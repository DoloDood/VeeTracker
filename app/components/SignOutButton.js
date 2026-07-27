'use client';
import { createClient } from '../../lib/supabase/client.js';
import { useRouter } from 'next/navigation';

export default function SignOutButton() {
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  }

  return (
    <button onClick={handleSignOut} style={{ background: 'none', border: 'none', color: '#8d8ca0', fontSize: 12, cursor: 'pointer', textDecoration: 'underline' }}>
      Sign out
    </button>
  );
}
