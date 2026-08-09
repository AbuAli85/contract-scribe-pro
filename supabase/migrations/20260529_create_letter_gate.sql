-- letter_gate: freemium gate for the ministry-letters product (/letters).
--
-- Anonymous visitors may fill the letter form freely, but the .docx
-- download requires a verified email (one-time code) and is capped at
-- 2 free letters per email / device / IP.
--
-- BOTH tables are service-role only. RLS is enabled with NO policies, so
-- anon + authenticated get zero rows and zero writes; only the Edge
-- Functions (letter-otp-send / letter-otp-verify / letter-generate-check)
-- touch them, using the service role key. Never expose these to the client:
-- the row set is the abuse-control ledger.
--
-- Privacy: raw IPs and raw OTP codes are NEVER stored. Both arrive here
-- already hashed with SHA-256 + the server-side LETTER_GATE_SALT.

-- ---------------------------------------------------------------
-- Generation ledger — one row per downloaded letter
-- ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.letter_generations (
  id                uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  email             text        NOT NULL,              -- lowercased, trimmed
  email_verified_at timestamptz,
  device_hash       text        NOT NULL,              -- sha256(fingerprint + salt)
  ip_hash           text        NOT NULL,              -- sha256(ip + salt), never the raw IP
  authority         text        NOT NULL,
  letter_type       text        NOT NULL,
  language          text        NOT NULL DEFAULT 'ar',
  user_id           uuid        REFERENCES auth.users(id) ON DELETE SET NULL, -- null for anonymous
  created_at        timestamptz NOT NULL DEFAULT now()
);

-- The three limit dimensions. Every download does one count query
-- filtered on (email OR device_hash OR ip_hash), so all three are indexed.
CREATE INDEX IF NOT EXISTS letter_generations_email_idx       ON public.letter_generations (email);
CREATE INDEX IF NOT EXISTS letter_generations_device_hash_idx ON public.letter_generations (device_hash);
CREATE INDEX IF NOT EXISTS letter_generations_ip_hash_idx     ON public.letter_generations (ip_hash);

-- ---------------------------------------------------------------
-- One-time codes — hashed, short-lived, attempt-limited
-- ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.letter_otp_codes (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  email       text        NOT NULL,
  code_hash   text        NOT NULL,                    -- sha256(code + salt), never the raw code
  expires_at  timestamptz NOT NULL,
  attempts    int         NOT NULL DEFAULT 0,
  consumed_at timestamptz,                             -- set on success OR on invalidation
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- Lookups are always "latest live code for this email", and the send
-- rate limit counts this email's codes in the last hour.
CREATE INDEX IF NOT EXISTS letter_otp_codes_email_idx ON public.letter_otp_codes (email);
CREATE INDEX IF NOT EXISTS letter_otp_codes_email_created_idx
  ON public.letter_otp_codes (email, created_at DESC);

-- ---------------------------------------------------------------
-- Lockdown: RLS on, no policies at all => service role only.
-- The REVOKEs are belt-and-braces against Supabase's default grants;
-- RLS alone already denies, but an accidental future policy shouldn't
-- silently open table-level access too.
-- ---------------------------------------------------------------
ALTER TABLE public.letter_generations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.letter_otp_codes   ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.letter_generations FROM anon, authenticated;
REVOKE ALL ON public.letter_otp_codes   FROM anon, authenticated;
