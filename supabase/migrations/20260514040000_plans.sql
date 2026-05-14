create table if not exists plans (
  id text primary key default ('plan_' || gen_random_uuid()::text),
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null default 'Untitled Plan',
  goal text not null default '',
  content jsonb not null default '{"phases":[],"kpis":[]}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table plans enable row level security;

create policy "users can manage own plans"
  on plans for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index plans_user_id_idx on plans(user_id);
