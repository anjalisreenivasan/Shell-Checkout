-- The app moved from Clerk to better-auth. Some environments already renamed
-- clerk_user_id to auth_user_id in 20260311000000, so keep this migration safe
-- to apply anywhere.
do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'shellers'
      and column_name = 'clerk_user_id'
  ) and not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'shellers'
      and column_name = 'auth_user_id'
  ) then
    alter table public.shellers rename column clerk_user_id to auth_user_id;
  end if;
end $$;

create or replace function public.get_sheller_id()
returns uuid
language sql
stable
as $$
  select id from public.shellers
  where auth_user_id = auth.jwt() ->> 'sub'
  limit 1;
$$;

create or replace function public.is_board_member()
returns boolean
language sql
stable
as $$
  select coalesce(
    (select is_board_member from public.shellers
     where auth_user_id = auth.jwt() ->> 'sub'
     limit 1),
    false
  );
$$;

drop policy if exists "Sheller can update own row" on public.shellers;
create policy "Sheller can update own row"
  on public.shellers for update
  using (
    auth_user_id = auth.jwt() ->> 'sub'
    or public.is_board_member()
  );
