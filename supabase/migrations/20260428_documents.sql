-- xeref — user document uploads for the Memory view

create table if not exists public.documents (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  name         text not null,
  size         bigint not null,
  mime_type    text not null default 'application/octet-stream',
  storage_path text not null,
  status       text not null default 'ready' check (status in ('processing', 'ready', 'error')),
  created_at   timestamptz not null default now()
);

create index if not exists documents_user_idx on public.documents(user_id);

alter table public.documents enable row level security;

do $$ begin
  create policy "documents owner select" on public.documents
    for select using (auth.uid() = user_id);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "documents owner delete" on public.documents
    for delete using (auth.uid() = user_id);
exception when duplicate_object then null; end $$;

-- Storage bucket (private — files are only accessible via signed URLs or service role)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'documents',
  'documents',
  false,
  52428800, -- 50 MB
  array['application/pdf','application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain','text/markdown','application/msword']
)
on conflict (id) do nothing;

-- Storage RLS: users can read/write only inside their own folder
do $$ begin
  create policy "documents storage owner" on storage.objects
    for all using (
      bucket_id = 'documents' and
      (storage.foldername(name))[1] = auth.uid()::text
    );
exception when duplicate_object then null; end $$;
