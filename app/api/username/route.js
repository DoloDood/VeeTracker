// POST /api/username  { "username": "desired-name" }
// Claims a username for the signed-in user. Usernames are unique app-wide.
import { getCurrentUser } from '../../../lib/supabase/server.js';
import { sql } from '../../../lib/db.js';

export async function POST(req) {
  const user = await getCurrentUser();
  if (!user) {
    return Response.json({ error: 'Not signed in' }, { status: 401 });
  }

  const { username } = await req.json();
  const clean = (username || '').trim().toLowerCase();

  if (!/^[a-z0-9_-]{3,20}$/.test(clean)) {
    return Response.json(
      { error: 'Username must be 3-20 characters: lowercase letters, numbers, - or _' },
      { status: 400 }
    );
  }

  const taken = await sql`SELECT id FROM profiles WHERE username = ${clean} AND id != ${user.id}`;
  if (taken.rows.length > 0) {
    return Response.json({ error: 'That username is already taken' }, { status: 409 });
  }

  await sql`
    INSERT INTO profiles (id, username) VALUES (${user.id}, ${clean})
    ON CONFLICT (id) DO UPDATE SET username = EXCLUDED.username
  `;
  return Response.json({ ok: true, username: clean });
}
