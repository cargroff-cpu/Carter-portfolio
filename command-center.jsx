// command-center.jsx — Marketing Command Center, recreated in React from the
// design-reference/Marketing Command Center.html + mcc-core.js prototype.
// Class names match parlor.css/mcc.css (linked in Command Center.html) so the
// prototype's exact visual fidelity carries over without reinventing styles
// inline. Screen state lives in the URL (screen/brand/id/sheet/ch/type) so
// every screen — and Wick's future deep links — stay linkable.
const { BRANDS, BRAND_KIT, CHANNELS, TYPES, money, fmtDate, inBrand, checklistDone, fetchCampaigns, fetchLinks, saveCampaign, saveLink } = window.CC;

const SCREENS = [
  { id: 'home', label: 'Home' },
  { id: 'campaigns', label: 'Campaigns' },
  { id: 'links', label: 'Links' },
  { id: 'builder', label: 'Builder' },
  { id: 'divider' },
  { id: 'present', label: 'Present', later: 1 },
  { id: 'calendar', label: 'Calendar', later: 1 },
  { id: 'connections', label: 'Connections', later: 1 },
  { id: 'revenue', label: 'Revenue', later: 1 },
];

function useQueryState() {
  const q = new URLSearchParams(location.search);
  const [s, setS] = React.useState({
    screen: q.get('screen') || 'home',
    brand: q.get('brand') || 'ltw',
    id: q.get('id') || '',
    sheet: q.get('sheet') || '',
    ch: '', type: '',
  });
  React.useEffect(() => {
    const p = new URLSearchParams({ screen: s.screen, brand: s.brand });
    if (s.screen === 'detail' && s.id) p.set('id', s.id);
    if (s.sheet) p.set('sheet', s.sheet);
    history.replaceState(null, '', '?' + p);
  }, [s.screen, s.brand, s.id, s.sheet]);
  return [s, setS];
}

function Dot({ b }) { return <span className={'dot ' + b} />; }
function Tag({ b }) { return <span className="tag"><Dot b={b} />{BRANDS[b].short}</span>; }
function StatusPill({ c }) {
  if (c.status === 'draft') return <span className="pill mute">Draft</span>;
  return checklistDone(c) ? <span className="pill ok">Tracked</span> : <span className="pill bad">Missing info</span>;
}

// ── Home ──────────────────────────────────────────────────────────────
function GoalCard({ b, pdGoal, leads }) {
  // pdGoal is this brand's entry from /api/pipedrive-goals -- { found, target,
  // current, syncedAt } once configured, or undefined/not-found before then.
  const hasGoal = !!(pdGoal && pdGoal.found && pdGoal.target != null);
  const goalLeads = hasGoal && pdGoal.current != null ? pdGoal.current : leads;
  const pct = hasGoal ? Math.round((goalLeads / pdGoal.target) * 100) : 0;
  const pace = !hasGoal ? '' : pct >= 74 ? 'On pace' : 'Behind pace';
  return (
    <div className="card panel goal">
      <div className="between">
        <div className="row"><Dot b={b} /><span className="lbl">{BRANDS[b].name}</span></div>
        {hasGoal && <span className={'pill ' + (pct >= 74 ? 'ok' : 'warn')}>{pace}</span>}
      </div>
      {hasGoal ? (
        <React.Fragment>
          <div className="glowsrc">
            <div className="bignum mono lit">{goalLeads}<span>/ {pdGoal.target}</span></div>
          </div>
          <div className="lbl" style={{ marginBottom: 10 }}>Leads vs. goal <span style={{ color: 'var(--text-4)' }}>· from Pipedrive</span></div>
          <div className="bar big"><i className="lit" style={{ width: Math.min(pct, 100) + '%' }} /></div>
          <div className="between" style={{ marginTop: 9 }}>
            <span className="sub mono">{pct}%</span>
            <span className="sub mono">{pdGoal.target - goalLeads} to go</span>
          </div>
          <div className="lbl" style={{ marginTop: 14, color: 'var(--text-4)' }}>Synced {pdGoal.syncedAt ? new Date(pdGoal.syncedAt).toLocaleString('en-US', { hour: 'numeric', minute: '2-digit' }) : ''}</div>
        </React.Fragment>
      ) : (
        <React.Fragment>
          <div className="bignum mono">{leads}</div>
          <div className="lbl" style={{ marginBottom: 12 }}>Leads this month</div>
          <div className="nogoal">No goal set in Pipedrive for {BRANDS[b].short}. Set one there and it appears here.</div>
        </React.Fragment>
      )}
    </div>
  );
}

