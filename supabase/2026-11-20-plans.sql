-- Dastak update 2, 20 Nov 2026: plans per restaurant, and weekly offer drafts written by Dastak.
-- Paste this whole file into Supabase > SQL Editor and press Run once. Safe to run twice.

-- 1. Plan and agreed price for each restaurant (only the admin can change these)
alter table public.restaurants add column if not exists plan text not null default 'pilot';
alter table public.restaurants drop constraint if exists restaurants_plan_ok;
alter table public.restaurants add constraint restaurants_plan_ok check (plan in ('pilot','standard','done_for_you','yearly','paused'));
alter table public.restaurants add column if not exists setup_price int check (setup_price between 0 and 10000000);
alter table public.restaurants add column if not exists monthly_price int check (monthly_price between 0 and 10000000);
alter table public.restaurants add column if not exists plan_note text check (char_length(plan_note) <= 200);

create or replace function public.admin_set_plan(p_slug text, p_plan text, p_setup int, p_monthly int, p_note text)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not is_admin() then raise exception 'not allowed'; end if;
  update restaurants set plan = p_plan, setup_price = p_setup, monthly_price = p_monthly, plan_note = nullif(trim(p_note), '')
  where slug = p_slug;
end $$;
revoke all on function public.admin_set_plan(text,text,int,int,text) from public, anon;
grant execute on function public.admin_set_plan(text,text,int,int,text) to authenticated;

-- 2. Offer drafts: Dastak writes them, the owner sends them
create table if not exists public.offer_drafts (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants on delete cascade,
  name text not null check (char_length(name) between 1 and 60),
  audience text not null default 'all' check (audience in ('all','bday','lapsed','new')),
  message text not null check (char_length(message) between 1 and 1000),
  created_by uuid references auth.users on delete set null,
  created_at timestamptz not null default now(),
  used_at timestamptz
);
create index if not exists drafts_rest on public.offer_drafts (restaurant_id, created_at desc);
alter table public.offer_drafts enable row level security;
revoke all on public.offer_drafts from anon;
drop policy if exists d_sel on public.offer_drafts;
create policy d_sel on public.offer_drafts for select using (is_member(restaurant_id));
drop policy if exists d_ins on public.offer_drafts;
create policy d_ins on public.offer_drafts for insert with check (is_admin());
drop policy if exists d_del on public.offer_drafts;
create policy d_del on public.offer_drafts for delete using (is_admin());
drop policy if exists d_upd on public.offer_drafts;
create policy d_upd on public.offer_drafts for update using (is_member(restaurant_id)) with check (is_member(restaurant_id));
revoke update on public.offer_drafts from authenticated;
grant update (used_at) on public.offer_drafts to authenticated;

-- 3. Admin overview now also shows the plan, price and whether this week's offer is written
drop function if exists public.admin_overview();
create function public.admin_overview()
returns table (slug text, name text, area text, created_at timestamptz, scans int, guests int, week int, redeemed int, sent int, returned int,
               last_guest timestamptz, owners text, invited text,
               plan text, setup_price int, monthly_price int, plan_note text, last_draft timestamptz)
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
    (select max(d.created_at) from offer_drafts d where d.restaurant_id = r.id)
  from restaurants r where is_admin() order by r.created_at desc
$$;
grant execute on function public.admin_overview() to authenticated;
