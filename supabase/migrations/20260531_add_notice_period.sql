-- notice_period_days on contract_records.
--
-- Company OS Constitution §I3: the notice period "drives the alert
-- threshold, not just expiry". A lease requiring 90 days' notice has to
-- surface as expiring 90 days out — warning at the flat 30 days the UI
-- assumed means the notice window has already closed when the badge
-- turns amber.
--
-- Null = no explicit notice period; src/lib/contractLifecycle.ts falls
-- back to DEFAULT_NOTICE_PERIOD_DAYS (30), which is the behaviour every
-- existing row had before this column existed.

ALTER TABLE public.contract_records
  ADD COLUMN IF NOT EXISTS notice_period_days integer
    CHECK (notice_period_days IS NULL
           OR (notice_period_days >= 0 AND notice_period_days <= 730));

COMMENT ON COLUMN public.contract_records.notice_period_days IS
  'Days of notice required before end_date. Drives the expiring_soon '
  'warning window (Constitution SI3). Null = default 30-day window.';
