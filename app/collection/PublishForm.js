'use client';
import { useState } from 'react';

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.split(',')[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function PublishForm({ item, title, description }) {
  const [price, setPrice] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [conditionId, setConditionId] = useState('USED_EXCELLENT');
  const [files, setFiles] = useState([]);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  async function publish() {
    setBusy(true);
    setError('');
    setResult(null);
    try {
      if (files.length === 0) throw new Error('Add at least one photo');
      if (!price || Number(price) <= 0) throw new Error('Enter a price');
      if (!categoryId) throw new Error('Enter an eBay category ID');

      const imageUrls = [];
      for (const file of files) {
        const dataBase64 = await fileToBase64(file);
        const res = await fetch('/api/ebay/upload-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ filename: file.name, dataBase64 }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Image upload failed');
        imageUrls.push(data.url);
      }

      const listRes = await fetch('/api/ebay/list-item', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sku: item.key.slice(0, 50),
          title,
          description,
          imageUrls,
          price: Number(price),
          quantity: item.qty,
          categoryId,
          conditionId,
        }),
      });
      const listData = await listRes.json();
      if (!listRes.ok) throw new Error(listData.error || 'Publish failed');
      setResult(listData);
    } catch (e) {
      setError(e.message);
    }
    setBusy(false);
  }

  if (result) {
    return (
      <div className="vfl-comps-block">
        <div className="vfl-comps-stat">
          ✅ Published to {result.environment}.{' '}
          <a href={result.viewUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#2f5f8a' }}>View listing ↗</a>
        </div>
      </div>
    );
  }

  return (
    <div className="vfl-comps-block">
      <div className="vfl-logrow" style={{ flexWrap: 'wrap', marginBottom: 8 }}>
        <input className="vfl-price-input" type="number" step="0.01" placeholder="$ price" value={price} onChange={e => setPrice(e.target.value)} />
        <input className="vfl-price-input" style={{ width: 150 }} placeholder="eBay category ID" value={categoryId} onChange={e => setCategoryId(e.target.value)} />
        <select className="vfl-price-input" style={{ width: 150 }} value={conditionId} onChange={e => setConditionId(e.target.value)}>
          <option value="USED_EXCELLENT">Used - Excellent</option>
          <option value="USED_VERY_GOOD">Used - Very Good</option>
          <option value="USED_GOOD">Used - Good</option>
          <option value="NEW">New</option>
        </select>
      </div>
      <input type="file" accept="image/*" multiple onChange={e => setFiles(Array.from(e.target.files || []))} style={{ marginBottom: 10, fontSize: 12 }} />
      {error && <div style={{ color: '#a12020', fontSize: 12, marginBottom: 8 }}>{error}</div>}
      <button className="vfl-coll-btn primary" onClick={publish} disabled={busy}>
        {busy ? 'Publishing…' : 'Publish live listing'}
      </button>
    </div>
  );
}
