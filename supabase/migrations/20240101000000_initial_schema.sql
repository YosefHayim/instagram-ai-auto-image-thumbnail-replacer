-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Profiles table
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text unique not null,
  credits integer default 1 not null,
  is_premium boolean default false not null,
  stripe_customer_id text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Optimizations table
create table public.optimizations (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  original_url text not null,
  ai_url text,
  status text default 'pending' check (status in ('pending', 'processing', 'completed', 'failed')) not null,
  style_preset text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create indexes
create index idx_optimizations_user_id on public.optimizations(user_id);
create index idx_optimizations_status on public.optimizations(status);
create index idx_profiles_stripe_customer_id on public.profiles(stripe_customer_id);

-- Enable Row Level Security
alter table public.profiles enable row level security;
alter table public.optimizations enable row level security;

-- Profiles policies
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Optimizations policies
create policy "Users can view own optimizations"
  on public.optimizations for select
  using (auth.uid() = user_id);

create policy "Users can create own optimizations"
  on public.optimizations for insert
  with check (auth.uid() = user_id);

create policy "Users can update own optimizations"
  on public.optimizations for update
  using (auth.uid() = user_id);

-- Function to handle new user creation
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to create profile on signup
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Function to decrement credits
create or replace function public.decrement_credits(user_id uuid)
returns integer as $$
declare
  current_credits integer;
begin
  select credits into current_credits
  from public.profiles
  where id = user_id;

  if current_credits = -1 then
    return -1;
  end if;

  if current_credits > 0 then
    update public.profiles
    set credits = credits - 1, updated_at = now()
    where id = user_id;
    return current_credits - 1;
  else
    return 0;
  end if;
end;
$$ language plpgsql security definer;

-- Function to update updated_at timestamp
create or replace function public.update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

-- Triggers for updated_at
create trigger update_profiles_updated_at
  before update on public.profiles
  for each row execute procedure public.update_updated_at_column();

create trigger update_optimizations_updated_at
  before update on public.optimizations
  for each row execute procedure public.update_updated_at_column();
