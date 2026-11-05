// scaffold-admin.jsx — the Backroom's editor for scaffold.cargroff.com.
// Edits the page's copy and lists (hero, services, prices, How it works,
// About you, Questions, Kind words), keeps a draft in this browser as you
// type, and publishes to Supabase (site_content row 2) through the
// password-gated /api/save-content?page=scaffold. The public page reads that
// row at load (applyScaffoldContent in design.jsx) and falls back to its own
// defaults, which reach this editor as window.SCAFFOLD_DEFAULTS
// (scaffold-defaults.js, generated from design.jsx by npm run build:design).

const { useState, useEffect, useRef } = React;
const { Field, Btn, SectionHead, card, labelStyle } = window.AdminPrimitives;

const DEF = window.SCAFFOLD_DEFAULTS;
const DESIGN_NEEDS = DEF.designNeeds;
const TOOL_NEEDS = DEF.toolNeeds;
const DRAFT_KEY = 'cg_scaffold_draft';
const SB_URL = 'https://rodxrkzwpsgeeatmbwku.supabase.co';
const SB_KEY = 'sb_publishable_fWE-gd3uSKDe0BpUK5WSxQ_f3Uzgd0x';
const LIVE_URL = 'https://scaffold.cargroff.com/';

const blank = () => JSON.parse(JSON.stringify({
  headline: DEF.headline, deck: DEF.deck, showPrices: DEF.showPrices,
  whyHead: DEF.whyHead, whyIntro: DEF.whyIntro, rules: DEF.rules,
  design: DEF.design, tools: DEF.tools, how: DEF.how, faq: DEF.faq, testimonials: DEF.testimonials,
}));
// Fit saved content (the live row or a draft kept in this browser) to the
// shape of the defaults, so a missing or wrong-typed field falls back instead
// of crashing the editor into a blank page.
const clone = (x) => JSON.parse(JSON.stringify(x));
const fit = (v, d) => {
  if (Array.isArray(d)) {
    if (!Array.isArray(v)) return clone(d);
    const t = d[0];
    return v.map((x) => (t !== null && typeof t === 'object' ? fit(x, t) : (typeof x === typeof t ? x : (t === undefined ? x : t))));
  }
  if (d !== null && typeof d === 'object') {
    if (v === null || typeof v !== 'object' || Array.isArray(v)) return clone(d);
    const out = { ...v };
    Object.keys(d).forEach((k) => { out[k] = fit(v[k], d[k]); });
    return out;
  }
  return typeof v === typeof d ? v : d;
};
const normalize = (o) => fit(o, blank());
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const readDraft = () => { try { const s = localStorage.getItem(DRAFT_KEY); return s ? normalize(JSON.parse(s)) : null; } catch (e) { return null; } };
const writeDraft = (d) => { try { localStorage.setItem(DRAFT_KEY, JSON.stringify(d)); } catch (e) {} };
const clearDraft = () => { try { localStorage.removeItem(DRAFT_KEY); } catch (e) {} };

const selectStyle = {
  width: '100%', background: 'var(--bg-deep)', color: 'var(--ink)', border: '1px solid var(--card-edge)',
  borderRadius: 3, padding: '11px 13px', fontFamily: 'var(--body-font)', fontSize: 15,
};
function Select({ label, value, options, onChange }) {
  return (
    <label style={{ display: 'block', marginBottom: 18 }}>
      <span style={labelStyle}>{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)} style={selectStyle}>
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </label>
  );
}
const hint = { fontFamily: 'var(--body-font)', fontStyle: 'italic', fontSize: 14, color: 'var(--ink-mute)', margin: '-6px 0 18px', lineHeight: 1.5 };

