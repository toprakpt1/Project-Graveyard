alter table projects
  add column if not exists archived_at timestamptz,
  add column if not exists restarted_at timestamptz,
  add column if not exists pinned boolean not null default false,
  add column if not exists pinned_at timestamptz;

create index if not exists projects_user_pinned_idx on projects(user_id, pinned_at desc nulls last);
create index if not exists projects_user_archived_idx on projects(user_id, archived_at);
