import Link from 'next/link';
import SignOutButton from './SignOutButton.js';

export default function AppNav({ username }) {
  return (
    <div style={{ maxWidth: 640, margin: '0 auto', padding: '20px 16px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div style={{ display: 'flex', gap: 16 }}>
        <Link href="/search" style={{ color: '#8d8ca0', fontSize: 13, fontWeight: 600, textDecoration: 'none' }}>Search &amp; List</Link>
        <Link href="/collection" style={{ color: '#8d8ca0', fontSize: 13, fontWeight: 600, textDecoration: 'none' }}>My Collection</Link>
        <Link href="/settings/ebay" style={{ color: '#8d8ca0', fontSize: 13, fontWeight: 600, textDecoration: 'none' }}>eBay Settings</Link>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ color: '#8d8ca0', fontSize: 12, fontFamily: 'monospace' }}>@{username}</span>
        <SignOutButton />
      </div>
    </div>
  );
}
