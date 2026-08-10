-- =============================================================
-- rewrite_usage: per-user daily-cap ledger for «تحسين الصياغة».
--
-- One row per successful rewrite. The Edge Function (letter-rewrite) counts
-- today's rows (UTC day) for the caller BEFORE hitting the Anthropic API and
-- blocks at DAILY_REWRITE_LIMIT, then inserts one row on success.
--
-- RLS lets a user read and insert only their own rows. The Edge Function
-- uses the service-role key, which bypasses RLS, so the count the cap is
-- based on can never be forged from the client.
-- =============================================================

create table if not exists public.rewrite_usage (
  id         uuid        primary key default gen_random_uuid(),
  user_id    uuid        not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  chars      int         not null
);

-- The cap query is "this user's rows since UTC midnight", newest first.
create index if not exists rewrite_usage_user_created_idx
  on public.rewrite_usage (user_id, created_at desc);

alter table public.rewrite_usage enable row level security;

-- Own rows only — INSERT and SELECT, matching the ledger convention.
drop policy if exists "select own rewrite usage" on public.rewrite_usage;
create policy "select own rewrite usage" on public.rewrite_usage
  for select using (auth.uid() = user_id);

drop policy if exists "insert own rewrite usage" on public.rewrite_usage;
create policy "insert own rewrite usage" on public.rewrite_usage
  for insert with check (auth.uid() = user_id);

comment on table public.rewrite_usage is
  'Per-user daily-cap ledger for the letter «تحسين الصياغة» rewrite feature (10/day).';
