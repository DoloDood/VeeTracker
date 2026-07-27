'use client';
import { useState, useEffect, useMemo } from 'react';
import {
  CATEGORY_META, CATEGORY_ORDER, parseQuery, effectiveState, buildTitle,
  buildDescription, compsUrl, slugFor, cycle, GRADE_CYCLE,
} from '../../lib/veefriends-core.js';

const TRIVIAL_RUNS = new Set(['base', 'tiered', '']);
const EXAMPLES = [
  'alert ape chrome 2026 psa 10',
  'empathy elephant spectacular sticker',
  'patient panda gemstone pin',
  'eager eagle coin gold',
];

function Spec({ k, v }) {
  return (
    <div className="vfl-spec">
      <div className="vfl-spec-k">{k}</div>
      <div className="vfl-spec-v">{v}</div>
    </div>
  );
}

export default function SearchTool() {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [overrides, setOverrides] = useState({ categoryId: null, setId: null, rarityName: null, grade: null });
  const [prices, setPrices] = useState([]);
  const [priceInput, setPriceInput] = useState('');
  const [addStatus, setAddStatus] = useState('');
  const [copyStatus, setCopyStatus] = useState({});
  const [descOverride, setDescOverride] = useState(null);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query), 100);
    return () => clearTimeout(t);
  }, [query]);

  const parsed = useMemo(() => (debouncedQuery.trim() ? parseQuery(debouncedQuery) : null), [debouncedQuery]);
  const state = useMemo(() => (parsed && parsed.character ? effectiveState(parsed, overrides) : null), [parsed, overrides]);
  const key = state ? slugFor(state) : null;
  const title = state ? buildTitle(state) : '';
  const description = descOverride !== null ? descOverride : state ? buildDescription(state) : '';

  useEffect(() => {
    setDescOverride(null);
    if (!key) {
      setPrices([]);
      return;
    }
    fetch(`/api/price-log?key=${encodeURIComponent(key)}`)
      .then(r => r.json())
      .then(d => setPrices(d.prices || []))
      .catch(() => setPrices([]));
  }, [key]);

  function setCategory(id) {
    setOverrides(o => ({ categoryId: id, setId: null, rarityName: null, grade: o.grade }));
  }
  function cycleSet() {
    const catSets = CATEGORY_META[state.categoryId].sets;
    setOverrides(o => ({ ...o, setId: cycle(catSets, state.setId, 1), rarityName: null }));
  }
  function cycleRarity() {
    const names = state.set.rarities.map(r => r.name);
    setOverrides(o => ({ ...o, rarityName: cycle(names, state.rarity.name, 1) }));
  }
  function cycleGrade() {
    setOverrides(o => ({ ...o, grade: cycle(GRADE_CYCLE, state.grade, 1) }));
  }
  function resetGuesses() {
    setOverrides({ categoryId: null, setId: null, rarityName: null, grade: null });
  }

  async function copyText(text, id) {
    try {
      await navigator.clipboard.writeText(text);
      setCopyStatus(s => ({ ...s, [id]: 'copied!' }));
    } catch {
      setCopyStatus(s => ({ ...s, [id]: 'copy failed' }));
    }
    setTimeout(() => setCopyStatus(s => ({ ...s, [id]: null })), 1300);
  }

  async function addToCollection() {
    setAddStatus('adding…');
    try {
      const res = await fetch('/api/collection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          key, character: state.character, categoryId: state.categoryId, setId: state.setId,
          setLabel: state.set.shortLabel, rarityName: state.rarity.name, grade: state.grade,
        }),
      });
      setAddStatus(res.ok ? 'added ✓' : 'failed');
    } catch {
      setAddStatus('failed');
    }
    setTimeout(() => setAddStatus(''), 1400);
  }

  async function logSale() {
    const val = parseFloat(priceInput);
    if (isNaN(val) || val <= 0) return;
    await fetch('/api/price-log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key, price: val }),
    });
    setPriceInput('');
    const d = await fetch(`/api/price-log?key=${encodeURIComponent(key)}`).then(r => r.json());
    setPrices(d.prices || []);
  }

  const avg = prices.length ? prices.reduce((a, p) => a + Number(p.price), 0) / prices.length : 0;
  const last = prices.length ? prices[prices.length - 1] : null;
  const activeCategory = overrides.categoryId || (state && state.categoryId) || 'cards';

  return (
    <div className="vfl-wrap">
      <div className="vfl-eyebrow"><span className="dot"></span>VF LISTER</div>

      <div className="vfl-searchbox">
        <span className="vfl-searchicon">⌕</span>
        <input
          className="vfl-search"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="e.g. alert ape chrome 2026 psa 10"
          autoComplete="off"
        />
      </div>
      <div className="vfl-hint">
        Type a character, product/set, rarity, and grade in any order. Click a chip below to jump categories or correct a guess.
      </div>
      <div className="vfl-catrow">
        {CATEGORY_ORDER.map(id => (
          <button
            key={id}
            className={`vfl-cat-chip${activeCategory === id ? ' active' : ''}`}
            onClick={() => setCategory(id)}
          >
            {CATEGORY_META[id].label}
          </button>
        ))}
      </div>

      {!state && (
        <div className="vfl-empty">
          Start typing above — try a character name, a product, or a grade.
          <div className="vfl-examples">
            {EXAMPLES.map(ex => (
              <button key={ex} className="vfl-example-chip" onClick={() => setQuery(ex)}>{ex}</button>
            ))}
          </div>
        </div>
      )}

      {state && (
        <div className="vfl-slab">
          <div className="vfl-slab-strip" style={{ background: state.rarity.color }}></div>
          <div className="vfl-slab-inner">
            <div className="vfl-slab-top">
              <div className="vfl-character">{state.character}</div>
              {state.isCustom && <div className="vfl-custom-tag">custom</div>}
            </div>
            <div className="vfl-chiprow">
              <button className="vfl-chip" onClick={cycleSet}>{state.set.shortLabel} <span className="arrows">⟳</span></button>
              <button className="vfl-chip" onClick={cycleRarity}>{state.rarity.name} <span className="arrows">⟳</span></button>
              <button className="vfl-chip" onClick={cycleGrade}>{state.grade} <span className="arrows">⟳</span></button>
              <button className="vfl-reset-link" onClick={resetGuesses}>reset guesses</button>
            </div>
            <div className="vfl-divider"></div>

            <div className="vfl-block">
              <div className="vfl-label">
                eBay title
                <button className="vfl-btn" style={{ padding: '4px 9px', fontSize: 11 }} onClick={() => copyText(title, 'title')}>
                  {copyStatus.title || 'copy'}
                </button>
              </div>
              <div className="vfl-title-text">{title}</div>
            </div>

            <div className="vfl-block">
              <div className="vfl-label">Item specifics</div>
              <div className="vfl-specs">
                <Spec k="Character" v={state.character} />
                <Spec k="Brand" v="VeeFriends" />
                <Spec k="Type" v={CATEGORY_META[state.categoryId].itemLabel} />
                <Spec k="Release" v={state.set.shortLabel} />
                <Spec k="Year" v={state.set.year || '—'} />
                <Spec k="Parallel/Rarity" v={state.rarity.name} />
                <Spec k="Print run" v={TRIVIAL_RUNS.has(state.rarity.run) ? '—' : state.rarity.run} />
                <Spec k="Grade" v={state.grade} />
              </div>
            </div>

            <div className="vfl-block">
              <div className="vfl-label">
                Description
                <button className="vfl-btn" style={{ padding: '4px 9px', fontSize: 11 }} onClick={() => copyText(description, 'desc')}>
                  {copyStatus.desc || 'copy'}
                </button>
              </div>
              <textarea className="vfl-desc" value={description} onChange={e => setDescOverride(e.target.value)} />
            </div>

            <div className="vfl-btnrow">
              <a className="vfl-btn primary" href={compsUrl(state, false)} target="_blank" rel="noopener noreferrer">Search sold comps ↗</a>
              <a className="vfl-btn" href={compsUrl(state, true)} target="_blank" rel="noopener noreferrer">Broader search ↗</a>
              <button className="vfl-btn" onClick={addToCollection}>{addStatus || '+ Add to collection'}</button>
            </div>

            <div className="vfl-comps-block">
              <div className="vfl-comps-stat">
                {prices.length > 0 ? (
                  <>My sold comps: <b>${avg.toFixed(2)} avg</b> across {prices.length} logged (last: <b>${Number(last.price).toFixed(2)}</b>)</>
                ) : (
                  'No comps logged yet for this exact item/grade.'
                )}
              </div>
              <div className="vfl-logrow">
                <input
                  className="vfl-price-input"
                  type="number"
                  step="0.01"
                  placeholder="$ sold price"
                  value={priceInput}
                  onChange={e => setPriceInput(e.target.value)}
                />
                <button className="vfl-btn primary" onClick={logSale}>Log sale</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="vfl-footer">
        Card, sticker, pin, coin &amp; treasure chest data seeded from public VeeFriends / community collector info —
        pin and coin release years and exact print runs aren't all confirmed, so double check anything price-critical.
      </div>
    </div>
  );
}
