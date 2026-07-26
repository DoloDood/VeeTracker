// POST /api/username  { "username": "desired-name" }
// Claims a username for the signed-in user. Usernames are unique app-wide.
import { auth } from '../../../auth.js';
import { sql } from '../../../lib/db.js';

export async function POST(req) {
  const session = await auth();
  if (!session?.user?.appUserId) {
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

  const taken = await sql`SELECT id FROM app_users WHERE username = ${clean} AND id != ${session.user.appUserId}`;
  if (taken.rows.length > 0) {
    return Response.json({ error: 'That username is already taken' }, { status: 409 });
  }

  await sql`UPDATE app_users SET username = ${clean} WHERE id = ${session.user.appUserId}`;
  return Response.json({ ok: true, username: clean });
}
