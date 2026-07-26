import { redirect } from 'next/navigation';
import { auth } from '../auth.js';

export default async function HomePage() {
  const session = await auth();
  if (!session) redirect('/login');
  if (!session.user.username) redirect('/onboarding');
  redirect('/search');
}
