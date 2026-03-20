-- Nearby profiles RPC (PostGIS ST_DWithin)
create or replace function public.nearby_profiles(
  user_lat  float8,
  user_lng  float8,
  radius_m  float8 default 10000
)
returns table (
  id           uuid,
  username     text,
  display_name text,
  avatar_url   text,
  distance_m   float8,
  age          int,
  looking_for  text[],
  is_verified  boolean,
  is_premium   boolean,
  last_seen    timestamptz
)
language sql stable security definer
set search_path = public
as $$
  select
    p.id,
    p.username,
    p.display_name,
    p.avatar_url,
    st_distance(
      p.location,
      st_point(user_lng, user_lat)::geography
    ) as distance_m,
    p.age,
    p.looking_for,
    p.is_verified,
    p.is_premium,
    p.last_seen
  from public.profiles p
  where
    p.location is not null
    and p.id != auth.uid()
    -- Exclude blocked
    and not exists (
      select 1 from public.blocks b
      where (b.blocker_id = auth.uid() and b.blocked_id = p.id)
         or (b.blocker_id = p.id and b.blocked_id = auth.uid())
    )
    and st_dwithin(
      case when p.travel_mode and p.travel_location is not null
        then p.travel_location
        else p.location
      end,
      st_point(user_lng, user_lat)::geography,
      radius_m
    )
  order by distance_m
  limit 200;
$$;
