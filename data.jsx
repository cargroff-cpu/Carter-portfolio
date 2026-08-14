// data.jsx, content for the portfolio. Pulled from Carter's LinkedIn
// profile; bio + resume copy is editable and ready to revise.

// Bump when the authored copy below is revised.
window.CG_COPY_REV = 6;

const CG_DATA = {
  name: 'Carter Groff',
  role: 'Marketing & Media',
  location: 'Harrisonburg, Virginia',
  email: 'car.groff@gmail.com',
  initials: 'CG',
  tools: 'video · copy · design · strategy',

  // Hero / About, Carter's voice, rewritten from the LinkedIn headline +
  // experience. Three short paragraphs.
  bio: [
    'Hi, I’m Carter, a marketer, video editor, designer, and storyteller. I edit video, build social and email campaigns, design the pieces that go with them, and find the through-line that ties it all together, whatever the medium.',
    'These days I run marketing for Log & Timber Worx, where we restore century-old log homes and give them a second act, turning worn timber and old stories into something new again. Before that, I spent four years at James Madison University studying media arts and design with a concentration in digital video and cinema.',
    'Most of what I make is about paying attention, to the material, the people, the details that don’t announce themselves. If that’s the kind of work you’re after, my inbox is open.',
  ],

  // Video reel, placeholder titles. Replace with real work as it ships.
  videos: [
    { title: 'Restoration, Bryan Place',     kind: 'Brand Video',           year: '2026', desc: 'A six-month log home restoration from first cut to final stain.', length: '4:12' },
    { title: 'Before / After',                     kind: 'Social Series',        year: '2026', desc: 'Ongoing social-first series capturing log home transformations one porch at a time.', length: '1:00' },
    { title: 'Hands at Work',                      kind: 'Documentary Short',    year: '2025', desc: 'A quiet portrait of the craftsmen behind Log & Timber Worx, shot over a single workday.', length: '6:48' },
    { title: 'FirstDay, Meet the Team',      kind: 'Employer Brand',       year: '2025', desc: 'Five short "get-to-know" videos produced freelance for FirstDay Learning client outreach.', length: '0:45' },
    { title: 'Leaders Rising, Promo',        kind: 'Internship Reel',      year: '2025', desc: 'Promotional video work produced during a media internship with Leaders Rising Network.', length: '1:20' },
    { title: 'Senior Capstone',                    kind: 'Capstone Short',           year: '2025', desc: 'Final capstone project at JMU, made in the digital video & cinema concentration.', length: '8:30' },
  ],

  // Design portfolio, placeholder titles, ready to swap.
  designs: [
    { title: 'Log & Timber Worx',  kind: 'Marketing System',     span: [2, 2], desc: 'The full marketing system for a log-home restoration company, logo, color, social templates, and signage built to feel hand-hewn.' },
    { title: 'Capstone Identity',      kind: 'Brand & Print',    span: [1, 1], desc: 'Brand identity and print collateral developed for my senior capstone at James Madison University.' },
    { title: 'FirstDay Toolkit',       kind: 'Social Templates',     span: [1, 2], desc: 'A reusable social-media template kit for FirstDay Learning, flexible layouts for recurring campaigns.' },
    { title: 'Field Notes',            kind: 'Editorial / Zine',     span: [1, 1], desc: 'A small editorial zine collecting field notes, photography, and type experiments.' },
    { title: 'Leaders Rising',         kind: 'Event Identity',       span: [1, 1], desc: 'Event identity and promotional materials produced for the Leaders Rising Network.' },
    { title: 'Restoration Posters',    kind: 'Print Series',         span: [2, 1], desc: 'A print poster series documenting log-home restorations, the before-and-after, side by side.' },
    { title: 'Email Campaigns',        kind: 'Lifecycle Design',     span: [1, 1], desc: 'Lifecycle email design, onboarding, nurture, and re-engagement flows with a warm, editorial feel.' },
    { title: 'SMAD Senior Show',       kind: 'Exhibition Identity',  span: [1, 1], desc: 'Exhibition identity for the SMAD senior show, signage, program, and wayfinding.' },
    { title: 'Personal Mark',          kind: 'Identity',             span: [1, 1], desc: 'My personal monogram and identity system, the mark behind this site.' },
  ],

  // Resume, pulled directly from LinkedIn. Edit dates / copy as needed.
  resume: [
    { role: 'Marketing Assistant',           company: 'Log & Timber Worx',     dates: 'Oct 2025 to Present', city: 'Harrisonburg, VA',
      bullets: ['Run social, email, and local marketing for a log-home restoration company.',
                'Capture and shape before/after stories that drive leads and referrals.'] },
    { role: 'Digital Content Creator',       company: 'FirstDay Learning',          dates: 'Aug 2025 to Jan 2026', city: 'Remote',
      bullets: ['Freelance video work, produced “get-to-know-me” employee videos for client outreach.'] },
    { role: 'Media Intern',                  company: 'Leaders Rising Network',     dates: 'Jun 2025 to Aug 2025', city: 'Internship',
      bullets: ['Summer internship across media production and content workflows.'] },
    { role: 'B.A., Media Arts & Design', company: 'James Madison University', dates: 'Aug 2021 to May 2025', city: 'Harrisonburg, VA',
      bullets: ['Concentration in Digital Video.'] },
  ],

  // Travel pins shown in the Resume “Explore My Travels” map. lon/lat place
  // the marker; edit copy + photos from the admin console.
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

  // Social handles shown on the growth stat. Each opens in a popup window.
  socials: {
    tiktok:    'https://www.tiktok.com/@cargli',
    instagram: 'https://www.instagram.com/cargli',
    youtube:   'https://www.youtube.com/@cargli',
  },

  nav: ['About', 'Video', 'Design', 'Resume'],

  // Order the scrolling sections appear in below the hero (editable from
  // the admin's Page Order panel). Hero and footer are always fixed.
  sectionOrder: ['about', 'videos', 'designs', 'resume', 'contact'],
};

