-- MCP token for external agent authentication
alter table public.profiles add column if not exists mcp_token text unique;

-- Telegram bot token for deploy wizard
alter table public.profiles add column if not exists telegram_bot_token text;

-- Index for fast bearer token lookup
create unique index if not exists idx_profiles_mcp_token on public.profiles(mcp_token) where mcp_token is not null;