function SpendPanel({ brand, campaigns }) {
  const brands = brand === 'both' ? ['ltw', 'sq'] : [brand];
  return (
    <section className="card panel">
      <div className="between" style={{ borderBottom: '1px solid var(--hair-in)', paddingBottom: 16, marginBottom: 16 }}>
        <h2 className="h2">Spend this month</h2>
        <span className="lbl">From logged costs</span>
      </div>
      <div className="spendgrid">
        {brands.map((b) => {
          const mine = campaigns.filter((x) => x.brand === b && x.status !== 'draft');
          const spend = mine.reduce((a, x) => a + (x.cost || 0), 0);
          const missing = mine.filter((x) => x.cost == null).length;
          const leads = mine.reduce((a, x) => a + (x.leads || 0), 0);
          const cpl = leads && spend ? Math.round(spend / leads) : null;
          return (
            <div className="spendcol" key={b}>
              <div className="row" style={{ gap: 8 }}><Dot b={b} /><span className="lbl">{BRANDS[b].short}</span></div>
              <div className="spendrow"><span className="lbl">Spent</span><span className="mono spendnum">{money(spend)}</span></div>
              <div className="spendrow"><span className="lbl">Per lead</span><span className="mono spendnum">{cpl ? money(cpl) : '·'}</span></div>
              {missing > 0 && <div className="spendnote">{missing} campaign{missing > 1 ? 's' : ''} logged without cost, so this is a floor, not the real figure.</div>}
            </div>
          );
        })}
      </div>
    </section>
  );
}

