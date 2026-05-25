create table if not exists project_milestones (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects on delete cascade,
  title text not null check (char_length(trim(title)) > 0),
  completed boolean not null default false,
  position int not null default 0,
  completed_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table project_milestones enable row level security;

create policy "Users can view milestones on own projects"
  on project_milestones for select
  using (
    exists (
      select 1 from projects
      where projects.id = project_milestones.project_id
      and projects.user_id = auth.uid()
    )
  );

create policy "Users can create milestones on own projects"
  on project_milestones for insert
  with check (
    exists (
      select 1 from projects
      where projects.id = project_milestones.project_id
      and projects.user_id = auth.uid()
    )
  );

create policy "Users can update milestones on own projects"
  on project_milestones for update
  using (
    exists (
      select 1 from projects
      where projects.id = project_milestones.project_id
      and projects.user_id = auth.uid()
    )
  );

create policy "Users can delete milestones on own projects"
  on project_milestones for delete
  using (
    exists (
      select 1 from projects
      where projects.id = project_milestones.project_id
      and projects.user_id = auth.uid()
    )
  );

create trigger set_project_milestones_updated_at
  before update on project_milestones
  for each row execute function public.update_updated_at_column();

create index if not exists project_milestones_project_idx
  on project_milestones(project_id, position, created_at);

create table if not exists project_status_events (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects on delete cascade,
  event_type text not null check (
    event_type in (
      'created',
      'status_change',
      'progress_update',
      'resurrected',
      'archived',
      'restored'
    )
  ),
  from_status text check (from_status in ('active', 'paused', 'abandoned', 'completed')),
  to_status text not null check (to_status in ('active', 'paused', 'abandoned', 'completed')),
  progress int not null default 0 check (progress >= 0 and progress <= 100),
  note text,
  happened_at timestamptz not null default now(),
  created_at timestamptz default now()
);

alter table project_status_events enable row level security;

create policy "Users can view status events on own projects"
  on project_status_events for select
  using (
    exists (
      select 1 from projects
      where projects.id = project_status_events.project_id
      and projects.user_id = auth.uid()
    )
  );

create policy "Users can create status events on own projects"
  on project_status_events for insert
  with check (
    exists (
      select 1 from projects
      where projects.id = project_status_events.project_id
      and projects.user_id = auth.uid()
    )
  );

create index if not exists project_status_events_project_idx
  on project_status_events(project_id, happened_at);
