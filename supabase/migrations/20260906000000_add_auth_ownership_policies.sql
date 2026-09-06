alter table public.forum_posts
add column if not exists owner_id uuid references auth.users(id) on delete set null;

create index if not exists forum_posts_owner_id_idx on public.forum_posts (owner_id);
create index if not exists projects_owner_id_idx on public.projects (owner_id);
create index if not exists knowledge_author_id_idx on public.knowledge (author_id);
create index if not exists resources_creator_id_idx on public.resources (creator_id);

grant select on public.tags to anon, authenticated;
grant insert, update, delete on public.tags to authenticated;

grant select on public.forum_posts to anon, authenticated;
grant insert, update, delete on public.forum_posts to authenticated;

grant select on public.projects to anon, authenticated;
grant insert, update, delete on public.projects to authenticated;

grant select on public.knowledge to anon, authenticated;
grant insert, update, delete on public.knowledge to authenticated;

grant select on public.resources to anon, authenticated;
grant insert, update, delete on public.resources to authenticated;

grant select on public.project_tags to anon, authenticated;
grant insert, update, delete on public.project_tags to authenticated;

grant select on public.knowledge_tags to anon, authenticated;
grant insert, update, delete on public.knowledge_tags to authenticated;

grant select on public.resource_tags to anon, authenticated;
grant insert, update, delete on public.resource_tags to authenticated;

drop policy if exists "Anyone can publish forum posts" on public.forum_posts;
drop policy if exists "Anyone can update forum posts" on public.forum_posts;
drop policy if exists "Authenticated users can publish forum posts" on public.forum_posts;
drop policy if exists "Post owners can update their posts" on public.forum_posts;
drop policy if exists "Post owners can delete their posts" on public.forum_posts;

create policy "Authenticated users can publish forum posts"
on public.forum_posts
for insert
to authenticated
with check (owner_id = auth.uid());

create policy "Post owners can update their posts"
on public.forum_posts
for update
to authenticated
using (owner_id = auth.uid())
with check (owner_id = auth.uid());

create policy "Post owners can delete their posts"
on public.forum_posts
for delete
to authenticated
using (owner_id = auth.uid());

drop policy if exists "Anyone can manage projects during MVP" on public.projects;
drop policy if exists "Authenticated users can publish projects" on public.projects;
drop policy if exists "Project owners can update their projects" on public.projects;
drop policy if exists "Project owners can delete their projects" on public.projects;

create policy "Authenticated users can publish projects"
on public.projects
for insert
to authenticated
with check (owner_id = auth.uid());

create policy "Project owners can update their projects"
on public.projects
for update
to authenticated
using (owner_id = auth.uid())
with check (owner_id = auth.uid());

create policy "Project owners can delete their projects"
on public.projects
for delete
to authenticated
using (owner_id = auth.uid());

drop policy if exists "Anyone can manage knowledge during MVP" on public.knowledge;
drop policy if exists "Authenticated users can publish knowledge" on public.knowledge;
drop policy if exists "Knowledge authors can update their knowledge" on public.knowledge;
drop policy if exists "Knowledge authors can delete their knowledge" on public.knowledge;

create policy "Authenticated users can publish knowledge"
on public.knowledge
for insert
to authenticated
with check (author_id = auth.uid());

create policy "Knowledge authors can update their knowledge"
on public.knowledge
for update
to authenticated
using (author_id = auth.uid())
with check (author_id = auth.uid());

create policy "Knowledge authors can delete their knowledge"
on public.knowledge
for delete
to authenticated
using (author_id = auth.uid());

drop policy if exists "Anyone can manage resources during MVP" on public.resources;
drop policy if exists "Authenticated users can publish resources" on public.resources;
drop policy if exists "Resource creators can update their resources" on public.resources;
drop policy if exists "Resource creators can delete their resources" on public.resources;

