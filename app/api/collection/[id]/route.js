// PATCH /api/collection/:id   body: { qty?, status? }  -> update quantity and/or status
// DELETE /api/collection/:id                            -> remove the item entirely
// Both scoped to the signed-in user's own rows only.
import { getCurrentUser } from '../../../../lib/supabase/server.js';
import { sql } from '../../../../lib/db.js';

export async function PATCH(req, { params }) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: 'Not signed in' }, { status: 401 });

  const { id } = params;
  const body = await req.json();

  if (typeof body.qty === 'number') {
    if (body.qty <= 0) {
      await sql`DELETE FROM collection_items WHERE id = ${id} AND user_id = ${user.id}`;
      return Response.json({ deleted: true });
    }
    await sql`UPDATE collection_items SET qty = ${body.qty} WHERE id = ${id} AND user_id = ${user.id}`;
  }
  if (typeof body.status === 'string') {
    await sql`UPDATE collection_items SET status = ${body.status} WHERE id = ${id} AND user_id = ${user.id}`;
  }

  const res = await sql`SELECT id, qty, status FROM collection_items WHERE id = ${id} AND user_id = ${user.id}`;
  return Response.json({ item: res.rows[0] || null });
}

export async function DELETE(req, { params }) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: 'Not signed in' }, { status: 401 });

  const { id } = params;
  await sql`DELETE FROM collection_items WHERE id = ${id} AND user_id = ${user.id}`;
  return Response.json({ ok: true });
}
