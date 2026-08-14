// admin.jsx, Parlor-themed portfolio CMS.
// Three sections (Site Text, Work, Videos), sidebar nav, pinned Save,
// state-only data, live JSON preview. Self-contained, copies the output
// JSON into the site's data file.

const { useState, useRef, useEffect } = React;

// ── Seed data (mirrors the live site's CG_DATA shape) ───────────────
const SITE_KEY = 'cg_site_data';
const sizeFromSpan = (span) => {
  const [c, r] = span || [1, 1];
  if (c >= 2 && r >= 2) return 'large';
  if (c >= 2) return 'wide';
  if (r >= 2) return 'tall';
  return 'small';
};
const SEED = {
  name: 'Carter Groff',
  tagline: 'Storytelling through strategy, screen, and design.',
  role: 'Marketing & Media',
  location: 'Harrisonburg, Virginia',
  email: 'car.groff@gmail.com',
  sinceYear: '2021',
  tools: 'video · copy · design · strategy',
  closing: 'Let’s make something worth remembering.',
  socials: {
    tiktok:    'https://www.tiktok.com/@cargli',
    instagram: 'https://www.instagram.com/cargli',
    youtube:   'https://www.youtube.com/@cargli',
  },
  bio: [
    'Hi, I’m Carter, a marketer, video editor, designer, and storyteller working out of the Shenandoah Valley. I shoot video, build social and email campaigns, design the pieces that go with them, and find the through-line that ties it all together.',
    'These days I run marketing for Log & Timber Worx, where we restore century-old log homes and tell their stories, the before-and-after kind, the kind you can almost smell the wood smoke in. Before that I built freelance video for FirstDay Learning, interned with Leaders Rising Network, and spent four years at James Madison studying media arts and design with a concentration in digital video and cinema.',
    'I like work that’s made with care and a little weathered around the edges. Send me a project worth telling carefully.',
  ],
  videos: [
    { id: 'v1', title: 'Restoration, Bryan Place', kind: 'Brand Video', year: '2026', desc: 'A six-month log home restoration from first cut to final stain.', length: '4:12' },
    { id: 'v2', title: 'Before / After', kind: 'Social Series', year: '2026', desc: 'Ongoing social-first series capturing log home transformations one porch at a time.', length: '1:00' },
    { id: 'v3', title: 'Hands at Work', kind: 'Documentary Short', year: '2025', desc: 'A quiet portrait of the craftsmen behind Log & Timber Worx, shot over a single workday.', length: '6:48' },
    { id: 'v4', title: 'FirstDay, Meet the Team', kind: 'Employer Brand', year: '2025', desc: 'Five short "get-to-know" videos produced freelance for FirstDay Learning client outreach.', length: '0:45' },
    { id: 'v5', title: 'Leaders Rising, Promo', kind: 'Internship Reel', year: '2025', desc: 'Promotional video work produced during a media internship with Leaders Rising Network.', length: '1:20' },
    { id: 'v6', title: 'Senior Capstone', kind: 'Capstone Short', year: '2025', desc: 'Final capstone project at JMU, made in the digital video & cinema concentration.', length: '8:30' },
  ],
  designs: [
    { id: 'd1', title: 'Log & Timber Worx', kind: 'Marketing System', size: 'large', desc: 'The full marketing system for a log-home restoration company, logo, color, social templates, and signage built to feel hand-hewn.' },
    { id: 'd2', title: 'Capstone Identity', kind: 'Brand & Print', size: 'small', desc: 'Brand identity and print collateral developed for my senior capstone at James Madison University.' },
    { id: 'd3', title: 'FirstDay Toolkit', kind: 'Social Templates', size: 'tall', desc: 'A reusable social-media template kit for FirstDay Learning, flexible layouts for recurring campaigns.' },
    { id: 'd4', title: 'Field Notes', kind: 'Editorial / Zine', size: 'small', desc: 'A small editorial zine collecting field notes, photography, and type experiments.' },
    { id: 'd5', title: 'Leaders Rising', kind: 'Event Identity', size: 'small', desc: 'Event identity and promotional materials produced for the Leaders Rising Network.' },
    { id: 'd6', title: 'Restoration Posters', kind: 'Print Series', size: 'wide', desc: 'A print poster series documenting log-home restorations, the before-and-after, side by side.' },
    { id: 'd7', title: 'Email Campaigns', kind: 'Lifecycle Design', size: 'small', desc: 'Lifecycle email design, onboarding, nurture, and re-engagement flows with a warm, editorial feel.' },
    { id: 'd8', title: 'SMAD Senior Show', kind: 'Exhibition Identity', size: 'small', desc: 'Exhibition identity for the SMAD senior show, signage, program, and wayfinding.' },
    { id: 'd9', title: 'Personal Mark', kind: 'Identity', size: 'small', desc: 'My personal monogram and identity system, the mark behind this site.' },
  ],
  resume: [
    { id: 'r1', role: 'Marketing Assistant', company: 'Log & Timber Worx', dates: 'Oct 2025 to Present', city: 'Harrisonburg, VA',
      bullets: ['Run social, email, and local marketing for a log-home restoration company.', 'Capture and shape before/after stories that drive leads and referrals.'] },
    { id: 'r2', role: 'Digital Content Creator', company: 'FirstDay Learning', dates: 'Aug 2025 to Jan 2026', city: 'Remote',
      bullets: ['Freelance video work, produced "get-to-know-me" employee videos for client outreach.'] },
    { id: 'r3', role: 'Media Intern', company: 'Leaders Rising Network', dates: 'Jun 2025 to Aug 2025', city: 'Internship',
      bullets: ['Summer internship across media production and content workflows.'] },
    { id: 'r4', role: 'B.A., Mass Communication / Media Studies', company: 'James Madison University', dates: 'Aug 2021 to May 2025', city: 'Harrisonburg, VA',
      bullets: ['Concentration in Media Arts & Design, Digital Video & Cinema.'] },
  ],
  travels: [
    { id: 't1', name: 'Japan', year: '2024', lon: 139.6, lat: 35.6, image: '',
      blurb: 'Spent time studying Japanese business and culture through a formal study abroad program at James Madison University. Immersed in daily life across Tokyo and surrounding regions, gaining firsthand exposure to Japanese professional customs, communication styles, and creative industries.' },
    { id: 't2', name: 'Romania', year: '2025', lon: 24.9, lat: 45.9, image: '',
      blurb: 'Traveled with Project Ruth to work alongside a local school, leading educational workshops for teachers and spending time with children in the community. The experience was hands-on and relational, focused on meaningful cross-cultural exchange and service.' },
    { id: 't3', name: 'Iceland', year: '2025', lon: -18.1, lat: 64.9, image: '',
      blurb: 'Completed a solo van journey along the Iceland Ring Road over the course of a week. Navigated remote landscapes, volcanic terrain, and coastal cliffs entirely independently, an exercise in self-reliance, adaptability, and finding stillness in unfamiliar places.' },
    { id: 't4', name: 'Guatemala', year: '2025', lon: -90.4, lat: 15.5, image: '',
      blurb: 'Joined a Teams Commissioned for Christ International mission, contributing to construction projects, painting, and community outreach. Worked alongside a diverse team in a rural setting, focused on practical service and building connections across language and culture.' },
  ],
};

