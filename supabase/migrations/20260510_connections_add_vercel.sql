-- Add 'vercel' to the user_connections provider check constraint.
-- The original constraint in 20260427_user_connections.sql did not include vercel.

ALTER TABLE public.user_connections
  DROP CONSTRAINT IF EXISTS user_connections_provider_check;

ALTER TABLE public.user_connections
  ADD CONSTRAINT user_connections_provider_check
  CHECK (provider IN ('github', 'google', 'notion', 'slack', 'supabase', 'webhook', 'vercel'));
