-- contract_events: immutable audit trail for every contract record.
-- One row per lifecycle event (created, activated, terminated, etc.)

CREATE TABLE IF NOT EXISTS public.contract_events (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id uuid        NOT NULL REFERENCES public.contract_records(id) ON DELETE CASCADE,
  user_id     uuid        REFERENCES auth.users(id) ON DELETE SET NULL,
  type        text        NOT NULL CHECK (type IN (
                'created','activated','document_generated',
                'expiring_soon','expired','terminated','renewed',
                'extended','note_added'
              )),
  note        text,
  data        jsonb,
  created_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.contract_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see own contract events"
  ON public.contract_events FOR ALL
  USING (
    auth.uid() = user_id
    OR auth.uid() = (
      SELECT user_id FROM public.contract_records WHERE id = contract_id LIMIT 1
    )
  )
  WITH CHECK (
    auth.uid() = user_id
  );
