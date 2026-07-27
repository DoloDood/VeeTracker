// POST /api/price-log   body: { key, price }
// GET  /api/price-log?key=...   -> this user's logged sale prices for that exact item
import { getCurrentUser } from '../../../lib/supabase/server.js';
import { sql } from '../../../lib/db.js';

export async function GET(req) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: 'Not signed in' }, { status: 401 });

  const key = new URL(req.url).searchParams.get('key');
  if (!key) return Response.json({ error: 'Missing ?key' }, { status: 400 });

  const res = await sql`
    SELECT price, logged_at AS "loggedAt" FROM price_logs
    WHERE user_id = ${user.id} AND item_key = ${key}
    ORDER BY logged_at ASC
  `;
  return Response.json({ prices: res.rows });
}

export async function POST(req) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: 'Not signed in' }, { status: 401 });

  const { key, price } = await req.json();
  if (!key || typeof price !== 'number' || price <= 0) {
    return Response.json({ error: 'Body must be { key: string, price: positive number }' }, { status: 400 });
  }

  await sql`INSERT INTO price_logs (user_id, item_key, price) VALUES (${user.id}, ${key}, ${price})`;
  return Response.json({ ok: true });
}