// A list of cards with move up, move down and remove, and an add button.
function ListEditor({ items, onChange, render, make, addLabel, max = 20, min = 0 }) {
  const set = (i, v) => onChange(items.map((x, j) => (j === i ? v : x)));
  const move = (i, d) => { const a = [...items]; const [m] = a.splice(i, 1); a.splice(i + d, 0, m); onChange(a); };
  const remove = (i) => onChange(items.filter((_, j) => j !== i));
  return (
    <div>
      {items.map((it, i) => (
        <div key={i} style={{ ...card, padding: 18, marginBottom: 14 }}>
          {render(it, (v) => set(i, v), i)}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <Btn onClick={() => move(i, -1)} style={{ opacity: i === 0 ? .4 : 1, pointerEvents: i === 0 ? 'none' : 'auto' }}>Move up</Btn>
            <Btn onClick={() => move(i, 1)} style={{ opacity: i === items.length - 1 ? .4 : 1, pointerEvents: i === items.length - 1 ? 'none' : 'auto' }}>Move down</Btn>
            {items.length > min && <Btn variant="danger" onClick={() => remove(i)}>Remove</Btn>}
          </div>
        </div>
      ))}
      {items.length < max && <Btn onClick={() => onChange([...items, make()])}>{addLabel}</Btn>}
    </div>
  );
}

const NAV = [['hero', 'Hero'], ['services', 'Services and prices'], ['how', 'How it works'], ['about', 'About you'], ['faq', 'Questions'], ['words', 'Kind words']];

