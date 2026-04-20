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

-- ── Tasks ─────────────────────────────────────────────────────────────────
-- User tasks (manual or created by AI via chat tools).
create table public.tasks (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  project_id uuid references public.projects(id) on delete set null,
  title text not null,
  description text,
  status text not null default 'todo' check (status in ('todo', 'in_progress', 'done')),
  priority text not null default 'medium' check (priority in ('low', 'medium', 'high')),
  due_date timestamptz,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

alter table public.tasks enable row level security;

create policy "Users can CRUD own tasks" on public.tasks
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create index idx_tasks_user_id on public.tasks(user_id, created_at desc);

-- ── Memories ──────────────────────────────────────────────────────────────
-- Long-term memory items saved manually or from chat messages.
create table public.memories (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  content text not null,
  source text not null default 'manual' check (source in ('chat', 'manual')),
  tags text[] default '{}',
  created_at timestamptz default now() not null
);

alter table public.memories enable row level security;

create policy "Users can CRUD own memories" on public.memories
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ── Workflows ─────────────────────────────────────────────────────────────
-- Automation workflows (e.g., save memory on chat message).
create table public.workflows (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  trigger text not null,
  action text not null,
  enabled boolean not null default true,
  created_at timestamptz default now() not null
);

alter table public.workflows enable row level security;

create policy "Users can CRUD own workflows" on public.workflows
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ── Profile onboarding columns ────────────────────────────────────────────
-- Add these if they don't exist yet.
alter table public.profiles add column if not exists role text;
alter table public.profiles add column if not exists primary_goal text;
alter table public.profiles add column if not exists preferred_model text;
alter table public.profiles add column if not exists onboarding_completed boolean default false;

-- ── Google Calendar Integration ───────────────────────────────────────────
-- Stores OAuth tokens for Google Calendar. Add GOOGLE_CALENDAR_CLIENT_ID
-- and GOOGLE_CALENDAR_CLIENT_SECRET to your environment variables.
alter table public.profiles add column if not exists google_calendar_token jsonb;

-- Per-user Google OAuth credentials (so each user brings their own OAuth app).
-- Falls back to server-side env vars if these are null.
alter table public.profiles add column if not exists google_oauth_client_id text;
alter table public.profiles add column if not exists google_oauth_client_secret text;

-- ── Project Goals ─────────────────────────────────────────────────────────────
-- AI-decomposed sub-goals for each project, generated on project creation.
create table if not exists public.project_goals (
  id uuid default gen_random_uuid() primary key,
  project_id uuid references public.projects(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  completed boolean not null default false,
  created_at timestamptz default now() not null
);

alter table public.project_goals enable row level security;

do $$ begin
  if not exists (
    select 1 from pg_policies where tablename = 'project_goals' and policyname = 'Users can CRUD own project goals'
  ) then
    create policy "Users can CRUD own project goals" on public.project_goals
      for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
  end if;
end $$;

create index if not exists idx_project_goals_project_id on public.project_goals(project_id, created_at);

-- ── Notes ─────────────────────────────────────────────────────────────────────
-- User-authored notes with auto-save on blur.
create table if not exists public.notes (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null default 'Untitled',
  content text not null default '',
  updated_at timestamptz default now() not null,
  created_at timestamptz default now() not null
);

alter table public.notes enable row level security;

do $$ begin
  if not exists (
    select 1 from pg_policies where tablename = 'notes' and policyname = 'Users can CRUD own notes'
  ) then
    create policy "Users can CRUD own notes" on public.notes
      for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
  end if;
end $$;

create index if not exists idx_notes_user_id on public.notes(user_id, updated_at desc);

-- ── Rate Limits (guest/anon users) ───────────────────────────────────────────
-- Tracks per-minute request counts for anonymous users.
-- window_start is a unix epoch minute bucket (floor(epoch / 60)).
create table if not exists public.rate_limits (
  user_id uuid not null,
  window_start bigint not null,
  count int not null default 0,
  primary key (user_id, window_start)
);

alter table public.rate_limits enable row level security;

do $$ begin
  if not exists (
    select 1 from pg_policies where tablename = 'rate_limits' and policyname = 'Service role only'
  ) then
    create policy "Service role only" on public.rate_limits
      using (false)
      with check (false);
  end if;
end $$;

-- ── Workflow extensions ───────────────────────────────────────────────────────
alter table public.workflows add column if not exists cron_expression text;
alter table public.workflows add column if not exists webhook_secret text;
alter table public.workflows add column if not exists last_run_at timestamptz;
alter table public.workflows add column if not exists last_run_result text;
alter table public.workflows add column if not exists trigger_description text;
create unique index if not exists idx_workflows_webhook_secret on public.workflows(webhook_secret) where webhook_secret is not null;

-- ── Daily task target columns on profiles ─────────────────────────────────────
-- daily_task_goal: how many tasks the user wants to complete per day
-- daily_completed: running count for today (reset by cron at midnight Istanbul)
-- daily_reset_at: the UTC date of the last reset
alter table public.profiles add column if not exists daily_task_goal int not null default 3;
alter table public.profiles add column if not exists daily_completed int not null default 0;
alter table public.profiles add column if not exists daily_reset_at date default current_date;
