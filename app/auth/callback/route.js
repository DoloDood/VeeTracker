// GET /auth/callback?code=...
// Supabase redirects here after Google approval. Exchanges the code for a
// session (sets HTTP-only cookies) and sends the user on to the app.
import { NextResponse } from 'next/server';
import { createClient } from '../../../lib/supabase/server.js';

export async function GET(req) {
  const { searchParams, origin } = new URL(req.url);
  const code = searchParams.get('code');

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}/`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth`);
}
