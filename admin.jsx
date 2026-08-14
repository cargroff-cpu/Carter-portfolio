// admin.jsx — main CMS app. Mirrors the live site's content model and
// publishes to localStorage so Carter Portfolio.html picks up edits.

const { Field, Btn, SectionHead, SEED, SITE_KEY, card, labelStyle, isPdfData } = window.AdminPrimitives;
const { loadInitial, normalizeSite, Identity, About, Videos, Designs, Resume, Travels, JsonPreview, SIZE_TO_SPAN } = window.AdminSections;

// Must match data.jsx's CG_COPY_REV — Admin.html doesn't load data.jsx, so
// that global would otherwise be undefined here, making every publish look
// "stale" to the portfolio's merge logic and silently drop bio/tools.
window.CG_COPY_REV = 6;

const NAV = [
  ['identity', 'Identity'],
  ['about', 'About'],
  ['videos', 'Video Work'],
  ['designs', 'Design Work'],
  ['resume', 'Resume'],
  ['travels', 'Travels'],
  ['json', 'Data Preview'],
];
const SIZE_GRID = { small: [1, 1], wide: [2, 1], tall: [1, 2], large: [2, 2] };

// Derive a YouTube still so videos without an uploaded thumbnail still show a picture.
function ytThumb(url) {
  if (!url) return '';
  const m = String(url).match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/|shorts\/|live\/))([\w-]{11})/);
  return m ? `https://img.youtube.com/vi/${m[1]}/hqdefault.jpg` : '';
}

