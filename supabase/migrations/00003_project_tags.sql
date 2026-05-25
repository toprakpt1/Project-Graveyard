alter table projects
  add column if not exists tags text[] not null default '{}';
