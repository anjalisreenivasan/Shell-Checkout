-- better-auth tables hold session tokens, OAuth tokens, and password hashes.
-- The app only ever reaches them via the direct Postgres connection in lib/auth.ts
-- (which bypasses RLS), never through the Supabase REST API/anon key — so RLS
-- with no policies fully locks down public API access without breaking auth.
alter table public."user"         enable row level security;
alter table public."session"      enable row level security;
alter table public."account"      enable row level security;
alter table public."verification" enable row level security;
