-- Add pro_until column to profiles.
-- The Thawani webhook sets this to 32 days from now on each successful payment.
-- NULL means the user is on free tier (or has never paid).

alter table public.profiles
  add column if not exists pro_until timestamptz;
