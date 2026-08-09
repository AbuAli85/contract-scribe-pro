-- =============================================================
-- Bring Your Own Format (نموذجي الخاص)
--
-- A user uploads their own .docx letter layout, confirms which spans
-- become placeholders, and we store the TAGGED copy for reuse. The raw
-- upload is discarded once tagging succeeds — we keep only what we can
-- actually merge into.
--
-- Storage mirrors the existing user-templates convention exactly:
-- private bucket, path {user_id}/{format_id}.docx, policies keyed on
-- the first path segment.
-- =============================================================

insert into storage.buckets (id, name, public)
values ('user-formats', 'user-formats', false)
on conflict (id) do nothing;

create table if not exists public.letter_formats (
  id           uuid        primary key default gen_random_uuid(),
  user_id      uuid        not null references auth.users(id) on delete cascade,
  name         text        not null,
  language     text        not null default 'ar',
  -- [{ "name": "cr_number", "label": "رقم السجل التجاري", "sample": "1234567" }, ...]
  fields       jsonb       not null,
  storage_path text        not null,
  created_at   timestamptz not null default now()
);

create index if not exists letter_formats_user_idx on public.letter_formats (user_id, created_at desc);

alter table public.letter_formats enable row level security;

drop policy if exists "own formats" on public.letter_formats;
create policy "own formats" on public.letter_formats
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ───────────────────────────────────────────────────────────────
-- Free tier: one saved format. Enforced in the database, not the UI —
-- RLS lets a client insert its own rows, so the limit has to live
-- somewhere the client cannot reach. A trigger also covers any future
-- server-side insert path for free.
-- ───────────────────────────────────────────────────────────────
create or replace function public.enforce_letter_format_limit()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  is_pro_user boolean;
  existing    integer;
begin
  select coalesce(p.is_pro, false) into is_pro_user
  from public.profiles p
  where p.id = new.user_id;

  if coalesce(is_pro_user, false) then
    return new;
  end if;

  select count(*) into existing
  from public.letter_formats
  where user_id = new.user_id;

  if existing >= 1 then
    -- The client matches on this exact string to show the upgrade copy.
    raise exception 'free_format_limit' using errcode = 'check_violation';
  end if;

  return new;
end;
$$;

drop trigger if exists letter_formats_limit on public.letter_formats;
create trigger letter_formats_limit
  before insert on public.letter_formats
  for each row execute function public.enforce_letter_format_limit();

-- ───────────────────────────────────────────────────────────────
-- Storage policies — owner-only, same shape as user-templates
-- ───────────────────────────────────────────────────────────────
drop policy if exists "owner can read own format files" on storage.objects;
create policy "owner can read own format files"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'user-formats'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "owner can upload own format files" on storage.objects;
create policy "owner can upload own format files"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'user-formats'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "owner can delete own format files" on storage.objects;
create policy "owner can delete own format files"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'user-formats'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

comment on table public.letter_formats is
  'User-uploaded letter layouts, stored tagged with {placeholders} for reuse. Free tier: 1 per account (enforced by trigger).';