const SIZES = [['small', '1×1'], ['wide', '2×1'], ['tall', '1×2'], ['large', '2×2']];
const uid = () => 'x' + Math.random().toString(36).slice(2, 8);

// ── Tile color presets, warm parlor hues matching the live site ────
const TILE_SWATCHES = [
  { name: 'Tobacco',       grad: 'linear-gradient(150deg, #6a4a2c 0%, #2a1a0e 100%)' },
  { name: 'Amber leather', grad: 'linear-gradient(150deg, #8a5a36 0%, #321e10 100%)' },
  { name: 'Rust',          grad: 'linear-gradient(150deg, #c97a48 0%, #4a2616 100%)' },
  { name: 'Moss',          grad: 'linear-gradient(150deg, #5e6a4c 0%, #1e2418 100%)' },
  { name: 'Candlelight',   grad: 'linear-gradient(150deg, #d99a3d 0%, #5a3a1a 100%)' },
  { name: 'Walnut',        grad: 'linear-gradient(150deg, #4a3a2a 0%, #15100a 100%)' },
  { name: 'Worn brass',    grad: 'linear-gradient(150deg, #936a44 0%, #2a1a10 100%)' },
  { name: 'Dried blood',   grad: 'linear-gradient(150deg, #6a4438 0%, #1e120c 100%)' },
  { name: 'Sage',          grad: 'linear-gradient(150deg, #8a9670 0%, #2a3220 100%)' },
];
const _hx = (n) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, '0');
// darken a hex by mixing toward the deep parlor brown (#15100a)
const darkenHex = (hex, amt = 0.72) => {
  const h = (hex || '#000000').replace('#', '');
  const r = parseInt(h.slice(0, 2), 16), g = parseInt(h.slice(2, 4), 16), b = parseInt(h.slice(4, 6), 16);
  return '#' + _hx(r * (1 - amt) + 0x15 * amt) + _hx(g * (1 - amt) + 0x10 * amt) + _hx(b * (1 - amt) + 0x0a * amt);
};
const gradFromHex = (hex) => `linear-gradient(150deg, ${hex} 0%, ${darkenHex(hex)} 100%)`;
const hexFromGrad = (grad) => { const m = /#([0-9a-fA-F]{6})/.exec(grad || ''); return m ? '#' + m[1] : '#c97a48'; };

// ── Shared primitives ───────────────────────────────────────────────
const fieldWrap = { marginBottom: 18 };
const labelStyle = {
  display: 'block', fontFamily: 'var(--ui-font)', fontSize: 11,
  letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--ink-mute)',
  marginBottom: 8, fontWeight: 600,
};
const inputBase = {
  width: '100%', background: 'var(--bg-deep)', color: 'var(--ink)',
  border: '1px solid var(--card-edge)', borderRadius: 3,
  padding: '11px 13px', fontFamily: 'var(--body-font)', fontSize: 15,
  outline: 'none', transition: 'border-color .2s ease, box-shadow .2s ease',
};

