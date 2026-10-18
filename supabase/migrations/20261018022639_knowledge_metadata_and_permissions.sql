begin;

-- Preserve existing publication history while backfilling missing metadata.
drop trigger if exists set_knowledge_updated_at on public.knowledge;
drop trigger if exists maintain_knowledge_metadata on public.knowledge;
alter table public.knowledge
  add column if not exists author_id uuid references auth.users(id) on delete set null,
  add column if not exists author_name text not null default '',
  add column if not exists created_at timestamptz default now(),
  add column if not exists updated_at timestamptz default now();
update public.knowledge set
  created_at = coalesce(created_at, now()),
  updated_at = coalesce(updated_at, created_at, now())
where created_at is null or updated_at is null;
alter table public.knowledge
  alter column created_at set default now(),
  alter column created_at set not null,
  alter column updated_at set default now(),
  alter column updated_at set not null;
create index if not exists knowledge_author_id_idx on public.knowledge(author_id);

-- Publish only the display name, never auth.users or the full email address.
update public.knowledge k set author_name = left(coalesce(
  nullif(btrim(u.raw_user_meta_data->>'display_name'), ''),
  nullif(btrim(u.raw_user_meta_data->>'full_name'), ''),
  nullif(split_part(u.email, '@', 1), ''), 'Member'), 160)
from auth.users u where u.id = k.author_id and btrim(k.author_name) = '';
update public.knowledge set author_name = 'Member' where btrim(author_name) = '';

-- Classification is no longer part of the knowledge catalog. Keep topic tags
-- and legacy ordering data; do not delete shared tags used by other modules.
delete from public.knowledge_tags kt using public.tags t
where kt.tag_id = t.id and t.name in ('初级','中级','高级');

create or replace function public.maintain_knowledge_metadata()
returns trigger language plpgsql security invoker
set search_path = public, pg_temp as $$
declare
  v_user uuid := auth.uid();
  v_claims jsonb := auth.jwt();
begin
  if TG_OP = 'INSERT' then
    new.created_at := statement_timestamp();
    new.updated_at := new.created_at;
  else
    new.created_at := old.created_at;
    if v_user is not null and new.author_id is distinct from old.author_id then
      raise exception 'The knowledge author cannot be changed.';
    end if;
  end if;

  -- Signed JWT metadata is display text only. Authorization remains author_id
  -- plus the RLS policies; names are neither unique nor a source of privileges.
  if v_user is not null and new.author_id = v_user then
    new.author_name := left(coalesce(
      nullif(btrim(v_claims->'user_metadata'->>'display_name'), ''),
      nullif(btrim(v_claims->'user_metadata'->>'full_name'), ''),
      nullif(split_part(v_claims->>'email', '@', 1), ''), 'Member'),160);
  elsif TG_OP = 'UPDATE' then
    new.author_name := old.author_name;
  end if;

  if TG_OP = 'UPDATE' then
    if row(new.author_id,new.author_name,new.slug,new.title,new.summary,new.content,new.type,new.difficulty,new.status)
         is not distinct from
       row(old.author_id,old.author_name,old.slug,old.title,old.summary,old.content,old.type,old.difficulty,old.status)
       and (new.view_count is distinct from old.view_count or new.like_count is distinct from old.like_count)
    then
      new.updated_at := old.updated_at;
    else
      -- A save with only topic-tag changes still issues a knowledge UPDATE.
      new.updated_at := statement_timestamp();
    end if;
  end if;
  return new;
end;
$$;
revoke all on function public.maintain_knowledge_metadata() from public, anon, authenticated;
create trigger maintain_knowledge_metadata before insert or update on public.knowledge
for each row execute function public.maintain_knowledge_metadata();

alter table public.knowledge enable row level security;
-- Existing author_id ownership policies continue to govern article mutations.

notify pgrst, 'reload schema';
commit;
