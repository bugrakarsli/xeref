-- xeref — user-scoped third-party connections (OAuth tokens, PATs, webhook configs)
-- One row per (user, provider). Tokens are AES-256-GCM encrypted before insert.

create extension if not exists "pgcrypto";

create table if not exists public.user_connections (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references auth.users(id) on delete cascade,
  provider        text not null check (provider in ('github','google','notion','slack','supabase','webhook')),
  kind            text not null check (kind in ('oauth','pat','webhook')),
  access_token    text,            -- encrypted (AES-256-GCM, base64)
  refresh_token   text,            -- encrypted (AES-256-GCM, base64), nullable
  expires_at      timestamptz,     -- nullable; some providers issue non-expiring tokens
  scopes          text[] not null default '{}',
  metadata        jsonb not null default '{}'::jsonb,  -- account email, workspace_id, webhook_url, etc.
  status          text not null default 'active' check (status in ('active','revoked','error')),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  unique (user_id, provider)
);

create index if not exists user_connections_user_idx on public.user_connections(user_id);

alter table public.user_connections enable row level security;

do $$ begin
  create policy "user_connections owner select" on public.user_connections
    for select using (auth.uid() = user_id);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "user_connections owner delete" on public.user_connections
    for delete using (auth.uid() = user_id);
exception when duplicate_object then null; end $$;

-- Note: writes (insert/update) are performed via the service-role client
-- from server-only routes (OAuth callbacks). Per-user RLS write policies
-- are intentionally omitted so encrypted tokens never round-trip through
-- the anon-key client.

create or replace function public.touch_user_connections_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;

drop trigger if exists user_connections_touch on public.user_connections;
create trigger user_connections_touch before update on public.user_connections
  for each row execute function public.touch_user_connections_updated_at();
