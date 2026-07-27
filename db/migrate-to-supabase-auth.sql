-- Run this ONCE in Supabase's SQL Editor to migrate your existing database
-- from the old custom app_users setup to Supabase Auth. This drops your old
-- tables (they're empty test data anyway) and recreates them correctly.
-- After running this, db/schema.sql reflects the current, correct shape.

DROP TABLE IF EXISTS ebay_oauth_state CASCADE;
DROP TABLE IF EXISTS ebay_connections CASCADE;
DROP TABLE IF EXISTS price_logs CASCADE;
DROP TABLE IF EXISTS collection_items CASCADE;
DROP TABLE IF EXISTS app_users CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- Now just re-run everything in db/schema.sql (paste its full contents below
-- this line, or run it as a separate query right after this one).
