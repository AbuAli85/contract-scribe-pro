-- =============================================================
-- Migration: template_requests
-- Captures user demand for "Coming Soon" templates in the catalog.
-- The most-requested templates are the next ones we build.
-- =============================================================

create table if not exists public.template_requests (
  id                   uuid primary key default gen_random_uuid(),
  email                text not null,
  template_id          text not null,
  template_title_en    text,
  template_title_ar    text,
  category             text,
  lang                 text not null default 'en' check (lang in ('en', 'ar')),
  requested_at         timestamptz not null default now(),
  notified_at          timestamptz, -- set once we email the user that the template is live
  constraint template_requests_email_template_unique unique (email, template_id)
);

create index if not exists template_requests_template_id_idx
  on public.template_requests (template_id);

create index if not exists template_requests_requested_at_idx
  on public.template_requests (requested_at desc);

-- Aggregated demand view — the prioritization signal
create or replace view public.template_demand as
  select
    template_id,
    max(template_title_en) as title_en,
    max(template_title_ar) as title_ar,
    max(category) as category,
    count(*)::int as request_count,
    max(requested_at) as last_requested_at
  from public.template_requests
  group by template_id
  order by request_count desc, last_requested_at desc;

-- =============================================================
-- RLS — anon insert, authenticated can read their own
-- =============================================================
alter table public.template_requests enable row level security;

drop policy if exists "anon can insert template requests"
  on public.template_requests;

create policy "anon can insert template requests"
  on public.template_requests
  for insert
  to anon, authenticated
  with check (true);

drop policy if exists "user can read own template requests"
  on public.template_requests;

create policy "user can read own template requests"
  on public.template_requests
  for select
  to authenticated
  using (email = auth.email());

comment on table public.template_requests is
  'Demand capture for templates listed as "coming-soon" in the catalog. Drives authoring priority.';
comment on view public.template_demand is
  'Aggregated request count per template — ORDER BY request_count DESC = roadmap priority list.';
