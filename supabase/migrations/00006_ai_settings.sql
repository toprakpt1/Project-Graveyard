create table if not exists ai_settings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade unique,
  openrouter_api_key_ciphertext text,
  openrouter_api_key_last_four text,
  model text not null default 'openrouter/free',
  ai_enabled boolean not null default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table ai_settings enable row level security;

create policy "Users can view own ai settings"
  on ai_settings for select
  using (auth.uid() = user_id);

create policy "Users can insert own ai settings"
  on ai_settings for insert
  with check (auth.uid() = user_id);

create policy "Users can update own ai settings"
  on ai_settings for update
  using (auth.uid() = user_id);

create trigger set_ai_settings_updated_at
  before update on ai_settings
  for each row execute function public.update_updated_at_column();