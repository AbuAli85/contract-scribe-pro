-- =============================================================
-- Migration: user_templates + template_fills
-- BYO-Template engine: users upload their own .docx with
-- {placeholder} tokens, then fill them into final contracts.
-- =============================================================

-- ───────────────────────────────────────────────────────────────
-- Storage bucket for raw uploaded .docx templates.
-- ───────────────────────────────────────────────────────────────
insert into storage.buckets (id, name, public)
values ('user-templates', 'user-templates', false)
on conflict (id) do nothing;

-- Bucket for generated outputs (final filled .docx/.pdf files).
insert into storage.buckets (id, name, public)
values ('template-outputs', 'template-outputs', false)
on conflict (id) do nothing;

-- ───────────────────────────────────────────────────────────────
-- user_templates — one row per uploaded template
-- ───────────────────────────────────────────────────────────────
create table if not exists public.user_templates (
  id            uuid primary key default gen_random_uuid(),
  owner_id      uuid not null references auth.users(id) on delete cascade,
  name          text not null,
  description   text,
  storage_path  text not null,                              -- path in user-templates bucket
  mime_type     text default 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  lang          text default 'en' check (lang in ('en', 'ar', 'bilingual')),
  -- Detected placeholders as JSON, e.g.
  --   [{ "key": "employee_name", "label": "Employee Name", "type": "text", "required": true }, ...]
  schema_json   jsonb not null default '[]'::jsonb,
  -- Set to true once the schema has been confirmed by the user
  is_published  boolean not null default false,
  -- Optional category for org/grouping
  category      text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists user_templates_owner_idx
  on public.user_templates (owner_id, created_at desc);

create index if not exists user_templates_category_idx
  on public.user_templates (category);

-- ───────────────────────────────────────────────────────────────
-- template_fills — one row per generated/filled contract instance
-- ───────────────────────────────────────────────────────────────
create table if not exists public.template_fills (
  id              uuid primary key default gen_random_uuid(),
  template_id     uuid not null references public.user_templates(id) on delete cascade,
  filled_by       uuid references auth.users(id) on delete set null,
  -- The values the user filled in, keyed by schema_json[].key
  values_json     jsonb not null default '{}'::jsonb,
  output_docx_path text,           -- path in template-outputs bucket
  output_pdf_path  text,
  recipient_email  text,           -- optional: who this fill is for
  status          text not null default 'draft'
    check (status in ('draft', 'generated', 'signed', 'archived')),
  created_at      timestamptz not null default now()
);

create index if not exists template_fills_template_idx
  on public.template_fills (template_id, created_at desc);

create index if not exists template_fills_filled_by_idx
  on public.template_fills (filled_by);

-- ───────────────────────────────────────────────────────────────
-- updated_at trigger for user_templates
-- ───────────────────────────────────────────────────────────────
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists user_templates_updated_at on public.user_templates;
create trigger user_templates_updated_at
  before update on public.user_templates
  for each row execute function public.set_updated_at();

-- ───────────────────────────────────────────────────────────────
-- Row-Level Security
-- ───────────────────────────────────────────────────────────────
alter table public.user_templates enable row level security;
alter table public.template_fills enable row level security;

-- Owners can do everything with their own templates
drop policy if exists "owner can manage own templates" on public.user_templates;
create policy "owner can manage own templates"
  on public.user_templates
  for all
  to authenticated
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

-- Authenticated users can read templates they own + fills they created
drop policy if exists "user can read own template fills" on public.template_fills;
create policy "user can read own template fills"
  on public.template_fills
  for select
  to authenticated
  using (
    filled_by = auth.uid()
    or template_id in (select id from public.user_templates where owner_id = auth.uid())
  );

drop policy if exists "user can insert template fills" on public.template_fills;
create policy "user can insert template fills"
  on public.template_fills
  for insert
  to authenticated
  with check (filled_by = auth.uid());

drop policy if exists "user can update own template fills" on public.template_fills;
create policy "user can update own template fills"
  on public.template_fills
  for update
  to authenticated
  using (filled_by = auth.uid())
  with check (filled_by = auth.uid());

-- ───────────────────────────────────────────────────────────────
-- Storage policies — owner-only on raw template files
-- ───────────────────────────────────────────────────────────────
drop policy if exists "owner can read own template files" on storage.objects;
create policy "owner can read own template files"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'user-templates'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "owner can upload own template files" on storage.objects;
create policy "owner can upload own template files"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'user-templates'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "owner can delete own template files" on storage.objects;
create policy "owner can delete own template files"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'user-templates'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

comment on table public.user_templates is
  'User-uploaded .docx templates with {placeholder} tokens. The schema_json column holds the detected placeholders.';
comment on table public.template_fills is
  'Each generated/filled contract from a user_template. values_json stores what the user filled in.';
