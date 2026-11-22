-- 1) A guest who leaves the list has their name, number and birthday removed.
--    Only a keyed one-way hash of the number stays, so rejoining returns the same code
--    instead of a second welcome offer.
-- 2) Admin powers need two-step login (aal2) once the admin has set up an authenticator app.

create schema if not exists private;
revoke all on schema private from public, anon, authenticated;
create table if not exists private.secrets (k text primary key, v text not null);
alter table private.secrets enable row level security;
revoke all on private.secrets from public, anon, authenticated;
insert into private.secrets (k, v) values ('phone_pepper', replace(gen_random_uuid()::text || gen_random_uuid()::text, '-', ''))
on conflict (k) do nothing;

create or replace function private.phone_hash(rid uuid, p text) returns text
language sql stable security definer set search_path = public, extensions as $$
  select encode(hmac(rid::text || ':' || p, (select v from private.secrets where k = 'phone_pepper'), 'sha256'), 'hex')
$$;
revoke all on function private.phone_hash(uuid, text) from public, anon, authenticated;

alter table public.guests add column if not exists phone_hash text;
alter table public.guests alter column phone drop not null;
alter table public.guests drop constraint if exists guests_phone_or_hash;
alter table public.guests add constraint guests_phone_or_hash check (phone is not null or phone_hash is not null);
create unique index if not exists guests_rest_phone_hash on public.guests (restaurant_id, phone_hash) where phone_hash is not null;

create or replace function public.guests_wipe_on_leave() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.opted_out_at is not null and new.phone is not null then
    new.phone_hash := private.phone_hash(new.restaurant_id, new.phone);
    new.phone := null;
    new.name := 'Left the list';
    new.birthday_day := null;
    new.birthday_month := null;
  elsif new.opted_out_at is null and new.phone is null then
    raise exception 'A guest who left can only come back by joining again';
  end if;
  return new;
end $$;
drop trigger if exists guests_wipe_on_leave on public.guests;
create trigger guests_wipe_on_leave before insert or update of opted_out_at, phone on public.guests
for each row execute function public.guests_wipe_on_leave();

-- Wipe guests who already left.
update public.guests set phone = phone where opted_out_at is not null and phone is not null;

-- A guest joining again: restores their details on the old record, same code.
create or replace function public.rejoin_guest(p_slug text, p_name text, p_phone text, p_bday_d int, p_bday_m int, p_ip text)
returns json language plpgsql security definer set search_path = public as $$
declare r restaurants; g guests;
begin
  if not rate_ok('claim:ip:' || p_ip, 20, interval '10 minutes') then return json_build_object('error','slow_down'); end if;
  select * into r from restaurants where slug = p_slug;
  if not found then return json_build_object('found', false); end if;
  select * into g from guests where restaurant_id = r.id and phone_hash = private.phone_hash(r.id, p_phone);
  if not found then return json_build_object('found', false); end if;
  update guests set phone = p_phone, phone_hash = null, name = p_name, opted_out_at = null, consent_at = now(),
    birthday_day = p_bday_d, birthday_month = p_bday_m
  where id = g.id;
  return json_build_object('found', true, 'code', g.code, 'redeemed', g.redeemed_at is not null,
    'name', r.name, 'whatsapp', r.whatsapp, 'offer', r.offer);
end $$;
revoke all on function public.rejoin_guest(text,text,text,int,int,text) from public, anon, authenticated;
grant execute on function public.rejoin_guest(text,text,text,int,int,text) to service_role;

-- Two-step login for admins. Until an admin verifies an authenticator app this behaves as before,
-- so nobody is locked out; after that, admin powers need a session that passed the second step.
create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from admins where user_id = auth.uid())
    and (coalesce(auth.jwt() ->> 'aal', 'aal1') = 'aal2'
         or not exists (select 1 from auth.mfa_factors f where f.user_id = auth.uid() and f.status = 'verified'))
$$;
