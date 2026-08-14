// admin.jsx — Parlor CMS mirroring the live site's CG_DATA, with two-way
// localStorage sync so edits drive Carter Portfolio.html.

const { Field, Btn, SectionHead, ImageUpload, AssetField, ColorPicker, SEED, SIZES, sizeFromSpan, SITE_KEY, uid, card, labelStyle, DEFAULT_SECTION_ORDER, SECTION_LABELS } = window.AdminPrimitives;

// span <-> size helpers (site stores designs as span:[c,r])
const SIZE_TO_SPAN = { small: [1, 1], wide: [2, 1], tall: [1, 2], large: [2, 2] };

// Derive a YouTube still so a video with a URL but no uploaded image shows a picture.
const ytThumb = (url) => {
  if (!url) return '';
  const m = String(url).match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/|shorts\/|live\/))([\w-]{11})/);
  return m ? `https://img.youtube.com/vi/${m[1]}/hqdefault.jpg` : '';
};

// Normalize a published payload (from IndexedDB/localStorage) into the
// admin's editing shape. Used after async hydration in the App.
function normalizeSite(o) {
  if (!o) return SEED;
  try {
    return {
      name: o.name ?? SEED.name, tagline: o.tagline ?? SEED.tagline,
      role: o.role ?? SEED.role, location: o.location ?? SEED.location,
      email: o.email ?? SEED.email, sinceYear: o.sinceYear ?? SEED.sinceYear,
      tools: o.tools ?? SEED.tools, closing: o.closing ?? SEED.closing,
      socials: { ...SEED.socials, ...(o.socials || {}) },
      bio: o.bio ?? SEED.bio,
      videos: (o.videos ?? SEED.videos).map((v, i) => ({ id: v.id || 'v' + i, ...v })),
      designs: (o.designs ?? SEED.designs).map((d, i) => ({
        id: d.id || 'd' + i, title: d.title, kind: d.kind, desc: d.desc || '',
        color: d.color || '', image: d.image || '', pdf: d.pdf || '', thumb: d.thumb || '',
        size: d.size || sizeFromSpan(d.span) })),
      resume: (o.resume ?? SEED.resume).map((r, i) => ({ id: r.id || 'r' + i, ...r })),
      travels: (o.travels ?? SEED.travels).map((t, i) => ({
        id: t.id || 't' + i, name: t.name || 'Place', year: t.year || '',
        lon: t.lon != null ? t.lon : (SEED.travels[i] ? SEED.travels[i].lon : 0),
        lat: t.lat != null ? t.lat : (SEED.travels[i] ? SEED.travels[i].lat : 0),
        blurb: t.blurb || '', image: t.image || '' })),
      sectionOrder: (Array.isArray(o.sectionOrder) && o.sectionOrder.length) ? o.sectionOrder : SEED.sectionOrder,
    };
  } catch (e) { return SEED; }
}

// Sync default for first render; the App hydrates from storage right after.
function loadInitial() {
  try {
    const raw = localStorage.getItem(SITE_KEY);
    if (raw) return normalizeSite(JSON.parse(raw));
  } catch (e) {}
  return SEED;
}

