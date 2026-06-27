-- ============================================================
-- Migration: Replace Clerk auth with Supabase Auth
-- Renames clerk_user_id -> auth_user_id across the schema
-- Updates RLS helper functions to use auth.uid()
-- ============================================================

-- Rename the column
alter table public.shellers rename column clerk_user_id to auth_user_id;

-- Update RLS helper: get_sheller_id()
create or replace function public.get_sheller_id()
returns uuid
language sql
stable
as $$
  select id from public.shellers
  where auth_user_id = auth.uid()::text
  limit 1;
$$;

-- Update RLS helper: is_board_member()
create or replace function public.is_board_member()
returns boolean
language sql
stable
as $$
  select coalesce(
    (select is_board_member from public.shellers
     where auth_user_id = auth.uid()::text
     limit 1),
    false
  );
$$;

-- Update the sheller self-update policy
drop policy if exists "Sheller can update own row" on public.shellers;

create policy "Sheller can update own row"
  on public.shellers for update
  using (
    auth_user_id = auth.uid()::text
    or public.is_board_member()
  );
