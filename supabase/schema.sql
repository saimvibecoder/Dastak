-- Dastak database setup. Paste this whole file into Supabase > SQL Editor and run it once.
-- Safe defaults: every table has row level security; guests are only written through
-- server-side functions that only the server (service role) can call.

create extension if not exists pgcrypto;

-- ---------- tables ----------
create table if not exists public.restaurants (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null check (slug ~ '^[a-z0-9-]{3,40}$'),
  name text not null check (char_length(name) between 2 and 60),
  area text check (char_length(area) <= 60),
  offer text not null default 'free dish' check (char_length(offer) between 3 and 80),
  code_prefix text not null default 'DK' check (code_prefix ~ '^[A-Z]{2,4}$'),
  whatsapp text check (whatsapp is null or whatsapp ~ '^[0-9]{10,15}$'),
  palette text not null default 'sand' check (palette in ('blush','mist','sage','sand','lilac','night')),
  tables int not null default 12 check (tables between 1 and 200),
  created_at timestamptz not null default now()
);

create table if not exists public.admins (
  user_id uuid primary key references auth.users on delete cascade
);

create table if not exists public.members (
  restaurant_id uuid not null references public.restaurants on delete cascade,
  user_id uuid not null references auth.users on delete cascade,
  role text not null check (role in ('owner','staff')),
  email text,
  created_at timestamptz not null default now(),
  primary key (restaurant_id, user_id)
);

