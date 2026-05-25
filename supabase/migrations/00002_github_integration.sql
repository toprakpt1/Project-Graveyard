-- GitHub connection metadata and repository sync fields
create table if not exists github_connections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users on delete cascade,
  github_login text not null,
  github_user_id bigint not null,
  token_ciphertext text not null,
  token_last_four text not null,
  token_type text not null default 'fine_grained_pat',
  repo_count int not null default 0,
  last_synced_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table github_connections enable row level security;

create policy "Users can view own github connection"
  on github_connections for select
  using (auth.uid() = user_id);

create policy "Users can create own github connection"
  on github_connections for insert
  with check (auth.uid() = user_id);

create policy "Users can update own github connection"
  on github_connections for update
  using (auth.uid() = user_id);

create policy "Users can delete own github connection"
  on github_connections for delete
  using (auth.uid() = user_id);

create trigger set_github_connections_updated_at
  before update on github_connections
  for each row execute function public.update_updated_at_column();

alter table projects
  add column if not exists github_repo_id bigint,
  add column if not exists github_full_name text,
  add column if not exists github_default_branch text,
  add column if not exists github_private boolean not null default false,
  add column if not exists github_last_pushed_at timestamptz,
  add column if not exists github_last_commit_at timestamptz,
  add column if not exists github_last_commit_sha text,
  add column if not exists github_language text,
  add column if not exists github_stars int not null default 0,
  add column if not exists github_open_issues int not null default 0;

create unique index if not exists projects_user_github_repo_id_key
  on projects(user_id, github_repo_id);