function App() {
  const [draft, setDraft] = useState(() => readDraft() || blank());
  const [published, setPublished] = useState(null);
  const [state, setState] = useState('loading'); // loading | ready | publishing
  const [msg, setMsg] = useState('');
  const loaded = useRef(false);

  // Load what is live now. A draft kept in this browser wins until it is
  // published or discarded.
  useEffect(() => {
    fetch(SB_URL + '/rest/v1/site_content?select=data&id=eq.2', { headers: { apikey: SB_KEY } })
      .then((r) => (r.ok ? r.json() : []))
      .then((rows) => {
        const live = normalize(rows && rows[0] ? rows[0].data : null);
        setPublished(live);
        if (!readDraft()) setDraft(live);
      })
      .catch(() => { setPublished(blank()); setMsg('Could not read the live content, so these are the page defaults.'); })
      .finally(() => { loaded.current = true; setState('ready'); });
  }, []);
  useEffect(() => { if (loaded.current) writeDraft(draft); }, [draft]);

  const f = (k) => (v) => setDraft((d) => ({ ...d, [k]: v }));
  const dirty = published && !same(draft, published);
  const howOk = draft.how.length === 4 && draft.how.every((h) => h.title.trim() && h.text.trim());

  const publish = async () => {
    setState('publishing'); setMsg('');
    try {
      const res = await fetch('/api/save-content?page=scaffold', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(draft) });
      if (res.status === 401) throw new Error('signed-out');
      if (!res.ok) throw new Error('failed');
      setPublished(draft); clearDraft();
      setMsg('Published. The live page shows it on its next load.');
    } catch (e) {
      setMsg(e.message === 'signed-out' ? 'You have been signed out. Reload the page, sign in, then publish again; your draft is kept.' : 'Could not publish just now. Your draft is kept in this browser; try again.');
    }
    setState('ready');
  };
  const discard = () => { if (published && confirm('Discard your unpublished changes?')) { setDraft(published); clearDraft(); setMsg(''); } };
  const defaults = () => { if (confirm('Load the page’s original copy into the editor? Nothing goes live until you publish.')) setDraft(blank()); };
  const [active, setActive] = useState('hero');
  const [frameKey, setFrameKey] = useState(0);
  const jump = (id) => { setActive(id); const el = document.getElementById('sc-' + id); if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' }); };

  const status = state === 'loading' ? 'Loading…' : state === 'publishing' ? 'Publishing…' : dirty ? 'Unpublished changes · draft kept in this browser' : 'Everything is live';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <style>{`
        @media (max-width: 900px) {
          .admin-topbar { flex-wrap: wrap; padding: 12px 16px !important; gap: 10px 16px; }
          .admin-split { flex-direction: column !important; }
          .admin-editor { width: 100% !important; border-right: none !important; border-bottom: 1px solid var(--rule); flex: 1 1 auto !important; }
          .admin-preview { display: none !important; }
        }
      `}</style>
      <div className="admin-topbar" style={{ flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 28px', background: 'rgba(13,9,5,0.92)', backdropFilter: 'blur(10px)', borderBottom: '1px solid var(--rule)', zIndex: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <a href="/backroom" style={{ display: 'inline-flex', alignItems: 'center', gap: 7, color: 'var(--ink-soft)', textDecoration: 'none', fontFamily: 'var(--ui-font)', fontSize: 12, letterSpacing: '0.14em', textTransform: 'uppercase', padding: '10px 16px 10px 0', marginRight: 4, borderRight: '1px solid var(--rule)', whiteSpace: 'nowrap' }}><span aria-hidden="true" style={{ fontSize: 16 }}>←</span> Backroom</a>
        <a href="/backroom" style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none' }}>
          <div style={{ width: 32, height: 32, border: '1px solid var(--ink-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <img src="/assets/logo.png" alt="Carter Groff" style={{ width: '76%', height: '76%', objectFit: 'contain' }} />
          </div>
          <div style={{ fontFamily: 'var(--ui-font)', fontSize: 11, letterSpacing: '0.24em', textTransform: 'uppercase', color: 'var(--ink-mute)' }}>The Backroom · Scaffold</div>
        </a>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span role="status" style={{ fontFamily: 'var(--ui-font)', fontSize: 11, letterSpacing: '0.06em', color: dirty ? 'var(--amber)' : 'var(--ink-mute)' }}>{status}</span>
          {dirty && <Btn onClick={discard}>Discard</Btn>}
          <Btn variant="solid" onClick={async () => { await publish(); setFrameKey((k) => k + 1); }} style={{ padding: '11px 26px', ...(!dirty || !howOk || state !== 'ready' ? { opacity: .5, pointerEvents: 'none' } : null) }}>Save / Publish</Btn>
        </div>
      </div>
      {msg && <p role="alert" style={{ flexShrink: 0, margin: 0, padding: '10px 28px', fontFamily: 'var(--body-font)', fontStyle: 'italic', fontSize: 13, color: 'var(--ink-soft)', borderBottom: '1px solid var(--rule)' }}>{msg}</p>}

      <div className="admin-split" style={{ flex: 1, display: 'flex', minHeight: 0 }}>
        <div className="admin-editor" style={{ width: 580, flexShrink: 0, display: 'flex', flexDirection: 'column', borderRight: '1px solid var(--rule)', minHeight: 0 }}>
          <div style={{ flexShrink: 0, display: 'flex', gap: 3, padding: '12px 22px', flexWrap: 'wrap', borderBottom: '1px solid var(--rule)', background: 'var(--bg-deep)' }}>
            {NAV.map(([id, label]) => (
              <button key={id} onClick={() => jump(id)}
                style={{ padding: '7px 12px', borderRadius: 4, cursor: 'pointer', fontFamily: 'var(--ui-font)', fontSize: 12, letterSpacing: '0.03em',
                  background: active === id ? 'rgba(245,205,106,0.12)' : 'transparent',
                  color: active === id ? 'var(--amber)' : 'var(--ink-soft)',
                  border: '1px solid ' + (active === id ? 'rgba(245,205,106,0.25)' : 'transparent'),
                  fontWeight: active === id ? 600 : 500, transition: 'all .15s' }}>{label}</button>
            ))}
            <button onClick={defaults} style={{ marginLeft: 'auto', padding: '7px 12px', background: 'none', border: '1px solid transparent', cursor: 'pointer', color: 'var(--ink-mute)', fontFamily: 'var(--ui-font)', fontSize: 12 }}>Reset to defaults</button>
          </div>
          <div style={{ flex: 1, overflowY: 'auto', padding: '30px 26px 80px' }}>
        <main>
          <section id="sc-hero" style={{ marginBottom: 56 }}>
            <SectionHead kicker="First screen" title="Hero" />
            <div style={card}>
              <Field label="Headline" value={draft.headline} onChange={f('headline')} />
              <Field label="Line under the headline" value={draft.deck} onChange={f('deck')} textarea />
            </div>
          </section>

          <section id="sc-services" style={{ marginBottom: 56 }}>
            <SectionHead kicker="What I make" title="Services and prices" />
            <div style={{ ...card, marginBottom: 20 }}>
              <label style={{ display: 'flex', gap: 12, alignItems: 'center', fontSize: 16, color: 'var(--ink)', cursor: 'pointer' }}>
                <input type="checkbox" checked={draft.showPrices} onChange={(e) => f('showPrices')(e.target.checked)} style={{ width: 18, height: 18, accentColor: 'var(--amber-deep)' }} />
                Show prices on the page
              </label>
              <p style={{ ...hint, margin: '10px 0 0' }}>Off, each design row shows only its turnaround. On, rows with a price show it too.</p>
            </div>
            <h3 style={{ fontFamily: 'var(--display-font)', fontSize: 26, fontWeight: 500, margin: '8px 0 12px' }}>Design</h3>
            <p style={hint}>Clicking a row opens the brief with its brief option ticked. Keep six a side so the two columns stay level.</p>
            <ListEditor items={draft.design} onChange={f('design')} addLabel="Add a design service" max={10} min={1}
              make={() => ({ title: '', sub: '', need: 'Something else', from: '', turn: 'Quoted' })}
              render={(s, set) => (
                <React.Fragment>
                  <Field label="Name" value={s.title} onChange={(v) => set({ ...s, title: v })} />
                  <Field label="Small note beside the name (optional)" value={s.sub} onChange={(v) => set({ ...s, sub: v })} placeholder="Leave empty for none" />
                  <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)', gap: 14 }}>
                    <Field label="Turnaround" value={s.turn} onChange={(v) => set({ ...s, turn: v })} placeholder="2 business days, or Quoted" />
                    <Field label="Price from (optional)" value={s.from} onChange={(v) => set({ ...s, from: v })} placeholder="$150" />
                  </div>
                  <Select label="Brief option it opens" value={s.need} options={DESIGN_NEEDS} onChange={(v) => set({ ...s, need: v })} />
                </React.Fragment>
              )} />
            <h3 style={{ fontFamily: 'var(--display-font)', fontSize: 26, fontWeight: 500, margin: '36px 0 12px' }}>Tools</h3>
            <p style={hint}>Tools are quoted after a brief, so they carry no price or turnaround.</p>
            <ListEditor items={draft.tools} onChange={f('tools')} addLabel="Add a tool" max={10} min={1}
              make={() => ({ title: '', need: 'Something else' })}
              render={(t, set) => (
                <React.Fragment>
                  <Field label="Name" value={t.title} onChange={(v) => set({ ...t, title: v })} />
                  <Select label="Brief option it opens" value={t.need} options={TOOL_NEEDS} onChange={(v) => set({ ...t, need: v })} />
                </React.Fragment>
              )} />
          </section>

          <section id="sc-how" style={{ marginBottom: 56 }}>
            <SectionHead kicker="The dial" title="How it works" />
            <p style={hint}>The dial has four stops, so there are always four steps. Each needs a name and a line.</p>
            {draft.how.map((h, i) => (
              <div key={i} style={{ ...card, padding: 18, marginBottom: 14 }}>
                <Field label={'Step ' + (i + 1)} value={h.title} onChange={(v) => f('how')(draft.how.map((x, j) => (j === i ? { ...x, title: v } : x)))} />
                <Field label="What happens" value={h.text} onChange={(v) => f('how')(draft.how.map((x, j) => (j === i ? { ...x, text: v } : x)))} textarea />
              </div>
            ))}
            {!howOk && <p style={{ ...hint, color: 'var(--terracotta)' }}>Fill in all four steps to publish.</p>}
          </section>

          <section id="sc-about" style={{ marginBottom: 56 }}>
            <SectionHead kicker="Who" title="About you" />
            <div style={{ ...card, marginBottom: 14 }}>
              <Field label="Heading" value={draft.whyHead} onChange={f('whyHead')} />
              <Field label="Intro" value={draft.whyIntro} onChange={f('whyIntro')} textarea />
            </div>
            <h3 style={{ fontFamily: 'var(--display-font)', fontSize: 26, fontWeight: 500, margin: '8px 0 12px' }}>My rules</h3>
            <ListEditor items={draft.rules} onChange={f('rules')} addLabel="Add a rule" max={6}
              make={() => ''} render={(r, set, i) => <Field label={'Rule ' + (i + 1)} value={r} onChange={set} />} />
          </section>

          <section id="sc-faq" style={{ marginBottom: 56 }}>
            <SectionHead kicker="Short answers" title="Questions" />
            <ListEditor items={draft.faq} onChange={f('faq')} addLabel="Add a question" max={16}
              make={() => ({ q: '', a: '' })}
              render={(x, set) => (
                <React.Fragment>
                  <Field label="Question" value={x.q} onChange={(v) => set({ ...x, q: v })} />
                  <Field label="Answer" value={x.a} onChange={(v) => set({ ...x, a: v })} textarea />
                </React.Fragment>
              )} />
          </section>

          <section id="sc-words" style={{ marginBottom: 56 }}>
            <SectionHead kicker="Real clients only" title="Kind words" />
            <p style={hint}>Short quotes from real clients, with their name. The section stays hidden while this list is empty.</p>
            <ListEditor items={draft.testimonials} onChange={f('testimonials')} addLabel="Add a quote" max={6}
              make={() => ({ quote: '', name: '', business: '' })}
              render={(t, set) => (
                <React.Fragment>
                  <Field label="Quote" value={t.quote} onChange={(v) => set({ ...t, quote: v })} textarea />
                  <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)', gap: 14 }}>
                    <Field label="Name" value={t.name} onChange={(v) => set({ ...t, name: v })} />
                    <Field label="Business (optional)" value={t.business} onChange={(v) => set({ ...t, business: v })} />
                  </div>
                </React.Fragment>
              )} />
          </section>
        </main>
          </div>
        </div>

        <div className="admin-preview" style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', background: 'var(--bg-deep)' }}>
          <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 24px', borderBottom: '1px solid var(--rule)' }}>
            <span style={{ fontFamily: 'var(--ui-font)', fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--ink-mute)' }}>Live page</span>
            <span style={{ fontFamily: 'var(--body-font)', fontStyle: 'italic', fontSize: 12, color: 'var(--ink-dim)' }}>refreshes when you publish · <a href={LIVE_URL} target="_blank" rel="noopener" style={{ color: 'var(--ink-soft)' }}>open</a></span>
          </div>
          <iframe key={frameKey} title="The live Scaffold page" src="/design" style={{ flex: 1, width: '100%', border: 0, background: '#fff' }} />
        </div>
      </div>
    </div>
  );
}

// If anything still throws, say so on the page instead of leaving it blank.
class Boundary extends React.Component {
  constructor(p) { super(p); this.state = { err: null }; }
  static getDerivedStateFromError(err) { return { err }; }
  render() {
    if (!this.state.err) return this.props.children;
    const reset = () => { clearDraft(); location.reload(); };
    return (
      <div style={{ maxWidth: 560, margin: '80px auto', padding: '0 20px', color: 'var(--ink)', fontFamily: 'var(--body-font)' }}>
        <h1 style={{ fontFamily: 'var(--display-font)', fontWeight: 500 }}>The editor hit a snag</h1>
        <p style={{ color: 'var(--ink-soft)' }}>{String(this.state.err && this.state.err.message || this.state.err)}</p>
        <Btn variant="solid" onClick={reset}>Clear my draft and reload</Btn>
      </div>
    );
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(<Boundary><App /></Boundary>);
