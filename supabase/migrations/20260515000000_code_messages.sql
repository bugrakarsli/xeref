-- Create code_messages table for code session chat history.
-- Previously referenced by app/api/sessions/[id]/chat/route.ts and
-- components/dashboard/code-session-view.tsx but never declared in source control.

create table if not exists public.code_messages (
  id          text primary key,
  session_id  text not null references public.code_sessions(id) on delete cascade,
  user_id     uuid not null references auth.users(id) on delete cascade,
  role        text not null check (role in ('user', 'assistant', 'system')),
  content     text not null default '',
  created_at  timestamptz not null default now()
);

create index if not exists code_messages_session_id_created_at_idx
  on public.code_messages (session_id, created_at);

alter table public.code_messages enable row level security;

create policy "code_messages owner" on public.code_messages
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- code_sessions.updated_at is read by the chat route but was missing from the
-- original table definition in 20260420_routines.sql.
alter table public.code_sessions
  add column if not exists updated_at timestamptz not null default now();
