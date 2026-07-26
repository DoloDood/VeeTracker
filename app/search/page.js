import { redirect } from 'next/navigation';
import { auth } from '../../auth.js';
import AppNav from '../components/AppNav.js';
import SearchTool from './SearchTool.js';

export default async function SearchPage() {
  const session = await auth();
  if (!session) redirect('/login');
  if (!session.user.username) redirect('/onboarding');

  return (
    <>
      <AppNav username={session.user.username} />
      <SearchTool />
    </>
  );
}
