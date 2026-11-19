-- Dastak update, 20 Nov 2026: funnel tracking, slow hours, premium table card, faster sending.
-- Paste this whole file into Supabase > SQL Editor and press Run once. Safe to run twice.

-- 1. Restaurant settings: slow hours and table card style
alter table public.restaurants add column if not exists slow_slots jsonb not null default '[]'::jsonb;
alter table public.restaurants drop constraint if exists restaurants_slow_slots_ok;
alter table public.restaurants add constraint restaurants_slow_slots_ok
  check (jsonb_typeof(slow_slots) = 'array' and jsonb_array_length(slow_slots) <= 28);
alter table public.restaurants add column if not exists card_style text not null default 'free';
alter table public.restaurants drop constraint if exists restaurants_card_style_ok;
alter table public.restaurants add constraint restaurants_card_style_ok check (card_style in ('free','premium'));
grant update (slow_slots, card_style) on public.restaurants to authenticated;

-- 2. Scans of the table cards (written only by the server)
create table if not exists public.scans (
  id bigint generated always as identity primary key,
  restaurant_id uuid not null references public.restaurants on delete cascade,
  table_no int check (table_no between 1 and 200),
  at timestamptz not null default now()
);
create index if not exists scans_rest_at on public.scans (restaurant_id, at);
alter table public.scans enable row level security;
drop policy if exists s_sel on public.scans;
create policy s_sel on public.scans for select using (is_member(restaurant_id));
revoke all on public.scans from anon;
revoke insert, update, delete on public.scans from authenticated;

-- One scan per phone connection per restaurant every 30 minutes, so refreshes don't inflate it.
create or replace function public.log_scan(p_slug text, p_table int, p_ip text)
returns void language plpgsql security definer set search_path = public as $$
declare r restaurants;
begin
  select * into r from restaurants where slug = p_slug;
  if r.id is null then return; end if;
  if not rate_ok('scan:' || r.id || ':' || p_ip, 1, interval '30 minutes') then return; end if;
  if p_table is null or p_table < 1 or p_table > r.tables then p_table := null; end if;
  insert into scans (restaurant_id, table_no) values (r.id, p_table);
end $$;
revoke all on function public.log_scan(text,int,text) from public, anon, authenticated;
grant execute on function public.log_scan(text,int,text) to service_role;

-- 3. Visits know what they are (sign-up, return after an offer) and which offer brought them
alter table public.visits add column if not exists kind text not null default 'visit';
alter table public.visits drop constraint if exists visits_kind_ok;
alter table public.visits add constraint visits_kind_ok check (kind in ('signup','visit','return'));
alter table public.visits add column if not exists campaign_id uuid references public.campaigns on delete set null;
update public.visits set kind = 'signup'
  where kind = 'visit' and id in (select min(id) from public.visits group by guest_id);

drop policy if exists v_ins on public.visits;
create policy v_ins on public.visits for insert with check (
  is_member(restaurant_id)
  and kind in ('visit','return')
  and exists (select 1 from guests g where g.id = guest_id and g.restaurant_id = visits.restaurant_id)
  and (campaign_id is null or exists (select 1 from campaigns c where c.id = campaign_id and c.restaurant_id = visits.restaurant_id)));

-- 4. Campaigns count up as the owner sends
drop policy if exists c_upd on public.campaigns;
create policy c_upd on public.campaigns for update using (is_member(restaurant_id)) with check (is_member(restaurant_id));
revoke update on public.campaigns from anon, authenticated;
grant update (sent_count) on public.campaigns to authenticated;

-- 5. Claims record a sign-up visit (same as before, plus kind = signup)
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
  insert into visits (restaurant_id, guest_id, kind) values (r.id, gid, 'signup');
  return json_build_object('code', c, 'name', r.name, 'whatsapp', r.whatsapp, 'offer', r.offer);
end $$;
revoke all on function public.claim_offer(text,int,text,text,int,int,text) from public, anon, authenticated;
grant execute on function public.claim_offer(text,int,text,text,int,int,text) to service_role;

-- 6. Guest page also needs the card style
drop function if exists public.public_restaurant(text);
create function public.public_restaurant(p_slug text)
returns table (name text, area text, offer text, whatsapp text, palette text, tables int, code_prefix text, card_style text)
language sql stable security definer set search_path = public as $$
  select name, area, offer, whatsapp, palette, tables, code_prefix, card_style from restaurants where slug = p_slug
$$;
grant execute on function public.public_restaurant(text) to anon, authenticated;

-- 7. The funnel for one restaurant (runs as the caller, so row level security applies)
create or replace function public.funnel(rid uuid)
returns json language sql stable security invoker set search_path = public as $$
  select json_build_object(
    'scans',    (select count(*) from scans where restaurant_id = rid),
    'signups',  (select count(*) from guests where restaurant_id = rid),
    'redeemed', (select count(*) from guests where restaurant_id = rid and redeemed_at is not null),
    'sent',     (select coalesce(sum(sent_count), 0) from campaigns where restaurant_id = rid),
    'returned', (select count(distinct guest_id) from visits where restaurant_id = rid and kind = 'return'))
$$;
grant execute on function public.funnel(uuid) to authenticated;

-- 8. Admin overview with the funnel for every restaurant
drop function if exists public.admin_overview();
create function public.admin_overview()
returns table (slug text, name text, area text, created_at timestamptz, scans int, guests int, week int, redeemed int, sent int, returned int,
               last_guest timestamptz, owners text, invited text)
language sql stable security definer set search_path = public as $$
  select r.slug, r.name, r.area, r.created_at,
    (select count(*) from scans s where s.restaurant_id = r.id)::int,
    (select count(*) from guests g where g.restaurant_id = r.id)::int,
    (select count(*) from guests g where g.restaurant_id = r.id and g.created_at > now() - interval '7 days')::int,
    (select count(*) from guests g where g.restaurant_id = r.id and g.redeemed_at is not null)::int,
    (select coalesce(sum(c.sent_count), 0) from campaigns c where c.restaurant_id = r.id)::int,
    (select count(distinct v.guest_id) from visits v where v.restaurant_id = r.id and v.kind = 'return')::int,
    (select max(g.created_at) from guests g where g.restaurant_id = r.id),
    (select string_agg(m.email, ', ') from members m where m.restaurant_id = r.id and m.role = 'owner'),
    (select string_agg(i.email, ', ') from invites i where i.restaurant_id = r.id and i.role = 'owner')
  from restaurants r where is_admin() order by r.created_at desc
$$;
grant execute on function public.admin_overview() to authenticated;