// ── Section 1: Identity & text ──────────────────────────────────────
function Identity({ d, set }) {
  const f = (k, v) => set({ ...d, [k]: v });
  const socials = d.socials || {};
  const setSocial = (k, v) => set({ ...d, socials: { ...socials, [k]: v } });
  return (
    <div>
      <SectionHead kicker="Section 01" title="Identity & Text" />
      <div style={{ ...card, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 26px' }}>
        <Field label="Name (hero headline)" value={d.name} onChange={(v) => f('name', v)} />
        <Field label="Role label" value={d.role} onChange={(v) => f('role', v)} />
        <div style={{ gridColumn: '1 / -1' }}>
          <Field label="Tagline" value={d.tagline} textarea onChange={(v) => f('tagline', v)} />
        </div>
        <Field label="Location" value={d.location} onChange={(v) => f('location', v)} />
        <Field label="Email" value={d.email} onChange={(v) => f('email', v)} />
        <Field label="Working since (year)" value={d.sinceYear} onChange={(v) => f('sinceYear', v)} />
        <Field label="Craft line" value={d.tools} onChange={(v) => f('tools', v)} />
        <div style={{ gridColumn: '1 / -1' }}>
          <Field label="Contact closing line" value={d.closing} textarea onChange={(v) => f('closing', v)} />
        </div>
      </div>

      <div style={{ marginTop: 14, ...card }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 16 }}>
          <span style={{ fontFamily: 'var(--ui-font)', fontSize: 11, letterSpacing: '0.22em',
            textTransform: 'uppercase', color: 'var(--amber)' }}>Social links</span>
          <span style={{ fontFamily: 'var(--body-font)', fontStyle: 'italic', fontSize: 12.5,
            color: 'var(--ink-mute)' }}>shown when visitors click your <strong>@cargli</strong> handle</span>
        </div>
        <Field label="TikTok URL" value={socials.tiktok || ''}
          placeholder="https://www.tiktok.com/@cargli" onChange={(v) => setSocial('tiktok', v)} />
        <Field label="Instagram URL" value={socials.instagram || ''}
          placeholder="https://www.instagram.com/cargli" onChange={(v) => setSocial('instagram', v)} />
        <Field label="YouTube URL" value={socials.youtube || ''}
          placeholder="https://www.youtube.com/@cargli" onChange={(v) => setSocial('youtube', v)} style={{ marginBottom: 0 }} />
      </div>
    </div>
  );
}

// ── Section 2: About / bio paragraphs ───────────────────────────────
function About({ bio, setBio }) {
  const setP = (i, v) => setBio(bio.map((p, j) => (j === i ? v : p)));
  const add = () => setBio([...bio, 'A new paragraph.']);
  const del = (i) => setBio(bio.filter((_, j) => j !== i));
  return (
    <div>
      <SectionHead kicker="Section 02" title="About — Bio" />
      <div style={{ ...card }}>
        {bio.map((p, i) => (
          <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: 14 }}>
            <span style={{ fontFamily: 'var(--display-font)', fontStyle: 'italic', fontSize: 14,
              color: 'var(--amber)', paddingTop: 12, flexShrink: 0 }}>¶{i + 1}</span>
            <div style={{ flex: 1 }}>
              <Field value={p} textarea onChange={(v) => setP(i, v)} style={{ marginBottom: 0 }} />
            </div>
            <Btn variant="danger" onClick={() => del(i)} style={{ padding: '7px 11px', fontSize: 11, marginTop: 4 }}>×</Btn>
          </div>
        ))}
        <Btn variant="ghost" onClick={add} style={{ width: '100%', marginTop: 6 }}>+ Add Paragraph</Btn>
      </div>
    </div>
  );
}

