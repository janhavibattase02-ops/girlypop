-- ================================================================
-- GIRLYPOP SUPABASE DATABASE SCHEMA
-- Run this in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/wmyfkrknjhjtcogxtsxe/sql/new
--
-- Features:
-- 1. Profiles (User details, PIN, age, emergency template)
-- 2. Cycle Settings (Cycle duration, period length, start date)
-- 3. Period Logs (Daily symptoms, flow, cramps, mood, water intake)
-- 4. Trusted Contacts (Emergency circle, phone numbers, roles)
--
-- Row Level Security (RLS) is enabled on all tables:
-- Every row belongs strictly to auth.uid()
-- ================================================================

-- 1. PROFILES TABLE
create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  phone text,
  name text default 'Maya',
  age integer default 19,
  pin text default '1234',
  emergency_message_template text default 'EMERGENCY: I feel unsafe. Here is my live GPS location! Please check on me immediately.',
  theme text default 'olive',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 2. CYCLE SETTINGS TABLE
create table if not exists public.cycle_settings (
  id text default gen_random_uuid()::text primary key,
  user_id uuid references auth.users(id) on delete cascade not null unique,
  average_cycle_days integer default 28,
  period_duration_days integer default 5,
  last_period_start_date text not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 3. PERIOD LOGS TABLE
create table if not exists public.period_logs (
  id text default gen_random_uuid()::text primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  date text not null,
  flow text default 'none',
  cramps text default 'none',
  mood text[] default array[]::text[],
  symptoms text[] default array[]::text[],
  notes text default '',
  water_glasses integer default 6,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(user_id, date)
);

create index if not exists idx_period_logs_user_date on public.period_logs(user_id, date);

-- 4. TRUSTED CONTACTS TABLE
create table if not exists public.trusted_contacts (
  id text default gen_random_uuid()::text primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  phone text not null,
  relationship text default 'Friend',
  is_emergency_primary boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_trusted_contacts_user on public.trusted_contacts(user_id);

-- ================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ================================================================

alter table public.profiles enable row level security;
alter table public.cycle_settings enable row level security;
alter table public.period_logs enable row level security;
alter table public.trusted_contacts enable row level security;

-- PROFILES POLICIES
drop policy if exists "Users can view own profile" on public.profiles;
create policy "Users can view own profile" on public.profiles
  for select using (auth.uid() = id);

drop policy if exists "Users can insert own profile" on public.profiles;
create policy "Users can insert own profile" on public.profiles
  for insert with check (auth.uid() = id);

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);

-- CYCLE SETTINGS POLICIES
drop policy if exists "Users can view own cycle settings" on public.cycle_settings;
create policy "Users can view own cycle settings" on public.cycle_settings
  for select using (auth.uid() = user_id);

drop policy if exists "Users can insert own cycle settings" on public.cycle_settings;
create policy "Users can insert own cycle settings" on public.cycle_settings
  for insert with check (auth.uid() = user_id);

drop policy if exists "Users can update own cycle settings" on public.cycle_settings;
create policy "Users can update own cycle settings" on public.cycle_settings
  for update using (auth.uid() = user_id);

-- PERIOD LOGS POLICIES
drop policy if exists "Users can view own period logs" on public.period_logs;
create policy "Users can view own period logs" on public.period_logs
  for select using (auth.uid() = user_id);

drop policy if exists "Users can insert own period logs" on public.period_logs;
create policy "Users can insert own period logs" on public.period_logs
  for insert with check (auth.uid() = user_id);

drop policy if exists "Users can update own period logs" on public.period_logs;
create policy "Users can update own period logs" on public.period_logs
  for update using (auth.uid() = user_id);

drop policy if exists "Users can delete own period logs" on public.period_logs;
create policy "Users can delete own period logs" on public.period_logs
  for delete using (auth.uid() = user_id);

-- TRUSTED CONTACTS POLICIES
drop policy if exists "Users can view own trusted contacts" on public.trusted_contacts;
create policy "Users can view own trusted contacts" on public.trusted_contacts
  for select using (auth.uid() = user_id);

drop policy if exists "Users can insert own trusted contacts" on public.trusted_contacts;
create policy "Users can insert own trusted contacts" on public.trusted_contacts
  for insert with check (auth.uid() = user_id);

drop policy if exists "Users can update own trusted contacts" on public.trusted_contacts;
create policy "Users can update own trusted contacts" on public.trusted_contacts
  for update using (auth.uid() = user_id);

drop policy if exists "Users can delete own trusted contacts" on public.trusted_contacts;
create policy "Users can delete own trusted contacts" on public.trusted_contacts
  for delete using (auth.uid() = user_id);
