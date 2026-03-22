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
