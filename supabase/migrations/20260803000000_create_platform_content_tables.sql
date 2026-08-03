create table if not exists public.tags (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references auth.users(id) on delete set null,
  slug text not null unique,
  title text not null,
  description text not null default '',
  cover_url text,
  github_url text,
  author_name text not null default 'anonymous',
  is_published boolean not null default true,
  view_count integer not null default 0 check (view_count >= 0),
  like_count integer not null default 0 check (like_count >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.knowledge (
  id uuid primary key default gen_random_uuid(),
  author_id uuid references auth.users(id) on delete set null,
  slug text not null unique,
  title text not null,
  summary text not null default '',
  content text not null default '',
  type text not null default 'guide',
  difficulty text not null default 'beginner',
  status text not null default 'published',
  view_count integer not null default 0 check (view_count >= 0),
  like_count integer not null default 0 check (like_count >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint knowledge_type_check check (
    type in (
      'tutorial',
      'guide',
      'best_practice',
      'reference',
      'faq',
      'engineering_note'
    )
  ),
  constraint knowledge_difficulty_check check (
    difficulty in ('beginner', 'intermediate', 'advanced')
  ),
  constraint knowledge_status_check check (
    status in ('draft', 'published', 'archived')
  )
);

create table if not exists public.resources (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid references auth.users(id) on delete set null,
  slug text not null unique,
  title text not null,
  url text not null,
  type text not null default 'tool',
  description text not null default '',
  author_name text not null default 'anonymous',
  is_published boolean not null default true,
  view_count integer not null default 0 check (view_count >= 0),
  like_count integer not null default 0 check (like_count >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint resources_type_check check (
    type in (
      'github_repository',
      'paper',
      'book',
      'dataset',
      'hardware',
      'tool',
      'course',
      'reference'
    )
  )
);

create table if not exists public.project_tags (
  project_id uuid not null references public.projects(id) on delete cascade,
  tag_id uuid not null references public.tags(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (project_id, tag_id)
);

create table if not exists public.knowledge_tags (
  knowledge_id uuid not null references public.knowledge(id) on delete cascade,
  tag_id uuid not null references public.tags(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (knowledge_id, tag_id)
);

create table if not exists public.resource_tags (
  resource_id uuid not null references public.resources(id) on delete cascade,
  tag_id uuid not null references public.tags(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (resource_id, tag_id)
);

create index if not exists projects_slug_idx on public.projects (slug);
create index if not exists projects_created_at_idx on public.projects (created_at desc);
create index if not exists projects_like_count_idx on public.projects (like_count desc);
create index if not exists projects_title_search_idx on public.projects using gin (
  to_tsvector('simple', title || ' ' || description)
);

create index if not exists knowledge_slug_idx on public.knowledge (slug);
create index if not exists knowledge_type_idx on public.knowledge (type);
create index if not exists knowledge_difficulty_idx on public.knowledge (difficulty);
create index if not exists knowledge_created_at_idx on public.knowledge (created_at desc);
create index if not exists knowledge_title_search_idx on public.knowledge using gin (
  to_tsvector('simple', title || ' ' || summary || ' ' || content)
);

create index if not exists resources_slug_idx on public.resources (slug);
create index if not exists resources_type_idx on public.resources (type);
create index if not exists resources_created_at_idx on public.resources (created_at desc);
create index if not exists resources_title_search_idx on public.resources using gin (
  to_tsvector('simple', title || ' ' || description || ' ' || url)
);

create index if not exists tags_name_idx on public.tags (name);
create index if not exists project_tags_tag_id_idx on public.project_tags (tag_id);
create index if not exists knowledge_tags_tag_id_idx on public.knowledge_tags (tag_id);
create index if not exists resource_tags_tag_id_idx on public.resource_tags (tag_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_projects_updated_at on public.projects;
create trigger set_projects_updated_at
before update on public.projects
for each row
execute function public.set_updated_at();

drop trigger if exists set_knowledge_updated_at on public.knowledge;
create trigger set_knowledge_updated_at
before update on public.knowledge
for each row
execute function public.set_updated_at();

drop trigger if exists set_resources_updated_at on public.resources;
create trigger set_resources_updated_at
before update on public.resources
for each row
execute function public.set_updated_at();

alter table public.tags enable row level security;
alter table public.projects enable row level security;
alter table public.knowledge enable row level security;
alter table public.resources enable row level security;
alter table public.project_tags enable row level security;
alter table public.knowledge_tags enable row level security;
alter table public.resource_tags enable row level security;

grant select, insert, update on public.tags to anon, authenticated;
grant select, insert, update on public.projects to anon, authenticated;
grant select, insert, update on public.knowledge to anon, authenticated;
grant select, insert, update on public.resources to anon, authenticated;
grant select, insert, update on public.project_tags to anon, authenticated;
grant select, insert, update on public.knowledge_tags to anon, authenticated;
grant select, insert, update on public.resource_tags to anon, authenticated;

drop policy if exists "Tags are readable by everyone" on public.tags;
create policy "Tags are readable by everyone"
on public.tags
for select
to anon, authenticated
using (true);

drop policy if exists "Anyone can manage tags during MVP" on public.tags;
create policy "Anyone can manage tags during MVP"
on public.tags
for all
to anon, authenticated
using (true)
with check (true);

drop policy if exists "Published projects are readable by everyone" on public.projects;
create policy "Published projects are readable by everyone"
on public.projects
for select
to anon, authenticated
using (is_published = true);

drop policy if exists "Anyone can manage projects during MVP" on public.projects;
create policy "Anyone can manage projects during MVP"
on public.projects
for all
to anon, authenticated
using (true)
with check (true);

drop policy if exists "Published knowledge is readable by everyone" on public.knowledge;
create policy "Published knowledge is readable by everyone"
on public.knowledge
for select
to anon, authenticated
using (status = 'published');

drop policy if exists "Anyone can manage knowledge during MVP" on public.knowledge;
create policy "Anyone can manage knowledge during MVP"
on public.knowledge
for all
to anon, authenticated
using (true)
with check (true);

drop policy if exists "Published resources are readable by everyone" on public.resources;
create policy "Published resources are readable by everyone"
on public.resources
for select
to anon, authenticated
using (is_published = true);

drop policy if exists "Anyone can manage resources during MVP" on public.resources;
create policy "Anyone can manage resources during MVP"
on public.resources
for all
to anon, authenticated
using (true)
with check (true);

drop policy if exists "Project tag relations are readable by everyone" on public.project_tags;
create policy "Project tag relations are readable by everyone"
on public.project_tags
for select
to anon, authenticated
using (true);

drop policy if exists "Anyone can manage project tag relations during MVP" on public.project_tags;
create policy "Anyone can manage project tag relations during MVP"
on public.project_tags
for all
to anon, authenticated
using (true)
with check (true);

drop policy if exists "Knowledge tag relations are readable by everyone" on public.knowledge_tags;
create policy "Knowledge tag relations are readable by everyone"
on public.knowledge_tags
for select
to anon, authenticated
using (true);

drop policy if exists "Anyone can manage knowledge tag relations during MVP" on public.knowledge_tags;
create policy "Anyone can manage knowledge tag relations during MVP"
on public.knowledge_tags
for all
to anon, authenticated
using (true)
with check (true);

drop policy if exists "Resource tag relations are readable by everyone" on public.resource_tags;
create policy "Resource tag relations are readable by everyone"
on public.resource_tags
for select
to anon, authenticated
using (true);

drop policy if exists "Anyone can manage resource tag relations during MVP" on public.resource_tags;
create policy "Anyone can manage resource tag relations during MVP"
on public.resource_tags
for all
to anon, authenticated
using (true)
with check (true);
