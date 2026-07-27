// GET  /api/collection            -> list the signed-in user's collection
// POST /api/collection             -> add an item (or increment qty if it already exists)
//      body: { key, character, categoryId, setId, setLabel, rarityName, grade }
import { getCurrentUser } from '../../../lib/supabase/server.js';
import { sql } from '../../../lib/db.js';

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: 'Not signed in' }, { status: 401 });

  const res = await sql`
    SELECT id, item_key AS key, character, category_id AS "categoryId", set_id AS "setId",
           set_label AS "setLabel", rarity_name AS "rarityName", grade, qty, status, added_at AS "addedAt"
    FROM collection_items
    WHERE user_id = ${user.id}
    ORDER BY added_at DESC
  `;
  return Response.json({ items: res.rows });
}

export async function POST(req) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: 'Not signed in' }, { status: 401 });

  const body = await req.json();
  const { key, character, categoryId, setId, setLabel, rarityName, grade } = body;
  if (!key || !character || !categoryId || !setId || !rarityName || !grade) {
    return Response.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const res = await sql`
    INSERT INTO collection_items (user_id, item_key, character, category_id, set_id, set_label, rarity_name, grade, qty, status)
    VALUES (${user.id}, ${key}, ${character}, ${categoryId}, ${setId}, ${setLabel}, ${rarityName}, ${grade}, 1, 'owned')
    ON CONFLICT (user_id, item_key)
    DO UPDATE SET qty = collection_items.qty + 1
    RETURNING id, item_key AS key, qty, status
  `;
  return Response.json({ item: res.rows[0] });
}
