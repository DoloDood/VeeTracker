# VeeFriends Lister — full app

Google sign-in, usernames, a persistent collection, and direct-to-eBay
publishing, all in one Next.js app. Deploys free on Vercel from GitHub.

This replaces the earlier Claude-artifact tool and the standalone
`veefriends-ebay-lister` backend — everything now lives here, in one place,
because Google OAuth needs a real domain to redirect back to (an artifact
can't provide that), and because being one app means "List to eBay" can
actually publish instead of just generating a JSON payload to copy elsewhere.

## Architecture

```
Browser
  │
  ├─ /login, /onboarding          Google sign-in, pick a username
  ├─ /search                       the search/listing generator (client-side)
  ├─ /collection                   your saved items, grouped Owned/Listed/Sold
  ├─ /settings/ebay                connect YOUR eBay seller account, set policies
  │
  └─ API routes (all session-scoped to the signed-in user)
       /api/collection, /api/price-log     -> Postgres
       /api/ebay/auth-start, auth-callback -> per-user eBay OAuth
       /api/ebay/upload-image              -> Vercel Blob
       /api/ebay/list-item                 -> the real publish call
```

Each signed-in user connects **their own** eBay seller account (their own
OAuth grant, their own refresh token, stored in Postgres against their user
row). The app itself only has one shared identity with eBay — its Client
ID/Secret — same as any real multi-user integration works. This means it's
already structured for "open it up to other people later," even though
you're the only user today.

## Prerequisites checklist

- [ ] GitHub account, Vercel account (both free)
- [ ] Google Cloud Console project (free) — for Sign in with Google
- [ ] eBay Developer account approved (you have this)
- [ ] eBay Business Policies set up in Seller Hub (payment/return/fulfillment)
      — required before publishing works, independent of any of this code

## Setup

### 1. Push to GitHub, import into Vercel

Same as before — new repo, push these files, Vercel → Add New → Project →
import it. Next.js is auto-detected, no config needed.

### 2. Add storage

In the Vercel project → Storage tab:
- Add **Postgres** (this auto-injects `POSTGRES_URL` and related env vars)
- Add **Blob** (auto-injects `BLOB_READ_WRITE_TOKEN`)

Neither needs manual key-copying — Vercel wires them in automatically.

### 3. Run the schema

Vercel → your Postgres database → Query (or connect with `psql` using the
connection string Vercel gives you) → paste in and run `db/schema.sql`.

### 4. Google OAuth

[Google Cloud Console](https://console.cloud.google.com) → APIs & Services →
Credentials → Create OAuth Client ID → Web application. Set the authorized
redirect URI to:

```
https://YOUR-PROJECT.vercel.app/api/auth/callback/google
```

Copy the Client ID and Client Secret into Vercel's environment variables as
`AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET`. Also set `AUTH_SECRET` (generate
with `npx auth secret` or `openssl rand -base64 32`).

### 5. eBay — Sandbox first

Same idea as before, but now scoped per-user instead of one set of env vars:

- Application Keys page → generate a **Sandbox keyset** → set
  `EBAY_CLIENT_ID_SANDBOX` / `EBAY_CLIENT_SECRET_SANDBOX` in Vercel
- User Access Tokens → Register a new Sandbox test user (`TESTUSER_...`)
- Create an RuName with its Accept URL set to
  `https://YOUR-PROJECT.vercel.app/api/ebay/auth-callback` → set as
  `EBAY_RUNAME_SANDBOX`
- Redeploy

### 6. Sign in and connect eBay

Visit your app, sign in with Google, pick a username, go to
**Settings → eBay**, click **Connect Sandbox**, log in as your `TESTUSER_`
account and approve. You'll land back on the settings page connected.

### 7. Business policies

While logged into `sandbox.ebay.com` as your test seller, set up payment/
return/fulfillment policies and an inventory location (same requirement as
before — the Sell API won't publish without them). Enter the resulting IDs
into the Business Policies form on the Settings page.

### 8. Test it

Add something to your collection from `/search`, go to `/collection`, click
**List to eBay**, fill in a price/category/photos, publish. You'll get back
a `viewUrl` — open it to see the listing live on Sandbox eBay.

### 9. Production, when you're ready

Repeat steps 5–7 with a **Production** keyset, a second RuName, and
`EBAY_CLIENT_ID_PRODUCTION` / `EBAY_CLIENT_SECRET_PRODUCTION` /
`EBAY_RUNAME_PRODUCTION`. Click **Connect Production** on the Settings page.
Same code, real eBay — nothing else changes.

## Things worth knowing

- **eBay category IDs and condition values** — still on you to look up the
  right ones for your item type (Taxonomy API's `getCategorySuggestions`, or
  check what a comparable existing listing uses). Publishing will fail
  loudly with a real eBay error if these are wrong, which is useful signal,
  not a bug in this code.
- **Refresh tokens are stored as plain text** in Postgres for this
  concept/personal-use phase. Fine for one user (you). Before opening this
  to other people, encrypt that column (e.g. via `pgcrypto`, or encrypt/
  decrypt in `lib/ebay.js` with a key from an env var) — flagging this now
  so it doesn't get forgotten later.
- **This hasn't run against a live eBay account yet** — I wrote it against
  eBay's current documented API shape and have no way to execute it from
  here. Sandbox exists exactly to catch that gap safely. Expect a debugging
  pass together the first time you run the real flow end-to-end.
- I dropped the artifact's "Recent" strip — the Collection page now serves
  that purpose better (it's permanent, not a rolling list of the last 20).
