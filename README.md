# VeeFriends Lister — full app

Google sign-in (via Supabase Auth), usernames, a persistent collection, and
direct-to-eBay publishing, all in one Next.js app. Deploys free on Vercel
from GitHub.

## Why Supabase Auth instead of a custom login system

An earlier version of this hand-rolled Google OAuth using Auth.js and a
custom database table. That was unnecessary complexity — Supabase already
has Google sign-in built in, and it's what you'd used successfully before.
This version uses it directly: less code, fewer environment variables,
fewer places for something to go subtly wrong.

## Architecture

```
Browser
  │
  ├─ /login                        "Sign in with Google" (Supabase Auth)
  ├─ /auth/callback                exchanges the OAuth code for a session
  ├─ /onboarding                   pick a username (stored in `profiles`)
  ├─ /search                       the search/listing generator (client-side)
  ├─ /collection                   your saved items, grouped Owned/Listed/Sold
  ├─ /settings/ebay                connect YOUR eBay seller account, set policies
  │
  └─ API routes (all check the Supabase session first)
       /api/collection, /api/price-log     -> Postgres, via lib/db.js
       /api/ebay/auth-start, auth-callback -> per-user eBay OAuth
       /api/ebay/upload-image              -> Vercel Blob
       /api/ebay/list-item                 -> the real publish call
```

Authentication (Supabase Auth) and app data (direct Postgres via `pg`) are
deliberately kept separate: Supabase tells us *who* is signed in, and our
own database — keyed by that same user ID — holds everything else. eBay
tokens and business policies are still per-user, stored in Postgres, so this
is already structured for "open it up to other people later."

## If you're migrating from an earlier version

Run `db/migrate-to-supabase-auth.sql` in Supabase's SQL Editor first (it
drops the old tables — they only had test data), then run `db/schema.sql`
right after.

## Setup

### 1. GitHub Desktop, as before

Delete your local project folder entirely, unzip this fresh copy, and in
GitHub Desktop it'll show every changed/added/removed file. Commit
("switch to Supabase Auth"), push.

### 2. Enable Google sign-in — in Supabase, not Vercel

- Supabase dashboard → **Authentication → Providers** → find **Google** →
  toggle it on
- Paste in the **same Client ID and Client Secret** you already created in
  Google Cloud Console
- Supabase shows you a **Callback URL** on this same screen (something like
  `https://xxxx.supabase.co/auth/v1/callback`) — copy it
- Go back to **Google Cloud Console → Credentials** → your existing OAuth
  Client → **Authorized redirect URIs** → **Add URI** → paste that Supabase
  callback URL → Save

### 3. Get your Supabase API keys

Supabase dashboard → **Project Settings → API**. Copy the **Project URL**
and the **anon / public key**.

### 4. Set environment variables in Vercel

Settings → Environment Variables → add:

| Name | Value |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | the Project URL from step 3 |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | the anon key from step 3 |

The old `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET` / `AUTH_SECRET` variables
aren't used anymore — safe to delete them, or just leave them, doesn't
matter either way.

### 5. Redeploy, test

Deployments → **⋯** → Redeploy. Visit your site, sign in with Google,
pick a username, land on the search tool.

## eBay setup

Unchanged from before — see the walkthrough you already have for Sandbox
keys, RuName, business policies, and the Settings → eBay page in the app.

## Things worth knowing

- **eBay category IDs and condition values** — still on you to look up the
  right ones for your item type (Taxonomy API's `getCategorySuggestions`, or
  check what a comparable existing listing uses).
- **Refresh tokens are stored as plain text** in Postgres for this
  concept/personal-use phase. Fine for one user. Encrypt that column before
  opening this to other people.
- **No session-refresh middleware yet** — Supabase sessions are checked
  through server components directly rather than refreshed in middleware,
  which is simpler but means you may occasionally need to sign in again
  after a session expires (roughly hourly, per Supabase's default). Fine for
  personal use; worth adding proper middleware-based refresh before this
  goes public.