create table if not exists public.invites (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants on delete cascade,
  email text not null check (email = lower(email) and email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  role text not null check (role in ('owner','staff')),
  created_at timestamptz not null default now(),
  unique (restaurant_id, email)
);

create table if not exists public.guests (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants on delete cascade,
  name text not null check (char_length(name) between 2 and 60),
  phone text not null check (phone ~ '^[6-9][0-9]{9}$'),
  birthday_day smallint check (birthday_day between 1 and 31),
  birthday_month smallint check (birthday_month between 1 and 12),
  table_no int check (table_no between 1 and 200),
  code text not null,
  redeemed_at timestamptz,
  opted_out_at timestamptz,
  consent_at timestamptz not null,
  created_at timestamptz not null default now(),
  unique (restaurant_id, phone),
  unique (restaurant_id, code)
);
create index if not exists guests_rest_created on public.guests (restaurant_id, created_at desc);

create table if not exists public.visits (
  id bigint generated always as identity primary key,
  restaurant_id uuid not null references public.restaurants on delete cascade,
  guest_id uuid not null references public.guests on delete cascade,
  at timestamptz not null default now()
);
create index if not exists visits_rest_at on public.visits (restaurant_id, at);

create table if not exists public.campaigns (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants on delete cascade,
  name text not null check (char_length(name) <= 60),
  audience text not null check (char_length(audience) <= 60),
  message text not null check (char_length(message) <= 1000),
  sent_count int not null default 0 check (sent_count >= 0),
  created_by uuid default auth.uid() references auth.users on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.rate_hits (
  id bigint generated always as identity primary key,
  bucket text not null,
  at timestamptz not null default now()
);
create index if not exists rate_hits_bucket_at on public.rate_hits (bucket, at);

-- ---------- helpers ----------
create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from admins where user_id = auth.uid())
$$;

create or replace function public.is_member(rid uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from members where restaurant_id = rid and user_id = auth.uid()) or is_admin()
$$;

create or replace function public.is_owner(rid uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from members where restaurant_id = rid and user_id = auth.uid() and role = 'owner') or is_admin()
$$;

-- ---------- row level security ----------
alter table public.restaurants enable row level security;
alter table public.admins      enable row level security;
alter table public.members     enable row level security;
alter table public.invites     enable row level security;
alter table public.guests      enable row level security;
alter table public.visits      enable row level security;
alter table public.campaigns   enable row level security;
alter table public.rate_hits   enable row level security; -- no policies: server only

drop policy if exists r_sel on public.restaurants;
create policy r_sel on public.restaurants for select using (is_member(id));
drop policy if exists r_upd on public.restaurants;
create policy r_upd on public.restaurants for update using (is_owner(id)) with check (is_owner(id));
drop policy if exists r_ins on public.restaurants;
create policy r_ins on public.restaurants for insert with check (is_admin());
drop policy if exists r_del on public.restaurants;
create policy r_del on public.restaurants for delete using (is_admin());

drop policy if exists a_sel on public.admins;
create policy a_sel on public.admins for select using (user_id = auth.uid());

drop policy if exists m_sel on public.members;
create policy m_sel on public.members for select using (is_member(restaurant_id));
drop policy if exists m_del on public.members;
create policy m_del on public.members for delete using (is_owner(restaurant_id) and user_id <> auth.uid());

drop policy if exists i_all on public.invites;
create policy i_all on public.invites for all using (is_owner(restaurant_id)) with check (is_owner(restaurant_id));

drop policy if exists g_sel on public.guests;
create policy g_sel on public.guests for select using (is_member(restaurant_id));
drop policy if exists g_upd on public.guests;
create policy g_upd on public.guests for update using (is_member(restaurant_id)) with check (is_member(restaurant_id));
drop policy if exists g_del on public.guests;
create policy g_del on public.guests for delete using (is_owner(restaurant_id));

drop policy if exists v_sel on public.visits;
create policy v_sel on public.visits for select using (is_member(restaurant_id));
drop policy if exists v_ins on public.visits;
create policy v_ins on public.visits for insert with check (
  is_member(restaurant_id) and exists (select 1 from guests g where g.id = guest_id and g.restaurant_id = visits.restaurant_id));

drop policy if exists c_sel on public.campaigns;
create policy c_sel on public.campaigns for select using (is_member(restaurant_id));
drop policy if exists c_ins on public.campaigns;
create policy c_ins on public.campaigns for insert with check (is_member(restaurant_id) and created_by = auth.uid());

-- Column level limits: signed-in users may only change these guest fields (no moving guests between restaurants).
revoke insert, update on public.guests from anon, authenticated;
grant update (redeemed_at, opted_out_at, name, birthday_day, birthday_month) on public.guests to authenticated;
revoke update on public.restaurants from authenticated;
grant update (name, area, offer, whatsapp, palette, tables) on public.restaurants to authenticated;
revoke all on public.rate_hits from anon, authenticated;

-- ---------- functions used by the app ----------

-- Public info for the guest page (anyone with the QR).
create or replace function public.public_restaurant(p_slug text)
returns table (name text, area text, offer text, whatsapp text, palette text, tables int, code_prefix text)
language sql stable security definer set search_path = public as $$
  select name, area, offer, whatsapp, palette, tables, code_prefix from restaurants where slug = p_slug
$$;
grant execute on function public.public_restaurant(text) to anon, authenticated;

-- Simple sliding-window rate limit. Returns true when allowed.
create or replace function public.rate_ok(p_bucket text, p_max int, p_window interval)
returns boolean language plpgsql security definer set search_path = public as $$
declare n int;
begin
  delete from rate_hits where at < now() - interval '1 day';
  select count(*) into n from rate_hits where bucket = p_bucket and at > now() - p_window;
  if n >= p_max then return false; end if;
  insert into rate_hits (bucket) values (p_bucket);
  return true;
end $$;

-- Guest claims the offer. Only the server (service role) may call it, after its own checks.
create or replace function public.claim_offer(
  p_slug text, p_table int, p_name text, p_phone text, p_bday_d int, p_bday_m int, p_ip text)
returns json language plpgsql security definer set search_path = public as $$
declare r restaurants; c text; gid uuid; tries int := 0;
begin
  select * into r from restaurants where slug = p_slug;
  if r.id is null then return json_build_object('error','not_found'); end if;
  if not rate_ok('claim:ip:' || p_ip, 8, interval '10 minutes') then return json_build_object('error','slow_down'); end if;
  if not rate_ok('claim:rest:' || r.id, 300, interval '1 hour') then return json_build_object('error','slow_down'); end if;
  if p_table is null or p_table < 1 or p_table > r.tables then p_table := null; end if;
  if exists (select 1 from guests where restaurant_id = r.id and phone = p_phone) then
    return json_build_object('error','exists');
  end if;
  loop
    tries := tries + 1;
    c := r.code_prefix || '-' || lpad((floor(random() * 9000) + 1000)::int::text, 4, '0');
    begin
      insert into guests (restaurant_id, name, phone, birthday_day, birthday_month, table_no, code, consent_at)
      values (r.id, trim(p_name), p_phone, p_bday_d, p_bday_m, p_table, c, now())
      returning id into gid;
      exit;
    exception when unique_violation then
      if exists (select 1 from guests where restaurant_id = r.id and phone = p_phone) then
        return json_build_object('error','exists');
      end if;
      if tries > 20 then return json_build_object('error','busy'); end if;
    end;
  end loop;
  insert into visits (restaurant_id, guest_id) values (r.id, gid);
  return json_build_object('code', c, 'name', r.name, 'whatsapp', r.whatsapp, 'offer', r.offer);
end $$;
revoke all on function public.claim_offer(text,int,text,text,int,int,text) from public, anon, authenticated;
grant execute on function public.claim_offer(text,int,text,text,int,int,text) to service_role;

-- Guest leaves the list. Same answer whether or not the number exists.
create or replace function public.opt_out(p_slug text, p_phone text, p_ip text)
returns json language plpgsql security definer set search_path = public as $$
begin
  if not rate_ok('stop:ip:' || p_ip, 10, interval '10 minutes') then return json_build_object('error','slow_down'); end if;
  update guests g set opted_out_at = coalesce(g.opted_out_at, now())
  from restaurants r where r.slug = p_slug and g.restaurant_id = r.id and g.phone = p_phone;
  return json_build_object('ok', true);
end $$;
revoke all on function public.opt_out(text,text,text) from public, anon, authenticated;
grant execute on function public.opt_out(text,text,text) to service_role;

-- Turn pending invites for the signed-in email into memberships.
create or replace function public.accept_invites() returns int
language plpgsql security definer set search_path = public as $$
declare em text := lower(coalesce(auth.jwt() ->> 'email', '')); n int;
begin
  if auth.uid() is null or em = '' then return 0; end if;
  insert into members (restaurant_id, user_id, role, email)
    select restaurant_id, auth.uid(), role, em from invites where email = em
    on conflict (restaurant_id, user_id) do nothing;
  get diagnostics n = row_count;
  delete from invites where email = em;
  return n;
end $$;
grant execute on function public.accept_invites() to authenticated;

-- Admin: create a restaurant and invite its owner in one step.
create or replace function public.admin_create_restaurant(
  p_slug text, p_name text, p_area text, p_offer text, p_prefix text, p_tables int, p_owner_email text)
returns uuid language plpgsql security definer set search_path = public as $$
declare rid uuid;
begin
  if not is_admin() then raise exception 'not allowed'; end if;
  insert into restaurants (slug, name, area, offer, code_prefix, tables)
    values (p_slug, p_name, nullif(p_area,''), p_offer, upper(p_prefix), p_tables) returning id into rid;
  insert into invites (restaurant_id, email, role) values (rid, lower(trim(p_owner_email)), 'owner');
  return rid;
end $$;
grant execute on function public.admin_create_restaurant(text,text,text,text,text,int,text) to authenticated;

-- Dashboard numbers (runs as the caller, so row level security applies).
create or replace function public.visit_heatmap(rid uuid)
returns table (dow int, hr int, n int) language sql stable security invoker set search_path = public as $$
  select extract(isodow from at at time zone 'Asia/Kolkata')::int - 1,
         extract(hour from at at time zone 'Asia/Kolkata')::int, count(*)::int
  from visits where restaurant_id = rid and at > now() - interval '90 days'
  group by 1, 2
$$;
grant execute on function public.visit_heatmap(uuid) to authenticated;

create or replace function public.guests_per_day(rid uuid, days int default 14)
returns table (day date, n int) language sql stable security invoker set search_path = public as $$
  select d::date, (select count(*)::int from guests g where g.restaurant_id = rid
     and (g.created_at at time zone 'Asia/Kolkata')::date = d::date)
  from generate_series((now() at time zone 'Asia/Kolkata')::date - (days - 1), (now() at time zone 'Asia/Kolkata')::date, interval '1 day') d
$$;
grant execute on function public.guests_per_day(uuid, int) to authenticated;

create or replace function public.guest_stats(rid uuid)
returns json language sql stable security invoker set search_path = public as $$
  select json_build_object(
    'total', count(*) filter (where opted_out_at is null),
    'all', count(*),
    'week', count(*) filter (where created_at > now() - interval '7 days'),
    'prev_week', count(*) filter (where created_at > now() - interval '14 days' and created_at <= now() - interval '7 days'),
    'redeemed', count(*) filter (where redeemed_at is not null),
    'repeat', (select count(*) from (select guest_id from visits where restaurant_id = rid group by guest_id having count(*) > 1) x))
  from guests where restaurant_id = rid
$$;
grant execute on function public.guest_stats(uuid) to authenticated;

-- ---------- make yourself the admin ----------
-- After you log in to the app once with your email, run this line with your email:
-- insert into public.admins (user_id) select id from auth.users where email = 'you@example.com';