// ── Live preview (the real site, clickable) ─────────────────────────
function LivePreview({ d, selected, onSelect, onReorder }) {
  const sel = (type, id) => (e) => { e.stopPropagation(); onSelect(type, id); };
  const ring = (on) => ({ cursor: 'pointer', borderRadius: 4, outlineOffset: 3,
    outline: on ? '2px solid var(--amber)' : '2px solid transparent', transition: 'outline .15s' });
  // Drag-to-reorder by grabbing the actual preview tile. Source index lives in
  // a ref (synchronous) so the drop reads the right value; state drives visuals.
  const dragRef = useRef({ type: null, from: null });
  const [over, setOver] = useState({ type: null, i: null });
  const [dragging, setDragging] = useState({ type: null, i: null });
  const dndHandlers = (type, i) => ({
    draggable: true,
    onDragStart: (e) => { e.stopPropagation(); dragRef.current = { type, from: i }; setDragging({ type, i }); if (e.dataTransfer) e.dataTransfer.effectAllowed = 'move'; },
    onDragOver: (e) => { if (dragRef.current.type === type) { e.preventDefault(); setOver((o) => (o.type === type && o.i === i ? o : { type, i })); } },
    onDrop: (e) => { e.stopPropagation(); e.preventDefault(); const s = dragRef.current; if (s.type === type && s.from != null && s.from !== i) onReorder(type, s.from, i); dragRef.current = { type: null, from: null }; setOver({ type: null, i: null }); setDragging({ type: null, i: null }); },
    onDragEnd: () => { dragRef.current = { type: null, from: null }; setOver({ type: null, i: null }); setDragging({ type: null, i: null }); },
  });
  const dndStyle = (type, i) => ({
    cursor: 'grab',
    opacity: dragging.type === type && dragging.i === i ? 0.35 : 1,
    outline: over.type === type && over.i === i && !(dragging.type === type && dragging.i === i) ? '2px dashed var(--amber)' : undefined,
    transition: 'opacity .15s, outline .15s',
  });
  const isId = selected.type === 'identity';
  return (
    <div style={{ background: 'var(--bg)', color: 'var(--ink)', minHeight: '100%', fontFamily: 'var(--body-font)' }}>
      {/* HERO */}
      <div id="preview-identity" style={{ position: 'relative', padding: '52px 40px 40px',
        background: 'radial-gradient(ellipse at 68% 28%, rgba(217,154,61,0.16), transparent 55%), var(--bg)' }}>
        <div onClick={sel('identity', 'role')} style={{ ...ring(false), display: 'inline-block',
          fontFamily: 'var(--ui-font)', fontSize: 10, letterSpacing: '0.26em', textTransform: 'uppercase',
          color: 'var(--amber)', marginBottom: 18 }}>{d.role} · {d.location}</div>
        <h1 onClick={sel('identity', 'name')} style={{ ...ring(isId), margin: 0,
          fontFamily: 'var(--display-font)', fontWeight: 500, fontSize: 60, lineHeight: 0.9,
          letterSpacing: '-0.025em' }}>{d.name}<span style={{ color: 'var(--amber)' }}>.</span></h1>
        <p onClick={sel('identity', 'tagline')} style={{ ...ring(false), marginTop: 20, maxWidth: 460,
          fontFamily: 'var(--display-font)', fontStyle: 'italic', fontSize: 19, lineHeight: 1.35,
          color: 'var(--ink-soft)' }}>{d.tagline}</p>
      </div>

      {/* ABOUT */}
      <div id="preview-about" style={{ padding: '40px', borderTop: '1px solid var(--rule)', background: 'var(--bg-soft)' }}>
        <div style={{ fontFamily: 'var(--ui-font)', fontSize: 10, letterSpacing: '0.3em',
          textTransform: 'uppercase', color: 'var(--amber)', marginBottom: 14 }}>About</div>
        <div onClick={sel('about', null)} style={{ ...ring(selected.type === 'about'), maxWidth: 560 }}>
          {d.bio.map((p, i) => (
            <p key={i} style={{ margin: '0 0 14px', fontSize: 14.5, lineHeight: 1.7,
              color: 'var(--ink-soft)', textIndent: i === 0 ? 0 : '1.6em' }}>{p}</p>
          ))}
        </div>
        <div style={{ marginTop: 18, display: 'flex', gap: 40, fontFamily: 'var(--ui-font)', fontSize: 12 }}>
          <div><div style={{ color: 'var(--ink-mute)', textTransform: 'uppercase', letterSpacing: '0.16em', fontSize: 10 }}>Based</div>
            <div style={{ fontFamily: 'var(--display-font)', fontSize: 18, color: 'var(--ink)' }}>{d.location}</div></div>
          <div><div style={{ color: 'var(--ink-mute)', textTransform: 'uppercase', letterSpacing: '0.16em', fontSize: 10 }}>Since</div>
            <div style={{ fontFamily: 'var(--display-font)', fontSize: 18, color: 'var(--ink)' }}>{d.sinceYear}</div></div>
          <div><div style={{ color: 'var(--ink-mute)', textTransform: 'uppercase', letterSpacing: '0.16em', fontSize: 10 }}>Craft</div>
            <div style={{ fontFamily: 'var(--body-font)', fontStyle: 'italic', fontSize: 13, color: 'var(--ink-soft)' }}>{d.tools}</div></div>
        </div>
      </div>

      {/* VIDEO WORK */}
      <div id="preview-videos" style={{ padding: '40px', borderTop: '1px solid var(--rule)', background: 'var(--bg)' }}>
        <h2 style={{ margin: '0 0 22px', fontFamily: 'var(--display-font)', fontWeight: 500,
          fontSize: 32, letterSpacing: '-0.02em' }}>Video</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
          {d.videos.map((v, i) => {
            const tint = v.color || `linear-gradient(150deg, ${['#6a4a2c','#8a5a36','#c97a48','#5e6a4c','#d99a3d','#4a3a2a'][i % 6]} 0%, #15100a 100%)`;
            const effImg = v.image || ytThumb(v.url);
            const autoThumb = !v.image && !!effImg;
            return (
            <div key={v.id} onClick={sel('videos', v.id)} {...dndHandlers('videos', i)}
              style={{ ...ring(selected.type === 'videos' && selected.id === v.id), ...dndStyle('videos', i) }}>
              <div style={{ aspectRatio: '16/10', position: 'relative', overflow: 'hidden', borderRadius: 4,
                border: '1px solid var(--card-edge)', background: tint }}>
                {effImg && <img src={effImg} alt="" draggable={false} style={{ position: 'absolute', inset: 0,
                  width: '100%', height: '100%', objectFit: 'cover' }} />}
                {autoThumb && <div style={{ position: 'absolute', inset: 0, background: tint,
                  mixBlendMode: 'color', opacity: 0.82 }} />}
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, transparent 55%, rgba(8,5,2,0.7))' }} />
                <div style={{ position: 'absolute', top: 8, left: 9, fontFamily: 'var(--display-font)',
                  fontStyle: 'italic', fontSize: 11, color: 'var(--amber)' }}>No. {String(i + 1).padStart(2, '0')}</div>
                <div style={{ position: 'absolute', top: 8, right: 9, fontFamily: 'var(--ui-font)',
                  fontSize: 9, letterSpacing: '0.12em', color: 'var(--ink-soft)' }}>{v.length}</div>
              </div>
              <div style={{ marginTop: 8 }}>
                <div style={{ fontFamily: 'var(--ui-font)', fontSize: 9, letterSpacing: '0.18em',
                  textTransform: 'uppercase', color: 'var(--amber)' }}>{v.kind} · {v.year}</div>
                <div style={{ fontFamily: 'var(--display-font)', fontSize: 17, color: 'var(--ink)' }}>{v.title}</div>
              </div>
            </div>
            );
          })}
        </div>
      </div>

      {/* DESIGN WORK */}
      <div id="preview-designs" style={{ padding: '40px', borderTop: '1px solid var(--rule)', background: 'var(--bg-soft)' }}>
        <h2 style={{ margin: '0 0 22px', fontFamily: 'var(--display-font)', fontWeight: 500,
          fontSize: 32, letterSpacing: '-0.02em' }}>Design Work</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gridAutoRows: 96, gap: 12 }}>
          {d.designs.map((g, i) => {
            const [c, r] = SIZE_GRID[g.size] || [1, 1];
            return (
              <div key={g.id} onClick={sel('designs', g.id)} {...dndHandlers('designs', i)}
                style={{ ...ring(selected.type === 'designs' && selected.id === g.id), ...dndStyle('designs', i),
                  gridColumn: `span ${c}`, gridRow: `span ${r}`, position: 'relative', overflow: 'hidden',
                  border: '1px solid var(--card-edge)',
                  background: g.color || `linear-gradient(150deg, ${['#6a4a2c','#8a5a36','#c97a48','#5e6a4c','#d99a3d','#4a3a2a','#936a44','#6a4438','#8e9462'][i % 9]} 0%, #15100a 100%)` }}>
                {(() => {
                  const disp = (g.image && !isPdfData(g.image)) ? g.image : (g.thumb || '');
                  const pdfOnly = (g.pdf || isPdfData(g.image)) && !disp;
                  return <>
                    {disp && <img src={disp} alt="" draggable={false} style={{ position: 'absolute', inset: 0,
                      width: '100%', height: '100%', objectFit: 'cover' }} />}
                    {pdfOnly && <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
                      alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="var(--ink)" strokeWidth="1.4">
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6" />
                        </svg>
                      </div>}
                    {disp && g.color && <div style={{ position: 'absolute', inset: 0, background: g.color,
                      mixBlendMode: 'color', opacity: 0.7 }} />}
                  </>;
                })()}
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, transparent 50%, rgba(8,5,2,0.72))' }} />
                <div style={{ position: 'absolute', left: 10, right: 10, bottom: 8, color: 'var(--ink)' }}>
                  <div style={{ fontFamily: 'var(--ui-font)', fontSize: 8, letterSpacing: '0.16em',
                    textTransform: 'uppercase', color: 'var(--amber)' }}>{g.kind}</div>
                  <div style={{ fontFamily: 'var(--display-font)', fontSize: c >= 2 ? 19 : 14, lineHeight: 1.1 }}>{g.title}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* RESUME */}
      <div id="preview-resume" style={{ padding: '40px', borderTop: '1px solid var(--rule)', background: 'var(--bg-deep)' }}>
        <h2 style={{ margin: '0 0 24px', fontFamily: 'var(--display-font)', fontWeight: 500,
          fontSize: 30, letterSpacing: '-0.02em', textAlign: 'center' }}>Where I&rsquo;ve been.</h2>
        <div style={{ maxWidth: 560, margin: '0 auto' }}>
          {d.resume.map((r, i) => (
            <div key={r.id} onClick={sel('resume', r.id)}
              style={{ ...ring(selected.type === 'resume' && selected.id === r.id), padding: '14px 12px',
                borderBottom: i < d.resume.length - 1 ? '1px solid var(--rule)' : 'none' }}>
              <div style={{ fontFamily: 'var(--ui-font)', fontSize: 10, letterSpacing: '0.16em',
                textTransform: 'uppercase', color: 'var(--amber)' }}>{r.dates} · {r.city}</div>
              <div style={{ fontFamily: 'var(--display-font)', fontSize: 22, color: 'var(--ink)', marginTop: 4 }}>{r.role}</div>
              <div style={{ fontFamily: 'var(--display-font)', fontStyle: 'italic', fontSize: 14,
                color: 'var(--ink-soft)' }}>{r.company}</div>
            </div>
          ))}
        </div>
      </div>

      {/* TRAVELS */}
      <div id="preview-travels" style={{ padding: '40px', borderTop: '1px solid var(--rule)', background: 'var(--bg)' }}>
        <div style={{ fontFamily: 'var(--ui-font)', fontSize: 10, letterSpacing: '0.3em',
          textTransform: 'uppercase', color: 'var(--amber)', marginBottom: 14, textAlign: 'center' }}>Explore My Travels</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, maxWidth: 560, margin: '0 auto' }}>
          {(d.travels || []).map((t) => (
            <div key={t.id} onClick={sel('travels', t.id)}
              style={{ ...ring(selected.type === 'travels' && selected.id === t.id), display: 'flex', gap: 12,
                padding: 12, border: '1px solid var(--card-edge)', background: 'var(--card)' }}>
              <div style={{ flexShrink: 0, width: 54, height: 54, position: 'relative', overflow: 'hidden', borderRadius: 3,
                border: '1px solid var(--card-edge)', background: 'var(--bg-deep)',
                display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {t.image
                  ? <img src={t.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover',
                      filter: 'sepia(0.42) saturate(0.8) contrast(1.06) brightness(0.9)' }} />
                  : <span style={{ color: 'var(--amber)', fontSize: 16 }}>◆</span>}
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontFamily: 'var(--ui-font)', fontSize: 9, letterSpacing: '0.16em',
                  textTransform: 'uppercase', color: 'var(--ink-mute)' }}>{t.year}</div>
                <div style={{ fontFamily: 'var(--display-font)', fontSize: 18, color: 'var(--amber)' }}>{t.name}</div>
                <div style={{ fontFamily: 'var(--body-font)', fontSize: 11.5, lineHeight: 1.4,
                  color: 'var(--ink-soft)', overflow: 'hidden', textOverflow: 'ellipsis',
                  display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{t.blurb}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CONTACT */}
      <div style={{ padding: '48px 40px', borderTop: '1px solid var(--rule)', background: 'var(--bg)', textAlign: 'center' }}>
        <h2 style={{ margin: 0, fontFamily: 'var(--display-font)', fontWeight: 500, fontSize: 34,
          letterSpacing: '-0.02em' }}>Write me a letter.</h2>
        <p onClick={sel('identity', 'closing')} style={{ ...ring(false), display: 'inline-block', marginTop: 14,
          fontFamily: 'var(--display-font)', fontStyle: 'italic', fontSize: 16, color: 'var(--ink-soft)' }}>
          &ldquo;{d.closing}&rdquo;</p>
        <div onClick={sel('identity', 'email')} style={{ ...ring(false), display: 'block', marginTop: 12,
          fontFamily: 'var(--ui-font)', fontSize: 12, letterSpacing: '0.14em', color: 'var(--amber)' }}>{d.email}</div>
      </div>
    </div>
  );
}

// ── App shell ───────────────────────────────────────────────────────
function App() {
  const [d, setD] = useState(loadInitial);
  const [active, setActive] = useState('identity');
  const [saved, setSaved] = useState(false);
  const [saveErr, setSaveErr] = useState('');
  const [autoSaved, setAutoSaved] = useState(false);
  const [selected, setSelected] = useState({ type: null, id: null });
  const hydrated = useRef(false);   // guards autosave until storage has loaded
  const saveTimer = useRef(null);

  const f = (k) => (v) => setD((prev) => ({ ...prev, [k]: v }));

  // Build the site-shaped payload the portfolio reads.
  const buildPayload = (data) => ({
    name: data.name, role: data.role, location: data.location, email: data.email,
    sinceYear: data.sinceYear, tools: data.tools, tagline: data.tagline, closing: data.closing,
    copyRev: window.CG_COPY_REV,
    socials: data.socials,
    bio: data.bio,
    videos: data.videos.map(({ id, ...rest }) => rest),
    designs: data.designs.map((g) => ({ title: g.title, kind: g.kind, desc: g.desc || '', span: SIZE_TO_SPAN[g.size] || [1, 1], color: g.color || '', image: g.image || '', pdf: g.pdf || '', thumb: g.thumb || '' })),
    resume: data.resume.map(({ id, ...rest }) => rest),
    travels: (data.travels || []).map(({ id, ...rest }) => rest),
  });

  // ── Hydrate from IndexedDB (falls back to localStorage) on mount ──
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const o = window.CGStore && window.CGStore.loadSite ? await window.CGStore.loadSite() : null;
        if (alive && o) setD(normalizeSite(o));
      } catch (e) { /* keep defaults */ }
      // allow autosave only after we've attempted to load existing data
      hydrated.current = true;
    })();
    return () => { alive = false; };
  }, []);

  // ── Autosave every change (debounced) so nothing is ever lost ──
  useEffect(() => {
    if (!hydrated.current) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      try {
        await window.CGStore.saveSite(buildPayload(d));
        setSaveErr('');
        setAutoSaved(true); setTimeout(() => setAutoSaved(false), 1400);
      } catch (e) {
        setSaveErr('Could not save automatically — try the Save button.');
      }
    }, 600);
    return () => { if (saveTimer.current) clearTimeout(saveTimer.current); };
  }, [d]);

  // Reorder a section's items (driven by dragging the preview tiles).
  const reorder = (type, from, to) => setD((prev) => {
    if (from == null || to == null || from === to) return prev;
    const arr = [...prev[type]];
    const [m] = arr.splice(from, 1);
    arr.splice(to, 0, m);
    return { ...prev, [type]: arr };
  });

  // Publish now (explicit): keep the local draft in sync, then push the
  // same payload to Supabase (via the password-gated /api/save-content
  // endpoint) so it shows up on the live site for every visitor.
  const save = async () => {
    try {
      const payload = buildPayload(d);
      await window.CGStore.saveSite(payload);
      const res = await fetch('/api/save-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('publish failed');
      setSaveErr('');
      setSaved(true); setTimeout(() => setSaved(false), 1800);
    } catch (e) {
      setSaveErr('Could not publish to the live site — your draft is saved locally; try again.');
    }
  };

  const jump = (id) => {
    setActive(id);
    const el = document.getElementById('sec-' + id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    // also scroll the live-preview pane to the matching section
    const pv = document.getElementById('preview-' + id);
    if (pv) {
      const scrollable = (e) => { const o = getComputedStyle(e).overflowY; return (o === 'auto' || o === 'scroll') && e.scrollHeight > e.clientHeight + 2; };
      let pane = pv.parentElement;
      while (pane && !scrollable(pane)) pane = pane.parentElement;
      if (pane) {
        const top = pane.scrollTop + (pv.getBoundingClientRect().top - pane.getBoundingClientRect().top) - 8;
        pane.scrollTop = top;
      }
    }
  };
  const selectFromPreview = (type, id) => {
    setSelected({ type, id });
    setActive(type);
    setTimeout(() => {
      const map = { videos: 'video', designs: 'design', resume: 'resume', travels: 'travel' };
      const anchor = (type === 'identity' || type === 'about')
        ? document.getElementById('sec-' + type)
        : document.getElementById(`edit-${map[type]}-${id}`);
      if (anchor) anchor.scrollIntoView({ behavior: 'smooth', block: type === 'identity' || type === 'about' ? 'start' : 'center' });
    }, 30);
  };
  const selId = (t) => (selected.type === t ? selected.id : null);
  const onSelEdit = (t) => (id) => setSelected({ type: t, id });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <style>{`
        @media (max-width: 900px) {
          .admin-topbar { flex-wrap: wrap; padding: 12px 16px !important; gap: 10px 16px; }
          .admin-split { flex-direction: column !important; }
          .admin-editor { width: 100% !important; border-right: none !important;
            border-bottom: 1px solid var(--rule); flex: none !important; max-height: 65vh; }
          .admin-preview { flex: none !important; min-height: 480px; }
        }
      `}</style>
      {/* top bar */}
      <div className="admin-topbar" style={{ flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 28px', background: 'rgba(13,9,5,0.92)', backdropFilter: 'blur(10px)',
        borderBottom: '1px solid var(--rule)', zIndex: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 32, height: 32, border: '1px solid var(--ink-dim)', display: 'flex',
            alignItems: 'center', justifyContent: 'center' }}>
            <img src="assets/logo.png" alt="Carter Groff" style={{ width: '76%', height: '76%', objectFit: 'contain' }} />
          </div>
          <div style={{ fontFamily: 'var(--ui-font)', fontSize: 11, letterSpacing: '0.24em',
            textTransform: 'uppercase', color: 'var(--ink-mute)' }}>Parlor Portfolio · Admin</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          {saveErr
            ? <span style={{ fontFamily: 'var(--body-font)', fontStyle: 'italic', fontSize: 12.5,
                color: 'var(--terracotta)', maxWidth: 320, textAlign: 'right' }}>{saveErr}</span>
            : <span style={{ fontFamily: 'var(--ui-font)', fontSize: 11, letterSpacing: '0.06em',
                color: autoSaved ? 'var(--sage)' : 'var(--ink-mute)', transition: 'color .2s' }}>
                {autoSaved ? '✓ Saved' : 'Autosaves as you type'}</span>}
          <Btn variant="solid" onClick={save} style={{ padding: '11px 26px' }}>{saved ? '✓ Published' : 'Save / Publish'}</Btn>
        </div>
      </div>

      {/* split */}
      <div className="admin-split" style={{ flex: 1, display: 'flex', minHeight: 0 }}>
        {/* editor */}
        <div className="admin-editor" style={{ width: 580, flexShrink: 0, display: 'flex', flexDirection: 'column',
          borderRight: '1px solid var(--rule)', minHeight: 0 }}>
          <div style={{ flexShrink: 0, display: 'flex', gap: 3, padding: '12px 22px', flexWrap: 'wrap',
            borderBottom: '1px solid var(--rule)', background: 'var(--bg-deep)' }}>
            {NAV.map(([id, label]) => (
              <button key={id} onClick={() => jump(id)}
                style={{ padding: '7px 12px', borderRadius: 4, cursor: 'pointer', fontFamily: 'var(--ui-font)',
                  fontSize: 12, letterSpacing: '0.03em',
                  background: active === id ? 'rgba(245,205,106,0.12)' : 'transparent',
                  color: active === id ? 'var(--amber)' : 'var(--ink-soft)',
                  border: '1px solid ' + (active === id ? 'rgba(245,205,106,0.25)' : 'transparent'),
                  fontWeight: active === id ? 600 : 500, transition: 'all .15s' }}>{label}</button>
            ))}
          </div>
          <div style={{ flex: 1, overflowY: 'auto', padding: '30px 26px 80px' }}>
            <section id="sec-identity" style={{ marginBottom: 46 }}><Identity d={d} set={setD} /></section>
            <section id="sec-about" style={{ marginBottom: 46 }}><About bio={d.bio} setBio={f('bio')} /></section>
            <section id="sec-videos" style={{ marginBottom: 46 }}>
              <Videos items={d.videos} setItems={f('videos')} selectedId={selId('videos')} onSelect={onSelEdit('videos')} /></section>
            <section id="sec-designs" style={{ marginBottom: 46 }}>
              <Designs items={d.designs} setItems={f('designs')} selectedId={selId('designs')} onSelect={onSelEdit('designs')} /></section>
            <section id="sec-resume" style={{ marginBottom: 46 }}>
              <Resume items={d.resume} setItems={f('resume')} selectedId={selId('resume')} onSelect={onSelEdit('resume')} /></section>
            <section id="sec-travels" style={{ marginBottom: 46 }}>
              <Travels items={d.travels || []} setItems={f('travels')} selectedId={selId('travels')} onSelect={onSelEdit('travels')} /></section>
            <JsonPreview data={d} />
          </div>
        </div>

        {/* live preview */}
        <div className="admin-preview" style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', background: 'var(--bg-deep)' }}>
          <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '12px 24px', borderBottom: '1px solid var(--rule)' }}>
            <span style={{ fontFamily: 'var(--ui-font)', fontSize: 11, letterSpacing: '0.2em',
              textTransform: 'uppercase', color: 'var(--ink-mute)' }}>Live preview</span>
            <span style={{ fontFamily: 'var(--body-font)', fontStyle: 'italic', fontSize: 12,
              color: 'var(--ink-dim)' }}>click any element to edit it</span>
          </div>
          <div onClick={() => setSelected({ type: null, id: null })} style={{ flex: 1, overflowY: 'auto' }}>
            <LivePreview d={d} selected={selected} onSelect={selectFromPreview} onReorder={reorder} />
          </div>
        </div>
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
