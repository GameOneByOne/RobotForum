-- Project requirements and ordered stages are saved together in one transaction.
begin;

alter table public.projects
  add column if not exists content text not null default '',
  add column if not exists operating_system text not null default '',
  add column if not exists hardware_requirements text[] not null default '{}',
  add column if not exists software_requirements text[] not null default '{}',
  add column if not exists prerequisites text[] not null default '{}',
  add column if not exists estimated_duration text not null default '',
  add column if not exists difficulty text not null default 'beginner'
    check (difficulty in ('beginner', 'intermediate', 'advanced'));

create table if not exists public.project_learning_stages (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  position integer not null check (position between 0 and 29),
  title text not null check (length(trim(title)) between 1 and 160),
  description text not null default '' check (length(description) <= 2000),
  outcome text not null check (length(trim(outcome)) between 1 and 1000),
  content text not null default '' check (length(content) <= 60000),
  unique(project_id, position)
);

create table if not exists public.project_stage_knowledge (
  stage_id uuid not null references public.project_learning_stages(id) on delete cascade,
  knowledge_id uuid not null references public.knowledge(id) on delete cascade,
  kind text not null default 'required' check (kind in ('required', 'supplement', 'optional')),
  position integer not null check (position between 0 and 29),
  primary key(stage_id, knowledge_id),
  unique(stage_id, position)
);
create index if not exists project_stage_knowledge_knowledge_idx on public.project_stage_knowledge(knowledge_id);
alter table public.project_learning_stages enable row level security;
alter table public.project_stage_knowledge enable row level security;
grant select on public.project_learning_stages, public.project_stage_knowledge to anon, authenticated;
grant insert, update, delete on public.project_learning_stages, public.project_stage_knowledge to authenticated;

create policy "Published project stages are readable" on public.project_learning_stages
for select to anon, authenticated using (exists (
  select 1 from public.projects p where p.id = project_id and (p.is_published or p.owner_id = auth.uid())
));
create policy "Project owners manage stages" on public.project_learning_stages
for all to authenticated using (exists (
  select 1 from public.projects p where p.id = project_id and p.owner_id = auth.uid()
)) with check (exists (
  select 1 from public.projects p where p.id = project_id and p.owner_id = auth.uid()
));
create policy "Published project learning links are readable" on public.project_stage_knowledge
for select to anon, authenticated using (exists (
  select 1 from public.project_learning_stages s join public.projects p on p.id = s.project_id
  where s.id = stage_id and (p.is_published or p.owner_id = auth.uid())
));
create policy "Project owners manage learning links" on public.project_stage_knowledge
for all to authenticated using (exists (
  select 1 from public.project_learning_stages s join public.projects p on p.id = s.project_id
  where s.id = stage_id and p.owner_id = auth.uid()
)) with check (exists (
  select 1 from public.project_learning_stages s join public.projects p on p.id = s.project_id
  where s.id = stage_id and p.owner_id = auth.uid()
));

create or replace function public.save_project_plan(p_project jsonb, p_project_id uuid default null)
returns table(project_id uuid, project_slug text)
language plpgsql security invoker set search_path = public, pg_temp as $$
declare
  v_id uuid;
  v_slug text;
  v_stage_id uuid;
  v_stage jsonb;
  v_lesson jsonb;
  v_position bigint;
  v_lesson_position bigint;
  v_field text;