function Field({ label, value, onChange, textarea, type = 'text', placeholder, min, max, style }) {
  const [focus, setFocus] = useState(false);
  const ring = focus ? { borderColor: 'var(--amber)', boxShadow: '0 0 0 3px rgba(245,205,106,0.12)' } : null;
  const common = {
    value, placeholder,
    onChange: (e) => onChange(e.target.value),
    onFocus: () => setFocus(true), onBlur: () => setFocus(false),
    style: { ...inputBase, ...ring, ...style },
  };
  return (
    <label style={fieldWrap}>
      {label && <span style={labelStyle}>{label}</span>}
      {textarea
        ? <textarea {...common} rows={3} style={{ ...common.style, resize: 'vertical', lineHeight: 1.5 }} />
        : <input {...common} type={type} min={min} max={max} />}
    </label>
  );
}

// ── Tile color picker, preset swatches + custom color + auto ───────
function ColorPicker({ label, value, onChange }) {
  const isPreset = (g) => TILE_SWATCHES.some((s) => s.grad === g);
  const isCustom = value && !isPreset(value);
  const swatch = {
    width: 30, height: 30, borderRadius: 4, cursor: 'pointer', padding: 0,
    border: '1px solid var(--card-edge)', transition: 'box-shadow .12s ease',
  };
  const sel = (on) => (on ? { boxShadow: '0 0 0 2px var(--bg-deep), 0 0 0 4px var(--amber)' } : null);
  return (
    <div style={{ marginBottom: 18 }}>
      {label && <span style={labelStyle}>{label}</span>}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 9, alignItems: 'center' }}>
        <button type="button" title="Default, auto color by position" onClick={() => onChange('')}
          style={{ ...swatch, width: 'auto', padding: '0 12px', fontFamily: 'var(--ui-font)', fontSize: 10,
            letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--ink-soft)',
            background: 'var(--bg-deep)', ...sel(!value) }}>Auto</button>
        {TILE_SWATCHES.map((s) => (
          <button key={s.name} type="button" title={s.name} onClick={() => onChange(s.grad)}
            style={{ ...swatch, background: s.grad, ...sel(value === s.grad) }} />
        ))}
        <label title="Custom color" style={{ ...swatch, position: 'relative', overflow: 'hidden',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          background: isCustom ? value : 'conic-gradient(from 0deg, #c97a48, #8a9670, #d99a3d, #6a4438, #c97a48)',
          ...sel(isCustom) }}>
          <input type="color" value={hexFromGrad(value)} onChange={(e) => onChange(gradFromHex(e.target.value))}
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer', border: 'none' }} />
          <span style={{ fontSize: 15, lineHeight: 1, color: '#fff', textShadow: '0 1px 2px rgba(0,0,0,0.85)', pointerEvents: 'none' }}>+</span>
        </label>
      </div>
    </div>
  );
}

