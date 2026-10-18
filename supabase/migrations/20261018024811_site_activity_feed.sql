begin;

create schema if not exists activity_private;
revoke all on schema activity_private from public, anon, authenticated;

create table if not exists public.site_activity (
  id uuid primary key default gen_random_uuid(),
  actor_name text not null,
  action text not null check (action in ('created','updated','commented')),
  kind text not null check (kind in ('knowledge','project','resource','discussion')),
  target_id uuid not null,
  occurred_at timestamptz not null default statement_timestamp(),
  comment_id uuid,
  is_backfill boolean not null default false,
  check ((action = 'commented') = (comment_id is not null))
);
create index if not exists site_activity_recent_idx on public.site_activity(occurred_at desc,id desc);
create index if not exists site_activity_target_idx on public.site_activity(kind,target_id);
create unique index if not exists site_activity_backfill_content_idx
  on public.site_activity(kind,target_id,action) where is_backfill and comment_id is null;
create unique index if not exists site_activity_backfill_comment_idx
  on public.site_activity(comment_id) where is_backfill and comment_id is not null;
alter table public.site_activity enable row level security;
revoke all on public.site_activity from public,anon,authenticated;
grant select on public.site_activity to anon,authenticated;

drop policy if exists "Visible targets and comments govern activity reads" on public.site_activity;
create policy "Visible targets and comments govern activity reads" on public.site_activity
for select to anon,authenticated using (
  (kind = 'knowledge' and exists (
    select 1 from public.knowledge k where k.id=target_id and k.status='published'
    and (comment_id is null or exists (select 1 from public.comments c where c.id=comment_id and not c.is_deleted and c.target_type='knowledge' and c.target_slug=k.slug))
  )) or (kind = 'project' and exists (
    select 1 from public.projects p where p.id=target_id and p.is_published
    and (comment_id is null or exists (select 1 from public.comments c where c.id=comment_id and not c.is_deleted and c.target_type='project' and c.target_slug=p.slug))
  )) or (kind = 'resource' and exists (
    select 1 from public.resources r where r.id=target_id and r.is_published
    and (comment_id is null or exists (select 1 from public.comments c where c.id=comment_id and not c.is_deleted and c.target_type='resource' and c.target_slug=r.slug))
  )) or (kind = 'discussion' and exists (
    select 1 from public.forum_posts f where f.id=target_id and f.is_published and not ('__deleted__'=any(f.tags))
    and (comment_id is null or exists (select 1 from public.comments c where c.id=comment_id and not c.is_deleted and c.target_type='post' and c.target_slug=f.slug))
  ))
);

create or replace function activity_private.record_content_activity()
returns trigger language plpgsql security definer set search_path = '' as $$
declare
  v_new jsonb := to_jsonb(new);
  v_old jsonb;
  v_published boolean;
  v_was_published boolean := false;
begin
  v_published := case when TG_ARGV[0]='knowledge' then v_new->>'status'='published' else (v_new->>'is_published')::boolean end;
  if TG_ARGV[0]='discussion' and (v_new->'tags') ? '__deleted__' then return new; end if;
  if not v_published then return new; end if;
  if TG_OP='UPDATE' then
    v_old := to_jsonb(old);
    v_was_published := case when TG_ARGV[0]='knowledge' then v_old->>'status'='published' else (v_old->>'is_published')::boolean end;
    if TG_ARGV[0]='discussion' and (v_old->'tags') ? '__deleted__' then v_was_published:=false; end if;
    -- Counter-only writes are not editorial activity. Explicit saves (including
    -- unchanged parent metadata for route/tag edits) are recorded separately.
    if (v_new - array['updated_at','created_at','view_count','like_count','reply_count'])
       is not distinct from (v_old - array['updated_at','created_at','view_count','like_count','reply_count'])
       and (v_new->'view_count' is distinct from v_old->'view_count'
         or v_new->'like_count' is distinct from v_old->'like_count'
         or v_new->'reply_count' is distinct from v_old->'reply_count')
    then return new; end if;
  end if;
  insert into public.site_activity(actor_name,action,kind,target_id)
  values(left(coalesce(nullif(btrim(v_new->>'author_name'),''),'Member'),160),
    case when TG_OP='INSERT' or not v_was_published then 'created' else 'updated' end,
    TG_ARGV[0],new.id);
  return new;
end;
$$;
revoke all on function activity_private.record_content_activity() from public,anon,authenticated;

create or replace function activity_private.record_comment_activity()
returns trigger language plpgsql security definer set search_path = '' as $$
declare v_target uuid; v_kind text;
begin
  if new.is_deleted then return new; end if;
  v_kind := case new.target_type when 'post' then 'discussion' else new.target_type end;
  case v_kind
    when 'knowledge' then select id into v_target from public.knowledge where slug=new.target_slug and status='published';
    when 'project' then select id into v_target from public.projects where slug=new.target_slug and is_published;
    when 'resource' then select id into v_target from public.resources where slug=new.target_slug and is_published;
    when 'discussion' then select id into v_target from public.forum_posts where slug=new.target_slug and is_published and not ('__deleted__'=any(tags));
    else return new;
  end case;
  if v_target is not null then
    insert into public.site_activity(actor_name,action,kind,target_id,comment_id)
    values(left(coalesce(nullif(btrim(new.author_name),''),'Member'),160),'commented',v_kind,v_target,new.id);
  end if;
  return new;
end;
$$;
revoke all on function activity_private.record_comment_activity() from public,anon,authenticated;

