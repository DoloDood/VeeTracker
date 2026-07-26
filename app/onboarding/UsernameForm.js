'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function UsernameForm() {
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  async function submit(e) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      const res = await fetch('/api/username', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Something went wrong');
        setBusy(false);
        return;
      }
      router.push('/search');
      router.refresh();
    } catch (err) {
      setError('Network error — try again');
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit}>
      <input
        value={username}
        onChange={e => setUsername(e.target.value)}
        placeholder="your-username"
        autoFocus
        style={{
          width: '100%', boxSizing: 'border-box', fontSize: 16, padding: '14px 16px',
          borderRadius: 12, border: '1.5px solid #2a2938', background: '#1a1922', color: '#eeeef4',
          marginBottom: 12, outline: 'none',
        }}
      />
      {error && <div style={{ color: '#e2582a', fontSize: 13, marginBottom: 12 }}>{error}</div>}
      <button
        type="submit"
        disabled={busy || username.trim().length < 3}
        style={{
          width: '100%', fontSize: 15, fontWeight: 600, padding: '14px 24px', borderRadius: 12,
          border: 'none', background: busy ? '#3a3a44' : '#5b5fef', color: '#fff',
          cursor: busy ? 'default' : 'pointer',
        }}
      >
        {busy ? 'Saving…' : 'Continue'}
      </button>
    </form>
  );
}
