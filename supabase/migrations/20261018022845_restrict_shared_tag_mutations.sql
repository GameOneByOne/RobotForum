begin;

-- Tags are shared across authors and modules. Readers can select and signed-in
-- users can add names, but cannot rename/delete someone else's shared tag.
drop policy if exists "Authenticated users can manage tags" on public.tags;
drop policy if exists "Authenticated users can add tags" on public.tags;
revoke update, delete on public.tags from authenticated;
grant select on public.tags to anon, authenticated;
grant insert on public.tags to authenticated;
create policy "Authenticated users can add tags" on public.tags
for insert to authenticated with check (true);

notify pgrst, 'reload schema';
commit;
