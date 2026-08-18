// command-center-data.jsx — brand constants (from brand/*.md) + Supabase-backed
// reads/writes for campaigns and links. Separate Supabase project from the
// public portfolio's (real business data, not public content).
const CC_SUPABASE_URL = 'https://kvgeimwitzdlstagqumw.supabase.co';
const CC_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt2Z2VpbXdpdHpkbHN0YWdxdW13Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY5ODk0ODUsImV4cCI6MjEwMjU2NTQ4NX0.t9-opIQWY95kj1qFfdiuQbtaiPyxpCvnmY-Jt-o-Dvk';

const BRANDS = {
  ltw: { key: 'ltw', name: 'Log & Timber Worx', short: 'LTW' },
  sq:  { key: 'sq',  name: 'Squeeky Clean',      short: 'Squeeky' },
};

// Brand constants, taken directly from brand/Brand Guide - *.md. Two separate
// brands: never mix palettes, fonts, or voice between them.
const BRAND_KIT = {
  ltw: {
    name: 'Log & Timber Worx', short: 'LTW', owner: 'Dan Link',
    position: 'Wood Restoration Specialists', tagline: 'Plan Ahead with Confidence',
    colors: [['Brick', '#b33624'], ['Gold', '#ffc20e'], ['Charcoal', '#231f1e'], ['Cream', '#f6f1e6']],
    ink: '#231f1e', body: '#3a3634', muted: '#4f4e4f', canvas: '#f6f1e6', backdrop: '#dcd6c8', rule: '#4a423f', onDark: '#ded8cc',
    display: 'Oswald', accent: 'DM Serif Display', bodyFace: 'Inter',
    typeNote: 'Oswald uppercase for all display, DM Serif italic for the greeting only, Inter for body',
    opener: 'Howdy,', signoff: 'Dan Link',
    voice: 'Plainspoken contractor to a homeowner. Short declarative sentences, concrete nouns, second person. Two clipped sentences in headlines, often a contrast.',
    rules: ['No em dashes in prose', 'No emoji, no urgency theater', 'Never "formerly Shenandoah Log Homes"', 'Gold is a band and highlight color, never a fill behind body copy', 'Buttons in email: filled brick primary, outlined charcoal secondary'],
    ctaStyle: 'buttons', signature: '9px gold band over a 3px charcoal hairline',
    logo: 'assets/ltw-logo.png', site: 'logandtimberworx.com', phone: '(844) STAINER',
    address: '2867 W Mosby Road, Harrisonburg, VA 22801',
    sales: 'Steve, steve@logandtimberworx.com', states: 'VA, WV, MD, PA, TN, DE',
    modules: ['Three Threats', 'Clean / Dry / Sound', '60 Month Maintenance Program', '5-Year Maintenance Guide'],
  },
  sq: {
    name: 'Squeeky Clean', short: 'Squeeky', owner: null,
    position: 'Exterior cleaning, route based', tagline: 'We Fight Dirty',
    colors: [['Green', '#9bcf36'], ['Navy', '#0e3c56'], ['Light blue', '#55b0d9'], ['Blue', '#176b8d']],
    ink: '#0e3c56', body: '#43687c', muted: '#176b8d', canvas: '#eef6fb', backdrop: '#dfeef7', rule: '#a9c0cd', onDark: '#eef6fb',
    display: 'Archivo', accent: 'Archivo', bodyFace: 'Open Sans',
    typeNote: 'Archivo 800 to 900 uppercase display, italic for punch, Open Sans body at 600 to 700. No serif, no condensed',
    opener: null, signoff: null,
    voice: 'Upbeat, punchy, neighborly. Verbs first, rhythmic pairs and rhymes, offers stated plainly. Louder than LTW.',
    rules: ['No buttons in email: text CTA, big phone, green rule', 'Every send structurally different from the last', 'No LTW colors, fonts, or timber language', 'Do not oversaturate the green field', 'Deep navy footer with a green hairline', 'Mascot and bubbles as accents, never wallpaper'],
    ctaStyle: 'text', signature: 'Light blue band, structural variation send to send',
    logo: 'assets/squeeky-logo.png', site: 'besqueekyclean.com', phone: '(540) 339-3432',
    address: '2867 W Mosby Road, Harrisonburg, VA 22801', sales: null, states: 'Shenandoah Valley',
    modules: ['Green highlight bar', 'Checklist badges', 'Dashed tear-off tabs', 'QR block', 'Mascot accent'],
  },
};

