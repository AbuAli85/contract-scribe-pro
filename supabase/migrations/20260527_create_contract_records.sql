-- contract_records: every generated contract with full lifecycle tracking.
-- Links to parties (first/second), stores field values, document path,
-- dates, and supports renewal chains via parent_id.

CREATE TABLE IF NOT EXISTS public.contract_records (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid        REFERENCES auth.users(id) ON DELETE CASCADE,
  title           text        NOT NULL,
  template_id     text,                          -- catalog id OR user_template id
  template_type   text        CHECK (template_type IN ('catalog','byo','custom')),
  first_party_id  uuid        REFERENCES public.parties(id) ON DELETE SET NULL,
  second_party_id uuid        REFERENCES public.parties(id) ON DELETE SET NULL,
  status          text        NOT NULL DEFAULT 'draft'
                              CHECK (status IN ('draft','active','expiring_soon','expired','terminated','renewed')),
  start_date      date,
  end_date        date,
  field_values    jsonb       NOT NULL DEFAULT '{}',
  document_path   text,                          -- Supabase Storage path
  notes           text,
  parent_id       uuid        REFERENCES public.contract_records(id) ON DELETE SET NULL,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.contract_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own contract records"
  ON public.contract_records FOR ALL
  USING  (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
