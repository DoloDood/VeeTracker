-- Run this once against your Vercel Postgres database before first use
-- (Vercel dashboard -> Storage -> your DB -> Query, or via `psql`).

CREATE TABLE IF NOT EXISTS app_users (
  id             SERIAL PRIMARY KEY,
  google_sub     TEXT UNIQUE NOT NULL,
  email          TEXT UNIQUE NOT NULL,
  username       TEXT UNIQUE,
  created_at     TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS collection_items (
  id             SERIAL PRIMARY KEY,
  user_id        INTEGER NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
  item_key       TEXT NOT NULL,
  character      TEXT NOT NULL,
  category_id    TEXT NOT NULL,
  set_id         TEXT NOT NULL,
  set_label      TEXT NOT NULL,
  rarity_name    TEXT NOT NULL,
  grade          TEXT NOT NULL,
  qty            INTEGER NOT NULL DEFAULT 1,
  status         TEXT NOT NULL DEFAULT 'owned',   -- owned | listed | sold
  added_at       TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, item_key)
);

CREATE TABLE IF NOT EXISTS price_logs (
  id             SERIAL PRIMARY KEY,
  user_id        INTEGER NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
  item_key       TEXT NOT NULL,
  price          NUMERIC(10,2) NOT NULL,
  logged_at      TIMESTAMPTZ DEFAULT now()
);

-- One eBay connection per app user. refresh_token is stored as plain text for
-- the concept/personal-use phase — see README for the note on encrypting this
-- before opening the app up to other people.
CREATE TABLE IF NOT EXISTS ebay_connections (
  user_id                 INTEGER PRIMARY KEY REFERENCES app_users(id) ON DELETE CASCADE,
  environment             TEXT NOT NULL DEFAULT 'sandbox',   -- sandbox | production
  refresh_token           TEXT,
  fulfillment_policy_id   TEXT,
  payment_policy_id       TEXT,
  return_policy_id        TEXT,
  merchant_location_key   TEXT,
  connected_at            TIMESTAMPTZ
);

-- Short-lived rows used only to carry the app user's id (and which eBay
-- environment they're connecting) through the OAuth redirect round-trip
-- (the `state` param eBay bounces back to us).
CREATE TABLE IF NOT EXISTS ebay_oauth_state (
  state          TEXT PRIMARY KEY,
  user_id        INTEGER NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
  environment    TEXT NOT NULL DEFAULT 'sandbox',
  created_at     TIMESTAMPTZ DEFAULT now()
);