const CHANNELS = ['Direct Mail', 'Email', 'Instagram', 'Google Ads', 'Referral Program', 'Facebook', 'Trade Show', 'Yard Sign'];
const TYPES = ['Seasonal', 'Reactivation', 'Always-On', 'Launch', 'Event', 'Retargeting'];

// Connections has no live-check for anything but Pipedrive (wired via
// /api/pipedrive-goals in command-center.jsx). Everyone else here is a
// static status board -- there's no API integration built for any of these
// yet, this just tells you what still has to be typed in by hand.
const CONNECTIONS = [
  { name: 'Pipedrive', role: 'Leads & deal value, the spine of attribution', status: 'not' },
  { name: 'CallRail', role: 'Tracked numbers per campaign', status: 'manual' },
  { name: 'Constant Contact', role: 'Email sends, opens, clicks', status: 'manual' },
  { name: 'Send Jim', role: 'Direct mail drops, piece counts, cost', status: 'manual' },
  { name: 'Meta / Instagram', role: 'Paid + organic social reach and spend', status: 'not' },
  { name: 'Google Ads', role: 'Spend and conversions by campaign', status: 'not' },
  { name: 'ISN', role: 'Job records for close-rate context', status: 'not' },
  { name: 'NiceJob', role: 'Reviews and referral traffic', status: 'not' },
];

const money = (n) => n == null ? '—' : '$' + Math.round(n).toLocaleString('en-US');
// Builds dates from local parts -- parsing a bare YYYY-MM-DD as UTC and
// formatting it locally shifts the display back a day. Don't reintroduce that.
const fmtDate = (s) => { const [y, m, d] = s.split('-'); return new Date(+y, +m - 1, +d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }); };
const inBrand = (rows, brand) => (brand === 'both' ? rows : rows.filter((r) => r.brand === brand));
const checklistDone = (c) => !!(c.checklist && c.checklist.cost && c.checklist.attr && c.checklist.qty);

async function ccFetch(path, opts = {}) {
  const res = await fetch(`${CC_SUPABASE_URL}/rest/v1/${path}`, {
    ...opts,
    headers: {
      apikey: CC_SUPABASE_ANON_KEY,
      Authorization: `Bearer ${CC_SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json',
      ...(opts.headers || {}),
    },
  });
  if (!res.ok) throw new Error(`Command Center fetch failed: ${path} (${res.status})`);
  return res.json();
}

async function fetchCampaigns() {
  return ccFetch('campaigns?select=*&order=date.desc');
}
async function fetchLinks() {
  return ccFetch('links?select=*&order=date.desc');
}
// Writes go through /api/scaffold-write (service-role key, server-side only)
// rather than direct-from-browser -- the anon key above is read-only by RLS.
async function saveCampaign(campaign) {
  const res = await fetch('/api/scaffold-write', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ table: 'campaigns', row: campaign }),
  });
  if (!res.ok) throw new Error('Could not save campaign');
  return res.json();
}
async function saveLink(link) {
  const res = await fetch('/api/scaffold-write', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ table: 'links', row: link }),
  });
  if (!res.ok) throw new Error('Could not save link');
  return res.json();
}

// ── Docket ───────────────────────────────────────────────────────────
async function fetchDocketTasks() {
  return ccFetch('docket_tasks?select=*&order=rank.asc');
}
async function saveDocketTask(task) {
  const res = await fetch('/api/scaffold-write', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ table: 'docket_tasks', row: task }),
  });
  if (!res.ok) throw new Error('Could not save task');
  return res.json();
}

// ── Content Builder ─────────────────────────────────────────────────
async function fetchGeneratedContent() {
  return ccFetch('generated_content?select=*&order=created_at.desc');
}
async function saveGeneratedContent(piece) {
  const res = await fetch('/api/scaffold-write', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ table: 'generated_content', row: piece }),
  });
  if (!res.ok) throw new Error('Could not save piece');
  return res.json();
}
async function generateContent(request) {
  const res = await fetch('/api/content-generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });
  if (!res.ok) throw new Error('Generation call failed');
  return res.json();
}

window.CC = {
  BRANDS, BRAND_KIT, CHANNELS, TYPES, CONNECTIONS,
  money, fmtDate, inBrand, checklistDone,
  fetchCampaigns, fetchLinks, saveCampaign, saveLink,
  fetchDocketTasks, saveDocketTask,
  fetchGeneratedContent, saveGeneratedContent, generateContent,
};
