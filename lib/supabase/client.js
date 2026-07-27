// Browser-side Supabase client — used for the "Sign in with Google" button
// and sign-out, both of which need to run in the browser to handle the
// OAuth redirect.
import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}
