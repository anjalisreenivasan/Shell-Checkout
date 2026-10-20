-- "Other" item: lets shellers request something that isn't in the item list.
-- The item is flagged with is_other, and the name of the thing they actually
-- want is stored per-checkout in requested_item_name.
alter table public.items add column is_other boolean default false not null;
alter table public.checkouts add column requested_item_name text;

-- Only one "Other" item can exist.
create unique index items_single_other_idx on public.items (is_other) where is_other;

insert into public.items (name, description, quantity, is_available, is_other)
select 'Other', 'Request an item that is not listed.', 1, true, true
where not exists (select 1 from public.items where is_other);
