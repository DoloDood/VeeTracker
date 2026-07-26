import { redirect } from 'next/navigation';
import { auth } from '../../auth.js';
import UsernameForm from './UsernameForm.js';

export default async function OnboardingPage() {
  const session = await auth();
  if (!session) redirect('/login');
  if (session.user.username) redirect('/search');

  return (
    <main style={{ maxWidth: 420, margin: '0 auto', padding: '80px 20px', textAlign: 'center' }}>
      <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 10 }}>Pick a username</h1>
      <p style={{ color: '#8d8ca0', fontSize: 14, marginBottom: 26 }}>
        This is how your collection will be identified. Lowercase letters, numbers, - or _, 3-20 characters.
      </p>
      <UsernameForm />
    </main>
  );
}
