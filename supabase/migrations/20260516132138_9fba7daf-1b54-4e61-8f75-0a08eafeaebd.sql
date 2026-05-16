
-- Profiles
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  avatar_url text,
  phone text,
  city text,
  occupation text,
  bio text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.profiles enable row level security;
create policy "profiles_select_own" on public.profiles for select using (auth.uid() = id);
create policy "profiles_insert_own" on public.profiles for insert with check (auth.uid() = id);
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = id);

-- Roles
create type public.app_role as enum ('tenant', 'landlord', 'admin');
create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);
alter table public.user_roles enable row level security;
create policy "roles_select_own" on public.user_roles for select using (auth.uid() = user_id);

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

-- Landlord onboarding
create table public.landlord_onboarding (
  user_id uuid primary key references auth.users(id) on delete cascade,
  identity_verified boolean not null default false,
  first_property_added boolean not null default false,
  payment_setup boolean not null default false,
  activated boolean not null default false,
  updated_at timestamptz not null default now()
);
alter table public.landlord_onboarding enable row level security;
create policy "onb_select_own" on public.landlord_onboarding for select using (auth.uid() = user_id);
create policy "onb_upsert_own" on public.landlord_onboarding for insert with check (auth.uid() = user_id);
create policy "onb_update_own" on public.landlord_onboarding for update using (auth.uid() = user_id);

-- Auto-create profile + tenant role on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', new.email), new.raw_user_meta_data->>'avatar_url')
  on conflict (id) do nothing;
  insert into public.user_roles (user_id, role) values (new.id, 'tenant')
  on conflict do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
