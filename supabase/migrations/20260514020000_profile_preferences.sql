-- Add per-user preferences JSON column to profiles
-- Stores sidebar config, capabilities settings, and Xeref Code settings.
-- All UI code merges against typed defaults in lib/types.ts — no schema enforcement needed here.

alter table public.profiles
  add column if not exists preferences jsonb not null default '{}'::jsonb;
