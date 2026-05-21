-- fill_seeds: saved company/party profiles for re-use across template fills.
-- Each row stores a named set of field key→value pairs as JSON.

create table if not exists public.fill_seeds (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references auth.users(id) on delete cascade,
  label      text not null,
  fields     jsonb not null default '{}',
  created_at timestamptz not null default now()
);

alter table public.fill_seeds enable row level security;

create policy "Users manage own seeds"
  on public.fill_seeds for all
  using  (auth.uid() = user_id)
  with check (auth.uid() = user_id);
