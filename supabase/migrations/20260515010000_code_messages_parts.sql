-- Persist UIMessage parts on code_messages so tool-invocation history survives reloads.
-- The chat route writes the user's incoming parts and the assistant's generated
-- parts (text today; tool calls once tools are wired in).
alter table public.code_messages
  add column if not exists parts jsonb not null default '[]'::jsonb;
