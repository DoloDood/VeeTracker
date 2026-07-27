import { redirect } from 'next/navigation';
import { getCurrentUser } from '../lib/supabase/server.js';

export default async function HomePage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');
  if (!user.username) redirect('/onboarding');
  redirect('/search');
}