// ── Section 3: Video work ───────────────────────────────────────────
function VideoCard({ item, idx, set, remove, selected, onSelect }) {
  const f = (k, v) => set({ ...item, [k]: v });
  return (
    <div id={`edit-video-${item.id}`} onMouseDown={onSelect}
      style={{ ...card, marginBottom: 18,
        borderColor: selected ? 'var(--amber)' : 'var(--card-edge)',
        boxShadow: selected ? '0 0 0 2px rgba(245,205,106,0.25), var(--shadow)' : 'var(--shadow)',
        transition: 'border-color .2s, box-shadow .2s' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <span style={{ fontFamily: 'var(--display-font)', fontStyle: 'italic', fontSize: 15,
          color: 'var(--amber)' }}>No. {String(idx + 1).padStart(2, '0')}</span>
        <Btn variant="danger" onClick={remove} style={{ padding: '7px 13px', fontSize: 11 }}>Delete</Btn>
      </div>
      <Field label="Title" value={item.title} onChange={(v) => f('title', v)} />
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '0 18px' }}>
        <Field label="Kind / category" value={item.kind} onChange={(v) => f('kind', v)} />
        <Field label="Year" value={item.year} onChange={(v) => f('year', v)} />
        <Field label="Length" value={item.length} placeholder="4:12" onChange={(v) => f('length', v)} />
      </div>
      <Field label="Description" value={item.desc} textarea onChange={(v) => f('desc', v)} />
      <Field label="Embed URL (optional — YouTube / Vimeo)" value={item.url || ''}
        placeholder="https://youtube.com/watch?v=…" onChange={(v) => f('url', v)} />
      <ColorPicker label="Tile color — shown behind the image / when empty" value={item.color || ''} onChange={(v) => f('color', v)} />
      <ImageUpload label="Thumbnail / still image" value={item.image || ''} ratio="16/10"
        onChange={(v) => f('image', v)} />
      {!item.image && ytThumb(item.url) && (
        <div style={{ marginTop: -8, marginBottom: 4, fontFamily: 'var(--body-font)', fontStyle: 'italic',
          fontSize: 12.5, color: 'var(--ink-mute)' }}>
          No image set — using the YouTube thumbnail automatically, tinted with the tile color.
        </div>
      )}
    </div>
  );
}

function Videos({ items, setItems, selectedId, onSelect }) {
  const setOne = (i, v) => setItems(items.map((it, j) => (j === i ? v : it)));
  const add = () => setItems([...items, { id: uid(), title: 'Untitled', kind: 'Category', year: '2026', desc: '', length: '0:00' }]);
  return (
    <div>
      <SectionHead kicker="Section 03" title="Video Work" />
      {items.map((it, i) => (
        <VideoCard key={it.id} item={it} idx={i} set={(v) => setOne(i, v)}
          remove={() => setItems(items.filter((_, j) => j !== i))}
          selected={selectedId === it.id} onSelect={() => onSelect && onSelect(it.id)} />
      ))}
      <Btn variant="solid" onClick={add} style={{ width: '100%', padding: 14 }}>+ Add New Video</Btn>
    </div>
  );
}

// ── Section 4: Design work ──────────────────────────────────────────
function SizePicker({ value, onChange }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <span style={labelStyle}>Tile size (grid span)</span>
      <div style={{ display: 'flex', gap: 8 }}>
        {SIZES.map(([k, lbl]) => (
          <button key={k} onClick={() => onChange(k)}
            style={{ flex: 1, padding: '9px 0', borderRadius: 3, cursor: 'pointer',
              fontFamily: 'var(--ui-font)', fontSize: 13,
              background: value === k ? 'var(--amber-deep)' : 'var(--bg-deep)',
              color: value === k ? '#1a120b' : 'var(--ink-soft)', fontWeight: value === k ? 700 : 500,
              border: '1px solid ' + (value === k ? 'var(--amber)' : 'var(--card-edge)'),
              transition: 'all .15s' }}>{lbl}</button>
        ))}
      </div>
    </div>
  );
}

