-- Add missing INSERT policy for documents table
-- Without this, authenticated users cannot insert document rows via the auth client

do $$ begin
  create policy "documents owner insert" on public.documents
    for insert with check (auth.uid() = user_id);
exception when duplicate_object then null; end $$;
