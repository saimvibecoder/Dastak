-- Visitors who aren't logged in can no longer reach admin/owner helpers.
-- Signed-in users keep access; each function still checks is_admin()/is_owner() inside.
revoke execute on function public.accept_invites() from public, anon;
revoke execute on function public.admin_create_restaurant(text, text, text, text, text, integer, text) from public, anon;
revoke execute on function public.admin_overview() from public, anon;
grant execute on function public.accept_invites(), public.admin_overview(),
  public.admin_create_restaurant(text, text, text, text, text, integer, text) to authenticated;

-- Only used inside other database functions (which run as the owner), never called by the app directly.
revoke execute on function public.rate_ok(text, integer, interval) from public, anon, authenticated;

-- Trigger functions: they still fire on their own; nobody needs to call them.
revoke execute on function public.guests_wipe_on_leave() from public, anon, authenticated;
revoke execute on function public.rls_auto_enable() from public, anon, authenticated;

-- Fully locked tables: say so explicitly with a deny-all rule (service role still bypasses RLS).
drop policy if exists no_access on public.rate_hits;
create policy no_access on public.rate_hits for all using (false) with check (false);
drop policy if exists no_access on private.secrets;
create policy no_access on private.secrets for all using (false) with check (false);
