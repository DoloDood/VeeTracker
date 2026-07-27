// GET /auth/callback?code=...
// Supabase redirects here after Google approval. Exchanges the code for a
// session (sets HTTP-only cookies) and sends the user on to the app.
import { NextResponse } from 'next/server';
import { createClient } from '../../../lib/supabase/server.js';

export async function GET(req) {
  const { searchParams, origin } = new URL(req.url);
  const code = searchParams.get('code');

  console.log('[auth/callback] hit, has code:', !!code, 'origin:', origin);

  if (code) {
    try {
      const supabase = await createClient();
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (error) {
        console.error('[auth/callback] exchangeCodeForSession error:', error.message);
      } else {
        console.log('[auth/callback] session exchange succeeded');
        return NextResponse.redirect(`${origin}/`);
      }
    } catch (err) {
      console.error('[auth/callback] THREW:', err.message, err.stack);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth`);
}