function Btn({ children, onClick, variant = 'ghost', style }) {  const [hover, setHover] = useState(false);
  const variants = {
    solid: { background: hover ? 'var(--amber)' : 'var(--amber-deep)', color: '#1a120b', border: '1px solid var(--amber)' },
    ghost: { background: hover ? 'rgba(245,205,106,0.10)' : 'transparent', color: 'var(--ink-soft)', border: '1px solid var(--card-edge)' },
    danger: { background: hover ? 'rgba(184,100,63,0.18)' : 'transparent', color: hover ? 'var(--terracotta)' : 'var(--ink-mute)', border: '1px solid var(--card-edge)' },
  };
  return (
    <button onClick={onClick} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{ fontFamily: 'var(--ui-font)', fontSize: 12, letterSpacing: '0.12em',
        textTransform: 'uppercase', fontWeight: 600, padding: '10px 18px',
        borderRadius: 3, cursor: 'pointer', transition: 'all .18s ease',
        ...variants[variant], ...style }}>
      {children}
    </button>
  );
}

function SectionHead({ kicker, title }) {
  return (
    <header style={{ marginBottom: 28 }}>
      <div style={{ fontFamily: 'var(--ui-font)', fontSize: 11, letterSpacing: '0.3em',
        textTransform: 'uppercase', color: 'var(--amber)', marginBottom: 10 }}>{kicker}</div>
      <h2 style={{ fontFamily: 'var(--display-font)', fontSize: 42, fontWeight: 500,
        letterSpacing: '-0.02em', margin: 0, color: 'var(--ink)' }}>{title}</h2>
    </header>
  );
}

const card = {
  background: 'var(--card)', border: '1px solid var(--card-edge)',
  borderRadius: 6, padding: 22, boxShadow: 'var(--shadow)',
};

// True when a stored value is a PDF data URL (vs an image).
const isPdfData = (v) => typeof v === 'string' && v.startsWith('data:application/pdf');

window.AdminPrimitives = { Field, Btn, SectionHead, ImageUpload, AssetField, ColorPicker, isPdfData, SEED, SIZES, sizeFromSpan, SITE_KEY, uid, card, labelStyle, TILE_SWATCHES, gradFromHex };

// ── Image upload, reads a file to a data URL, shows a thumbnail ─────
// Also accepts PDFs (pass accept="image/*,application/pdf"); shows a PDF chip.
function ImageUpload({ label, value, onChange, ratio = '16/10', accept = 'image/*' }) {
  const inputRef = useRef(null);
  const [over, setOver] = useState(false);
  const pdf = isPdfData(value);
  const allowsPdf = accept.includes('pdf');
  const processFile = async (file) => {
    if (!file) return;
    if (file.type && file.type.startsWith('image/')) { onChange(await compressImage(file)); }
    else if (allowsPdf && file.type === 'application/pdf') {
      const reader = new FileReader(); reader.onload = () => onChange(reader.result); reader.readAsDataURL(file);
    }
  };
  const pick = (e) => processFile(e.target.files && e.target.files[0]);
  const drop = {
    onDragOver: (e) => { e.preventDefault(); setOver(true); },
    onDragLeave: (e) => { e.preventDefault(); setOver(false); },
    onDrop: (e) => { e.preventDefault(); setOver(false); processFile(e.dataTransfer.files && e.dataTransfer.files[0]); },
  };
  return (
    <div style={{ marginBottom: 18 }} {...drop}>
      {label && <span style={labelStyle}>{label}</span>}
      <input ref={inputRef} type="file" accept={accept} onChange={pick} style={{ display: 'none' }} />
      {value ? (
        <div style={{ position: 'relative', aspectRatio: ratio, maxWidth: 280, overflow: 'hidden',
          borderRadius: 4, border: '1px solid var(--card-edge)' }}>
          {pdf ? (
            <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', gap: 8, background: 'var(--bg-deep)' }}>
              <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="var(--amber)" strokeWidth="1.4">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <path d="M14 2v6h6" />
              </svg>
              <span style={{ fontFamily: 'var(--ui-font)', fontSize: 11, letterSpacing: '0.18em',
                textTransform: 'uppercase', color: 'var(--ink-soft)' }}>PDF document</span>
            </div>
          ) : (
            <img src={value} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
          )}
          <div style={{ position: 'absolute', top: 8, right: 8, display: 'flex', gap: 6 }}>
            <button onClick={() => inputRef.current && inputRef.current.click()}
              style={{ fontFamily: 'var(--ui-font)', fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase',
                background: 'rgba(13,9,5,0.8)', color: 'var(--ink)', border: '1px solid var(--card-edge)',
                borderRadius: 3, padding: '5px 9px', cursor: 'pointer' }}>Replace</button>
            <button onClick={() => onChange('')}
              style={{ fontFamily: 'var(--ui-font)', fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase',
                background: 'rgba(13,9,5,0.8)', color: 'var(--terracotta)', border: '1px solid var(--card-edge)',
                borderRadius: 3, padding: '5px 9px', cursor: 'pointer' }}>Remove</button>
          </div>
        </div>
      ) : (
        <button onClick={() => inputRef.current && inputRef.current.click()}
          style={{ width: '100%', maxWidth: 280, aspectRatio: ratio, cursor: 'pointer',
            background: over ? 'rgba(245,205,106,0.08)' : 'var(--bg-deep)',
            border: '1.5px dashed ' + (over ? 'var(--amber)' : 'var(--card-edge)'), borderRadius: 4,
            color: over ? 'var(--amber)' : 'var(--ink-mute)', fontFamily: 'var(--ui-font)', fontSize: 12.5, letterSpacing: '0.06em',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8,
            transition: 'border-color .2s, color .2s, background .2s' }}
          onMouseEnter={(e) => { if (!over) { e.currentTarget.style.borderColor = 'var(--amber)'; e.currentTarget.style.color = 'var(--amber)'; } }}
          onMouseLeave={(e) => { if (!over) { e.currentTarget.style.borderColor = 'var(--card-edge)'; e.currentTarget.style.color = 'var(--ink-mute)'; } }}>
          <span style={{ fontSize: 22 }}>↑</span>
          <span>{over ? 'Drop to upload' : (allowsPdf ? 'Click or drop an image / PDF' : 'Click or drop an image')}</span>
        </button>
      )}
    </div>
  );
}

