-- Add scheduled pickup date/time (separate from checkout_at, which remains
-- "when the request was submitted") and a free-text notes field.
alter table public.checkouts add column pickup_date date;
alter table public.checkouts add column pickup_time time;
alter table public.checkouts add column notes text;

-- Backfill existing rows so pickup_date/pickup_time can become not null.
update public.checkouts
set pickup_date = checkout_at::date,
    pickup_time = checkout_at::time
where pickup_date is null;

alter table public.checkouts alter column pickup_date set not null;
alter table public.checkouts alter column pickup_time set not null;
