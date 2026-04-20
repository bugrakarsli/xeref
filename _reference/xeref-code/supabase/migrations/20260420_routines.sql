-- xeref /code — routines & code sessions (additive, safe to re-run)
create extension if not exists "pgcrypto";

create table if not exists public.routines (
  id              text primary key check (id ~ '^trig_01[0-9A-HJKMNP-TV-Z]{24}$'),
  user_id         uuid not null references auth.users(id) on delete cascade,
  name            text not null,
  prompt          text not null default '',
  model           text not null default 'haiku-4.5',
  repo_full_name  text,
  connectors      jsonb not null default '[]'::jsonb,
  schedule_cron   text,
  timezone        text not null default 'Europe/Istanbul',
  active          boolean not null default true,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create table if not exists public.routine_runs (
  id            uuid primary key default gen_random_uuid(),
  routine_id    text not null references public.routines(id) on delete cascade,
  user_id       uuid not null references auth.users(id) on delete cascade,
  kind          text not null check (kind in ('scheduled','manual','api','webhook')),
  status        text not null default 'queued',
  started_at    timestamptz not null default now(),
  finished_at   timestamptz
);

create table if not exists public.code_sessions (
  id             text primary key check (id ~ '^session_[0-9A-HJKMNP-TV-Z]{26}$'),
  user_id        uuid not null references auth.users(id) on delete cascade,
  repo_full_name text,
  title          text not null default 'New session',
  created_at     timestamptz not null default now()
);

create index if not exists routines_user_idx on public.routines(user_id, created_at desc);
create index if not exists runs_routine_idx on public.routine_runs(routine_id, started_at desc);
create index if not exists sessions_user_idx on public.code_sessions(user_id, created_at desc);

alter table public.routines      enable row level security;
alter table public.routine_runs  enable row level security;
alter table public.code_sessions enable row level security;

do $$ begin
  create policy "routines owner" on public.routines
    for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "runs owner" on public.routine_runs
    for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "sessions owner" on public.code_sessions
    for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
exception when duplicate_object then null; end $$;

create or replace function public.touch_routines_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;

drop trigger if exists routines_touch on public.routines;
create trigger routines_touch before update on public.routines
  for each row execute function public.touch_routines_updated_at();