begin
  if auth.uid() is null then raise exception 'Please sign in to save a project.'; end if;
  if jsonb_typeof(p_project) <> 'object' or octet_length(p_project::text) > 1000000
     or length(trim(coalesce(p_project->>'title',''))) not between 1 and 160
     or length(trim(coalesce(p_project->>'description',''))) not between 1 and 2000
     or length(coalesce(p_project->>'content','')) > 150000
     or length(coalesce(p_project->>'operatingSystem','')) > 500
     or length(coalesce(p_project->>'duration','')) > 120
     or coalesce(p_project->>'difficulty','') not in ('beginner','intermediate','advanced')
     or length(coalesce(p_project->>'githubUrl','')) > 2000
     or (coalesce(p_project->>'githubUrl','') <> '' and p_project->>'githubUrl' !~* '^https?://[^[:space:]]+$')
  then raise exception 'Invalid project fields.'; end if;
  foreach v_field in array array['hardware','software','prerequisites','tags','stages'] loop
    if jsonb_typeof(p_project->v_field) is distinct from 'array' then raise exception 'Invalid project list: %', v_field; end if;
  end loop;
  foreach v_field in array array['hardware','software','prerequisites','tags'] loop
    if jsonb_array_length(p_project->v_field) > (case when v_field='tags' then 20 else 40 end)
       or exists (select 1 from jsonb_array_elements(p_project->v_field) x
                  where jsonb_typeof(x) <> 'string' or length(x #>> '{}') > (case when v_field='tags' then 60 else 500 end))
    then raise exception 'Invalid project requirements or tags.'; end if;
  end loop;
  if jsonb_array_length(p_project->'stages') > 30 then raise exception 'Too many project stages.'; end if;

  if p_project_id is not null then
    -- Serialize saves of the same project, and never trust owner IDs from JSON.
    select p.id, p.slug into v_id, v_slug from public.projects p
      where p.id = p_project_id and p.owner_id = auth.uid() for update;
    if not found then raise exception 'You can only edit your own projects.'; end if;
  else
    v_id := gen_random_uuid();
    v_slug := 'project-' || replace(v_id::text, '-', '');
    insert into public.projects(id, owner_id, slug, title, description, author_name)
    values(v_id, auth.uid(), v_slug, trim(p_project->>'title'), trim(p_project->>'description'),
      left(coalesce(nullif(trim(p_project->>'authorName'),''), 'Member'),160));
  end if;
  update public.projects set
    title = trim(p_project->>'title'), description = trim(p_project->>'description'),
    content = coalesce(p_project->>'content',''), github_url = nullif(p_project->>'githubUrl',''),
    operating_system = coalesce(p_project->>'operatingSystem',''),
    hardware_requirements = array(select jsonb_array_elements_text(p_project->'hardware')),
    software_requirements = array(select jsonb_array_elements_text(p_project->'software')),
    prerequisites = array(select jsonb_array_elements_text(p_project->'prerequisites')),
    estimated_duration = coalesce(p_project->>'duration',''), difficulty = p_project->>'difficulty'
  where id = v_id;

  delete from public.project_learning_stages where project_learning_stages.project_id = v_id;
  for v_stage, v_position in select value, ordinality from jsonb_array_elements(p_project->'stages') with ordinality loop
    if jsonb_typeof(v_stage) <> 'object' or jsonb_typeof(v_stage->'lessons') is distinct from 'array'
       or jsonb_array_length(v_stage->'lessons') > 30
    then raise exception 'Invalid learning stage.'; end if;
    insert into public.project_learning_stages(project_id,position,title,description,outcome,content)
    values(v_id,v_position-1,trim(v_stage->>'title'),coalesce(v_stage->>'description',''),
      trim(v_stage->>'outcome'),coalesce(v_stage->>'content','')) returning id into v_stage_id;
    for v_lesson, v_lesson_position in select value, ordinality from jsonb_array_elements(v_stage->'lessons') with ordinality loop
      if not exists (select 1 from public.knowledge where id = (v_lesson->>'knowledgeId')::uuid and status = 'published')
      then raise exception 'A linked article is missing or is not published.'; end if;
      insert into public.project_stage_knowledge(stage_id,knowledge_id,kind,position)
      values(v_stage_id,(v_lesson->>'knowledgeId')::uuid,v_lesson->>'kind',v_lesson_position-1);
    end loop;
  end loop;
  insert into public.tags(name)
    select distinct trim(value) from jsonb_array_elements_text(p_project->'tags') where trim(value) <> ''
    on conflict(name) do nothing;
  delete from public.project_tags where project_tags.project_id = v_id;
  insert into public.project_tags(project_id,tag_id)
    select v_id,t.id from public.tags t where t.name in (select trim(jsonb_array_elements_text(p_project->'tags')));
  return query select v_id, v_slug;
end;
$$;
revoke all on function public.save_project_plan(jsonb, uuid) from public, anon;
grant execute on function public.save_project_plan(jsonb, uuid) to authenticated;
notify pgrst, 'reload schema';
commit;
