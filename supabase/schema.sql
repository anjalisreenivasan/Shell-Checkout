-- ============================================================
-- Startup Shell Checkout System — Schema Reference
-- DO NOT run this file directly.
-- Use migrations instead: npm run db:push
-- To make a change: npm run db:new -- your_migration_name
-- ============================================================

-- Enable moddatetime extension for auto-updating updated_at
create extension if not exists moddatetime schema extensions;

-- ============================================================
-- TABLES
-- ============================================================

-- Shellers (synced from Clerk on first sign-in)
create table if not exists public.shellers (
  id              uuid        default gen_random_uuid() primary key,
  clerk_user_id   text        unique not null,
  email           text        unique not null,
  name            text        not null,
  is_board_member boolean     default false not null,
  created_at      timestamptz default now() not null
);

-- Items (resources available for checkout)
create table if not exists public.items (
  id           uuid        default gen_random_uuid() primary key,
  name         text        not null,
  description  text,
  quantity     integer     default 1 not null check (quantity >= 1),
  is_available boolean     default true not null,
  added_by     uuid        references public.shellers(id) on delete set null,
  created_at   timestamptz default now() not null,
  deleted_at   timestamptz
);

-- Checkouts (checkout requests submitted by shellers)
create table if not exists public.checkouts (
  id           uuid        default gen_random_uuid() primary key,
  sheller_id   uuid        references public.shellers(id) on delete cascade not null,
  item_id      uuid        references public.items(id) on delete cascade not null,
  checkout_at  timestamptz not null,
  return_date  date        not null,
  return_time  time        not null,
  status       text        default 'pending' not null
               check (status in ('pending', 'approved', 'denied', 'returned', 'return_confirmed')),
  approved_by    uuid        references public.shellers(id) on delete set null,
  waiver_url     text,
  rental_consent boolean     default false not null,
  created_at     timestamptz default now() not null,
  updated_at     timestamptz default now() not null
);

-- Auto-update updated_at on checkouts
create trigger handle_updated_at
  before update on public.checkouts
  for each row
  execute procedure extensions.moddatetime(updated_at);

-- Returns (log of actual returns and board confirmations)
create table if not exists public.returns (
  id           uuid        default gen_random_uuid() primary key,
  request_id   uuid        references public.checkouts(id) on delete cascade not null,
  sheller_id   uuid        references public.shellers(id) on delete cascade not null,
  item_id      uuid        references public.items(id) on delete cascade not null,
  returned_at  timestamptz default now() not null,
  confirmed_by uuid        references public.shellers(id) on delete set null,
  confirmed_at timestamptz,
  created_at   timestamptz default now() not null
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table public.shellers  enable row level security;
alter table public.items     enable row level security;
alter table public.checkouts enable row level security;
alter table public.returns   enable row level security;

-- Helper function: get the current sheller's row from clerk_user_id
-- (Clerk passes user ID via JWT claim "sub")
create or replace function public.get_sheller_id()
returns uuid
language sql
stable
as $$
  select id from public.shellers
  where clerk_user_id = auth.jwt() ->> 'sub'
  limit 1;
$$;

-- Helper function: check if current user is a board member
create or replace function public.is_board_member()
returns boolean
language sql
stable
as $$
  select coalesce(
    (select is_board_member from public.shellers
     where clerk_user_id = auth.jwt() ->> 'sub'
     limit 1),
    false
  );
$$;

-- ============================================================
-- SHELLERS policies
-- ============================================================

-- Anyone authenticated can read shellers (needed for name display)
create policy "Authenticated users can read shellers"
  on public.shellers for select
  using (auth.role() = 'authenticated');

-- Service role only inserts (handled server-side on first sign-in)
create policy "Service role can insert shellers"
  on public.shellers for insert
  with check (auth.role() = 'service_role');

-- Sheller can update their own row; board can update any
create policy "Sheller can update own row"
  on public.shellers for update
  using (
    clerk_user_id = auth.jwt() ->> 'sub'
    or public.is_board_member()
  );

-- ============================================================
-- ITEMS policies
-- ============================================================

-- Everyone (including unauthenticated) can read active items
create policy "Anyone can read active items"
  on public.items for select
  using (deleted_at is null);

-- Board only: insert items
create policy "Board can insert items"
  on public.items for insert
  with check (public.is_board_member());

-- Board only: update items
create policy "Board can update items"
  on public.items for update
  using (public.is_board_member());

-- Board only: delete (soft delete via update, but hard delete if needed)
create policy "Board can delete items"
  on public.items for delete
  using (public.is_board_member());

-- ============================================================
-- CHECKOUTS policies
-- ============================================================

-- Public can read approved/returned/return_confirmed checkouts (for home page feed)
create policy "Public can read active checkouts"
  on public.checkouts for select
  using (status in ('approved', 'returned', 'return_confirmed'));

-- Authenticated sheller can read their own checkouts (all statuses)
create policy "Sheller can read own checkouts"
  on public.checkouts for select
  using (sheller_id = public.get_sheller_id());

-- Board can read all checkouts
create policy "Board can read all checkouts"
  on public.checkouts for select
  using (public.is_board_member());

-- Authenticated sheller can insert their own checkout request
create policy "Sheller can insert checkout"
  on public.checkouts for insert
  with check (sheller_id = public.get_sheller_id());

-- Sheller can mark their own checkout as returned
create policy "Sheller can mark as returned"
  on public.checkouts for update
  using (
    sheller_id = public.get_sheller_id()
    and status = 'approved'
  )
  with check (status = 'returned');

-- Board can update any checkout (approve, deny, edit dates, confirm return)
create policy "Board can update any checkout"
  on public.checkouts for update
  using (public.is_board_member());

-- ============================================================
-- RETURNS policies
-- ============================================================

-- Sheller can insert their own return
create policy "Sheller can insert return"
  on public.returns for insert
  with check (sheller_id = public.get_sheller_id());

-- Sheller can read their own returns
create policy "Sheller can read own returns"
  on public.returns for select
  using (sheller_id = public.get_sheller_id());

-- Board can read all returns
create policy "Board can read all returns"
  on public.returns for select
  using (public.is_board_member());

-- Board can update returns (to confirm)
create policy "Board can update returns"
  on public.returns for update
  using (public.is_board_member());

-- ============================================================
-- SEED: First board member
-- Replace the values below with the actual first board member's info
-- Run this AFTER they sign in for the first time (so their shellers row exists)
-- ============================================================

-- UPDATE public.shellers
-- SET is_board_member = true
-- WHERE email = 'yourname@startupshell.org';
