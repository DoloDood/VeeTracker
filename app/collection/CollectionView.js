'use client';
import { useState, useEffect } from 'react';
import { SETS, CATEGORY_META, buildTitle, buildDescription, cycle } from '../../lib/veefriends-core.js';
import PublishForm from './PublishForm.js';

const STATUS_CYCLE = ['owned', 'listed', 'sold'];
const STATUS_LABELS = [
  { status: 'owned', label: 'Owned' },
  { status: 'listed', label: 'Listed on eBay' },
  { status: 'sold', label: 'Sold' },
];

function stateFromItem(item) {
  const set = SETS[item.setId];
  const rarity = set.rarities.find(r => r.name === item.rarityName) || set.rarities[0];
  return { character: item.character, isCustom: false, categoryId: item.categoryId, setId: item.setId, set, rarity, grade: item.grade };
}

export default function CollectionView() {
  const [items, setItems] = useState(null);
  const [openPublish, setOpenPublish] = useState(null);

  useEffect(() => { load(); }, []);

  async function load() {
    const res = await fetch('/api/collection');
    const data = await res.json();
    setItems(data.items || []);
  }

  async function updateQty(id, delta, currentQty) {
    await fetch(`/api/collection/${id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ qty: currentQty + delta }),
    });
    load();
  }
  async function cycleStatus(id, current) {
    await fetch(`/api/collection/${id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: cycle(STATUS_CYCLE, current, 1) }),
    });
    load();
  }
  async function remove(id) {
    await fetch(`/api/collection/${id}`, { method: 'DELETE' });
    load();
  }

  if (items === null) {
    return <div className="vfl-wrap"><div className="vfl-coll-empty">Loading…</div></div>;
  }

  return (
    <div className="vfl-wrap">
      <div className="vfl-eyebrow"><span className="dot"></span>MY COLLECTION</div>
      <div className="vfl-hint" style={{ marginBottom: 20 }}>
        Everything you've added from a search. Adjust quantity, mark status, or publish it straight to eBay.
      </div>

      {items.length === 0 && (
        <div className="vfl-coll-empty">Nothing here yet — add items from the Search &amp; List page.</div>
      )}

      {STATUS_LABELS.map(g => {
        const groupItems = items.filter(i => i.status === g.status);
        if (groupItems.length === 0) return null;
        return (
          <div key={g.status}>
            <div className="vfl-coll-group-head">{g.label} ({groupItems.reduce((a, i) => a + i.qty, 0)})</div>
            {groupItems.map(item => {
              const s = stateFromItem(item);
              const title = buildTitle(s);
              const description = buildDescription(s);
              return (
                <div className="vfl-coll-card" key={item.id}>
                  <div className="vfl-coll-strip" style={{ background: s.rarity.color }}></div>
                  <div className="vfl-coll-inner">
                    <div className="vfl-coll-top">
                      <div>
                        <div className="vfl-coll-name">{item.character}</div>
                        <div className="vfl-coll-meta">
                          {CATEGORY_META[item.categoryId].label} · {item.setLabel} · {item.rarityName} · {item.grade}
                        </div>
                      </div>
                      <button className={`vfl-coll-status ${item.status}`} onClick={() => cycleStatus(item.id, item.status)}>
                        {item.status}
                      </button>
                    </div>
                    <div className="vfl-coll-row2">
                      <div className="vfl-qty">
                        <button className="vfl-qty-btn" onClick={() => updateQty(item.id, -1, item.qty)} aria-label="Decrease quantity">–</button>
                        <span className="vfl-qty-num">{item.qty}</span>
                        <button className="vfl-qty-btn" onClick={() => updateQty(item.id, 1, item.qty)} aria-label="Increase quantity">+</button>
                      </div>
                      <div className="vfl-coll-actions">
                        <button className="vfl-coll-btn primary" onClick={() => setOpenPublish(openPublish === item.id ? null : item.id)}>
                          {openPublish === item.id ? 'Close' : 'List to eBay'}
                        </button>
                        <button className="vfl-coll-btn danger" onClick={() => remove(item.id)}>Remove</button>
                      </div>
                    </div>
                    {openPublish === item.id && <PublishForm item={item} title={title} description={description} />}
                  </div>
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
