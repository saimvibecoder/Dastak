# Dastak

Restaurant table QR → WhatsApp guest list. Guests scan a table card, claim a free starter and join the restaurant's list; owners see their guests, find slow hours and send offers on WhatsApp.

Next.js 15 (App Router) · Supabase (Postgres, auth, row level security) · Vercel.

## Set up

1. **Supabase:** create a free project at supabase.com (Mumbai region). Open SQL Editor, paste `supabase/schema.sql`, run it.
2. **Auth URLs:** in Supabase › Authentication › URL Configuration, set Site URL to your live address and add `https://YOUR-SITE/auth/callback` to Redirect URLs.
3. **Environment:** copy `.env.example` to `.env.local` (and add the same values in Vercel › Settings › Environment Variables). `SUPABASE_SERVICE_ROLE_KEY` takes the **secret** key (`sb_secret_…`, or the legacy service_role key) and is server only; never give it a `NEXT_PUBLIC_` name.
4. **Run:** `npm install` then `npm run dev`.
5. **Make yourself admin:** log in once at `/login`, then run in SQL Editor:
   `insert into public.admins (user_id) select id from auth.users where email = 'you@example.com';`
6. **Add a restaurant:** go to `/admin`, fill the form with the owner's email. They log in with that email and become owner.

## How it fits together

| Path | Who | What |
|---|---|---|
| `/` | everyone | sales page |
| `/r/[slug]/t/[table]` | guests | QR landing page to claim the offer |
| `/r/[slug]/stop` | guests | leave the restaurant's list |
| `/login` | owners, staff | email login link |
| `/app/[slug]` | owners, staff | overview, guests, send offer, redeem, QR cards, settings |
| `/admin` | you | add restaurants, invite owners |

## Security model

- Every table has row level security. A user only sees restaurants they are a member of.
- Guests are never written from the browser. `/api/claim` validates input, checks the origin, hashes the IP, and calls `claim_offer`, which only the service role can run. It rate limits per IP (8 per 10 minutes) and per restaurant (300 per hour).
- Signed-in users can update only specific guest columns (used, opted out, name, birthday) and specific restaurant settings; they can't move guests between restaurants or change code prefixes.
- Staff can check codes and send offers. Only owners change settings, invite people or delete guests.
- CSV export escapes spreadsheet formulas.

## WhatsApp

Sending is tap-to-send through `wa.me` links, plus copy-all numbers for a WhatsApp Business broadcast list. Every message ends with the guest's stop link. Automatic sending through the WhatsApp Cloud API can be added later; Meta charges per marketing message.
