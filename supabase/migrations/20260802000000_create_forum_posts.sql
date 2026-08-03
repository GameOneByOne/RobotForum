create table if not exists public.forum_posts (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  excerpt text not null default '',
  content text[] not null default '{}',
  author_name text not null default 'anonymous',
  tags text[] not null default '{}',
  view_count integer not null default 0 check (view_count >= 0),
  like_count integer not null default 0 check (like_count >= 0),
  reply_count integer not null default 0 check (reply_count >= 0),
  is_published boolean not null default true,
  published_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists forum_posts_tags_idx on public.forum_posts using gin (tags);
create index if not exists forum_posts_published_at_idx on public.forum_posts (published_at desc);
create index if not exists forum_posts_view_count_idx on public.forum_posts (view_count desc);
create index if not exists forum_posts_like_count_idx on public.forum_posts (like_count desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_forum_posts_updated_at on public.forum_posts;
create trigger set_forum_posts_updated_at
before update on public.forum_posts
for each row
execute function public.set_updated_at();

alter table public.forum_posts enable row level security;

grant select, insert, update on public.forum_posts to anon;
grant select, insert, update on public.forum_posts to authenticated;

drop policy if exists "Published forum posts are readable by everyone" on public.forum_posts;
create policy "Published forum posts are readable by everyone"
on public.forum_posts
for select
using (is_published = true);

drop policy if exists "Anyone can publish forum posts" on public.forum_posts;
create policy "Anyone can publish forum posts"
on public.forum_posts
for insert
to anon, authenticated
with check (true);

drop policy if exists "Anyone can update forum posts" on public.forum_posts;
create policy "Anyone can update forum posts"
on public.forum_posts
for update
to anon, authenticated
using (true)
with check (true);
