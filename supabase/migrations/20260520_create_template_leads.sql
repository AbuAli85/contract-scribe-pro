-- =============================================================
-- Migration: create template_leads table for the free template
-- library lead-magnet flow. Drives the MOFU email nurture sequence.
-- =============================================================

create table if not exists public.template_leads (
  id            uuid primary key default gen_random_uuid(),
  email         text not null,
  template_id   text not null,
  lang          text not null default 'en' check (lang in ('en', 'ar')),
  downloaded_at timestamptz not null default now(),
  ip            text,
  user_agent    text,
  -- prevent runaway duplicates from one inbox grabbing the same template repeatedly
  constraint template_leads_email_template_unique unique (email, template_id)
);

create index if not exists template_leads_email_idx
  on public.template_leads (email);

create index if not exists template_leads_template_id_idx
  on public.template_leads (template_id);

create index if not exists template_leads_downloaded_at_idx
  on public.template_leads (downloaded_at desc);

-- =============================================================
-- Row-Level Security
-- =============================================================
-- Anonymous visitors must be able to INSERT (they don't have an account yet)
-- but should NEVER be able to SELECT, UPDATE, or DELETE leads.
-- The service role bypasses RLS and is used by edge functions + the drip
-- scheduler for reading and processing leads.
-- =============================================================

alter table public.template_leads enable row level security;

-- Allow public/anon inserts. Anyone visiting /templates can submit their email.
drop policy if exists "anon can insert template leads"
  on public.template_leads;

create policy "anon can insert template leads"
  on public.template_leads
  for insert
  to anon, authenticated
  with check (true);

-- Authenticated users may read only their own leads (matches their auth email).
drop policy if exists "user can read own template leads"
  on public.template_leads;

create policy "user can read own template leads"
  on public.template_leads
  for select
  to authenticated
  using (email = auth.email());

-- =============================================================
-- Comments — make the schema self-documenting
-- =============================================================
comment on table public.template_leads is
  'Email leads captured via the public /templates lead-magnet gate. Feeds the 7-email drip nurture sequence.';
comment on column public.template_leads.template_id is
  'Matches ContractTemplate.id from src/lib/templates.ts';
comment on column public.template_leads.lang is
  'Language the lead was downloaded in — drives drip email language';
