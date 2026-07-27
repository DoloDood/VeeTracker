// Server-side Supabase client (for Server Components, Route Handlers, Server
// Actions) — reads/writes the auth session via cookies. This is ONLY used
// to answer "who is signed in" (Supabase Auth). All actual app data
// (collection, price logs, eBay connections) still goes through lib/db.js's
// direct Postgres connection, keyed by the UUID this returns.
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { sql } from '../db.js';

export async function createClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
          } catch {
            // Called from a Server Component render, where cookies can't be
            // written — safe to ignore since we don't rely on middleware to
            // refresh sessions in this app (personal-use scale for now).
          }
        },
      },
    }
  );
}

// Returns { id, email, username } for the signed-in user, or null if signed out.
export async function getCurrentUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const res = await sql`SELECT username FROM profiles WHERE id = ${user.id}`;
  return { id: user.id, email: user.email, username: res.rows[0]?.username || null };
}
