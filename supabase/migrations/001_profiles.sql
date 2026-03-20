-- Enable PostGIS for geographic queries
create extension if not exists postgis;
create extension if not exists pgcrypto;

-- Profiles table
create table public.profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  username      text unique not null check (length(username) >= 3 and length(username) <= 32),
  display_name  text check (length(display_name) <= 50),
  bio           text check (length(bio) <= 500),
  avatar_url    text,
  gallery_urls  text[]       not null default '{}',
  location      geography(point, 4326),
  geohash       text generated always as (
    case when location is not null
      then st_geohash(location::geometry, 7)
      else null
    end
  ) stored,
  looking_for   text[]       not null default '{}',
  age           int          check (age >= 18 and age <= 99),
  height_cm     int          check (height_cm >= 100 and height_cm <= 250),
  is_verified   boolean      not null default false,
  is_premium    boolean      not null default false,
  travel_mode   boolean      not null default false,
  travel_location geography(point, 4326),
  last_seen     timestamptz  not null default now(),
  created_at    timestamptz  not null default now()
);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, username)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', 'user_' || substr(new.id::text, 1, 8))
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Update last_seen trigger
create or replace function public.update_last_seen()
returns trigger language plpgsql security definer as $$
begin
  update public.profiles set last_seen = now() where id = auth.uid();
  return new;
end;
$$;