function DesignCard({ item, idx, set, remove, selected, onSelect }) {
  const f = (k, v) => set({ ...item, [k]: v });
  return (
    <div id={`edit-design-${item.id}`} onMouseDown={onSelect}
      style={{ ...card, marginBottom: 18,
        borderColor: selected ? 'var(--amber)' : 'var(--card-edge)',
        boxShadow: selected ? '0 0 0 2px rgba(245,205,106,0.25), var(--shadow)' : 'var(--shadow)',
        transition: 'border-color .2s, box-shadow .2s' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <span style={{ fontFamily: 'var(--display-font)', fontStyle: 'italic', fontSize: 15,
          color: 'var(--amber)' }}>No. {String(idx + 1).padStart(2, '0')}</span>
        <Btn variant="danger" onClick={remove} style={{ padding: '7px 13px', fontSize: 11 }}>Delete</Btn>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 24px' }}>
        <Field label="Title" value={item.title} onChange={(v) => f('title', v)} />
        <Field label="Kind / category" value={item.kind} onChange={(v) => f('kind', v)} />
      </div>
      <Field label="Description" value={item.desc || ''} textarea onChange={(v) => f('desc', v)} />
      <SizePicker value={item.size} onChange={(v) => f('size', v)} />
      <ColorPicker label="Tile color — shown behind the image / when empty" value={item.color || ''} onChange={(v) => f('color', v)} />
      <AssetField label="Design image or PDF" item={item} set={set} ratio="4/3" />
    </div>
  );
}

function Designs({ items, setItems, selectedId, onSelect }) {
  const setOne = (i, v) => setItems(items.map((it, j) => (j === i ? v : it)));
  const add = () => setItems([...items, { id: uid(), title: 'Untitled', kind: 'Category', size: 'small' }]);
  return (
    <div>
      <SectionHead kicker="Section 04" title="Design Work" />
      {items.map((it, i) => (
        <DesignCard key={it.id} item={it} idx={i} set={(v) => setOne(i, v)}
          remove={() => setItems(items.filter((_, j) => j !== i))}
          selected={selectedId === it.id} onSelect={() => onSelect && onSelect(it.id)} />
      ))}
      <Btn variant="solid" onClick={add} style={{ width: '100%', padding: 14 }}>+ Add New Design</Btn>
    </div>
  );
}

// ── Section 5: Resume ───────────────────────────────────────────────
function ResumeCard({ item, idx, set, remove, selected, onSelect }) {
  const f = (k, v) => set({ ...item, [k]: v });
  const setB = (i, v) => f('bullets', item.bullets.map((b, j) => (j === i ? v : b)));
  return (
    <div id={`edit-resume-${item.id}`} onMouseDown={onSelect}
      style={{ ...card, marginBottom: 18,
        borderColor: selected ? 'var(--amber)' : 'var(--card-edge)',
        boxShadow: selected ? '0 0 0 2px rgba(245,205,106,0.25), var(--shadow)' : 'var(--shadow)',
        transition: 'border-color .2s, box-shadow .2s' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <span style={{ fontFamily: 'var(--display-font)', fontStyle: 'italic', fontSize: 15,
          color: 'var(--amber)' }}>No. {String(idx + 1).padStart(2, '0')}</span>
        <Btn variant="danger" onClick={remove} style={{ padding: '7px 13px', fontSize: 11 }}>Delete</Btn>
      </div>
      <Field label="Role / title" value={item.role} onChange={(v) => f('role', v)} />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 24px' }}>
        <Field label="Company" value={item.company} onChange={(v) => f('company', v)} />
        <Field label="Dates" value={item.dates} onChange={(v) => f('dates', v)} />
      </div>
      <Field label="City / location" value={item.city} onChange={(v) => f('city', v)} />
      <span style={labelStyle}>Bullets</span>
      {item.bullets.map((b, i) => (
        <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 10 }}>
          <div style={{ flex: 1 }}>
            <Field value={b} textarea onChange={(v) => setB(i, v)} style={{ marginBottom: 0 }} />
          </div>
          <Btn variant="danger" onClick={() => f('bullets', item.bullets.filter((_, j) => j !== i))}
            style={{ padding: '7px 11px', fontSize: 11, marginTop: 4 }}>×</Btn>
        </div>
      ))}
      <Btn variant="ghost" onClick={() => f('bullets', [...item.bullets, 'New accomplishment.'])}
        style={{ marginTop: 4 }}>+ Add Bullet</Btn>
    </div>
  );
}

function Resume({ items, setItems, selectedId, onSelect }) {
  const setOne = (i, v) => setItems(items.map((it, j) => (j === i ? v : it)));
  const add = () => setItems([...items, { id: uid(), role: 'Role', company: 'Company', dates: '2026 to Present', city: 'City', bullets: ['What you did.'] }]);
  return (
    <div>
      <SectionHead kicker="Section 05" title="Resume / Experience" />
      {items.map((it, i) => (
        <ResumeCard key={it.id} item={it} idx={i} set={(v) => setOne(i, v)}
          remove={() => setItems(items.filter((_, j) => j !== i))}
          selected={selectedId === it.id} onSelect={() => onSelect && onSelect(it.id)} />
      ))}
      <Btn variant="solid" onClick={add} style={{ width: '100%', padding: 14 }}>+ Add Experience</Btn>
    </div>
  );
}

// ── Section 6: Travels (map pins) ───────────────────────────────────
function TravelCard({ item, idx, set, remove, selected, onSelect }) {
  const f = (k, v) => set({ ...item, [k]: v });
  const num = (k) => (v) => f(k, v === '' ? '' : parseFloat(v));
  return (
    <div id={`edit-travel-${item.id}`} onMouseDown={onSelect}
      style={{ ...card, marginBottom: 18,
        borderColor: selected ? 'var(--amber)' : 'var(--card-edge)',
        boxShadow: selected ? '0 0 0 2px rgba(245,205,106,0.25), var(--shadow)' : 'var(--shadow)',
        transition: 'border-color .2s, box-shadow .2s' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <span style={{ fontFamily: 'var(--display-font)', fontStyle: 'italic', fontSize: 15,
          color: 'var(--amber)' }}>No. {String(idx + 1).padStart(2, '0')}</span>
        <Btn variant="danger" onClick={remove} style={{ padding: '7px 13px', fontSize: 11 }}>Delete</Btn>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '0 24px' }}>
        <Field label="Place name" value={item.name} onChange={(v) => f('name', v)} />
        <Field label="Year" value={item.year} onChange={(v) => f('year', v)} />
      </div>
      <Field label="Description (shown in the map popup)" value={item.blurb || ''} textarea
        onChange={(v) => f('blurb', v)} />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 24px' }}>
        <Field label="Latitude (−90 to 90)" value={item.lat} type="number" onChange={num('lat')} />
        <Field label="Longitude (−180 to 180)" value={item.lon} type="number" onChange={num('lon')} />
      </div>
      <ImageUpload label="Photo (optional — appears beside the popup text)" value={item.image || ''}
        ratio="3/2" onChange={(v) => f('image', v)} />
      <div style={{ marginTop: -8, fontFamily: 'var(--body-font)', fontStyle: 'italic',
        fontSize: 12.5, color: 'var(--ink-mute)' }}>
        Pinned at {Number(item.lat).toFixed(1)}°, {Number(item.lon).toFixed(1)}° — adjust the
        coordinates above to move the marker on the world map.
      </div>
    </div>
  );
}

function Travels({ items, setItems, selectedId, onSelect }) {
  const setOne = (i, v) => setItems(items.map((it, j) => (j === i ? v : it)));
  const add = () => setItems([...items, { id: uid(), name: 'New Place', year: '2025', lat: 20, lon: 0, blurb: 'What happened here.', image: '' }]);
  return (
    <div>
      <SectionHead kicker="Section 06" title="Travels — Map Pins" />
      {items.map((it, i) => (
        <TravelCard key={it.id} item={it} idx={i} set={(v) => setOne(i, v)}
          remove={() => setItems(items.filter((_, j) => j !== i))}
          selected={selectedId === it.id} onSelect={() => onSelect && onSelect(it.id)} />
      ))}
      <Btn variant="solid" onClick={add} style={{ width: '100%', padding: 14 }}>+ Add Destination</Btn>
    </div>
  );
}

// ── Section 7: Page order — reorder which sections scroll where ────
const arrowBtn = {
  width: 30, height: 30, borderRadius: 3, border: '1px solid var(--card-edge)',
  background: 'var(--bg-deep)', color: 'var(--ink-soft)', fontSize: 14, fontFamily: 'var(--ui-font)',
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center', transition: 'border-color .15s, color .15s',
};
function Layout({ order, setOrder }) {
  const list = (Array.isArray(order) && order.length) ? order : DEFAULT_SECTION_ORDER;
  const move = (i, dir) => {
    const j = i + dir;
    if (j < 0 || j >= list.length) return;
    const next = [...list];
    [next[i], next[j]] = [next[j], next[i]];
    setOrder(next);
  };
  return (
    <div>
      <SectionHead kicker="Layout" title="Page Order" />
      <div style={{ ...card, padding: 0, overflow: 'hidden' }}>
        {list.map((id, i) => (
          <div key={id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '13px 18px', borderBottom: i < list.length - 1 ? '1px solid var(--rule)' : 'none' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <span style={{ fontFamily: 'var(--display-font)', fontStyle: 'italic', fontSize: 14,
                color: 'var(--amber)', width: 18 }}>{i + 1}</span>
              <span style={{ fontFamily: 'var(--display-font)', fontSize: 18, color: 'var(--ink)' }}>{SECTION_LABELS[id] || id}</span>
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              <button onClick={() => move(i, -1)} disabled={i === 0}
                style={{ ...arrowBtn, opacity: i === 0 ? 0.3 : 1, cursor: i === 0 ? 'default' : 'pointer' }}>↑</button>
              <button onClick={() => move(i, 1)} disabled={i === list.length - 1}
                style={{ ...arrowBtn, opacity: i === list.length - 1 ? 0.3 : 1, cursor: i === list.length - 1 ? 'default' : 'pointer' }}>↓</button>
            </div>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 12, fontFamily: 'var(--body-font)', fontStyle: 'italic', fontSize: 12.5, color: 'var(--ink-mute)' }}>
        Controls the order these sections scroll in on the live site. The hero and footer always stay fixed at the top and bottom.
      </div>
    </div>
  );
}

// ── JSON preview ────────────────────────────────────────────────────
// Replace heavy data URLs (uploaded images / PDF thumbnails) with short
// placeholders so stringifying on each keystroke stays cheap (no lag).
function lightenForPreview(data) {
  const short = (v) => (typeof v === 'string' && v.startsWith('data:')) ? `[${(v.split(';')[0] || 'data').replace('data:', '') || 'file'} · ${Math.round(v.length / 1024)}KB]` : v;
  return {
    ...data,
    videos: (data.videos || []).map((v) => ({ ...v, image: short(v.image) })),
    designs: (data.designs || []).map((d) => ({ ...d, image: short(d.image), thumb: short(d.thumb) })),
    travels: (data.travels || []).map((t) => ({ ...t, image: short(t.image) })),
  };
}
function JsonPreview({ data }) {
  const [copied, setCopied] = useState(false);
  const json = React.useMemo(() => JSON.stringify(lightenForPreview(data), null, 2), [data]);
  const copy = () => navigator.clipboard.writeText(json).then(() => {
    setCopied(true); setTimeout(() => setCopied(false), 1600);
  });
  return (
    <div id="sec-json" style={{ marginTop: 40 }}>
      <SectionHead kicker="Export" title="Data Preview" />
      <div style={{ ...card, padding: 0, overflow: 'hidden' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '12px 18px', borderBottom: '1px solid var(--rule)', background: 'var(--bg-soft)' }}>
          <span style={{ fontFamily: 'var(--ui-font)', fontSize: 12, color: 'var(--ink-mute)', letterSpacing: '0.1em' }}>data.json</span>
          <Btn variant="ghost" onClick={copy} style={{ padding: '7px 14px', fontSize: 11 }}>{copied ? '✓ Copied' : 'Copy JSON'}</Btn>
        </div>
        <pre style={{ margin: 0, padding: 20, fontFamily: 'ui-monospace, Menlo, monospace',
          fontSize: 12, lineHeight: 1.6, color: 'var(--sage)', overflowX: 'auto', maxHeight: 360,
          background: 'var(--bg-deep)' }}>{json}</pre>
      </div>
    </div>
  );
}

window.AdminSections = { loadInitial, normalizeSite, Identity, About, Videos, Designs, Resume, Travels, Layout, JsonPreview, SIZE_TO_SPAN };
