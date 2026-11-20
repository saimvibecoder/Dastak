-- Dastak update 3, 20 Nov 2026: "welcome offer" instead of "free dish", offer types, data deletion requests.
-- Paste this whole file into Supabase > SQL Editor and press Run once. Safe to run twice.

-- 1. Offer type: a dish, a drink, a small bite, a dessert, or % off the bill
alter table public.restaurants add column if not exists offer_type text not null default 'dish';
alter table public.restaurants drop constraint if exists restaurants_offer_type_ok;
alter table public.restaurants add constraint restaurants_offer_type_ok check (offer_type in ('dish','drink','bite','dessert','percent'));
grant update (offer_type) on public.restaurants to authenticated;
-- A % offer is stored as just the number ("10"), so allow short values.
alter table public.restaurants drop constraint if exists restaurants_offer_check;
alter table public.restaurants add constraint restaurants_offer_check check (char_length(offer) between 1 and 80);
-- The offer is now just the item ("masala chai"), so drop a leading "free".
update public.restaurants set offer = 'chef''s special' where lower(trim(offer)) in ('free dish','dish');
update public.restaurants set offer = regexp_replace(offer, '^\s*free\s+', '', 'i') where offer ~* '^\s*free\s+';
alter table public.restaurants alter column offer set default 'chef''s special';

-- 2. Guest page needs the offer type
drop function if exists public.public_restaurant(text);
create function public.public_restaurant(p_slug text)
returns table (name text, area text, offer text, offer_type text, whatsapp text, palette text, tables int, code_prefix text, card_style text)
language sql stable security definer set search_path = public as $$
  select name, area, offer, offer_type, whatsapp, palette, tables, code_prefix, card_style from restaurants where slug = p_slug
$$;
grant execute on function public.public_restaurant(text) to anon, authenticated;

-- 3. Owners can ask Dastak to delete all of their restaurant's data
alter table public.restaurants add column if not exists delete_requested_at timestamptz;
create or replace function public.request_data_deletion(p_slug text)
returns void language plpgsql security definer set search_path = public as $$
declare rid uuid;
begin
  select id into rid from restaurants where slug = p_slug;
  if rid is null or not is_owner(rid) then raise exception 'not allowed'; end if;
  update restaurants set delete_requested_at = coalesce(delete_requested_at, now()) where id = rid;
end $$;
revoke all on function public.request_data_deletion(text) from public, anon;
grant execute on function public.request_data_deletion(text) to authenticated;

-- 4. Admin overview shows deletion requests
drop function if exists public.admin_overview();
create function public.admin_overview()
returns table (slug text, name text, area text, created_at timestamptz, scans int, guests int, week int, redeemed int, sent int, returned int,
               last_guest timestamptz, owners text, invited text,
               plan text, setup_price int, monthly_price int, plan_note text, last_draft timestamptz, delete_requested_at timestamptz)
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
    (select string_agg(i.email, ', ') from invites i where i.restaurant_id = r.id and i.role = 'owner'),
    r.plan, r.setup_price, r.monthly_price, r.plan_note,
    (select max(d.created_at) from offer_drafts d where d.restaurant_id = r.id),
    r.delete_requested_at
  from restaurants r where is_admin() order by r.created_at desc
$$;
grant execute on function public.admin_overview() to authenticated;