// ── Asset helpers: compress images, render a PDF first-page thumbnail ─
function fileToDataUrl(file) {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result);
    r.onerror = rej;
    r.readAsDataURL(file);
  });
}
async function compressImage(file, max = 1500, q = 0.82) {
  const dataUrl = await fileToDataUrl(file);
  const img = await new Promise((res, rej) => { const im = new Image(); im.onload = () => res(im); im.onerror = rej; im.src = dataUrl; });
  let w = img.width, h = img.height;
  if (Math.max(w, h) > max) { const s = max / Math.max(w, h); w = Math.round(w * s); h = Math.round(h * s); }
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  c.getContext('2d').drawImage(img, 0, 0, w, h);
  return c.toDataURL('image/jpeg', q);
}
async function pdfFirstPageThumb(dataUrl) {
  if (!window.pdfjsLib) return '';
  try {
    const bin = atob(dataUrl.split(',')[1]);
    const arr = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
    const pdf = await window.pdfjsLib.getDocument({ data: arr }).promise;
    const page = await pdf.getPage(1);
    const base = page.getViewport({ scale: 1 });
    const scale = Math.min(1000 / base.width, 2);
    const vp = page.getViewport({ scale });
    const c = document.createElement('canvas'); c.width = vp.width; c.height = vp.height;
    await page.render({ canvasContext: c.getContext('2d'), viewport: vp }).promise;
    return c.toDataURL('image/jpeg', 0.8);
  } catch (e) { return ''; }
}
const newAssetKey = () => 'pdf_' + Math.random().toString(36).slice(2, 10);

