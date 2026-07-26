import { redirect } from 'next/navigation';
import { auth, signIn } from '../../auth.js';

export default async function LoginPage() {
  const session = await auth();
  if (session) redirect('/');

  async function googleSignIn() {
    'use server';
    await signIn('google', { redirectTo: '/' });
  }

  return (
    <main style={{ maxWidth: 420, margin: '0 auto', padding: '80px 20px', textAlign: 'center' }}>
      <div style={{ fontFamily: 'monospace', fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#8d8ca0', marginBottom: 10 }}>
        VF LISTER
      </div>
      <h1 style={{ fontSize: 30, fontWeight: 800, marginBottom: 30 }}>Track your collection. List it to eBay.</h1>
      <form action={googleSignIn}>
        <button
          type="submit"
          style={{
            fontSize: 15, fontWeight: 600, padding: '14px 24px', borderRadius: 12,
            border: 'none', background: '#5b5fef', color: '#fff', cursor: 'pointer', width: '100%',
          }}
        >
          Sign in with Google
        </button>
      </form>
    </main>
  );
}
