-- parties: registry of companies and individuals that appear as
-- first/second party in contracts. Replaces fill_seeds for the
-- formal contract workflow.

CREATE TABLE IF NOT EXISTS public.parties (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid        REFERENCES auth.users(id) ON DELETE CASCADE,
  type         text        NOT NULL CHECK (type IN ('company','person')),
  role         text        NOT NULL CHECK (role IN ('employer','client','employee','contractor','supplier','other')),
  name_en      text        NOT NULL,
  name_ar      text        NOT NULL DEFAULT '',
  email        text,
  phone        text,
  address_en   text,
  address_ar   text,
  cr_number    text,        -- commercial registration (companies)
  tax_id       text,
  id_number    text,        -- national ID / passport (persons)
  nationality  text,
  job_title_en text,
  job_title_ar text,
  extra_fields jsonb       NOT NULL DEFAULT '{}', -- template token key→value store
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.parties ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own parties"
  ON public.parties FOR ALL
  USING  (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