function ChannelBreakdown({ brand, campaigns }) {
  const rows = inBrand(campaigns.filter((c) => c.status !== 'draft'), brand);
  const by = {};
  rows.forEach((c) => {
    by[c.channel] = by[c.channel] || { leads: 0, cost: 0, brands: new Set() };
    by[c.channel].leads += c.leads || 0;
    by[c.channel].cost += c.cost || 0;
    by[c.channel].brands.add(c.brand);
  });
  const list = Object.entries(by).sort((a, b) => b[1].leads - a[1].leads);
  const max = Math.max(1, ...list.map(([, v]) => v.leads));
  // The one efficient channel (lowest $/lead among channels with real spend)
  // carries the lit bar + figure -- everything else stays bone/dim gold.
  const cpl = ([, v]) => (v.cost > 0 ? v.cost / Math.max(v.leads, 1) : Infinity);
  const bestChannel = list.length ? list.reduce((a, b) => (cpl(b) < cpl(a) ? b : a))[0] : null;
  return (
    <section className="card panel">
      <div className="between" style={{ borderBottom: '1px solid var(--hair-in)', paddingBottom: 16, marginBottom: 16 }}>
        <h2 className="h2">Channel breakdown</h2>
        <span className="lbl">{new Date().toLocaleDateString('en-US', { month: 'long' })}</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {list.length === 0 && <p className="sub" style={{ padding: '4px 0' }}>No leads attributed yet this month. Channels appear as touches come in.</p>}
        {list.map(([ch, v]) => {
          const isBest = ch === bestChannel;
          const noSpend = !v.cost;
          return (
            <div className="chrow" key={ch}>
              <div className="between">
                <div className="row" style={{ gap: 8 }}>{[...v.brands].map((b) => <Dot key={b} b={b} />)}<span style={{ fontSize: 13.5, color: noSpend ? 'var(--text-4)' : undefined }}>{ch}</span></div>
                <span className="mono" style={{ fontSize: 13, color: isBest ? 'var(--accent-lit)' : noSpend ? 'var(--text-4)' : 'var(--text-2)' }}>{v.leads} · {v.cost ? money(Math.round(v.cost / Math.max(v.leads, 1))) + '/lead' : 'no spend'}</span>
              </div>
              <div className="bar" style={{ marginTop: 7, height: 5 }}><i className={isBest ? 'lit' : noSpend ? 'dead' : ''} style={{ width: (v.leads / max) * 100 + '%' }} /></div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function RecentRow({ c, onGo }) {
  return (
    <button className="reclist" onClick={() => onGo('detail', c.id)}>
      <div className="between">
        <div className="row" style={{ gap: 8 }}><Dot b={c.brand} /><span style={{ fontSize: 13.5, fontWeight: 500 }}>{c.name}</span></div>
        <StatusPill c={c} />
      </div>
      <div className="row" style={{ gap: 14, marginTop: 6 }}>
        <span className="sub mono">{fmtDate(c.date)}</span>
        <span className="sub">{c.channel}</span>
        <span className="sub mono">{c.cost == null ? '·' : money(c.cost)}</span>
        <span className="sub mono">{c.leads || 0} leads</span>
      </div>
    </button>
  );
}

function ScreenHome({ s, campaigns, onGo, goals }) {
  const brands = s.brand === 'both' ? ['ltw', 'sq'] : [s.brand];
  const flagged = inBrand(campaigns.filter((c) => c.status === 'flagged'), s.brand);
  return (
    <div className="stack">
      {flagged.length > 0 && (
        <div className="flagbox panel flag">
          <div className="row" style={{ gap: 10, alignItems: 'flex-start' }}>
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" style={{ flex: 'none', marginTop: 1 }}>
              <path d="M10 2.5l8 15H2z" /><path d="M10 8v4M10 14.5v.5" />
            </svg>
            <div style={{ flex: 1 }}>
              <div className="h2">{flagged.length} campaign{flagged.length > 1 ? 's' : ''} went out untracked</div>
              <p className="sub" style={{ marginTop: 5, color: '#e8c79b' }}>{flagged.map((c) => c.name).join(' · ')}, missing attribution, so any leads they produced land nowhere.</p>
              <div className="row" style={{ gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
                {flagged.map((c) => <button key={c.id} className="btn ghost sm" onClick={() => onGo('detail', c.id)}>Fix {BRANDS[c.brand].short} · {c.channel}</button>)}
              </div>
            </div>
          </div>
        </div>
      )}
      <div className={'goals' + (brands.length > 1 ? ' two' : '')}>
        {brands.map((b) => {
          const leads = campaigns.filter((c) => c.brand === b).reduce((a, c) => a + (c.leads || 0), 0);
          return <GoalCard key={b} b={b} pdGoal={goals.goals && goals.goals[b]} leads={leads} />;
        })}
      </div>
      <SpendPanel brand={s.brand} campaigns={campaigns} />
      <ChannelBreakdown brand={s.brand} campaigns={campaigns} />
      <section className="card panel">
        <div className="between" style={{ borderBottom: '1px solid var(--hair-in)', paddingBottom: 16, marginBottom: 16 }}>
          <h2 className="h2">Recent campaigns</h2>
          <button className="btn quiet sm" onClick={() => onGo('campaigns')}>All campaigns →</button>
        </div>
        <div className="reclistwrap">
          {inBrand(campaigns, s.brand).slice(0, 6).map((c) => <RecentRow key={c.id} c={c} onGo={onGo} />)}
        </div>
      </section>
    </div>
  );
}

// ── Campaign list ─────────────────────────────────────────────────────
function ScreenCampaigns({ s, campaigns, onGo, onFilter, onLogCampaign }) {
  const rows = inBrand(campaigns, s.brand).filter((c) => (!s.ch || c.channel === s.ch) && (!s.type || c.type === s.type));
  if (campaigns.length === 0) {
    return (
      <div className="card panel pad empty">
        <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="var(--text-3)" strokeWidth="1.3"><path d="M3 6h18M3 12h18M3 18h11" /></svg>
        <h2 className="h1" style={{ marginTop: 16 }}>Nothing logged yet</h2>
        <p className="sub" style={{ maxWidth: 340, margin: '8px auto 0' }}>The first campaign you log sets the baseline. Thirty seconds now beats reconstructing it in November.</p>
      </div>
    );
  }
  return (
    <div className="stack">
      <div className="filters console">
        <select className="select" value={s.ch} onChange={(e) => onFilter('ch', e.target.value)}>
          <option value="">All channels</option>
          {CHANNELS.map((c) => <option key={c}>{c}</option>)}
        </select>
        <select className="select" value={s.type} onChange={(e) => onFilter('type', e.target.value)}>
          <option value="">All types</option>
          {TYPES.map((c) => <option key={c}>{c}</option>)}
        </select>
        <span className="lbl spacer" style={{ whiteSpace: 'nowrap' }}>{rows.length} campaigns · {money(rows.reduce((a, c) => a + (c.cost || 0), 0))} spent</span>
        <button className="btn" onClick={onLogCampaign}>+ Log a campaign</button>
      </div>
      <div className="card panel tight scroll-x desktop-only">
        <table>
          <thead><tr><th>Date</th><th>Brand</th><th>Campaign</th><th>Channel</th><th>Type</th><th>Cost</th><th>Qty</th><th>Leads</th><th>Status</th></tr></thead>
          <tbody>
            {rows.map((c) => (
              <tr key={c.id} className={c.status === 'flagged' ? 'flagrow' : ''} onClick={() => onGo('detail', c.id)}>
                <td className="mono" style={{ color: 'var(--text-2)' }}>{fmtDate(c.date)}</td>
                <td><Dot b={c.brand} /></td>
                <td style={{ fontWeight: 500 }}>{c.name}</td>
                <td style={{ color: 'var(--text-2)' }}>{c.channel}</td>
                <td><span className="tag">{c.type}</span></td>
                <td className="mono">{c.cost == null ? '·' : money(c.cost)}</td>
                <td className="mono" style={{ color: 'var(--text-2)' }}>{c.qty == null ? '·' : c.qty.toLocaleString()}</td>
                <td className="mono">{c.leads || '·'}</td>
                <td><StatusPill c={c} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mobile-only reclistwrap card panel">
        {rows.map((c) => <RecentRow key={c.id} c={c} onGo={onGo} />)}
      </div>
    </div>
  );
}

// ── Campaign detail ───────────────────────────────────────────────────
function Field({ label, value, mono }) {
  return (
    <div className="fld">
      <div className="lbl">{label}</div>
      <div className={mono ? 'mono' : ''} style={{ marginTop: 5, fontSize: 14.5 }}>
        {value == null || value === '' ? <span style={{ color: 'var(--text-3)' }}>·</span> : value}
      </div>
    </div>
  );
}

function ScreenDetail({ s, campaigns, onGo, onSaved }) {
  const c = campaigns.find((x) => x.id === s.id) || campaigns[0];
  if (!c) return <div className="card panel pad empty"><p className="sub">No campaigns yet.</p></div>;
  const done = checklistDone(c);
  const items = [['cost', 'Cost entered'], ['attr', 'Attribution mechanism assigned'], ['qty', 'Audience quantity logged']];
  const [saving, setSaving] = React.useState(false);
  const markSent = async () => {
    if (!done || saving) return;
    setSaving(true);
    try { await saveCampaign({ id: c.id, status: 'sent' }); onSaved(); } finally { setSaving(false); }
  };
  return (
    <div className="stack">
      <div className="between detailhead">
        <div>
          <button className="btn quiet sm" style={{ marginLeft: -12 }} onClick={() => onGo('campaigns')}>← All campaigns</button>
          <h1 className="h1" style={{ fontSize: 24, marginTop: 6 }}>{c.name}</h1>
          <div className="row" style={{ gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
            <Tag b={c.brand} /><span className="tag">{c.channel}</span><span className="tag">{c.type}</span><span className="tag mono">{fmtDate(c.date)}</span>
          </div>
        </div>
        <div className="row" style={{ gap: 8, flexWrap: 'wrap' }}>
          <button className="btn ghost">Edit</button>
          <button className="btn">Clone this campaign</button>
        </div>
      </div>
      {!done && <div className="flagbox slim"><b>Checklist incomplete.</b> This campaign can't be marked <em>Sent</em> until every item below is cleared.</div>}
      <div className="cols">
        <div className="stack">
          <section className="card">
            <div className="pad" style={{ borderBottom: '1px solid var(--line)' }}><h2 className="h2">The record</h2></div>
            <div className="pad fldgrid">
              <Field label="Date" value={fmtDate(c.date)} mono />
              <Field label="Brand" value={BRANDS[c.brand].name} />
              <Field label="Channel" value={c.channel} />
              <Field label="Campaign type" value={c.type} />
              <Field label="Audience" value={c.audience} />
              <Field label="Quantity" value={c.qty == null ? null : c.qty.toLocaleString()} mono />
              <Field label="Total cost" value={c.cost == null ? null : money(c.cost)} mono />
              <Field label="Cost per lead" value={c.leads && c.cost ? money(Math.round(c.cost / c.leads)) : null} mono />
              <Field label="Creative reference" value={c.creative || null} />
            </div>
            {c.channel === 'Direct Mail' && (
              <div className="pad mailblock">
                <div className="lbl" style={{ marginBottom: 16 }}>Piece economics · direct mail only</div>
                <div className="fldgrid">
                  <Field label="Piece count" value={c.pieces == null ? null : c.pieces.toLocaleString()} mono />
                  <Field label="Print / piece" value={c.cpp == null ? null : '$' + c.cpp.toFixed(2)} mono />
                  <Field label="Postage / piece" value={c.postage == null ? null : '$' + c.postage.toFixed(2)} mono />
                  <Field label="List + mail house" value={c.list_cost == null ? null : `${money(c.list_cost)} · ${c.mail_house || ''}`} mono />
                </div>
              </div>
            )}
            <div className="pad" style={{ borderTop: '1px solid var(--line)' }}>
              <Field label="Notes / post-mortem" value={c.notes || null} />
            </div>
          </section>
          <section className="card">
            <div className="pad" style={{ borderBottom: '1px solid var(--line)' }}>
              <div className="between"><h2 className="h2">Linked leads</h2><span className="pill mute">Pipedrive not connected</span></div>
            </div>
            <div className="pad empty" style={{ padding: '34px 18px' }}>
              <p className="sub" style={{ maxWidth: 330, margin: '0 auto' }}>Once Pipedrive is connected, every lead carrying this campaign's UTM, tracked number, or promo code lists here with its stage and value.</p>
            </div>
          </section>
        </div>
        <div className="stack">
          <section className="card">
            <div className="pad" style={{ borderBottom: '1px solid var(--line)' }}><h2 className="h2">Pre-send checklist</h2></div>
            <div className="pad" style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {items.map(([k, label]) => (
                <div key={k} className={'chk ' + (c.checklist[k] ? 'on' : 'off')}>
                  <span className="box">{c.checklist[k] && <svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1.5 6.5l3 3 6-7" /></svg>}</span>
                  <span>{label}</span>
                  {!c.checklist[k] && <span className="pill bad" style={{ marginLeft: 'auto' }}>Needed</span>}
                </div>
              ))}
            </div>
            <div className="pad" style={{ borderTop: '1px solid var(--line)' }}>
              <button className="btn" style={{ width: '100%', opacity: done ? 1 : 0.45, cursor: done ? 'pointer' : 'not-allowed' }} disabled={!done || saving} onClick={markSent}>
                {c.status === 'sent' ? 'Marked as sent' : 'Mark as sent'}
              </button>
            </div>
          </section>
          <section className="card">
            <div className="pad" style={{ borderBottom: '1px solid var(--line)' }}><h2 className="h2">Attribution mechanism</h2></div>
            <div className="pad">
              {c.attribution ? <div className="attr">{c.attribution}</div> : <div className="attr missing">Nothing assigned, leads from this send can't be traced back</div>}
              {c.utm && <div className="urlbox mono">{c.utm}</div>}
              <div className="row" style={{ gap: 8, marginTop: 14, flexWrap: 'wrap' }}>
                <button className="btn ghost sm" onClick={() => onGo('links')}>{c.attribution ? 'Build another link' : 'Assign a mechanism'}</button>
              </div>
            </div>
          </section>
          <section className="card">
            <div className="pad" style={{ borderBottom: '1px solid var(--line)' }}><h2 className="h2">Result</h2></div>
            <div className="pad fldgrid">
              <Field label="Leads attributed" value={c.leads || '0'} mono />
              <Field label="Closed revenue" value={<span style={{ color: 'var(--text-3)' }}>Awaiting Pipedrive</span>} />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

// ── Quick-add sheet ───────────────────────────────────────────────────
function QuickAddSheet({ onClose, onSaved }) {
  const [brand, setBrand] = React.useState('ltw');
  const [channel, setChannel] = React.useState(CHANNELS[0]);
  const [date, setDate] = React.useState(new Date().toISOString().slice(0, 10));
  const [name, setName] = React.useState('');
  const [cost, setCost] = React.useState('');
  const [qty, setQty] = React.useState('');
  const [type, setType] = React.useState(TYPES[0]);
  const [notes, setNotes] = React.useState('');
  const [saving, setSaving] = React.useState(false);
  const [err, setErr] = React.useState('');

  const save = async (asDraft) => {
    setSaving(true); setErr('');
    try {
      await saveCampaign({
        brand, channel, date, type,
        name: name || 'Untitled campaign',
        cost: cost === '' ? null : Number(cost),
        qty: qty === '' ? null : Number(qty),
        notes: notes || null,
        status: asDraft ? 'draft' : 'flagged',
        leads: 0,
        checklist: { cost: cost !== '', attr: false, qty: qty !== '' },
      });
      onSaved();
      onClose();
    } catch (e) {
      setErr('Could not save — try again.');
    }
    setSaving(false);
  };

  return (
    <div className="scrim" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="sheet" role="dialog" aria-modal="true" aria-label="Log a campaign">
        <div className="sheethead between">
          <div><h2 className="h1">Log a campaign</h2><p className="sub" style={{ marginTop: 3 }}>Three fields saves it. The rest can wait.</p></div>
          <button className="btn quiet" onClick={onClose}>Close</button>
        </div>
        <div className="sheetbody">
          <div className="req">
            <div className="lbl" style={{ color: 'var(--accent)' }}>Required</div>
            <div className="qgrid" style={{ marginTop: 12 }}>
              <div>
                <div className="lbl">Brand</div>
                <div className="seg" style={{ marginTop: 7, width: '100%' }}>
                  <button type="button" aria-pressed={brand === 'ltw'} style={{ flex: 1 }} onClick={() => setBrand('ltw')}><Dot b="ltw" />LTW</button>
                  <button type="button" aria-pressed={brand === 'sq'} style={{ flex: 1 }} onClick={() => setBrand('sq')}><Dot b="sq" />Squeeky</button>
                </div>
              </div>
              <div>
                <div className="lbl">Channel</div>
                <select className="select" style={{ marginTop: 7 }} value={channel} onChange={(e) => setChannel(e.target.value)}>
                  {CHANNELS.map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <div className="lbl">Date sent</div>
                <input className="input" type="date" style={{ marginTop: 7 }} value={date} onChange={(e) => setDate(e.target.value)} />
              </div>
            </div>
          </div>
          <div className="opt">
            <div className="between"><div className="lbl">Fill now or later</div><span className="pill mute">Optional</span></div>
            <div className="qgrid" style={{ marginTop: 12 }}>
              <div><div className="lbl">Campaign name</div><input className="input" style={{ marginTop: 7 }} placeholder="Bee season postcard" value={name} onChange={(e) => setName(e.target.value)} /></div>
              <div><div className="lbl">Cost</div><input className="input" style={{ marginTop: 7 }} placeholder="$" inputMode="decimal" value={cost} onChange={(e) => setCost(e.target.value)} /></div>
              <div><div className="lbl">Quantity / audience size</div><input className="input" style={{ marginTop: 7 }} placeholder="1,850" inputMode="numeric" value={qty} onChange={(e) => setQty(e.target.value)} /></div>
              <div>
                <div className="lbl">Campaign type</div>
                <select className="select" style={{ marginTop: 7 }} value={type} onChange={(e) => setType(e.target.value)}>
                  {TYPES.map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div style={{ gridColumn: '1 / -1' }}><div className="lbl">Notes</div><input className="input" style={{ marginTop: 7 }} placeholder="Anything you'll forget by Friday" value={notes} onChange={(e) => setNotes(e.target.value)} /></div>
            </div>
          </div>
          {err && <div className="sub" style={{ color: 'var(--danger)' }}>{err}</div>}
        </div>
        <div className="sheetfoot">
          <button className="btn ghost" disabled={saving} onClick={() => save(true)}>Save as draft, finish later</button>
          <button className="btn" disabled={saving} onClick={() => save(false)}>Save campaign</button>
        </div>
      </div>
    </div>
  );
}

// ── UTM builder ────────────────────────────────────────────────────────
const UTM_MED = { 'Direct Mail': 'postcard', Email: 'constant-contact', Instagram: 'social', Facebook: 'social', 'Google Ads': 'cpc', 'Referral Program': 'referral', 'Trade Show': 'event', 'Yard Sign': 'print' };
const UTM_SRC = { 'Direct Mail': 'directmail', Email: 'email', Instagram: 'instagram', Facebook: 'facebook', 'Google Ads': 'google', 'Referral Program': 'partner', 'Trade Show': 'tradeshow', 'Yard Sign': 'yardsign' };
const slugify = (s) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

function ScreenLinks({ links, onSaved }) {
  const [brand, setBrand] = React.useState('ltw');
  const [channel, setChannel] = React.useState(CHANNELS[0]);
  const [name, setName] = React.useState('');
  const [path, setPath] = React.useState('');
  const [copied, setCopied] = React.useState(false);
  const [saving, setSaving] = React.useState(false);

  const now = new Date();
  const yymm = `${String(now.getFullYear()).slice(2)}${String(now.getMonth() + 1).padStart(2, '0')}`;
  const host = brand === 'ltw' ? 'logandtimberworx.com' : 'squeekycleanva.com';
  const campSlug = `${brand === 'ltw' ? 'ltw' : 'squeeky'}-${yymm}-${slugify(name || 'campaign-name')}`;
  const cleanPath = (path || '').replace(/^\/?/, '/').replace(/^\/$/, '');
  const url = `https://${host}${cleanPath}?utm_source=${UTM_SRC[channel]}&utm_medium=${UTM_MED[channel]}&utm_campaign=${campSlug}`;

  const copy = () => { navigator.clipboard && navigator.clipboard.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 1400); };
  const save = async () => {
    if (!name || saving) return;
    setSaving(true);
    try { await saveLink({ name: campSlug, brand, channel, date: now.toISOString().slice(0, 10), url }); onSaved(); } finally { setSaving(false); }
  };

  return (
    <div className="stack">
      <div className="cols links">
        <section className="card">
          <div className="pad" style={{ borderBottom: '1px solid var(--line)' }}>
            <h2 className="h2">Build a link</h2>
            <p className="sub" style={{ marginTop: 4 }}>Naming convention is enforced: brand-yymm-slug.</p>
          </div>
          <div className="pad" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <div className="lbl">Brand</div>
              <div className="seg" style={{ marginTop: 7, width: '100%' }}>
                <button type="button" aria-pressed={brand === 'ltw'} style={{ flex: 1 }} onClick={() => setBrand('ltw')}><Dot b="ltw" />LTW</button>
                <button type="button" aria-pressed={brand === 'sq'} style={{ flex: 1 }} onClick={() => setBrand('sq')}><Dot b="sq" />Squeeky</button>
              </div>
            </div>
            <div><div className="lbl">Channel</div><select className="select" style={{ marginTop: 7 }} value={channel} onChange={(e) => setChannel(e.target.value)}>{CHANNELS.map((c) => <option key={c}>{c}</option>)}</select></div>
            <div><div className="lbl">Campaign name</div><input className="input" style={{ marginTop: 7 }} placeholder="Bee season postcard" value={name} onChange={(e) => setName(e.target.value)} /></div>
            <div><div className="lbl">Landing path</div><input className="input" style={{ marginTop: 7 }} placeholder="/ (home)" value={path} onChange={(e) => setPath(e.target.value)} /></div>
          </div>
          <div className="pad" style={{ borderTop: '1px solid var(--line)' }}>
            <div className="lbl">Generated link</div>
            <div className="urlbox mono" style={{ marginTop: 9 }}>{url}</div>
            <div className="row" style={{ gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
              <button className="btn sm" onClick={copy}>{copied ? 'Copied' : 'Copy link'}</button>
              <button className="btn ghost sm" disabled={!name || saving} onClick={save}>Save link</button>
            </div>
          </div>
        </section>
        <section className="card">
          <div className="pad between" style={{ borderBottom: '1px solid var(--line)' }}><h2 className="h2">Every link ever built</h2></div>
          <div className="scroll-x">
            <table>
              <thead><tr><th>Campaign</th><th>Brand</th><th>Channel</th><th>Date</th><th>URL</th></tr></thead>
              <tbody>
                {links.map((l) => (
                  <tr key={l.id || l.name}>
                    <td className="mono" style={{ fontSize: 12.5 }}>{l.name}</td>
                    <td><Dot b={l.brand} /></td>
                    <td style={{ color: 'var(--text-2)' }}>{l.channel}</td>
                    <td className="mono" style={{ color: 'var(--text-2)' }}>{fmtDate(l.date)}</td>
                    <td><span className="urlcell mono">{l.url}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}

// ── Shell ──────────────────────────────────────────────────────────────
function LaterScreen({ label, reason }) {
  return (
    <div className="card panel pad empty">
      <h2 className="h1">{label}</h2>
      <p className="sub" style={{ maxWidth: 380, margin: '8px auto 0' }}>{reason}</p>
    </div>
  );
}

function CommandCenter() {
  const [s, setS] = useQueryState();
  const [campaigns, setCampaigns] = React.useState([]);
  const [links, setLinks] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [err, setErr] = React.useState('');
  // Pipedrive goals load independently of campaigns/links -- Home shouldn't
  // wait on (or break for) a slow/unconfigured Pipedrive connection.
  const [goals, setGoals] = React.useState({ configured: false, goals: {} });

  const reload = React.useCallback(() => {
    Promise.all([fetchCampaigns(), fetchLinks()])
      .then(([c, l]) => { setCampaigns(c); setLinks(l); setErr(''); })
      .catch(() => setErr('Could not load Command Center data.'))
      .finally(() => setLoading(false));
  }, []);
  React.useEffect(() => { reload(); }, [reload]);
  React.useEffect(() => {
    fetch('/api/pipedrive-goals').then((r) => r.json()).then(setGoals).catch(() => {});
  }, []);

  const onGo = (screen, id) => { setS((prev) => ({ ...prev, screen, id: id || prev.id })); window.scrollTo(0, 0); };
  const onFilter = (key, value) => setS((prev) => ({ ...prev, [key]: value }));
  const setBrand = (brand) => setS((prev) => ({ ...prev, brand }));
  const openSheet = (sheet) => setS((prev) => ({ ...prev, sheet }));

  React.useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape' && s.sheet) openSheet(''); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [s.sheet]);

  const isPresent = s.screen === 'present';
  // Photographic masthead per the Lamplight treatment — Home and Campaigns get
  // a job photo scrim; everything else (its own content is the "artwork", or
  // isn't built yet) gets the flat gradient variant instead.
  const plateVariant = s.screen === 'home' ? { photo: 'plate-mcc.jpg' }
    : (s.screen === 'campaigns' || s.screen === 'detail') ? { photo: 'plate-mcc2.jpg', short: true }
    : { flat: true };

  return (
    <React.Fragment>
      {!isPresent && (
        <header className="top">
          <div className={'plate' + (plateVariant.flat ? ' flat' : '')}
            style={plateVariant.flat ? undefined : {
              '--plate-photo': `url(assets/${plateVariant.photo})`,
              ...(plateVariant.short ? { minHeight: 104, backgroundPosition: 'center 35%' } : {}),
            }}>
            <div className="topin">
              <a className="mark" href="/scaffold">
                <img src="assets/antler.png" alt="" />
                <div><b>Command Center</b><span>The Scaffold</span></div>
              </a>
              <div className="spacer" />
              <a className="btn quiet sm" href="/docket">Docket</a>
              <a className="btn quiet sm" style={{ marginRight: 4 }} href="/wick">Wick</a>
              <div className="seg" id="brandtoggle">
                <button aria-pressed={s.brand === 'ltw'} onClick={() => setBrand('ltw')}><Dot b="ltw" />LTW</button>
                <button aria-pressed={s.brand === 'sq'} onClick={() => setBrand('sq')}><Dot b="sq" />Squeeky</button>
                <button aria-pressed={s.brand === 'both'} onClick={() => setBrand('both')}>Both</button>
              </div>
            </div>
            <nav className="nav">
              {SCREENS.map((sc, i) => sc.id === 'divider'
                ? <span className="navdiv" key={i} />
                : (
                  <button key={sc.id} className={sc.later ? 'later' : ''}
                    aria-current={s.screen === sc.id || (sc.id === 'campaigns' && s.screen === 'detail')}
                    onClick={() => onGo(sc.id)}>
                    {sc.later && <svg className="lock" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.3"><rect x="2" y="5" width="8" height="6" /><path d="M4 5V3.6a2 2 0 014 0V5" /></svg>}
                    {sc.label}
                  </button>
                ))}
            </nav>
          </div>
        </header>
      )}
      <main>
        {loading ? (
          <div className="card panel pad empty"><p className="sub">Loading…</p></div>
        ) : err ? (
          <div className="card panel pad empty"><p className="sub" style={{ color: 'var(--danger)' }}>{err}</p></div>
        ) : (
          <React.Fragment>
            {s.screen === 'home' && <ScreenHome s={s} campaigns={campaigns} onGo={onGo} goals={goals} />}
            {(s.screen === 'campaigns') && <ScreenCampaigns s={s} campaigns={campaigns} onGo={onGo} onFilter={onFilter} onLogCampaign={() => openSheet('quickadd')} />}
            {s.screen === 'detail' && <ScreenDetail s={s} campaigns={campaigns} onGo={onGo} onSaved={reload} />}
            {s.screen === 'links' && <ScreenLinks links={links} onSaved={reload} />}
            {s.screen === 'builder' && <LaterScreen label="Content Builder" reason="Not built yet — this is next up, right after the Docket and Wick." />}
            {s.screen === 'present' && <LaterScreen label="Present mode" reason="Designed, but waits on Pipedrive's revenue data. Unlocks once that's connected." />}
            {s.screen === 'calendar' && <LaterScreen label="Calendar" reason="Designed, but waits on Pipedrive's revenue data. Unlocks once that's connected." />}
            {s.screen === 'connections' && <LaterScreen label="Connections" reason="Designed, but waits on Pipedrive's revenue data. Unlocks once that's connected." />}
            {s.screen === 'revenue' && <LaterScreen label="Revenue" reason="Designed, but waits on Pipedrive's revenue data. Unlocks once that's connected." />}
          </React.Fragment>
        )}
      </main>
      {!isPresent && (
        <button className="qa" onClick={() => openSheet('quickadd')}>
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M8 2v12M2 8h12" /></svg>
          Log a campaign
        </button>
      )}
      {s.sheet === 'quickadd' && <QuickAddSheet onClose={() => openSheet('')} onSaved={reload} />}
    </React.Fragment>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<CommandCenter />);
