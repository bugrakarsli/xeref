-- Telegram bot integration: user-to-telegram account links and one-time pairing codes

create table public.telegram_links (
  telegram_user_id bigint primary key,
  user_id uuid references auth.users on delete cascade not null,
  telegram_username text,
  created_at timestamptz default now()
);

alter table public.telegram_links enable row level security;
-- No client access — only service role (bot) reads/writes this table

create table public.telegram_pairing_codes (
  code text primary key default gen_random_uuid()::text,
  user_id uuid references auth.users on delete cascade not null,
  expires_at timestamptz not null,
  used boolean default false,
  created_at timestamptz default now()
);

alter table public.telegram_pairing_codes enable row level security;
create policy "owner_read" on public.telegram_pairing_codes for select using (auth.uid() = user_id);
create policy "owner_insert" on public.telegram_pairing_codes for insert with check (auth.uid() = user_id);