// ── AssetField, design uploader: image (compressed) OR PDF (→IndexedDB
//   + first-page thumbnail). Writes {image, pdf, thumb} onto the item. ──
function AssetField({ label, item, set, ratio = '4/3' }) {
  const inputRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [over, setOver] = useState(false);
  const display = (item.image && !isPdfData(item.image)) ? item.image : (item.thumb || '');
  const isPdf = !!item.pdf || isPdfData(item.image);
  const processFile = async (file) => {
    if (!file) return;
    setErr(''); setBusy(true);
    try {
      if (file.type === 'application/pdf') {
        const dataUrl = await fileToDataUrl(file);
        const key = newAssetKey();
        if (window.CGStore) await window.CGStore.putAsset(key, dataUrl);
        const thumb = await pdfFirstPageThumb(dataUrl);
        set({ ...item, pdf: key, thumb: thumb || '', image: '' });
      } else if (file.type && file.type.startsWith('image/')) {
        const img = await compressImage(file);
        set({ ...item, image: img, pdf: '', thumb: '' });
      } else {
        setErr('Unsupported file, use an image or PDF.');
      }
    } catch (ex) { setErr('Upload failed, try a different file.'); }
    setBusy(false);
    if (inputRef.current) inputRef.current.value = '';
  };
  const pick = (e) => processFile(e.target.files && e.target.files[0]);
  const drop = {
    onDragOver: (e) => { e.preventDefault(); setOver(true); },
    onDragLeave: (e) => { e.preventDefault(); setOver(false); },
    onDrop: (e) => { e.preventDefault(); setOver(false); processFile(e.dataTransfer.files && e.dataTransfer.files[0]); },
  };
  const clear = () => { setErr(''); set({ ...item, image: '', pdf: '', thumb: '' }); };
  const hasAsset = !!(display || isPdf);
  return (
    <div style={{ marginBottom: 18 }} {...drop}>
      {label && <span style={labelStyle}>{label}</span>}
      <input ref={inputRef} type="file" accept="image/*,application/pdf" onChange={pick} style={{ display: 'none' }} />
      {hasAsset ? (
        <div style={{ position: 'relative', aspectRatio: ratio, maxWidth: 280, overflow: 'hidden',
          borderRadius: 4, border: '1px solid ' + (over ? 'var(--amber)' : 'var(--card-edge)'), background: 'var(--bg-deep)' }}>
          {display
            ? <img src={display} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
            : <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="var(--amber)" strokeWidth="1.4">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6" />
                </svg>
                <span style={{ fontFamily: 'var(--ui-font)', fontSize: 10, letterSpacing: '0.18em',
                  textTransform: 'uppercase', color: 'var(--ink-soft)' }}>PDF</span>
              </div>}
          {isPdf && display && (
            <span style={{ position: 'absolute', left: 8, bottom: 8, fontFamily: 'var(--ui-font)', fontSize: 9,
              letterSpacing: '0.14em', textTransform: 'uppercase', color: '#1a120b', background: 'var(--amber)',
              padding: '3px 7px', borderRadius: 3 }}>PDF</span>
          )}
          <div style={{ position: 'absolute', top: 8, right: 8, display: 'flex', gap: 6 }}>
            <button onClick={() => inputRef.current && inputRef.current.click()}
              style={{ fontFamily: 'var(--ui-font)', fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase',
                background: 'rgba(13,9,5,0.8)', color: 'var(--ink)', border: '1px solid var(--card-edge)',
                borderRadius: 3, padding: '5px 9px', cursor: 'pointer' }}>Replace</button>
            <button onClick={clear}
              style={{ fontFamily: 'var(--ui-font)', fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase',
                background: 'rgba(13,9,5,0.8)', color: 'var(--terracotta)', border: '1px solid var(--card-edge)',
                borderRadius: 3, padding: '5px 9px', cursor: 'pointer' }}>Remove</button>
          </div>
        </div>
      ) : (
        <button onClick={() => inputRef.current && inputRef.current.click()} disabled={busy}
          style={{ width: '100%', maxWidth: 280, aspectRatio: ratio, cursor: busy ? 'wait' : 'pointer',
            background: over ? 'rgba(245,205,106,0.08)' : 'var(--bg-deep)',
            border: '1.5px dashed ' + (over ? 'var(--amber)' : 'var(--card-edge)'), borderRadius: 4,
            color: over ? 'var(--amber)' : 'var(--ink-mute)', fontFamily: 'var(--ui-font)', fontSize: 12.5, letterSpacing: '0.06em',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8,
            transition: 'border-color .2s, color .2s, background .2s' }}>
          <span style={{ fontSize: 22 }}>{busy ? '…' : '↑'}</span>
          <span>{busy ? 'Processing…' : (over ? 'Drop to upload' : 'Click or drop an image / PDF')}</span>
        </button>
      )}
      {err && <div style={{ marginTop: 8, fontFamily: 'var(--body-font)', fontStyle: 'italic', fontSize: 12.5, color: 'var(--terracotta)' }}>{err}</div>}
    </div>
  );
}
