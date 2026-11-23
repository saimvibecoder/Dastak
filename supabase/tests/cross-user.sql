-- Cross-user test: restaurant B's owner, a staff member and an anonymous visitor try to read,
-- change and delete restaurant A's guests. Every attempt must return 0 rows or "permission denied".
-- Run against a LOCAL or branch copy of the database, never production: it creates test rows.
\set QUIET on
\pset footer off
insert into auth.users values ('aaaaaaaa-0000-0000-0000-000000000001','ownera@test.in'),('bbbbbbbb-0000-0000-0000-000000000002','ownerb@test.in'),('cccccccc-0000-0000-0000-000000000003','staffa@test.in');
insert into restaurants (id, slug, name) values ('a0000000-0000-0000-0000-00000000000a','test-a','Test A'),('b0000000-0000-0000-0000-00000000000b','test-b','Test B');
insert into members values ('a0000000-0000-0000-0000-00000000000a','aaaaaaaa-0000-0000-0000-000000000001','owner','ownera@test.in'),
 ('b0000000-0000-0000-0000-00000000000b','bbbbbbbb-0000-0000-0000-000000000002','owner','ownerb@test.in'),
 ('a0000000-0000-0000-0000-00000000000a','cccccccc-0000-0000-0000-000000000003','staff','staffa@test.in');
-- A guest joins restaurant A the real way (server-only function)
set role service_role;
select 'setup: guest claims at A' as step, (claim_offer('test-a', 3, 'Guest One', '9876543210', null, null, 'iphash'))::jsonb ? 'code' as ok;
reset role;

\echo '--- Owner of B (user B) attacks restaurant A'
begin; set local role authenticated;
set local request.jwt.claim.sub = 'bbbbbbbb-0000-0000-0000-000000000002'; set local request.jwt.claims = '{"aal":"aal1"}';
select 'B reads A guests' t, count(*) rows from guests where restaurant_id = 'a0000000-0000-0000-0000-00000000000a';
with u as (update guests set name='Hacked' where restaurant_id='a0000000-0000-0000-0000-00000000000a' returning 1) select 'B updates A guests' t, count(*) rows from u;
with d as (delete from guests where restaurant_id='a0000000-0000-0000-0000-00000000000a' returning 1) select 'B deletes A guests' t, count(*) rows from d;
with u as (update restaurants set name='Hacked' where id='a0000000-0000-0000-0000-00000000000a' returning 1) select 'B renames restaurant A' t, count(*) rows from u;
select 'B stats for A' t, guest_stats('a0000000-0000-0000-0000-00000000000a')->>'total' total;
select 'B admin overview' t, count(*) rows from admin_overview();
rollback;

\echo '--- Staff of A tries owner-only actions'
begin; set local role authenticated;
set local request.jwt.claim.sub = 'cccccccc-0000-0000-0000-000000000003'; set local request.jwt.claims = '{"aal":"aal1"}';
select 'staff reads own guests (allowed)' t, count(*) rows from guests where restaurant_id='a0000000-0000-0000-0000-00000000000a';
with d as (delete from guests where restaurant_id='a0000000-0000-0000-0000-00000000000a' returning 1) select 'staff deletes guests' t, count(*) rows from d;
with u as (update restaurants set name='Hacked' where id='a0000000-0000-0000-0000-00000000000a' returning 1) select 'staff changes settings' t, count(*) rows from u;
rollback;

\echo '--- Anonymous visitor (anon key from the browser)'
begin; set local role anon;
select 'anon reads guests' t, count(*) rows from guests;
select 'anon reads members' t, count(*) rows from members;
rollback;

\echo '--- Calls that must be refused outright'
\set ON_ERROR_STOP off
begin; set local role anon; select claim_offer('test-a', 1, 'Bot', '9123456780', null, null, 'x'); rollback;
begin; set local role authenticated; set local request.jwt.claim.sub = 'bbbbbbbb-0000-0000-0000-000000000002'; select admin_set_plan('test-a','paused',0,0,'x'); rollback;
begin; set local role authenticated; set local request.jwt.claim.sub = 'bbbbbbbb-0000-0000-0000-000000000002'; update guests set code='X' where true; rollback;
begin; set local role authenticated; set local request.jwt.claim.sub = 'bbbbbbbb-0000-0000-0000-000000000002'; update restaurants set plan='yearly' where id='b0000000-0000-0000-0000-00000000000b'; rollback;

\echo '--- Control: owner of A sees and changes own data (proves the test is not trivially empty)'
begin; set local role authenticated;
set local request.jwt.claim.sub = 'aaaaaaaa-0000-0000-0000-000000000001'; set local request.jwt.claims = '{"aal":"aal1"}';
select 'A reads own guests' t, count(*) rows from guests where restaurant_id='a0000000-0000-0000-0000-00000000000a';
with u as (update restaurants set name='Renamed' where id='a0000000-0000-0000-0000-00000000000a' returning 1) select 'A changes own settings' t, count(*) rows from u;
rollback;
