-- Create profiles table automatically when a new user signs up
create table if not exists profiles (
  id uuid primary key references auth.users on delete cascade,
  username text unique,
  full_name text,
  avatar_url text,
  created_at timestamptz default now()
);

alter table profiles enable row level security;

create policy "Users can view own profile"
  on profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on profiles for update
  using (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, username)
  values (
    new.id,
    new.raw_user_meta_data ->> 'full_name',
    split_part(new.email, '@', 1)
  );
  return new;
end;
$$;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Projects table
create table if not exists projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  name text not null,
  description text,
  goal text,
  technologies text[] default '{}',
  github_repo_url text,
  status text not null default 'active' check (status in ('active', 'paused', 'abandoned', 'completed')),
  progress int not null default 0 check (progress >= 0 and progress <= 100),
  stopped_reason text check (stopped_reason in ('motivation', 'scope_creep', 'technical', 'no_time', 'changed_mind', 'other')),
  started_at timestamptz not null default now(),
  last_updated_at timestamptz not null default now(),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table projects enable row level security;

create policy "Users can view own projects"
  on projects for select
  using (auth.uid() = user_id);

create policy "Users can create own projects"
  on projects for insert
  with check (auth.uid() = user_id);

create policy "Users can update own projects"
  on projects for update
  using (auth.uid() = user_id);

create policy "Users can delete own projects"
  on projects for delete
  using (auth.uid() = user_id);

-- Auto-update updated_at
create or replace function public.update_updated_at_column()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_updated_at
  before update on projects
  for each row execute function public.update_updated_at_column();

-- Project notes table
create table if not exists project_notes (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects on delete cascade,
  content text not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table project_notes enable row level security;

create policy "Users can view notes on own projects"
  on project_notes for select
  using (
    exists (
      select 1 from projects
      where projects.id = project_notes.project_id
      and projects.user_id = auth.uid()
    )
  );

create policy "Users can create notes on own projects"
  on project_notes for insert
  with check (
    exists (
      select 1 from projects
      where projects.id = project_notes.project_id
      and projects.user_id = auth.uid()
    )
  );

create policy "Users can delete notes on own projects"
  on project_notes for delete
  using (
    exists (
      select 1 from projects
      where projects.id = project_notes.project_id
      and projects.user_id = auth.uid()
    )
  );

create trigger set_project_notes_updated_at
  before update on project_notes
  for each row execute function public.update_updated_at_column();