-- The legacy generic timestamp triggers touch updated_at for every UPDATE.
-- Run after them alphabetically, preserving editorial timestamps for counters.
create or replace function activity_private.preserve_counter_time()
returns trigger language plpgsql security invoker set search_path = '' as $$
declare v_new jsonb:=to_jsonb(new); v_old jsonb:=to_jsonb(old);
begin
  if (v_new-array['created_at','updated_at','view_count','like_count','reply_count'])
     is not distinct from (v_old-array['created_at','updated_at','view_count','like_count','reply_count'])
     and (v_new->'view_count' is distinct from v_old->'view_count'
       or v_new->'like_count' is distinct from v_old->'like_count'
       or v_new->'reply_count' is distinct from v_old->'reply_count')
  then new.updated_at:=old.updated_at; end if;
  return new;
end;
$$;
revoke all on function activity_private.preserve_counter_time() from public,anon,authenticated;
drop trigger if exists zz_preserve_activity_counter_time on public.projects;
create trigger zz_preserve_activity_counter_time before update on public.projects for each row execute function activity_private.preserve_counter_time();
drop trigger if exists zz_preserve_activity_counter_time on public.resources;
create trigger zz_preserve_activity_counter_time before update on public.resources for each row execute function activity_private.preserve_counter_time();
drop trigger if exists zz_preserve_activity_counter_time on public.forum_posts;
create trigger zz_preserve_activity_counter_time before update on public.forum_posts for each row execute function activity_private.preserve_counter_time();

drop trigger if exists record_site_activity on public.knowledge;
create trigger record_site_activity after insert or update on public.knowledge for each row execute function activity_private.record_content_activity('knowledge');
drop trigger if exists record_site_activity on public.projects;
create trigger record_site_activity after insert or update on public.projects for each row execute function activity_private.record_content_activity('project');
drop trigger if exists record_site_activity on public.resources;
create trigger record_site_activity after insert or update on public.resources for each row execute function activity_private.record_content_activity('resource');
drop trigger if exists record_site_activity on public.forum_posts;
create trigger record_site_activity after insert or update on public.forum_posts for each row execute function activity_private.record_content_activity('discussion');
drop trigger if exists record_comment_site_activity on public.comments;
create trigger record_comment_site_activity after insert on public.comments for each row execute function activity_private.record_comment_activity();

-- Existing timestamps support at most creation and the last known edit; no
-- intermediate edits are invented. Backfill keys make reruns harmless.
with targets as (
 select id,'knowledge'::text kind,author_name,created_at,updated_at from public.knowledge where status='published'
 union all select id,'project',author_name,created_at,updated_at from public.projects where is_published
 union all select id,'resource',author_name,created_at,updated_at from public.resources where is_published
 union all select id,'discussion',author_name,created_at,updated_at from public.forum_posts where is_published and not ('__deleted__'=any(tags))
), events as (
 select id,kind,author_name,'created'::text action,created_at occurred_at from targets
 union all select id,kind,author_name,'updated',updated_at from targets where updated_at>created_at
)
insert into public.site_activity(actor_name,action,kind,target_id,occurred_at,is_backfill)
select left(coalesce(nullif(btrim(e.author_name),''),'Member'),160),e.action,e.kind,e.id,e.occurred_at,true from events e
where not exists (select 1 from public.site_activity a where a.kind=e.kind and a.target_id=e.id and a.action=e.action)
on conflict do nothing;

with targets as (
 select id,slug,'knowledge'::text kind,'knowledge'::text comment_type from public.knowledge where status='published'
 union all select id,slug,'project','project' from public.projects where is_published
 union all select id,slug,'resource','resource' from public.resources where is_published
 union all select id,slug,'discussion','post' from public.forum_posts where is_published and not ('__deleted__'=any(tags))
)
insert into public.site_activity(actor_name,action,kind,target_id,occurred_at,comment_id,is_backfill)
select left(coalesce(nullif(btrim(c.author_name),''),'Member'),160),'commented',t.kind,t.id,c.created_at,c.id,true
from public.comments c join targets t on c.target_type=t.comment_type and c.target_slug=t.slug where not c.is_deleted
and not exists (select 1 from public.site_activity a where a.comment_id=c.id)
on conflict do nothing;

create or replace function public.get_latest_activity(p_limit integer default 30)
returns table(id uuid,actor_name text,action text,kind text,target_id uuid,occurred_at timestamptz,comment_id uuid,title text,slug text,comment_excerpt text)
language sql stable security invoker set search_path = '' as $$
  select a.id,a.actor_name,a.action,a.kind,a.target_id,a.occurred_at,a.comment_id,t.title,t.slug,
    case when a.comment_id is not null then left(regexp_replace(c.content,E'\\s+',' ','g'),160) else null end
  from public.site_activity a
  join lateral (
    select k.title,k.slug from public.knowledge k where a.kind='knowledge' and k.id=a.target_id and k.status='published'
    union all select p.title,p.slug from public.projects p where a.kind='project' and p.id=a.target_id and p.is_published
    union all select r.title,r.slug from public.resources r where a.kind='resource' and r.id=a.target_id and r.is_published
    union all select f.title,f.slug from public.forum_posts f where a.kind='discussion' and f.id=a.target_id and f.is_published and not ('__deleted__'=any(f.tags))
  ) t on true
  left join public.comments c on c.id=a.comment_id and not c.is_deleted
    and c.target_slug=t.slug and c.target_type=case a.kind when 'discussion' then 'post' else a.kind end
  where a.comment_id is null or c.id is not null
  order by a.occurred_at desc,a.id desc
  limit greatest(1,least(coalesce(p_limit,30),30));
$$;
revoke all on function public.get_latest_activity(integer) from public;
grant execute on function public.get_latest_activity(integer) to anon,authenticated;
notify pgrst,'reload schema';
commit;
