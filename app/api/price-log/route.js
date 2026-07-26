// POST /api/price-log   body: { key, price }
// GET  /api/price-log?key=...   -> this user's logged sale prices for that exact item
import { auth } from '../../../auth.js';
import { sql } from '../../../lib/db.js';

async function requireUser() {
  const session = await auth();
  if (!session?.user?.appUserId) return null;
  return session.user.appUserId;
}

export async function GET(req) {
  const userId = await requireUser();
  if (!userId) return Response.json({ error: 'Not signed in' }, { status: 401 });

  const key = new URL(req.url).searchParams.get('key');
  if (!key) return Response.json({ error: 'Missing ?key' }, { status: 400 });

  const res = await sql`
    SELECT price, logged_at AS "loggedAt" FROM price_logs
    WHERE user_id = ${userId} AND item_key = ${key}
    ORDER BY logged_at ASC
  `;
  return Response.json({ prices: res.rows });
}

export async function POST(req) {
  const userId = await requireUser();
  if (!userId) return Response.json({ error: 'Not signed in' }, { status: 401 });

  const { key, price } = await req.json();
  if (!key || typeof price !== 'number' || price <= 0) {
    return Response.json({ error: 'Body must be { key: string, price: positive number }' }, { status: 400 });
  }

  await sql`INSERT INTO price_logs (user_id, item_key, price) VALUES (${userId}, ${key}, ${price})`;
  return Response.json({ ok: true });
}
