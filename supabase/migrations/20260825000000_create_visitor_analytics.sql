create table if not exists public.visitor_events (
  id uuid primary key default gen_random_uuid(),
  visitor_id text not null,
  path text not null default '/',
  user_agent text,
  created_at timestamptz not null default now()
);

create table if not exists public.visitor_sessions (
  visitor_id text primary key,
  path text not null default '/',
  user_agent text,
  first_seen_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now()
);

create index if not exists visitor_events_created_at_idx
on public.visitor_events (created_at desc);

create index if not exists visitor_sessions_last_seen_at_idx
on public.visitor_sessions (last_seen_at desc);

alter table public.visitor_events enable row level security;
alter table public.visitor_sessions enable row level security;

grant select, insert on public.visitor_events to anon, authenticated;
grant select, insert, update on public.visitor_sessions to anon, authenticated;

drop policy if exists "Visitor events can be inserted by everyone" on public.visitor_events;
create policy "Visitor events can be inserted by everyone"
on public.visitor_events
for insert
to anon, authenticated
with check (true);

drop policy if exists "Visitor events can be counted by everyone" on public.visitor_events;
create policy "Visitor events can be counted by everyone"
on public.visitor_events
for select
to anon, authenticated
using (true);

drop policy if exists "Visitor sessions can be inserted by everyone" on public.visitor_sessions;
create policy "Visitor sessions can be inserted by everyone"
on public.visitor_sessions
for insert
to anon, authenticated
with check (true);

drop policy if exists "Visitor sessions can be updated by everyone" on public.visitor_sessions;
create policy "Visitor sessions can be updated by everyone"
on public.visitor_sessions
for update
to anon, authenticated
using (true)
with check (true);

drop policy if exists "Visitor sessions can be counted by everyone" on public.visitor_sessions;
create policy "Visitor sessions can be counted by everyone"
on public.visitor_sessions
for select
to anon, authenticated
using (true);

notify pgrst, 'reload schema';
