-- xeref-claw Supabase Schema
-- Run this in the Supabase SQL Editor for your project.
-- Authentication providers (magic link + Google OAuth) are enabled in the
-- Supabase dashboard under Authentication → Providers.

-- ── Profiles ──────────────────────────────────────────────────────────────
-- Shadow table that mirrors auth.users, auto-populated via trigger.
create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  email text,
  display_name text,
  avatar_url text,
  plan text not null default 'free',
  created_at timestamptz default now() not null
);

alter table public.profiles enable row level security;

create policy "Users can read own profile" on public.profiles
  for select using (auth.uid() = id);

create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);

-- Trigger: create a profile row whenever a new user signs up
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles(id, email, avatar_url)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ── Projects ──────────────────────────────────────────────────────────────
-- Saved agent configurations (named collections of CLAWS feature IDs).
create table public.projects (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  description text,
  selected_feature_ids text[] not null default '{}',
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

alter table public.projects enable row level security;

create policy "Users can CRUD own projects" on public.projects
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ── Prompt column on projects ─────────────────────────────────────────────
-- Stores the auto-generated system prompt for the agent.
-- Run: alter table public.projects add column prompt text;

-- ── Chats ─────────────────────────────────────────────────────────────────
-- Conversation sessions between a user and one of their agents.
create table public.chats (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  project_id uuid references public.projects(id) on delete set null,
  title text not null default 'New Chat',
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

alter table public.chats enable row level security;

create policy "Users can CRUD own chats" on public.chats
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create index idx_chats_user_id on public.chats(user_id, updated_at desc);

-- ── Messages ──────────────────────────────────────────────────────────────
-- Individual messages within a chat session.
create table public.messages (
  id uuid default gen_random_uuid() primary key,
  chat_id uuid references public.chats(id) on delete cascade not null,
  role text not null check (role in ('user', 'assistant', 'system')),
  content text not null,
  citations jsonb default '[]'::jsonb,
  created_at timestamptz default now() not null
);

alter table public.messages enable row level security;

create policy "Users can read own chat messages" on public.messages
  for select using (
    exists (
      select 1 from public.chats
      where chats.id = messages.chat_id
      and chats.user_id = auth.uid()
    )
  );

create policy "Users can insert into own chats" on public.messages
  for insert with check (
    exists (
      select 1 from public.chats
      where chats.id = messages.chat_id
      and chats.user_id = auth.uid()
    )
  );

create policy "Users can delete own chat messages" on public.messages
  for delete using (
    exists (
      select 1 from public.chats
      where chats.id = messages.chat_id
      and chats.user_id = auth.uid()
    )
  );

create index idx_messages_chat_id on public.messages(chat_id, created_at);

-- ── Usage Events ──────────────────────────────────────────────────────────
-- Analytics log for prompt generation and project actions.
create table public.usage_events (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade,
  event_type text not null, -- 'prompt_generated' | 'project_saved' | 'project_loaded' | 'project_deleted'
  metadata jsonb,
  created_at timestamptz default now() not null
);

alter table public.usage_events enable row level security;

create policy "Users can insert own events" on public.usage_events
  for insert with check (auth.uid() = user_id);

create policy "Users can read own events" on public.usage_events
  for select using (auth.uid() = user_id);
