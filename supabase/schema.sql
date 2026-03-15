-- Initial Schema for Pathfinder Unit Management

-- Settings Table
create table settings (
  id text primary key,
  app_icon_url text
);

-- Units Table
create table units (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  password text,
  card_image_url text,
  card_color text,
  icon text,
  icon_url text,
  scoring_criteria jsonb default '[]'::jsonb,
  ranks jsonb default '[]'::jsonb,
  created_at timestamp with time zone default now()
);

-- Members Table
create table members (
  id uuid primary key default gen_random_uuid(),
  unit_id uuid references units(id) on delete cascade,
  name text not null,
  age integer,
  role text,
  class_name text,
  score integer default 0,
  ranking integer,
  avatar_url text,
  patent jsonb,
  all_patents jsonb,
  created_at timestamp with time zone default now()
);

-- Score Logs Table
create table score_logs (
  id uuid primary key default gen_random_uuid(),
  unit_id uuid references units(id) on delete cascade,
  date timestamp with time zone not null,
  member_scores jsonb default '{}'::jsonb,
  created_at timestamp with time zone default now()
);

-- Row Level Security (RLS)
-- For now, enable read for everyone to match Firebase rules
alter table settings enable row level security;
create policy "Allow public read on settings" on settings for select using (true);

alter table units enable row level security;
create policy "Allow public read on units" on units for select using (true);
create policy "Allow authenticated insert/update on units" on units for all using (auth.role() = 'authenticated');

alter table members enable row level security;
create policy "Allow public read on members" on members for select using (true);
create policy "Allow authenticated insert/update on members" on members for all using (auth.role() = 'authenticated');

alter table score_logs enable row level security;
create policy "Allow public read on score_logs" on score_logs for select using (true);
create policy "Allow authenticated insert/update on score_logs" on score_logs for all using (auth.role() = 'authenticated');
