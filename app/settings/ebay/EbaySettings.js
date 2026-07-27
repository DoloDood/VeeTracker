'use client';
import { useState, useEffect } from 'react';

export default function EbaySettings() {
  const [justConnected, setJustConnected] = useState(false);
  const [connection, setConnection] = useState(undefined); // undefined = loading, null = not connected
  const [form, setForm] = useState({ fulfillmentPolicyId: '', paymentPolicyId: '', returnPolicyId: '', merchantLocationKey: '' });
  const [saveStatus, setSaveStatus] = useState('');

  useEffect(() => {
    setJustConnected(new URLSearchParams(window.location.search).get('connected') === '1');
    load();
  }, []);

  async function load() {
    const res = await fetch('/api/ebay/settings');
    const data = await res.json();
    setConnection(data.connection || null);
    if (data.connection) {
      setForm({
        fulfillmentPolicyId: data.connection.fulfillmentPolicyId || '',
        paymentPolicyId: data.connection.paymentPolicyId || '',
        returnPolicyId: data.connection.returnPolicyId || '',
        merchantLocationKey: data.connection.merchantLocationKey || '',
      });
    }
  }

  async function save() {
    setSaveStatus('saving…');
    const res = await fetch('/api/ebay/settings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    setSaveStatus(res.ok ? 'saved ✓' : 'failed to save');
    setTimeout(() => setSaveStatus(''), 1600);
    load();
  }

  return (
    <div className="vfl-wrap">
      <div className="vfl-eyebrow"><span className="dot"></span>EBAY SETTINGS</div>

      {justConnected && (
        <div className="vfl-comps-block" style={{ background: 'rgba(63,145,66,0.12)', borderRadius: 10, padding: 12, marginBottom: 16, border: 'none' }}>
          ✅ eBay account connected.
        </div>
      )}

      {connection === undefined && <div className="vfl-coll-empty">Loading…</div>}

      {connection !== undefined && (
        <>
          <div className="vfl-slab" style={{ marginBottom: 20 }}>
            <div className="vfl-slab-inner">
              <div className="vfl-label">Connection status</div>
              {connection ? (
                <div className="vfl-title-text" style={{ marginBottom: 12 }}>
                  Connected to <b>{connection.environment}</b>
                  {connection.connectedAt ? ` on ${new Date(connection.connectedAt).toLocaleDateString()}` : ''}.
                </div>
              ) : (
                <div className="vfl-title-text" style={{ marginBottom: 12 }}>Not connected yet.</div>
              )}
              <div className="vfl-btnrow">
                <a className="vfl-btn primary" href="/api/ebay/auth-start?env=sandbox">
                  {connection?.environment === 'sandbox' ? 'Reconnect Sandbox' : 'Connect Sandbox'}
                </a>
                <a className="vfl-btn" href="/api/ebay/auth-start?env=production">
                  {connection?.environment === 'production' ? 'Reconnect Production' : 'Connect Production'}
                </a>
              </div>
              <div className="vfl-hint" style={{ marginTop: 10, marginBottom: 0 }}>
                Start with Sandbox. It's a full working replica of eBay — nothing here touches a real listing until you connect Production.
              </div>
            </div>
          </div>

          <div className="vfl-slab">
            <div className="vfl-slab-inner">
              <div className="vfl-label">Business policies &amp; location</div>
              <div className="vfl-hint" style={{ marginTop: 0 }}>
                Required before publishing works. Find these in Seller Hub → Business Policies, and set up an
                inventory location via the Account API's <code>createInventoryLocation</code> call.
              </div>
              {['fulfillmentPolicyId', 'paymentPolicyId', 'returnPolicyId', 'merchantLocationKey'].map(field => (
                <div key={field} style={{ marginBottom: 10 }}>
                  <div className="vfl-spec-k" style={{ marginBottom: 4 }}>{field}</div>
                  <input
                    className="vfl-price-input"
                    style={{ width: '100%' }}
                    value={form[field]}
                    onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))}
                  />
                </div>
              ))}
              <button className="vfl-btn primary" onClick={save}>{saveStatus || 'Save'}</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