create policy "Authenticated users can publish resources"
on public.resources
for insert
to authenticated
with check (creator_id = auth.uid());

create policy "Resource creators can update their resources"
on public.resources
for update
to authenticated
using (creator_id = auth.uid())
with check (creator_id = auth.uid());

create policy "Resource creators can delete their resources"
on public.resources
for delete
to authenticated
using (creator_id = auth.uid());

drop policy if exists "Anyone can manage tags during MVP" on public.tags;
drop policy if exists "Authenticated users can manage tags" on public.tags;

create policy "Authenticated users can manage tags"
on public.tags
for all
to authenticated
using (true)
with check (true);

drop policy if exists "Anyone can manage project tag relations during MVP" on public.project_tags;
drop policy if exists "Project owners can manage project tag relations" on public.project_tags;

create policy "Project owners can manage project tag relations"
on public.project_tags
for all
to authenticated
using (
  exists (
    select 1
    from public.projects
    where projects.id = project_tags.project_id
      and projects.owner_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.projects
    where projects.id = project_tags.project_id
      and projects.owner_id = auth.uid()
  )
);

drop policy if exists "Anyone can manage knowledge tag relations during MVP" on public.knowledge_tags;
drop policy if exists "Knowledge authors can manage knowledge tag relations" on public.knowledge_tags;

create policy "Knowledge authors can manage knowledge tag relations"
on public.knowledge_tags
for all
to authenticated
using (
  exists (
    select 1
    from public.knowledge
    where knowledge.id = knowledge_tags.knowledge_id
      and knowledge.author_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.knowledge
    where knowledge.id = knowledge_tags.knowledge_id
      and knowledge.author_id = auth.uid()
  )
);

drop policy if exists "Anyone can manage resource tag relations during MVP" on public.resource_tags;
drop policy if exists "Resource creators can manage resource tag relations" on public.resource_tags;

create policy "Resource creators can manage resource tag relations"
on public.resource_tags
for all
to authenticated
using (
  exists (
    select 1
    from public.resources
    where resources.id = resource_tags.resource_id
      and resources.creator_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.resources
    where resources.id = resource_tags.resource_id
      and resources.creator_id = auth.uid()
  )
);

create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  target_type text not null check (target_type in ('post', 'project', 'knowledge', 'resource')),
  target_slug text not null,
  author_id uuid references auth.users(id) on delete set null,
  guest_id text,
  author_name text not null default '游客',
  content text not null,
  is_deleted boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint comments_author_or_guest_check check (
    author_id is not null or guest_id is not null
  )
);

create index if not exists comments_target_idx on public.comments (target_type, target_slug, created_at);
create index if not exists comments_author_id_idx on public.comments (author_id);

drop trigger if exists set_comments_updated_at on public.comments;
create trigger set_comments_updated_at
before update on public.comments
for each row
execute function public.set_updated_at();

alter table public.comments enable row level security;

grant select, insert on public.comments to anon, authenticated;
grant update, delete on public.comments to authenticated;

drop policy if exists "Visible comments are readable by everyone" on public.comments;
create policy "Visible comments are readable by everyone"
on public.comments
for select
to anon, authenticated
using (is_deleted = false);

drop policy if exists "Anyone can create comments" on public.comments;
create policy "Anyone can create comments"
on public.comments
for insert
to anon, authenticated
with check (
  is_deleted = false
  and content <> ''
  and (
    (auth.uid() is not null and author_id = auth.uid())
    or
    (auth.uid() is null and author_id is null and guest_id is not null)
  )
);

drop policy if exists "Comment authors can update their comments" on public.comments;
create policy "Comment authors can update their comments"
on public.comments
for update
to authenticated
using (author_id = auth.uid())
with check (author_id = auth.uid());

drop policy if exists "Comment authors can delete their comments" on public.comments;
create policy "Comment authors can delete their comments"
on public.comments
for delete
to authenticated
using (author_id = auth.uid());