window.CG_DATA = CG_DATA;

// Public-safe: Supabase's anon/publishable key + a table locked to
// read-only for anyone but the server (see api/save-content.js).
const CG_SUPABASE_URL = 'https://rodxrkzwpsgeeatmbwku.supabase.co';
const CG_SUPABASE_ANON_KEY = 'sb_publishable_fWE-gd3uSKDe0BpUK5WSxQ_f3Uzgd0x';

// ── Live overrides, published from the admin ────────────────────────
// The admin publishes to Supabase; we read it here at load time and merge
// it over the defaults. If Supabase is slow or unreachable, we give up
// quietly and the hardcoded copy above stands — the site never breaks.
window.CG_READY = (async function applyOverrides() {
  try {
    let o = null;
    try {
      const res = await Promise.race([
        fetch(`${CG_SUPABASE_URL}/rest/v1/site_content?select=data&id=eq.1`, {
          headers: { apikey: CG_SUPABASE_ANON_KEY },
        }),
        new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 3000)),
      ]);
      if (res && res.ok) {
        const rows = await res.json();
        if (rows && rows[0] && rows[0].data) o = rows[0].data;
      }
    } catch (e) { /* Supabase unreachable — hardcoded defaults stand */ }
    if (!o) return;
    // Copy revision: when data.jsx's authored copy is revised, stale saved
    // bio/tools from an older admin save must not win. Drop just those keys
    // and re-stamp the payload so later admin edits stick.
    if (o.copyRev !== window.CG_COPY_REV) {
      delete o.bio; delete o.tools;
      try {
        const restamped = { ...o, copyRev: window.CG_COPY_REV, bio: CG_DATA.bio, tools: CG_DATA.tools };
        if (window.CGStore && window.CGStore.saveSite) window.CGStore.saveSite(restamped);
        else localStorage.setItem('cg_site_data', JSON.stringify(restamped));
      } catch (e) {}
    }
    const keys = ['name', 'role', 'location', 'email', 'sinceYear', 'tools', 'bio', 'videos', 'designs', 'resume', 'travels', 'sectionOrder'];
    keys.forEach((k) => { if (o[k] != null) CG_DATA[k] = o[k]; });
    // socials merge field-by-field so a partial save keeps the defaults.
    if (o.socials && typeof o.socials === 'object') {
      CG_DATA.socials = { ...CG_DATA.socials, ...o.socials };
    }
    // designs may arrive with `size` instead of `span`, normalize.
    const S2 = { small: [1, 1], wide: [2, 1], tall: [1, 2], large: [2, 2] };
    if (Array.isArray(CG_DATA.designs)) {
      CG_DATA.designs = CG_DATA.designs.map((d) => ({
        title: d.title, kind: d.kind, desc: d.desc || '', span: d.span || S2[d.size] || [1, 1],
        color: d.color || '', image: d.image || '', pdf: d.pdf || '', thumb: d.thumb || '' }));
    }
    // tagline + closing live on the theme.
    if (window.CG_THEME) {
      if (o.tagline != null) window.CG_THEME.tagline = o.tagline;
      if (o.closing != null) window.CG_THEME.closing = o.closing;
    }
  } catch (e) { /* ignore malformed overrides */ }
})();
