import { redirect } from 'next/navigation';
import { getCurrentUser } from '../../lib/supabase/server.js';
import AppNav from '../components/AppNav.js';
import CollectionView from './CollectionView.js';

export default async function CollectionPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');
  if (!user.username) redirect('/onboarding');

  return (
    <>
      <AppNav username={user.username} />
      <CollectionView />
    </>
  );
}
