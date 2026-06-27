-- Ensure each sheller row points at a real better-auth user.
-- Delete or fix legacy/test shellers before applying this migration.
do $$
begin
  if exists (
    select 1
    from public.shellers s
    left join public."user" u on u.id = s.auth_user_id
    where u.id is null
  ) then
    raise exception 'Cannot add shellers_auth_user_id_fkey: shellers.auth_user_id has values missing from public."user".id';
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'shellers_auth_user_id_fkey'
      and conrelid = 'public.shellers'::regclass
  ) then
    alter table public.shellers
      add constraint shellers_auth_user_id_fkey
      foreign key (auth_user_id)
      references public."user"(id)
      on delete restrict;
  end if;
end $$;
