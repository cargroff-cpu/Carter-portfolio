// portfolio.js — GENERATED from themes.jsx, data.jsx, motifs.jsx, portfolio.jsx, app.jsx by scripts/build-portfolio.mjs. Do not edit; edit the sources and run `npm run build:portfolio`.
// ── themes.jsx
(function () {
const PARLOR = {
  name: 'Parlor',
  vars: {
    '--bg': '#1a120b',
    '--bg-soft': '#221710',
    '--bg-deep': '#0f0a06',
    '--bg-warm': '#2a1c11',
    '--ink': '#ecd9b2',
    '--ink-soft': '#c9b48a',
    '--ink-mute': '#9a8462',
    '--ink-dim': '#5a4a36',
    '--amber': '#d99a3d',
    '--amber-lit': '#f5cd6a',
    '--amber-glow': 'rgba(217, 154, 61, 0.32)',
    '--terracotta': '#b8643f',
    '--terracotta-lit': '#c37350',
    '--sage': '#8e9462',
    '--sage-deep': '#5a6132',
    '--sage-pale': '#aab074',
    '--rule': 'rgba(236,217,178,0.16)',
    '--rule-strong': 'rgba(236,217,178,0.32)',
    '--card': '#241810',
    '--card-edge': 'rgba(236,217,178,0.10)',
    '--shadow': '0 30px 60px -30px rgba(0,0,0,0.85), 0 2px 6px rgba(0,0,0,0.6)',
    '--grain': '0.10'
  },
  display: '"Cormorant Garamond", "Newsreader", Georgia, serif',
  body: '"Spectral", Georgia, serif',
  ui: '"Karla", "Spectral", system-ui, sans-serif',
  displayWeight: 500,
  letterspacing: '-0.012em',
  tagline: 'Storytelling through strategy, screen, and design.',
  closing: '"Let’s make something worth remembering."'
};
window.CG_THEME = PARLOR;
(function injectGlobal() {
  if (document.getElementById('cg-globals')) return;
  const fontLink = document.createElement('link');
  fontLink.rel = 'stylesheet';
  fontLink.href = 'https://fonts.googleapis.com/css2' + '?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500;1,600' + '&family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,500;0,6..72,600;1,6..72,400' + '&family=Spectral:ital,wght@0,300;0,400;0,500;0,600;1,400;1,500' + '&family=Karla:wght@400;500;600' + '&display=swap';
  document.head.appendChild(fontLink);
  const s = document.createElement('style');
  s.id = 'cg-globals';
  s.textContent = `
    html, body { background: #0d0905; overflow-x: clip; }
    .cg-root, .cg-root * { box-sizing: border-box; }
    .cg-root { color: var(--ink); background: var(--bg); position: relative; }
    .cg-root img { display: block; max-width: 100%; }
    .cg-root a { color: inherit; }
    .cg-root ::selection { background: var(--amber); color: #0d0905; }

    /* ── Browser surfaces ────────────────────────────────────────────────
       The parts we didn't draw still have to read as the Parlor. Left at
       their defaults these ship as Chrome's blue/orange and betray the world. */
    html { color-scheme: dark; }
    .cg-root { accent-color: var(--amber); caret-color: var(--amber-lit); }
    .cg-root a:not([class]) { text-underline-offset: 0.18em; text-decoration-thickness: 1px; }
    /* Candle-lit focus ring: bone core so it reads on wood, amber bloom around it.
       :focus-visible only, so mouse users never see it. */
    .cg-root :focus-visible {
      outline: 2px solid var(--ink);
      outline-offset: 3px;
      border-radius: 1px;
    }
    .cg-root :focus-visible:not(input):not(textarea) {
      box-shadow: 0 0 0 5px rgba(217, 154, 61, 0.22), 0 0 18px -2px var(--amber-glow);
    }
    /* Inputs already draw their own lit underline; keep the ring tight on them. */
    .cg-root input:focus-visible, .cg-root textarea:focus-visible { outline-offset: 4px; }
    /* Numerals in dated/tabular material shouldn't wobble between rows. */
    .cg-root time, .cg-root .cg-num { font-variant-numeric: tabular-nums; }
    /* Scrollbar, dressed as a brass rail rather than system chrome. */
    .cg-root { scrollbar-color: var(--ink-dim) transparent; scrollbar-width: thin; }
    .cg-root ::-webkit-scrollbar { width: 10px; height: 10px; }
    .cg-root ::-webkit-scrollbar-track { background: var(--bg-deep); }
    .cg-root ::-webkit-scrollbar-thumb {
      background: var(--ink-dim); border: 2px solid var(--bg-deep); border-radius: 6px;
    }
    .cg-root ::-webkit-scrollbar-thumb:hover { background: var(--ink-mute); }

    /* Filmic grain overlay across the entire page. Sits above bg, below content. */
    .cg-grain::before {
      content: ''; position: fixed; inset: 0; pointer-events: none; z-index: 100;
      background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='220' height='220'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 1  0 0 0 0 0.85  0 0 0 0 0.55  0 0 0 0.45 0'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>");
      background-size: 220px 220px;
      mix-blend-mode: overlay;
      opacity: var(--grain);
    }

    /* Vertical wood-panel rhythm — used on certain sections.
       Fixed 34px panels (not percentage-based) so the rhythm reads the same
       density on a wide desktop screen as it does on a phone — a percentage
       width stretched each seam thin and faint on large viewports. */
    .cg-wood {
      background-color: var(--bg);
      background-image:
        repeating-linear-gradient(
          to right,
          transparent 0,
          transparent 33px,
          rgba(0,0,0,0.35) 33px,
          rgba(0,0,0,0.35) 34px,
          rgba(236,217,178,0.025) 34px,
          rgba(236,217,178,0.025) 35px,
          transparent 35px,
          transparent 68px
        );
    }
    /* Subtle horizontal grain mimicking sawn wood */
    .cg-wood::before {
      content: ''; position: absolute; inset: 0; pointer-events: none;
      background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='600' height='12'><filter id='g'><feTurbulence baseFrequency='0.02 0.9' numOctaves='2'/><feColorMatrix values='0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.5 0'/></filter><rect width='100%25' height='100%25' filter='url(%23g)'/></svg>");
      opacity: 0.30;
      mix-blend-mode: multiply;
    }

    /* Hand-drawn divider — minimal, restrained */
    .cg-divider { display: flex; align-items: center; justify-content: center; gap: 14px; margin: 0 auto; }
    .cg-divider .line { flex: 0 0 80px; height: 1px; background: var(--rule-strong); }
    .cg-divider .dot { width: 4px; height: 4px; background: var(--amber); transform: rotate(45deg); }

    /* Small label above a fact (Based in, Working since): Karla, sentence case, untracked */
    .cg-eyebrow {
      font-family: var(--ui-font); font-size: 13px; color: var(--amber); font-weight: 500;
    }

    /* Worn-photo card — used for both video + design tiles */
    .cg-photo {
      position: relative; background: var(--card);
      box-shadow: var(--shadow);
      border: 1px solid var(--card-edge);
      transition: transform .5s cubic-bezier(.2,.7,.3,1), box-shadow .4s ease, border-color .4s ease;
    }
    .cg-photo::after {
      content: ''; position: absolute; inset: 0; pointer-events: none;
      box-shadow: inset 0 0 60px rgba(0,0,0,0.6);
    }

    /* Pooled candle-light — used at hero + section accents */
    .cg-candlelight {
      position: absolute; pointer-events: none; border-radius: 50%;
      background: radial-gradient(circle, var(--amber-glow) 0%, rgba(217,154,61,0.06) 40%, transparent 70%);
      animation: cg-flicker 7s ease-in-out infinite;
      mix-blend-mode: screen;
    }
    @keyframes cg-flicker {
      0%, 100% { opacity: 1; transform: scale(1); }
      45% { opacity: 0.95; transform: scale(1.02); }
      48% { opacity: 0.78; transform: scale(0.99); }
      52% { opacity: 0.92; transform: scale(1.01); }
      70% { opacity: 0.88; transform: scale(1); }
    }

    /* Fade-in entrance */
    @keyframes cg-fadeup {
      from { opacity: 0; transform: translateY(22px); }
      to { opacity: 1; transform: none; }
    }

    /* Perched raven fades in once a bird "lands" on the lamp */
    /* The flying birds layer darkens against the warm wall */
    .cg-birds { mix-blend-mode: multiply; }

    /* ── Hero ambiance ─────────────────────────────────────────── */
    /* Candle pulse — warm amber/burnt-gold radial that breathes in opacity */
    @keyframes cg-candle-pulse {
      0%, 100% { opacity: 0.60; }
      50%      { opacity: 0.85; }
    }
    .cg-candle-pulse {
      position: absolute; pointer-events: none; border-radius: 50%;
      background: radial-gradient(circle,
        rgba(210,150,52,0.72) 0%,
        rgba(162,104,30,0.42) 34%,
        rgba(96,60,18,0.18) 58%,
        transparent 74%);
      animation: cg-candle-pulse 5.5s ease-in-out infinite;
      will-change: opacity;
    }

    /* Rain — fine near-vertical strokes drifting down */
    @keyframes cg-rain-fall {
      0%   { transform: translateY(-12vh) translateX(0); }
      100% { transform: translateY(112vh) translateX(8px); }
    }
    .cg-rain-drop {
      position: absolute; top: 0; width: 1.4px;
      background: linear-gradient(to bottom, transparent, rgba(228,214,186,0.85), transparent);
      animation-name: cg-rain-fall; animation-timing-function: linear;
      animation-iteration-count: infinite; will-change: transform;
    }

    /* Fog — slow lateral drift of large blurred bands */
    @keyframes cg-fog-a {
      0%   { transform: translateX(-16%); }
      50%  { transform: translateX(12%); }
      100% { transform: translateX(-16%); }
    }
    @keyframes cg-fog-b {
      0%   { transform: translateX(14%); }
      50%  { transform: translateX(-12%); }
      100% { transform: translateX(14%); }
    }
    /* Rolls a fog bank in from off the right, across, and off the left */
    @keyframes cg-fog-roll {
      0%   { transform: translateX(85%); opacity: 0; }
      14%  { opacity: 1; }
      85%  { opacity: 1; }
      100% { transform: translateX(-95%); opacity: 0; }
    }
    .cg-fog-band {
      position: absolute; pointer-events: none; left: -30%; right: -30%;
      height: 460px; filter: blur(46px); will-change: transform, opacity;
      mix-blend-mode: screen;
      background: radial-gradient(ellipse 50% 100% at 50% 50%,
        rgba(230,222,205,0.30) 0%, rgba(205,196,176,0.15) 40%, transparent 70%);
    }

    /* ── Lamp-top man (silhouette, hangs + swings + waves) ───────── */
    @keyframes cg-man-swing {
      0%, 100% { transform: rotate(-7deg); }
      50%      { transform: rotate(6deg); }
    }
    /* Gentle seated lean while lounging on the cap */
    @keyframes cg-man-lean {
      0%, 100% { transform: rotate(-3deg); }
      50%      { transform: rotate(2.5deg); }
    }
    /* Clinging to the pole — small shift + sway about the grip */
    @keyframes cg-man-cling {
      0%, 100% { transform: rotate(-4deg) translateY(0); }
      50%      { transform: rotate(4deg) translateY(1px); }
    }
    /* Spawn in at the bottom, climb up the name, settle on a letter */
    @keyframes cg-man-climb {
      0%   { transform: translate(0, 260px); opacity: 0; }
      8%   { opacity: 1; }
      30%  { transform: translate(9px, 178px); opacity: 1; }
      46%  { transform: translate(-8px, 132px); }
      62%  { transform: translate(8px, 84px); }
      78%  { transform: translate(-5px, 38px); }
      100% { transform: translate(0, 0); opacity: 1; }
    }
    .cg-man-climb { animation: cg-man-climb 4.4s cubic-bezier(0.4, 0.1, 0.5, 1) both; }
    @keyframes cg-man-freearm {
      0%, 58%, 100% { transform: rotate(8deg); }
      64% { transform: rotate(-104deg); }
      70% { transform: rotate(-128deg); }
      76% { transform: rotate(-104deg); }
      82% { transform: rotate(-128deg); }
      88% { transform: rotate(-106deg); }
      94% { transform: rotate(8deg); }
    }
    @keyframes cg-man-leg-a {
      0%, 100% { transform: rotate(5deg); }
      50%      { transform: rotate(-7deg); }
    }
    @keyframes cg-man-leg-b {
      0%, 100% { transform: rotate(-6deg); }
      50%      { transform: rotate(8deg); }
    }

    /* Portrait — slow, smooth float so the framed photo feels alive
       (GPU-composited transform; eased both ways to avoid any blockiness) */
    @keyframes cg-portrait-float {
      0%   { transform: translate3d(0, 0, 0) rotate(-0.4deg); }
      50%  { transform: translate3d(0, -10px, 0) rotate(0.4deg); }
      100% { transform: translate3d(0, 0, 0) rotate(-0.4deg); }
    }
    .cg-portrait-float {
      animation: cg-portrait-float 11s cubic-bezier(0.45, 0, 0.55, 1) infinite;
      will-change: transform;
    }

    /* Scroll-driven reveal — portrait eases in as the About section enters
       the viewport and eases back out as it leaves (progressive enhancement;
       only runs where scroll-timelines are supported). */
    @keyframes cg-portrait-reveal {
      0%   { opacity: 0; transform: translateX(-70px) scale(0.94); }
      24%  { opacity: 1; transform: translateX(0) scale(1); }
      76%  { opacity: 1; transform: translateX(0) scale(1); }
      100% { opacity: 0; transform: translateX(-70px) scale(0.94); }
    }
    @supports (animation-timeline: view()) {
      .cg-portrait-reveal {
        animation: cg-portrait-reveal linear both;
        animation-timeline: view();
        animation-range: entry 0% exit 100%;
        will-change: opacity, transform;
      }
    }

    /* Perched crow idle — slow sway about the feet, an occasional tail flick,
       and a faint vertical settle. Movement is deliberately minimal. */
    @keyframes cg-crow-sway {
      0%, 100% { transform: rotate(-1deg); }
      50%      { transform: rotate(1.3deg); }
    }
    @keyframes cg-crow-flick {
      0%, 58%, 100% { transform: skewX(0deg) translateY(0); }
      64%           { transform: skewX(-2.6deg) translateY(0.4px); }
      70%           { transform: skewX(1.4deg) translateY(0); }
      76%           { transform: skewX(0deg) translateY(0); }
    }
    @keyframes cg-crow-glow {
      0%, 100% { opacity: 0.85; }
      45%      { opacity: 1; }
      48%      { opacity: 0.72; }
      52%      { opacity: 0.95; }
    }
    .cg-fadeup { animation: cg-fadeup 1.4s cubic-bezier(.2,.7,.3,1) both; }
    .cg-fadeup-1 { animation-delay: 0.15s; }
    .cg-fadeup-2 { animation-delay: 0.35s; }
    .cg-fadeup-3 { animation-delay: 0.55s; }
    .cg-fadeup-4 { animation-delay: 0.75s; }

    /* Reveal-on-scroll */
    .cg-reveal { opacity: 0; transform: translateY(18px); transition: opacity 1s ease-out, transform 1s cubic-bezier(.2,.7,.3,1); }
    .cg-reveal.is-in { opacity: 1; transform: none; }

    /* Botanical corner motifs — delayed, gentle fade-and-rise as they scroll
       into view; kept slow and subtle so they read as ambience, not UI. */
    .cg-botanical { opacity: 0; transform: translateY(16px); transition: opacity 1.8s ease-out, transform 1.8s cubic-bezier(.2,.7,.3,1); }
    .cg-botanical.is-in { opacity: 1; transform: none; }

    /* Lightbox */
    .cg-lightbox {
      position: fixed; inset: 0; z-index: 1000;
      background: rgba(8, 5, 2, 0.55); backdrop-filter: blur(5px);
      display: flex; justify-content: center;
      overflow-y: auto; padding: 6vh 24px;
      animation: cg-fade .3s ease-out;
    }
    @keyframes cg-fade { from { opacity: 0; } to { opacity: 1; } }

    /* Social pop-up windows — transform-only pop so windows stay visible
       even if the entrance animation never samples (e.g. backgrounded tab). */
    @keyframes cgWinIn {
      from { transform: translateY(26px) scale(0.92); }
      to   { transform: none; }
    }
    .cg-handle:hover { color: var(--amber-lit) !important; border-bottom-color: var(--amber) !important; }

    /* ── Easter-egg candle flames ──────────────────────────────── */
    /* Organic flame dance: subtle scale + skew about the wick (origin bottom). */
    @keyframes cg-flame-dance {
      0%   { transform: scaleY(1)    scaleX(1)    skewX(0deg);   }
      20%  { transform: scaleY(1.06) scaleX(0.95) skewX(1.6deg); }
      40%  { transform: scaleY(0.96) scaleX(1.03) skewX(-1.4deg);}
      60%  { transform: scaleY(1.04) scaleX(0.97) skewX(1deg);   }
      80%  { transform: scaleY(0.98) scaleX(1.02) skewX(-0.8deg);}
      100% { transform: scaleY(1)    scaleX(1)    skewX(0deg);   }
    }
    /* Glow behind the flame breathes in brightness. */
    @keyframes cg-flame-glow {
      0%, 100% { opacity: 0.5; transform: scale(1);    }
      50%      { opacity: 0.82; transform: scale(1.12); }
    }
    /* Soft flicker on first appearance — quick uneven brightening. */
    @keyframes cg-candle-appear {
      0%   { opacity: 0; }
      25%  { opacity: 0.9; }
      40%  { opacity: 0.45; }
      60%  { opacity: 1; }
      75%  { opacity: 0.7; }
      100% { opacity: 1; }
    }
    /* Low mist drifting horizontally between the candle depth planes. */
    @keyframes cg-egg-fog-drift {
      0%   { transform: translate3d(-6%, 0, 0); }
      100% { transform: translate3d(6%, 0, 0); }
    }
    .cg-egg-fog {
      background:
        radial-gradient(60% 120% at 20% 60%, rgba(20,12,5,0.35) 0%, transparent 60%),
        radial-gradient(55% 110% at 62% 45%, rgba(20,12,5,0.30) 0%, transparent 58%),
        radial-gradient(50% 120% at 88% 70%, rgba(20,12,5,0.28) 0%, transparent 60%);
      filter: blur(26px);
      animation: cg-egg-fog-drift 14s ease-in-out infinite alternate;
      will-change: transform;
    }
    /* Barely-there smoke wisp rising + drifting from a near candle. */
    @keyframes cg-smoke-rise {
      0%   { opacity: 0;    transform: translateY(4px)   translateX(0)  scaleY(0.85); }
      20%  { opacity: 0.06; }
      100% { opacity: 0;    transform: translateY(-22px) translateX(6px) scaleY(1.3); }
    }
    /* Alternate flame motions — assigned per candle so no two move alike. */
    @keyframes cg-flame-dance-b {
      0%, 100% { transform: scaleY(1)    scaleX(1)    skewX(0deg);    }
      22%      { transform: scaleY(1.11) scaleX(0.9)  skewX(3.2deg);  }
      48%      { transform: scaleY(0.93) scaleX(1.06) skewX(-2.8deg); }
      72%      { transform: scaleY(1.06) scaleX(0.95) skewX(2.2deg);  }
    }
    @keyframes cg-flame-dance-c { /* guttering — bobs vertically + quick flutter */
      0%, 100% { transform: scaleY(1)    translateY(0)     skewX(0deg);    }
      15%      { transform: scaleY(0.85) translateY(1.1px) skewX(-1.8deg); }
      36%      { transform: scaleY(1.14) translateY(-0.6px) skewX(2.4deg); }
      58%      { transform: scaleY(0.9)  translateY(0.7px) skewX(-1.2deg); }
      80%      { transform: scaleY(1.07) translateY(-0.3px) skewX(1.6deg); }
    }
    @keyframes cg-flame-dance-d { /* lazy, wide sway */
      0%, 100% { transform: scaleY(1)    scaleX(1)    skewX(-1deg); }
      33%      { transform: scaleY(1.04) scaleX(0.98) skewX(2.6deg); }
      66%      { transform: scaleY(0.97) scaleX(1.03) skewX(-2.4deg); }
    }
  `;
  document.head.appendChild(s);
})();
})();
// ── data.jsx
(function () {
window.CG_COPY_REV = 6;
const CG_DATA = {
  name: 'Carter Groff',
  role: 'Marketing & Media',
  location: 'Harrisonburg, Virginia',
  email: 'car.groff@gmail.com',
  initials: 'CG',
  tools: 'video · copy · design · strategy',
  bio: ['Hi, I’m Carter, a marketer, video editor, designer, and storyteller. I edit video, build social and email campaigns, design the pieces that go with them, and find the through-line that ties it all together, whatever the medium.', 'These days I run marketing for Log & Timber Worx, where we restore century-old log homes and give them a second act, turning worn timber and old stories into something new again. Before that, I spent four years at James Madison University studying media arts and design with a concentration in digital video and cinema.', 'Most of what I make is about paying attention, to the material, the people, the details that don’t announce themselves. If that’s the kind of work you’re after, my inbox is open.'],
  videos: [{
    title: 'Restoration, Bryan Place',
    kind: 'Brand Video',
    year: '2026',
    desc: 'A six-month log home restoration from first cut to final stain.',
    length: '4:12'
  }, {
    title: 'Before / After',
    kind: 'Social Series',
    year: '2026',
    desc: 'Ongoing social-first series capturing log home transformations one porch at a time.',
    length: '1:00'
  }, {
    title: 'Hands at Work',
    kind: 'Documentary Short',
    year: '2025',
    desc: 'A quiet portrait of the craftsmen behind Log & Timber Worx, shot over a single workday.',
    length: '6:48'
  }, {
    title: 'FirstDay, Meet the Team',
    kind: 'Employer Brand',
    year: '2025',
    desc: 'Five short "get-to-know" videos produced freelance for FirstDay Learning client outreach.',
    length: '0:45'
  }, {
    title: 'Leaders Rising, Promo',
    kind: 'Internship Reel',
    year: '2025',
    desc: 'Promotional video work produced during a media internship with Leaders Rising Network.',
    length: '1:20'
  }, {
    title: 'Senior Capstone',
    kind: 'Capstone Short',
    year: '2025',
    desc: 'Final capstone project at JMU, made in the digital video & cinema concentration.',
    length: '8:30'
  }],
  designs: [{
    title: 'Log & Timber Worx',
    kind: 'Marketing System',
    span: [2, 2],
    desc: 'The full marketing system for a log-home restoration company, logo, color, social templates, and signage built to feel hand-hewn.'
  }, {
    title: 'Capstone Identity',
    kind: 'Brand & Print',
    span: [1, 1],
    desc: 'Brand identity and print collateral developed for my senior capstone at James Madison University.'
  }, {
    title: 'FirstDay Toolkit',
    kind: 'Social Templates',
    span: [1, 2],
    desc: 'A reusable social-media template kit for FirstDay Learning, flexible layouts for recurring campaigns.'
  }, {
    title: 'Field Notes',
    kind: 'Editorial / Zine',
    span: [1, 1],
    desc: 'A small editorial zine collecting field notes, photography, and type experiments.'
  }, {
    title: 'Leaders Rising',
    kind: 'Event Identity',
    span: [1, 1],
    desc: 'Event identity and promotional materials produced for the Leaders Rising Network.'
  }, {
    title: 'Restoration Posters',
    kind: 'Print Series',
    span: [2, 1],
    desc: 'A print poster series documenting log-home restorations, the before-and-after, side by side.'
  }, {
    title: 'Email Campaigns',
    kind: 'Lifecycle Design',
    span: [1, 1],
    desc: 'Lifecycle email design, onboarding, nurture, and re-engagement flows with a warm, editorial feel.'
  }, {
    title: 'SMAD Senior Show',
    kind: 'Exhibition Identity',
    span: [1, 1],
    desc: 'Exhibition identity for the SMAD senior show, signage, program, and wayfinding.'
  }, {
    title: 'Personal Mark',
    kind: 'Identity',
    span: [1, 1],
    desc: 'My personal monogram and identity system, the mark behind this site.'
  }],
  resume: [{
    role: 'Marketing and Automation Lead',
    company: 'Log & Timber Worx',
    dates: 'Sep 2026 to Present',
    city: 'Harrisonburg, VA',
    promoted: 'Promoted from Marketing Assistant',
    bullets: ['Lead marketing for a log-home restoration company across social, email, paid search, and direct mail.', 'Build the operations tools the office and field crews run on, from scheduling to customer calls to job checklists.']
  }, {
    role: 'Marketing Assistant',
    company: 'Log & Timber Worx',
    dates: 'Oct 2025 to Sep 2026',
    city: 'Harrisonburg, VA',
    bullets: ['Run social, email, and local marketing for a log-home restoration company.', 'Capture and shape before/after stories that drive leads and referrals.']
  }, {
    role: 'Digital Content Creator',
    company: 'FirstDay Learning',
    dates: 'Aug 2025 to Jan 2026',
    city: 'Remote',
    bullets: ['Freelance video work, produced “get-to-know-me” employee videos for client outreach.']
  }, {
    role: 'Media Intern',
    company: 'Leaders Rising Network',
    dates: 'Jun 2025 to Aug 2025',
    city: 'Internship',
    bullets: ['Summer internship across media production and content workflows.']
  }, {
    role: 'B.A., Media Arts & Design',
    company: 'James Madison University',
    dates: 'Aug 2021 to May 2025',
    city: 'Harrisonburg, VA',
    bullets: ['Concentration in Digital Video.']
  }],
  travels: [{
    id: 't1',
    name: 'Japan',
    year: '2024',
    lon: 139.6,
    lat: 35.6,
    image: '',
    blurb: 'Spent time studying Japanese business and culture through a formal study abroad program at James Madison University. Immersed in daily life across Tokyo and surrounding regions, gaining firsthand exposure to Japanese professional customs, communication styles, and creative industries.'
  }, {
    id: 't2',
    name: 'Romania',
    year: '2025',
    lon: 24.9,
    lat: 45.9,
    image: '',
    blurb: 'Traveled with Project Ruth to work alongside a local school, leading educational workshops for teachers and spending time with children in the community. The experience was hands-on and relational, focused on meaningful cross-cultural exchange and service.'
  }, {
    id: 't3',
    name: 'Iceland',
    year: '2025',
    lon: -18.1,
    lat: 64.9,
    image: '',
    blurb: 'Completed a solo van journey along the Iceland Ring Road over the course of a week. Navigated remote landscapes, volcanic terrain, and coastal cliffs entirely independently, an exercise in self-reliance, adaptability, and finding stillness in unfamiliar places.'
  }, {
    id: 't4',
    name: 'Guatemala',
    year: '2025',
    lon: -90.4,
    lat: 15.5,
    image: '',
    blurb: 'Joined a Teams Commissioned for Christ International mission, contributing to construction projects, painting, and community outreach. Worked alongside a diverse team in a rural setting, focused on practical service and building connections across language and culture.'
  }],
  socials: {
    tiktok: 'https://www.tiktok.com/@cargli',
    instagram: 'https://www.instagram.com/cargli',
    youtube: 'https://www.youtube.com/@cargli'
  },
  nav: ['About', 'Video', 'Design', 'Resume'],
  sectionOrder: ['about', 'videos', 'designs', 'resume', 'contact']
};
window.CG_DATA = CG_DATA;
const CG_SUPABASE_URL = 'https://rodxrkzwpsgeeatmbwku.supabase.co';
const CG_SUPABASE_ANON_KEY = 'sb_publishable_fWE-gd3uSKDe0BpUK5WSxQ_f3Uzgd0x';
window.CG_READY = async function applyOverrides() {
  try {
    let o = null;
    try {
      const res = await Promise.race([fetch(`${CG_SUPABASE_URL}/rest/v1/site_content?select=data&id=eq.1`, {
        headers: {
          apikey: CG_SUPABASE_ANON_KEY
        }
      }), new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 3000))]);
      if (res && res.ok) {
        const rows = await res.json();
        if (rows && rows[0] && rows[0].data) o = rows[0].data;
      }
    } catch (e) {}
    if (!o) return;
    if (o.copyRev !== window.CG_COPY_REV) {
      delete o.bio;
      delete o.tools;
      try {
        const restamped = {
          ...o,
          copyRev: window.CG_COPY_REV,
          bio: CG_DATA.bio,
          tools: CG_DATA.tools
        };
        if (window.CGStore && window.CGStore.saveSite) window.CGStore.saveSite(restamped);else localStorage.setItem('cg_site_data', JSON.stringify(restamped));
      } catch (e) {}
    }
    const keys = ['name', 'role', 'location', 'email', 'sinceYear', 'tools', 'bio', 'videos', 'designs', 'resume', 'travels', 'sectionOrder'];
    keys.forEach(k => {
      if (o[k] != null) CG_DATA[k] = o[k];
    });
    if (window.CGStore && window.CGStore.migrateResume) CG_DATA.resume = window.CGStore.migrateResume(CG_DATA.resume);
    if (o.socials && typeof o.socials === 'object') {
      CG_DATA.socials = {
        ...CG_DATA.socials,
        ...o.socials
      };
    }
    const S2 = {
      small: [1, 1],
      wide: [2, 1],
      tall: [1, 2],
      large: [2, 2]
    };
    if (Array.isArray(CG_DATA.designs)) {
      CG_DATA.designs = CG_DATA.designs.map(d => ({
        title: d.title,
        kind: d.kind,
        desc: d.desc || '',
        span: d.span || S2[d.size] || [1, 1],
        color: d.color || '',
        image: d.image || '',
        pdf: d.pdf || '',
        thumb: d.thumb || ''
      }));
    }
    if (window.CG_THEME) {
      if (o.tagline != null) window.CG_THEME.tagline = o.tagline;
      if (o.closing != null) window.CG_THEME.closing = o.closing;
    }
  } catch (e) {}
}();
})();
// ── motifs.jsx
(function () {
function PhotoPlaceholder({
  title,
  subtitle,
  hue,
  ratio = '4/3',
  icon,
  tilt = 0,
  badge = null,
  fill = false,
  dim = false
}) {
  const noise = "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2'/><feColorMatrix values='0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.7 0'/></filter><rect width='100%25' height='100%25' filter='url(%23n)' opacity='0.6'/></svg>\")";
  return React.createElement("div", {
    className: "cg-photo",
    style: {
      aspectRatio: fill ? undefined : ratio,
      height: fill ? '100%' : undefined,
      width: '100%',
      transform: `rotate(${tilt}deg)`,
      position: 'relative',
      overflow: 'hidden',
      cursor: 'pointer'
    }
  }, React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      background: hue
    }
  }), React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      backgroundImage: noise,
      mixBlendMode: 'multiply',
      opacity: 0.6
    }
  }), React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      background: 'radial-gradient(ellipse at 35% 30%, rgba(228,180,90,0.18) 0%, transparent 50%), linear-gradient(135deg, transparent 50%, rgba(10,6,2,0.55) 100%)'
    }
  }), dim && React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      background: 'rgba(10,6,2,0.35)'
    }
  }), React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 6,
      border: '1px solid rgba(236,217,178,0.08)',
      pointerEvents: 'none'
    }
  }), icon && React.createElement("div", {
    style: {
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -60%)',
      color: 'rgba(236,217,178,0.20)',
      fontSize: 64,
      fontFamily: 'serif'
    }
  }, icon), (title || subtitle) && React.createElement("div", {
    style: {
      position: 'absolute',
      left: 18,
      right: 18,
      bottom: 16,
      color: 'var(--ink)',
      textShadow: '0 1px 6px rgba(0,0,0,0.7)'
    }
  }, subtitle && React.createElement("div", {
    style: {
      fontFamily: 'var(--ui-font)',
      fontSize: 13,
      color: 'var(--amber)',
      marginBottom: 6,
      opacity: 0.9
    }
  }, subtitle), title && React.createElement("div", {
    style: {
      fontFamily: 'var(--display-font)',
      fontSize: 22,
      lineHeight: 1.1,
      letterSpacing: '-0.01em'
    }
  }, title)), badge && React.createElement("div", {
    style: {
      position: 'absolute',
      top: 14,
      right: 14
    }
  }, badge));
}
function PaperFrame({
  children,
  tilt = 0,
  padding = 0,
  style = {}
}) {
  return React.createElement("div", {
    style: {
      background: 'var(--card)',
      padding,
      boxShadow: 'var(--shadow)',
      border: '1px solid var(--card-edge)',
      transform: `rotate(${tilt}deg)`,
      position: 'relative',
      transition: 'transform .5s cubic-bezier(.2,.7,.3,1), box-shadow .4s ease',
      ...style
    }
  }, children);
}
function GasLamp({
  height = 640,
  style = {},
  out = false,
  onGlobeClick,
  variant
}) {
  const halo = {
    opacity: out ? 0 : 1,
    transition: `opacity ${out ? 0.3 : 0.5}s ease`
  };
  const darkGlobe = {
    opacity: out ? 1 : 0,
    transition: `opacity ${out ? 0.3 : 0.5}s ease`
  };
  return React.createElement("svg", {
    viewBox: "0 0 200 900",
    width: height * 200 / 900,
    height: height,
    style: {
      display: 'block',
      overflow: 'visible',
      ...style
    }
  }, React.createElement("defs", null, React.createElement("linearGradient", {
    id: "lamp-iron",
    x1: "0",
    y1: "0",
    x2: "1",
    y2: "0"
  }, React.createElement("stop", {
    offset: "0%",
    stopColor: "#070403"
  }), React.createElement("stop", {
    offset: "50%",
    stopColor: "#100a06"
  }), React.createElement("stop", {
    offset: "100%",
    stopColor: "#241608"
  })), React.createElement("linearGradient", {
    id: "lamp-rust",
    x1: "0",
    y1: "0",
    x2: "0",
    y2: "1"
  }, React.createElement("stop", {
    offset: "0%",
    stopColor: "#5a2a10"
  }), React.createElement("stop", {
    offset: "100%",
    stopColor: "#2a1408"
  })), React.createElement("radialGradient", {
    id: "lamp-glass",
    cx: "50%",
    cy: "45%",
    r: "70%"
  }, React.createElement("stop", {
    offset: "0%",
    stopColor: "#fff5d0"
  }), React.createElement("stop", {
    offset: "40%",
    stopColor: "#f4c478"
  }), React.createElement("stop", {
    offset: "80%",
    stopColor: "#c6862c"
  }), React.createElement("stop", {
    offset: "100%",
    stopColor: "#6e3a10"
  })), React.createElement("linearGradient", {
    id: "lamp-glassHi",
    x1: "0",
    y1: "0",
    x2: "1",
    y2: "0"
  }, React.createElement("stop", {
    offset: "78%",
    stopColor: "#fff5d8",
    stopOpacity: "0"
  }), React.createElement("stop", {
    offset: "94%",
    stopColor: "#fff5d8",
    stopOpacity: "0.6"
  }), React.createElement("stop", {
    offset: "100%",
    stopColor: "#fff5d8",
    stopOpacity: "0"
  })), React.createElement("radialGradient", {
    id: "lamp-halo",
    cx: "50%",
    cy: "50%",
    r: "50%"
  }, React.createElement("stop", {
    offset: "0%",
    stopColor: "#f5cd6a",
    stopOpacity: "0.62"
  }), React.createElement("stop", {
    offset: "22%",
    stopColor: "#e7b357",
    stopOpacity: "0.34"
  }), React.createElement("stop", {
    offset: "48%",
    stopColor: "#d99a3d",
    stopOpacity: "0.15"
  }), React.createElement("stop", {
    offset: "74%",
    stopColor: "#c98a34",
    stopOpacity: "0.05"
  }), React.createElement("stop", {
    offset: "100%",
    stopColor: "#c98a34",
    stopOpacity: "0"
  }))), React.createElement("g", {
    style: halo
  }, React.createElement("g", {
    transform: variant ? 'translate(0 22.5)' : undefined
  }, React.createElement("animate", {
    attributeName: "opacity",
    values: "0.95;0.95;0.6;0.95;0.95;0.7;0.95",
    keyTimes: "0;0.45;0.52;0.6;0.82;0.88;1",
    dur: "9s",
    repeatCount: "indefinite"
  }), React.createElement("ellipse", {
    cx: "104",
    cy: "96",
    rx: "300",
    ry: "250",
    fill: "url(#lamp-halo)"
  }), React.createElement("ellipse", {
    cx: "70",
    cy: "150",
    rx: "190",
    ry: "230",
    fill: "url(#lamp-halo)",
    opacity: "0.7"
  }), React.createElement("ellipse", {
    cx: "140",
    cy: "70",
    rx: "170",
    ry: "150",
    fill: "url(#lamp-halo)",
    opacity: "0.6"
  }))), variant ? React.createElement("g", null, React.createElement("ellipse", {
    cx: "100",
    cy: "899",
    rx: "88",
    ry: "6",
    fill: "#000",
    opacity: "0.55"
  }), React.createElement("image", {
    href: `/assets/lamps/${variant}-out.webp`,
    x: "0",
    y: "8.5",
    width: "200",
    height: "900",
    preserveAspectRatio: "none"
  }), React.createElement("image", {
    className: "lamp-lit",
    href: `/assets/lamps/${variant}-lit.webp`,
    x: "0",
    y: "8.5",
    width: "200",
    height: "900",
    preserveAspectRatio: "none",
    style: {
      opacity: out ? 0 : 1,
      transition: `opacity ${out ? 0.3 : 0.5}s ease`
    }
  }), React.createElement("path", {
    d: "M 70 94.5 L 130 94.5 L 122 144.5 L 78 144.5 Z",
    fill: "#1a1008",
    style: {
      opacity: 0
    }
  })) : React.createElement(React.Fragment, null, React.createElement("path", {
    d: "M 100 6 L 100.8 24 L 100 27 L 99.2 24 Z",
    fill: "url(#lamp-iron)"
  }), React.createElement("ellipse", {
    cx: "100",
    cy: "27",
    rx: "1.6",
    ry: "1.0",
    fill: "url(#lamp-iron)"
  }), React.createElement("rect", {
    x: "96",
    y: "28",
    width: "8",
    height: "3",
    fill: "url(#lamp-iron)"
  }), React.createElement("rect", {
    x: "93",
    y: "31",
    width: "14",
    height: "1.5",
    fill: "url(#lamp-iron)"
  }), React.createElement("path", {
    d: "M 93 32.5 L 107 32.5 L 126 56 L 74 56 Z",
    fill: "url(#lamp-iron)"
  }), React.createElement("path", {
    d: "M 93 32.5 L 100 32.5 L 100 33 L 74 56 Z",
    fill: "#000",
    opacity: "0.4"
  }), React.createElement("path", {
    d: "M 100 32.5 L 107 32.5 L 126 56 L 100 33 Z",
    fill: "#3a2614",
    opacity: "0.55"
  }), React.createElement("line", {
    x1: "100",
    y1: "32.5",
    x2: "100",
    y2: "56",
    stroke: "#000",
    strokeWidth: "0.5",
    opacity: "0.5"
  }), React.createElement("rect", {
    x: "74",
    y: "56",
    width: "52",
    height: "1.5",
    fill: "#0a0604"
  }), React.createElement("rect", {
    x: "74",
    y: "58",
    width: "52",
    height: "4",
    fill: "url(#lamp-iron)"
  }), React.createElement("rect", {
    x: "74",
    y: "62",
    width: "52",
    height: "1",
    fill: "url(#lamp-rust)",
    opacity: "0.85"
  }), React.createElement("path", {
    d: "M 74 63 L 126 63 L 132 72 L 68 72 Z",
    fill: "url(#lamp-iron)"
  }), React.createElement("rect", {
    x: "68",
    y: "72",
    width: "64",
    height: "3",
    fill: "url(#lamp-iron)"
  }), React.createElement("rect", {
    x: "68",
    y: "75",
    width: "64",
    height: "1.2",
    fill: "url(#lamp-rust)",
    opacity: "0.85"
  }), React.createElement("g", null, React.createElement("path", {
    d: "M 70 76.5 L 130 76.5 L 122 128 L 78 128 Z",
    fill: "url(#lamp-glass)"
  }), React.createElement("path", {
    d: "M 70 76.5 L 130 76.5 L 122 128 L 78 128 Z",
    fill: "url(#lamp-glassHi)"
  }), React.createElement("line", {
    x1: "71",
    y1: "76.5",
    x2: "79",
    y2: "128",
    stroke: "#0a0604",
    strokeWidth: "1.4",
    strokeLinecap: "round"
  }), React.createElement("line", {
    x1: "129",
    y1: "76.5",
    x2: "121",
    y2: "128",
    stroke: "#0a0604",
    strokeWidth: "1.4",
    strokeLinecap: "round"
  }), React.createElement("line", {
    x1: "87",
    y1: "76.5",
    x2: "91",
    y2: "128",
    stroke: "#1a1208",
    strokeWidth: "0.8"
  }), React.createElement("line", {
    x1: "113",
    y1: "76.5",
    x2: "109",
    y2: "128",
    stroke: "#1a1208",
    strokeWidth: "0.8"
  }), React.createElement("line", {
    x1: "100",
    y1: "79",
    x2: "100",
    y2: "126",
    stroke: "#fff5db",
    strokeOpacity: "0.42",
    strokeWidth: "0.6"
  }), React.createElement("path", {
    d: "M 118 84 Q 121 104, 116 124",
    stroke: "#fff5db",
    strokeWidth: "1.3",
    strokeOpacity: "0.6",
    fill: "none"
  })), React.createElement("path", {
    d: "M 70 76.5 L 130 76.5 L 122 128 L 78 128 Z",
    fill: "#1a1008",
    style: darkGlobe
  }), React.createElement("rect", {
    x: "76",
    y: "128",
    width: "48",
    height: "3",
    fill: "url(#lamp-iron)"
  }), React.createElement("rect", {
    x: "76",
    y: "131",
    width: "48",
    height: "1.2",
    fill: "url(#lamp-rust)",
    opacity: "0.85"
  }), React.createElement("path", {
    d: "M 80 132.2 L 120 132.2 L 113 139 L 87 139 Z",
    fill: "url(#lamp-iron)"
  }), React.createElement("rect", {
    x: "88",
    y: "139",
    width: "24",
    height: "2",
    fill: "url(#lamp-iron)"
  }), React.createElement("path", {
    d: "M 88 141 L 112 141 L 107 146 L 93 146 Z",
    fill: "url(#lamp-iron)"
  }), React.createElement("ellipse", {
    cx: "100",
    cy: "148.5",
    rx: "3.5",
    ry: "3",
    fill: "url(#lamp-iron)"
  }), React.createElement("path", {
    d: "M 100 151 L 100.6 154 L 100 155 L 99.4 154 Z",
    fill: "url(#lamp-iron)"
  }), React.createElement("path", {
    d: "M 86 151 L 114 151 L 110 164 L 90 164 Z",
    fill: "url(#lamp-iron)"
  }), React.createElement("path", {
    d: "M 90 164 L 110 164 L 106 176 L 94 176 Z",
    fill: "url(#lamp-iron)"
  }), React.createElement("rect", {
    x: "92",
    y: "176",
    width: "16",
    height: "3",
    fill: "url(#lamp-iron)"
  }), React.createElement("path", {
    d: "M 94 179 L 106 179 Q 108 188, 104 198 L 96 198 Q 92 188, 94 179 Z",
    fill: "url(#lamp-iron)"
  }), React.createElement("rect", {
    x: "92",
    y: "198",
    width: "16",
    height: "3",
    fill: "url(#lamp-iron)"
  }), React.createElement("rect", {
    x: "92",
    y: "201",
    width: "16",
    height: "1",
    fill: "url(#lamp-rust)",
    opacity: "0.8"
  }), React.createElement("rect", {
    x: "97",
    y: "202",
    width: "6",
    height: "200",
    fill: "url(#lamp-iron)"
  }), React.createElement("line", {
    x1: "103",
    y1: "205",
    x2: "103",
    y2: "400",
    stroke: "#3a2614",
    strokeWidth: "0.6",
    opacity: "0.7"
  }), React.createElement("line", {
    x1: "98",
    y1: "205",
    x2: "98",
    y2: "400",
    stroke: "#000",
    strokeWidth: "0.4",
    opacity: "0.6"
  }), React.createElement("rect", {
    x: "92",
    y: "402",
    width: "16",
    height: "3",
    fill: "url(#lamp-iron)"
  }), React.createElement("rect", {
    x: "94",
    y: "405",
    width: "12",
    height: "4",
    fill: "url(#lamp-iron)"
  }), React.createElement("rect", {
    x: "92",
    y: "409",
    width: "16",
    height: "3",
    fill: "url(#lamp-iron)"
  }), React.createElement("rect", {
    x: "92",
    y: "412",
    width: "16",
    height: "1",
    fill: "url(#lamp-rust)",
    opacity: "0.8"
  }), React.createElement("rect", {
    x: "97",
    y: "413",
    width: "6",
    height: "200",
    fill: "url(#lamp-iron)"
  }), React.createElement("line", {
    x1: "103",
    y1: "416",
    x2: "103",
    y2: "611",
    stroke: "#3a2614",
    strokeWidth: "0.6",
    opacity: "0.7"
  }), React.createElement("line", {
    x1: "98",
    y1: "416",
    x2: "98",
    y2: "611",
    stroke: "#000",
    strokeWidth: "0.4",
    opacity: "0.6"
  }), React.createElement("rect", {
    x: "92",
    y: "613",
    width: "16",
    height: "3",
    fill: "url(#lamp-iron)"
  }), React.createElement("path", {
    d: "M 94 616 L 106 616 Q 108 624, 104 632 L 96 632 Q 92 624, 94 616 Z",
    fill: "url(#lamp-iron)"
  }), React.createElement("rect", {
    x: "92",
    y: "632",
    width: "16",
    height: "3",
    fill: "url(#lamp-iron)"
  }), React.createElement("rect", {
    x: "92",
    y: "635",
    width: "16",
    height: "1",
    fill: "url(#lamp-rust)",
    opacity: "0.8"
  }), React.createElement("rect", {
    x: "97",
    y: "636",
    width: "6",
    height: "48",
    fill: "url(#lamp-iron)"
  }), React.createElement("rect", {
    x: "92",
    y: "684",
    width: "16",
    height: "4",
    fill: "url(#lamp-iron)"
  }), React.createElement("rect", {
    x: "89",
    y: "688",
    width: "22",
    height: "3",
    fill: "url(#lamp-iron)"
  }), React.createElement("rect", {
    x: "89",
    y: "691",
    width: "22",
    height: "1.5",
    fill: "url(#lamp-rust)",
    opacity: "0.8"
  }), React.createElement("path", {
    d: "M 90 693 C 85 708, 76 715, 73 734 C 70 754, 79 772, 88 786 L 112 786 C 121 772, 130 754, 127 734 C 124 715, 115 708, 110 693 Z",
    fill: "url(#lamp-iron)"
  }), React.createElement("path", {
    d: "M 90 693 C 85 708, 76 715, 73 734 C 70 754, 79 772, 88 786 L 100 786 L 100 693 Z",
    fill: "#000",
    opacity: "0.18"
  }), React.createElement("g", {
    fill: "none",
    opacity: "0.6"
  }, React.createElement("path", {
    d: "M 84 700 C 79 720, 80 760, 86 784",
    stroke: "#000",
    strokeWidth: "0.5"
  }), React.createElement("path", {
    d: "M 100 698 L 100 784",
    stroke: "#2a1810",
    strokeWidth: "0.5"
  }), React.createElement("path", {
    d: "M 116 700 C 121 720, 120 760, 114 784",
    stroke: "#3a2514",
    strokeWidth: "0.5"
  })), React.createElement("rect", {
    x: "70",
    y: "786",
    width: "60",
    height: "5",
    fill: "url(#lamp-iron)"
  }), React.createElement("rect", {
    x: "68",
    y: "791",
    width: "64",
    height: "3",
    fill: "url(#lamp-iron)"
  }), React.createElement("rect", {
    x: "68",
    y: "794",
    width: "64",
    height: "1.5",
    fill: "url(#lamp-rust)",
    opacity: "0.85"
  }), React.createElement("rect", {
    x: "66",
    y: "796",
    width: "68",
    height: "26",
    fill: "url(#lamp-iron)"
  }), React.createElement("rect", {
    x: "64",
    y: "800",
    width: "72",
    height: "2",
    fill: "#000",
    opacity: "0.22"
  }), React.createElement("rect", {
    x: "77",
    y: "802",
    width: "46",
    height: "16",
    fill: "#3a2514",
    opacity: "0.14",
    stroke: "#000",
    strokeOpacity: "0.4",
    strokeWidth: "0.6"
  }), React.createElement("rect", {
    x: "58",
    y: "822",
    width: "84",
    height: "32",
    fill: "url(#lamp-iron)"
  }), React.createElement("rect", {
    x: "56",
    y: "826",
    width: "88",
    height: "2",
    fill: "#000",
    opacity: "0.22"
  }), React.createElement("rect", {
    x: "71",
    y: "828",
    width: "58",
    height: "20",
    fill: "#3a2514",
    opacity: "0.14",
    stroke: "#000",
    strokeOpacity: "0.4",
    strokeWidth: "0.6"
  }), React.createElement("path", {
    d: "M 50 854 L 150 854 L 154 878 L 46 878 Z",
    fill: "url(#lamp-iron)"
  }), React.createElement("rect", {
    x: "42",
    y: "878",
    width: "116",
    height: "21",
    fill: "url(#lamp-iron)"
  }), React.createElement("line", {
    x1: "42",
    y1: "880",
    x2: "158",
    y2: "880",
    stroke: "#000",
    strokeWidth: "0.6",
    opacity: "0.6"
  }), React.createElement("rect", {
    x: "42",
    y: "895",
    width: "116",
    height: "4",
    fill: "url(#lamp-rust)",
    opacity: "0.7"
  }), React.createElement("ellipse", {
    cx: "100",
    cy: "898",
    rx: "86",
    ry: "6",
    fill: "#000",
    opacity: "0.55"
  })), out && onGlobeClick && !variant && React.createElement("ellipse", {
    cx: "100",
    cy: "102",
    rx: "60",
    ry: "78",
    fill: "rgba(217,154,61,0.16)",
    style: {
      filter: 'blur(9px)',
      pointerEvents: 'none'
    }
  }, React.createElement("animate", {
    attributeName: "opacity",
    values: "0.5;1;0.5",
    dur: "3.4s",
    repeatCount: "indefinite"
  })), onGlobeClick && React.createElement("rect", {
    x: "26",
    y: "18",
    width: "148",
    height: "200",
    rx: "24",
    fill: "transparent",
    onClick: onGlobeClick,
    style: {
      cursor: 'pointer',
      pointerEvents: 'auto',
      outline: 'none',
      WebkitTapHighlightColor: 'transparent'
    }
  }));
}
function hash(i) {
  const x = Math.sin(i * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
}
function BotanicalDefs() {
  return React.createElement("svg", {
    width: "0",
    height: "0",
    "aria-hidden": "true",
    style: {
      position: 'absolute',
      overflow: 'hidden',
      pointerEvents: 'none'
    }
  }, React.createElement("defs", null, React.createElement("filter", {
    id: "cg-leaf-grain",
    x: "-10%",
    y: "-10%",
    width: "120%",
    height: "120%"
  }, React.createElement("feTurbulence", {
    type: "fractalNoise",
    baseFrequency: "1.4",
    numOctaves: "2",
    seed: "7"
  }), React.createElement("feColorMatrix", {
    values: "0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.28 0"
  }), React.createElement("feComposite", {
    in2: "SourceGraphic",
    operator: "in"
  }), React.createElement("feMerge", null, React.createElement("feMergeNode", {
    in: "SourceGraphic"
  }), React.createElement("feMergeNode", null))), React.createElement("radialGradient", {
    id: "cg-berry",
    cx: "32%",
    cy: "30%",
    r: "75%"
  }, React.createElement("stop", {
    offset: "0%",
    stopColor: "#e8b878"
  }), React.createElement("stop", {
    offset: "45%",
    stopColor: "#b46a32"
  }), React.createElement("stop", {
    offset: "100%",
    stopColor: "#3a1808"
  })), React.createElement("radialGradient", {
    id: "cg-leaf-shade",
    cx: "15%",
    cy: "50%",
    r: "40%"
  }, React.createElement("stop", {
    offset: "0%",
    stopColor: "#000",
    stopOpacity: "0.35"
  }), React.createElement("stop", {
    offset: "60%",
    stopColor: "#000",
    stopOpacity: "0.10"
  }), React.createElement("stop", {
    offset: "100%",
    stopColor: "#000",
    stopOpacity: "0"
  }))));
}
function Leaf({
  L = 20,
  weight = 0.8,
  style = 'solid',
  flipBelly = false
}) {
  const a = flipBelly ? 0.18 : 0.26;
  const b = flipBelly ? 0.26 : 0.18;
  const body = `M 0 0
    Q ${L * 0.18} ${-L * a * 0.55}, ${L * 0.42} ${-L * a}
    Q ${L * 0.70} ${-L * a * 0.85}, ${L * 0.92} ${-L * 0.08}
    L ${L} 0
    L ${L * 0.92} ${L * 0.08}
    Q ${L * 0.70} ${L * b * 0.85}, ${L * 0.42} ${L * b}
    Q ${L * 0.18} ${L * b * 0.55}, 0 0 Z`;
  if (style === 'outlined') {
    return React.createElement("g", null, React.createElement("path", {
      d: body,
      fill: "none",
      stroke: "var(--sage)",
      strokeWidth: weight,
      strokeLinejoin: "round",
      strokeLinecap: "round"
    }), React.createElement("line", {
      x1: L * 0.18,
      y1: "0",
      x2: L * 0.78,
      y2: "0",
      stroke: "var(--sage)",
      strokeWidth: weight * 0.5,
      opacity: "0.55",
      strokeLinecap: "round"
    }));
  }
  return React.createElement("path", {
    d: body,
    fill: "var(--sage-deep)",
    stroke: "var(--sage-deep)",
    strokeWidth: weight * 0.5,
    strokeLinejoin: "round"
  });
}
function StemNode({
  cx,
  cy,
  size = 1.3
}) {
  return React.createElement("ellipse", {
    cx: cx,
    cy: cy,
    rx: size,
    ry: size * 0.85,
    fill: "var(--sage-deep)"
  });
}
function Tendril({
  size = 14,
  angle = 0,
  opacity = 0.65
}) {
  return React.createElement("g", {
    transform: `rotate(${angle})`,
    opacity: opacity
  }, React.createElement("path", {
    d: `M 0 0 q ${size * 0.6} ${size * 0.2}, ${size * 0.5} ${size * 0.7} q -${size * 0.3} ${size * 0.4}, ${size * 0.1} ${size * 0.9}`,
    stroke: "var(--sage)",
    strokeWidth: "0.7",
    fill: "none",
    strokeLinecap: "round"
  }));
}
function IvyVine({
  width = 380,
  opacity = 0.5,
  style = {},
  flip = false
}) {
  const segs = [[[20, 40], [80, 26], [140, 42]], [[140, 42], [200, 58], [260, 38]], [[260, 38], [320, 18], [380, 40]]];
  const stem = t => {
    const i = Math.min(2, Math.floor(t * 3));
    const s = t * 3 - i;
    const [P0, P1, P2] = segs[i];
    return [(1 - s) * (1 - s) * P0[0] + 2 * (1 - s) * s * P1[0] + s * s * P2[0], (1 - s) * (1 - s) * P0[1] + 2 * (1 - s) * s * P1[1] + s * s * P2[1]];
  };
  const tangent = t => {
    const [x1, y1] = stem(Math.max(0.0001, t - 0.005));
    const [x2, y2] = stem(Math.min(0.9999, t + 0.005));
    return Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;
  };
  const leaves = [];
  for (let i = 0; i < 12; i++) {
    const t = (i + 0.5) / 12;
    const [x, y] = stem(t);
    const ang = tangent(t);
    const side = i % 2 === 0 ? -1 : 1;
    const L = 18 + (hash(i) - 0.5) * 6;
    const rot = ang + side * 80 + (side === 1 ? -8 : 8) + (hash(i + 4) - 0.5) * 14;
    leaves.push({
      x,
      y,
      rot,
      L,
      outlined: i % 5 === 4,
      key: i
    });
  }
  return React.createElement("svg", {
    viewBox: "0 0 400 80",
    width: width,
    height: width * 80 / 400,
    style: {
      display: 'block',
      opacity,
      transform: flip ? 'scaleX(-1)' : 'none',
      ...style
    }
  }, React.createElement("path", {
    d: "M 20 40 Q 80 26, 140 42 T 260 38 T 380 40",
    stroke: "var(--sage-deep)",
    strokeWidth: "1.5",
    fill: "none",
    strokeLinecap: "round"
  }), React.createElement("path", {
    d: "M 20 40 Q 80 26, 140 42 T 260 38 T 380 40",
    stroke: "var(--sage)",
    strokeWidth: "0.5",
    fill: "none",
    strokeLinecap: "round",
    opacity: "0.55"
  }), leaves.map(l => React.createElement("g", {
    key: l.key,
    transform: `translate(${l.x.toFixed(2)} ${l.y.toFixed(2)}) rotate(${l.rot.toFixed(1)})`
  }, React.createElement(Leaf, {
    L: l.L,
    style: l.outlined ? 'outlined' : 'solid',
    flipBelly: l.key % 3 === 0
  }))), React.createElement("ellipse", {
    cx: "388",
    cy: "40",
    rx: "3",
    ry: "1.4",
    fill: "var(--sage-deep)",
    transform: "rotate(-20 388 40)"
  }), React.createElement("ellipse", {
    cx: "12",
    cy: "40",
    rx: "3",
    ry: "1.4",
    fill: "var(--sage-deep)",
    transform: "rotate(160 12 40)"
  }));
}
function IvyCurl({
  size = 140,
  opacity = 0.5,
  style = {},
  flip = false
}) {
  return React.createElement("svg", {
    viewBox: "0 0 140 140",
    width: size,
    height: size,
    style: {
      display: 'block',
      opacity,
      transform: flip ? 'scaleX(-1)' : 'none',
      ...style
    }
  }, React.createElement("path", {
    d: "M 8 10 Q 40 30, 52 64 Q 60 96, 92 108 Q 122 114, 132 96",
    stroke: "var(--sage-deep)",
    strokeWidth: "1.4",
    fill: "none",
    strokeLinecap: "round"
  }), React.createElement("path", {
    d: "M 8 10 Q 40 30, 52 64 Q 60 96, 92 108 Q 122 114, 132 96",
    stroke: "var(--sage)",
    strokeWidth: "0.5",
    fill: "none",
    strokeLinecap: "round",
    opacity: "0.55"
  }), React.createElement("g", {
    transform: "translate(24 22) rotate(-72)"
  }, React.createElement(Leaf, {
    L: 20
  })), React.createElement("g", {
    transform: "translate(39 39) rotate(64)"
  }, React.createElement(Leaf, {
    L: 18,
    flipBelly: true
  })), React.createElement("g", {
    transform: "translate(52 63) rotate(-58)"
  }, React.createElement(Leaf, {
    L: 22
  })), React.createElement("g", {
    transform: "translate(62 86) rotate(78)"
  }, React.createElement(Leaf, {
    L: 20,
    flipBelly: true
  })), React.createElement("g", {
    transform: "translate(78 101) rotate(-44)"
  }, React.createElement(Leaf, {
    L: 22
  })), React.createElement("g", {
    transform: "translate(113 109) rotate(40)"
  }, React.createElement(Leaf, {
    L: 18
  })), React.createElement("ellipse", {
    cx: "132",
    cy: "96",
    rx: "2.6",
    ry: "1.4",
    fill: "var(--sage-deep)",
    transform: "rotate(-26 132 96)"
  }));
}
function FernFrond({
  height = 260,
  opacity = 0.5,
  style = {},
  flip = false
}) {
  const rachis = t => [88 * (1 - t) ** 3 + 3 * 100 * (1 - t) ** 2 * t + 3 * 56 * (1 - t) * t ** 2 + 28 * t ** 3, 6 * (1 - t) ** 3 + 3 * 110 * (1 - t) ** 2 * t + 3 * 220 * (1 - t) * t ** 2 + 300 * t ** 3];
  const tangent = t => {
    const [x1, y1] = rachis(Math.max(0, t - 0.005));
    const [x2, y2] = rachis(Math.min(1, t + 0.005));
    return Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;
  };
  const leaves = [];
  for (let i = 0; i < 11; i++) {
    const t = 0.05 + i / 10 * 0.90;
    const [x, y] = rachis(t);
    const ang = tangent(t);
    const side = i % 2 === 0 ? 1 : -1;
    const rot = ang + side * 80 + (side === 1 ? -12 : 12);
    const L = 36 * (1 - t * 0.62);
    leaves.push({
      x,
      y,
      rot,
      L,
      key: i
    });
  }
  return React.createElement("svg", {
    viewBox: "0 0 140 320",
    width: height * 140 / 320,
    height: height,
    style: {
      display: 'block',
      opacity,
      transform: flip ? 'scaleX(-1)' : 'none',
      ...style
    }
  }, React.createElement("path", {
    d: "M 88 6 C 100 110, 56 220, 28 300",
    stroke: "var(--sage-deep)",
    strokeWidth: "1.7",
    fill: "none",
    strokeLinecap: "round"
  }), React.createElement("path", {
    d: "M 88 6 C 100 110, 56 220, 28 300",
    stroke: "var(--sage)",
    strokeWidth: "0.5",
    fill: "none",
    strokeLinecap: "round",
    opacity: "0.55"
  }), leaves.map(l => React.createElement("g", {
    key: l.key,
    transform: `translate(${l.x.toFixed(2)} ${l.y.toFixed(2)}) rotate(${l.rot.toFixed(1)})`
  }, React.createElement(Leaf, {
    L: l.L,
    flipBelly: l.key % 2 === 0
  }))), React.createElement("ellipse", {
    cx: "28",
    cy: "302",
    rx: "3",
    ry: "1.6",
    fill: "var(--sage-deep)",
    transform: "rotate(110 28 302)"
  }));
}
function BranchSprig({
  size = 140,
  opacity = 0.55,
  style = {},
  flip = false
}) {
  return React.createElement("svg", {
    viewBox: "0 0 100 160",
    width: size * 100 / 160,
    height: size,
    style: {
      display: 'block',
      opacity,
      transform: flip ? 'scaleX(-1)' : 'none',
      ...style
    }
  }, React.createElement("path", {
    d: "M 48 152 C 52 116, 58 76, 56 36 C 56 24, 60 18, 64 12",
    stroke: "var(--sage-deep)",
    strokeWidth: "1.6",
    fill: "none",
    strokeLinecap: "round"
  }), React.createElement("path", {
    d: "M 48 152 C 52 116, 58 76, 56 36 C 56 24, 60 18, 64 12",
    stroke: "var(--sage)",
    strokeWidth: "0.5",
    fill: "none",
    strokeLinecap: "round",
    opacity: "0.55"
  }), React.createElement("g", {
    transform: "translate(51 130) rotate(110)"
  }, React.createElement(Leaf, {
    L: 22,
    flipBelly: true
  })), React.createElement("g", {
    transform: "translate(53 110) rotate(-70)"
  }, React.createElement(Leaf, {
    L: 22
  })), React.createElement("g", {
    transform: "translate(55 88)  rotate(100)"
  }, React.createElement(Leaf, {
    L: 20,
    flipBelly: true
  })), React.createElement("g", {
    transform: "translate(56 66)  rotate(-78)"
  }, React.createElement(Leaf, {
    L: 18
  })), React.createElement("g", {
    transform: "translate(56 48)  rotate(110)"
  }, React.createElement(Leaf, {
    L: 15,
    flipBelly: true
  })), React.createElement("g", {
    transform: "translate(64 12) rotate(-56)"
  }, React.createElement(Leaf, {
    L: 10
  })), React.createElement("ellipse", {
    cx: "64",
    cy: "10",
    rx: "1.6",
    ry: "1.0",
    fill: "var(--sage-deep)",
    transform: "rotate(-56 64 10)"
  }));
}
function LooseSprig({
  size = 200,
  opacity = 0.45,
  style = {},
  flip = false
}) {
  return React.createElement("svg", {
    viewBox: "0 0 220 160",
    width: size,
    height: size * 160 / 220,
    style: {
      display: 'block',
      opacity,
      transform: flip ? 'scaleX(-1)' : 'none',
      ...style
    }
  }, React.createElement("path", {
    d: "M 6 18 C 60 40, 120 70, 170 96 C 190 106, 206 116, 216 130",
    stroke: "var(--sage-deep)",
    strokeWidth: "1.5",
    fill: "none",
    strokeLinecap: "round"
  }), React.createElement("path", {
    d: "M 6 18 C 60 40, 120 70, 170 96 C 190 106, 206 116, 216 130",
    stroke: "var(--sage)",
    strokeWidth: "0.5",
    fill: "none",
    strokeLinecap: "round",
    opacity: "0.55"
  }), React.createElement("path", {
    d: "M 86 54 C 92 42, 102 28, 116 18",
    stroke: "var(--sage-deep)",
    strokeWidth: "1.1",
    fill: "none",
    strokeLinecap: "round"
  }), React.createElement("g", {
    transform: "translate(27 27) rotate(-50)"
  }, React.createElement(Leaf, {
    L: 26
  })), React.createElement("g", {
    transform: "translate(56 40) rotate(58)"
  }, React.createElement(Leaf, {
    L: 22,
    flipBelly: true
  })), React.createElement("g", {
    transform: "translate(93 57) rotate(-58)"
  }, React.createElement(Leaf, {
    L: 24
  })), React.createElement("g", {
    transform: "translate(116 18) rotate(-86)"
  }, React.createElement(Leaf, {
    L: 18
  })), React.createElement("g", {
    transform: "translate(131 76) rotate(54)"
  }, React.createElement(Leaf, {
    L: 22,
    flipBelly: true
  })), React.createElement("g", {
    transform: "translate(158 90) rotate(-48)"
  }, React.createElement(Leaf, {
    L: 24
  })), React.createElement("g", {
    transform: "translate(192 108) rotate(50)"
  }, React.createElement(Leaf, {
    L: 20,
    flipBelly: true
  })), React.createElement("ellipse", {
    cx: "216",
    cy: "130",
    rx: "3",
    ry: "1.4",
    fill: "var(--sage-deep)",
    transform: "rotate(50 216 130)"
  }));
}
function BotanicalDivider({
  width = 380,
  style = {}
}) {
  return React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 18,
      ...style
    }
  }, React.createElement(IvyVine, {
    width: width * 0.42,
    opacity: 0.5
  }), React.createElement("span", {
    style: {
      display: 'inline-block',
      width: 6,
      height: 6,
      background: 'var(--amber)',
      transform: 'rotate(45deg)'
    }
  }), React.createElement(IvyVine, {
    width: width * 0.42,
    opacity: 0.5,
    flip: true
  }));
}
function LanternDefs() {
  return React.createElement("svg", {
    width: "0",
    height: "0",
    "aria-hidden": "true",
    style: {
      position: 'absolute',
      overflow: 'hidden',
      pointerEvents: 'none'
    }
  }, React.createElement("defs", null, React.createElement("linearGradient", {
    id: "lh-iron",
    x1: "0",
    y1: "0",
    x2: "1",
    y2: "0"
  }, React.createElement("stop", {
    offset: "0%",
    stopColor: "#070403"
  }), React.createElement("stop", {
    offset: "50%",
    stopColor: "#100a06"
  }), React.createElement("stop", {
    offset: "100%",
    stopColor: "#241608"
  })), React.createElement("linearGradient", {
    id: "lh-rust",
    x1: "0",
    y1: "0",
    x2: "0",
    y2: "1"
  }, React.createElement("stop", {
    offset: "0%",
    stopColor: "#5a2a10"
  }), React.createElement("stop", {
    offset: "100%",
    stopColor: "#2a1408"
  })), React.createElement("radialGradient", {
    id: "lh-glass",
    cx: "50%",
    cy: "45%",
    r: "70%"
  }, React.createElement("stop", {
    offset: "0%",
    stopColor: "#fff5d0"
  }), React.createElement("stop", {
    offset: "40%",
    stopColor: "#f4c478"
  }), React.createElement("stop", {
    offset: "80%",
    stopColor: "#c6862c"
  }), React.createElement("stop", {
    offset: "100%",
    stopColor: "#6e3a10"
  })), React.createElement("linearGradient", {
    id: "lh-glassHi",
    x1: "0",
    y1: "0",
    x2: "1",
    y2: "0"
  }, React.createElement("stop", {
    offset: "78%",
    stopColor: "#fff5d8",
    stopOpacity: "0"
  }), React.createElement("stop", {
    offset: "94%",
    stopColor: "#fff5d8",
    stopOpacity: "0.6"
  }), React.createElement("stop", {
    offset: "100%",
    stopColor: "#fff5d8",
    stopOpacity: "0"
  })), React.createElement("radialGradient", {
    id: "lh-halo",
    cx: "50%",
    cy: "50%",
    r: "50%"
  }, React.createElement("stop", {
    offset: "0%",
    stopColor: "#f5cd6a",
    stopOpacity: "0.65"
  }), React.createElement("stop", {
    offset: "40%",
    stopColor: "#d99a3d",
    stopOpacity: "0.22"
  }), React.createElement("stop", {
    offset: "100%",
    stopColor: "#d99a3d",
    stopOpacity: "0"
  }))));
}
function LanternHead({
  x = 0,
  y = 0,
  scale = 1
}) {
  return React.createElement("g", {
    transform: `translate(${x} ${y}) scale(${scale})`
  }, React.createElement("rect", {
    x: "46",
    y: "0",
    width: "8",
    height: "1",
    fill: "url(#lh-iron)"
  }), React.createElement("path", {
    d: "M 46 1 L 54 1 L 64 15 L 36 15 Z",
    fill: "url(#lh-iron)"
  }), React.createElement("path", {
    d: "M 46 1 L 50 1 L 50 1.5 L 36 15 Z",
    fill: "#000",
    opacity: "0.45"
  }), React.createElement("line", {
    x1: "50",
    y1: "1",
    x2: "50",
    y2: "15",
    stroke: "#000",
    strokeWidth: "0.4",
    opacity: "0.5"
  }), React.createElement("path", {
    d: "M 32 15 L 68 15 L 70 19 L 30 19 Z",
    fill: "url(#lh-iron)"
  }), React.createElement("rect", {
    x: "30",
    y: "19",
    width: "40",
    height: "0.8",
    fill: "#0a0604"
  }), React.createElement("g", {
    fill: "url(#lh-iron)"
  }, [34, 40, 46, 52, 58, 64].map((bx, i) => React.createElement("path", {
    key: i,
    d: `M ${bx} 19.8 L ${bx + 2} 19.8 L ${bx + 1.7} 22 L ${bx + 0.3} 22 Z`
  }))), React.createElement("rect", {
    x: "32",
    y: "23",
    width: "36",
    height: "2",
    fill: "url(#lh-iron)"
  }), React.createElement("path", {
    d: "M 33 25 L 67 25 L 62 60 L 38 60 Z",
    fill: "url(#lh-glass)"
  }), React.createElement("path", {
    d: "M 33 25 L 67 25 L 62 60 L 38 60 Z",
    fill: "url(#lh-glassHi)"
  }), React.createElement("line", {
    x1: "33.5",
    y1: "25",
    x2: "38.5",
    y2: "60",
    stroke: "#0a0604",
    strokeWidth: "1",
    strokeLinecap: "round"
  }), React.createElement("line", {
    x1: "66.5",
    y1: "25",
    x2: "61.5",
    y2: "60",
    stroke: "#0a0604",
    strokeWidth: "1",
    strokeLinecap: "round"
  }), React.createElement("line", {
    x1: "44",
    y1: "25",
    x2: "46",
    y2: "60",
    stroke: "#1a1208",
    strokeWidth: "0.5"
  }), React.createElement("line", {
    x1: "56",
    y1: "25",
    x2: "54",
    y2: "60",
    stroke: "#1a1208",
    strokeWidth: "0.5"
  }), React.createElement("line", {
    x1: "50",
    y1: "27",
    x2: "50",
    y2: "58",
    stroke: "#fff5db",
    strokeOpacity: "0.4",
    strokeWidth: "0.5"
  }), React.createElement("path", {
    d: "M 60 28 Q 62 42, 59 56",
    stroke: "#fff5db",
    strokeWidth: "1",
    strokeOpacity: "0.55",
    fill: "none"
  }), React.createElement("rect", {
    x: "36",
    y: "60",
    width: "28",
    height: "2",
    fill: "url(#lh-iron)"
  }), React.createElement("path", {
    d: "M 40 62 L 60 62 L 56 66 L 44 66 Z",
    fill: "url(#lh-iron)"
  }), React.createElement("rect", {
    x: "44",
    y: "66",
    width: "12",
    height: "1",
    fill: "url(#lh-iron)"
  }), React.createElement("path", {
    d: "M 45 67 L 55 67 L 52 70 L 48 70 Z",
    fill: "url(#lh-iron)"
  }), React.createElement("ellipse", {
    cx: "50",
    cy: "72",
    rx: "2.2",
    ry: "1.8",
    fill: "url(#lh-iron)"
  }), React.createElement("path", {
    d: "M 50 74 L 50.4 76 L 50 76.5 L 49.6 76 Z",
    fill: "url(#lh-iron)"
  }));
}
function HangingLantern({
  height = 260,
  chainLength = 0.5,
  style = {}
}) {
  const chainPx = 80 * chainLength;
  const headTop = chainPx + 10;
  return React.createElement("svg", {
    viewBox: "0 0 100 200",
    width: height * 100 / 200,
    height: height,
    style: {
      display: 'block',
      overflow: 'visible',
      ...style
    }
  }, React.createElement("ellipse", {
    cx: "50",
    cy: headTop + 35,
    rx: "90",
    ry: "80",
    fill: "url(#lh-halo)"
  }, React.createElement("animate", {
    attributeName: "opacity",
    values: "0.9;1;0.78;0.95;0.9",
    dur: "6s",
    repeatCount: "indefinite"
  })), React.createElement("rect", {
    x: "46",
    y: "0",
    width: "8",
    height: "2",
    fill: "url(#lh-iron)"
  }), React.createElement("rect", {
    x: "44",
    y: "2",
    width: "12",
    height: "3",
    fill: "url(#lh-iron)"
  }), React.createElement("g", {
    stroke: "url(#lh-iron)",
    strokeWidth: "1.2",
    fill: "none"
  }, Array.from({
    length: Math.max(3, Math.round(chainPx / 6))
  }).map((_, i) => {
    const cy = 6 + i * 6;
    return i % 2 === 0 ? React.createElement("ellipse", {
      key: i,
      cx: "50",
      cy: cy,
      rx: "2.5",
      ry: "3.2"
    }) : React.createElement("ellipse", {
      key: i,
      cx: "50",
      cy: cy,
      rx: "3.2",
      ry: "2.5"
    });
  })), React.createElement("ellipse", {
    cx: "50",
    cy: chainPx + 6,
    rx: "3.5",
    ry: "2",
    fill: "none",
    stroke: "url(#lh-iron)",
    strokeWidth: "1.2"
  }), React.createElement(LanternHead, {
    x: 0,
    y: headTop,
    scale: 1
  }));
}
function FloorLamp({
  height = 320,
  style = {}
}) {
  return React.createElement("svg", {
    viewBox: "0 0 100 280",
    width: height * 100 / 280,
    height: height,
    style: {
      display: 'block',
      overflow: 'visible',
      ...style
    }
  }, React.createElement("ellipse", {
    cx: "50",
    cy: "50",
    rx: "90",
    ry: "80",
    fill: "url(#lh-halo)"
  }, React.createElement("animate", {
    attributeName: "opacity",
    values: "0.9;1;0.78;0.95;0.9",
    dur: "6s",
    repeatCount: "indefinite"
  })), React.createElement("path", {
    d: "M 50 -4 L 50.5 -1 L 50 0 L 49.5 -1 Z",
    fill: "url(#lh-iron)"
  }), React.createElement("ellipse", {
    cx: "50",
    cy: "0",
    rx: "1.4",
    ry: "0.8",
    fill: "url(#lh-iron)"
  }), React.createElement(LanternHead, {
    x: 0,
    y: 2,
    scale: 1
  }), React.createElement("rect", {
    x: "49",
    y: "80",
    width: "2.5",
    height: "158",
    fill: "url(#lh-iron)"
  }), React.createElement("rect", {
    x: "46",
    y: "148",
    width: "8",
    height: "2",
    fill: "url(#lh-iron)"
  }), React.createElement("rect", {
    x: "47",
    y: "150",
    width: "6",
    height: "1.5",
    fill: "url(#lh-iron)"
  }), React.createElement("path", {
    d: "M 42 238 L 58 238 L 64 252 L 36 252 Z",
    fill: "url(#lh-iron)"
  }), React.createElement("rect", {
    x: "32",
    y: "252",
    width: "36",
    height: "4",
    fill: "url(#lh-iron)"
  }), React.createElement("rect", {
    x: "32",
    y: "254",
    width: "36",
    height: "1.2",
    fill: "url(#lh-rust)",
    opacity: "0.6"
  }), React.createElement("ellipse", {
    cx: "50",
    cy: "258",
    rx: "22",
    ry: "3",
    fill: "url(#lh-iron)"
  }), React.createElement("ellipse", {
    cx: "50",
    cy: "266",
    rx: "28",
    ry: "3",
    fill: "#000",
    opacity: "0.4"
  }));
}
function Raven({
  flightDur = 3.6,
  perchedOnly = false,
  reducedMotion = false,
  style = {}
}) {
  const d = flightDur;
  const settled = perchedOnly || reducedMotion;
  const begin = settled ? '0s' : `${d}s`;
  const INK = '#0a0807';
  const nearExt = 'M 2 -8 Q -16 -20 -38 -18 L -32 -13 L -40 -13 L -32 -8 Q -16 -7 2 -4 Z';
  const nearHalf = 'M 2 -9 Q -10 -12 -22 -6 L -20 -3 L -24 -1 L -19 1 Q -9 0 3 -4 Z';
  const nearFold = 'M 2 -9 Q -2 -2 -5 7 L -6 10 L -7 10 L -6 12 Q -2 6 3 -4 Z';
  const farExt = 'M 0 -7 Q -16 -18 -36 -16 L -30 -12 L -38 -12 L -30 -7 Q -16 -6 0 -3 Z';
  const farHalf = 'M 0 -8 Q -9 -11 -20 -5 L -18 -2 L -22 0 L -17 1 Q -8 0 1 -3 Z';
  const farFold = 'M 0 -8 Q -3 -1 -5 7 L -6 10 L -7 10 L -6 12 Q -2 6 1 -3 Z';
  return React.createElement("svg", {
    viewBox: "0 0 520 360",
    width: "520",
    height: "360",
    style: {
      display: 'block',
      overflow: 'visible',
      ...style
    }
  }, React.createElement("defs", null, React.createElement("linearGradient", {
    id: "raven-amber",
    x1: "0",
    y1: "0",
    x2: "0",
    y2: "1"
  }, React.createElement("stop", {
    offset: "0%",
    stopColor: "#e8b056",
    stopOpacity: "0"
  }), React.createElement("stop", {
    offset: "74%",
    stopColor: "#e8b056",
    stopOpacity: "0"
  }), React.createElement("stop", {
    offset: "100%",
    stopColor: "#f0bf6a",
    stopOpacity: "0.9"
  })), React.createElement("radialGradient", {
    id: "raven-breast",
    cx: "60%",
    cy: "78%",
    r: "60%"
  }, React.createElement("stop", {
    offset: "0%",
    stopColor: "rgba(200,120,30,0.28)"
  }), React.createElement("stop", {
    offset: "55%",
    stopColor: "rgba(200,120,30,0.12)"
  }), React.createElement("stop", {
    offset: "100%",
    stopColor: "rgba(200,120,30,0)"
  })), React.createElement("clipPath", {
    id: "raven-clip"
  }, React.createElement("use", {
    href: "#raven-body-shape"
  })), React.createElement("clipPath", {
    id: "raven-clip-tail"
  }, React.createElement("use", {
    href: "#raven-tail-shape"
  })), React.createElement("clipPath", {
    id: "raven-clip-wing"
  }, React.createElement("use", {
    href: "#raven-wing-shape"
  }))), React.createElement("g", {
    id: "rv-move",
    transform: settled ? 'translate(440 282)' : undefined
  }, !settled && React.createElement("animateMotion", {
    dur: `${d}s`,
    fill: "freeze",
    calcMode: "spline",
    keyTimes: "0; 1",
    keySplines: "0.3 0 0.4 1",
    path: "M -260 -60 C -40 40, 220 140, 440 282"
  }), React.createElement("g", {
    id: "raven-tilt"
  }, !settled && React.createElement("animateTransform", {
    attributeName: "transform",
    type: "rotate",
    values: "-26 0 0; -18 0 0; -8 0 0; 14 0 0; 2 0 0; 0 0 0",
    keyTimes: "0; 0.4; 0.66; 0.86; 0.95; 1",
    dur: `${d}s`,
    fill: "freeze"
  }), React.createElement("g", {
    id: "raven-breath"
  }, !reducedMotion && React.createElement("animateTransform", {
    attributeName: "transform",
    type: "translate",
    values: "0 0; 0 -0.9; 0 0; 0 0.5; 0 0",
    keyTimes: "0; 0.34; 0.6; 0.82; 1",
    dur: "3s",
    begin: begin,
    repeatCount: "indefinite"
  }), React.createElement("g", {
    id: "raven-tail"
  }, React.createElement("path", {
    id: "raven-tail-shape",
    fill: INK,
    d: "M -10 -6 C -22 -3, -34 4, -45 15 L -39 16 L -41 19 L -34 18 L -35 22 L -28 20 L -29 23 L -22 20 C -15 13, -12 3, -8 -1 Z"
  }), React.createElement("rect", {
    x: "-46",
    y: "-6",
    width: "42",
    height: "31",
    fill: "url(#raven-amber)",
    clipPath: "url(#raven-clip-tail)",
    style: {
      mixBlendMode: 'screen'
    }
  }), !settled && React.createElement("animateTransform", {
    attributeName: "transform",
    type: "rotate",
    values: "-8 -7 4; -8 -7 4; 16 -7 4",
    keyTimes: "0; 0.86; 1",
    dur: `${d}s`,
    fill: "freeze"
  }), !reducedMotion && React.createElement("animateTransform", {
    attributeName: "transform",
    type: "rotate",
    values: "16 -7 4; 16 -7 4; 24 -7 4; 16 -7 4; 16 -7 4",
    keyTimes: "0; 0.62; 0.7; 0.78; 1",
    dur: "7s",
    begin: begin,
    repeatCount: "indefinite"
  })), !settled && React.createElement("g", {
    id: "raven-wing-right"
  }, React.createElement("path", {
    fill: INK,
    d: farExt
  }, React.createElement("animate", {
    attributeName: "d",
    values: `${farExt}; ${farExt}; ${farHalf}; ${farFold}; ${farFold}`,
    keyTimes: "0; 0.8; 0.9; 0.96; 1",
    dur: `${d}s`,
    fill: "freeze"
  })), React.createElement("animateTransform", {
    attributeName: "transform",
    type: "rotate",
    values: "-26 0 -7; 36 0 -7; -26 0 -7; 36 0 -7; -26 0 -7; 40 0 -7; -30 0 -7; 8 0 -7; 0 0 -7",
    keyTimes: "0; 0.13; 0.26; 0.39; 0.52; 0.64; 0.78; 0.9; 1",
    dur: `${d}s`,
    fill: "freeze",
    calcMode: "spline",
    keySplines: "0.4 0 0.6 1; 0.4 0 0.6 1; 0.4 0 0.6 1; 0.4 0 0.6 1; 0.4 0 0.6 1; 0.4 0 0.6 1; 0.3 0 0.7 1; 0.3 0 0.7 1"
  }), React.createElement("animate", {
    attributeName: "opacity",
    values: "1;1;0",
    keyTimes: "0;0.93;0.99",
    dur: `${d}s`,
    fill: "freeze"
  })), React.createElement("g", {
    id: "raven-body"
  }, React.createElement("path", {
    id: "raven-body-shape",
    fill: INK,
    d: "M 11 -9 C 16 -8, 18 -3, 15 1 C 12 4, 5 5, -3 5 C -11 5, -17 3, -18 -2 C -19 -7, -12 -10, -3 -10 C 3 -10, 8 -10, 11 -9 Z"
  }), React.createElement("rect", {
    x: "-19",
    y: "-10",
    width: "38",
    height: "16",
    fill: "url(#raven-breast)",
    clipPath: "url(#raven-clip)",
    style: {
      mixBlendMode: 'screen'
    }
  }), React.createElement("rect", {
    x: "-19",
    y: "-10",
    width: "38",
    height: "16",
    fill: "url(#raven-amber)",
    clipPath: "url(#raven-clip)",
    style: {
      mixBlendMode: 'screen'
    }
  }, !reducedMotion && React.createElement("animate", {
    attributeName: "opacity",
    values: "0.85;1;0.72;0.95;0.85",
    dur: "6s",
    begin: begin,
    repeatCount: "indefinite"
  }))), !settled && React.createElement("g", {
    id: "raven-wing-left"
  }, React.createElement("path", {
    fill: INK,
    d: nearExt
  }, React.createElement("animate", {
    attributeName: "d",
    values: `${nearExt}; ${nearExt}; ${nearHalf}; ${nearFold}; ${nearFold}`,
    keyTimes: "0; 0.8; 0.9; 0.96; 1",
    dur: `${d}s`,
    fill: "freeze"
  })), React.createElement("animateTransform", {
    attributeName: "transform",
    type: "rotate",
    values: "-30 2 -8; 38 2 -8; -30 2 -8; 38 2 -8; -30 2 -8; 42 2 -8; -34 2 -8; 10 2 -8; 0 2 -8",
    keyTimes: "0; 0.13; 0.26; 0.39; 0.52; 0.64; 0.78; 0.9; 1",
    dur: `${d}s`,
    fill: "freeze",
    calcMode: "spline",
    keySplines: "0.4 0 0.6 1; 0.4 0 0.6 1; 0.4 0 0.6 1; 0.4 0 0.6 1; 0.4 0 0.6 1; 0.4 0 0.6 1; 0.3 0 0.7 1; 0.3 0 0.7 1"
  }), React.createElement("animate", {
    attributeName: "opacity",
    values: "1;1;0",
    keyTimes: "0;0.93;0.99",
    dur: `${d}s`,
    fill: "freeze"
  })), React.createElement("g", {
    id: "raven-wing",
    opacity: settled ? 1 : 0
  }, React.createElement("path", {
    id: "raven-wing-shape",
    fill: INK,
    d: "M 8 -9 C 12 -6, 11 0, 6 5 L 3 3 L 1 6 L -3 4 L -5 7 L -9 5 L -11 8 L -16 5 C -10 -1, -2 -7, 8 -9 Z"
  }), React.createElement("rect", {
    x: "-17",
    y: "-9",
    width: "26",
    height: "18",
    fill: "url(#raven-amber)",
    clipPath: "url(#raven-clip-wing)",
    style: {
      mixBlendMode: 'screen'
    }
  }), !settled && React.createElement("animate", {
    attributeName: "opacity",
    values: "0;0;1",
    keyTimes: "0;0.92;1",
    dur: `${d}s`,
    fill: "freeze"
  })), React.createElement("g", {
    id: "raven-head"
  }, React.createElement("path", {
    fill: INK,
    d: "M 5 -9 C 2 -16, 7 -22, 14 -22 C 20 -22, 24 -18, 23 -14 L 35 -13 C 37 -12.5, 37 -11.4, 35 -11 L 33 -11.6 L 32 -9.6 L 30 -11.4 C 25 -12, 12 -11, 5 -9 Z"
  }), !reducedMotion && React.createElement("animateTransform", {
    attributeName: "transform",
    type: "rotate",
    values: "0 8 -13; 0 8 -13; -16 8 -13; -16 8 -13; 0 8 -13; 0 8 -13",
    keyTimes: "0; 0.18; 0.34; 0.54; 0.7; 1",
    dur: "8s",
    begin: begin,
    repeatCount: "indefinite",
    calcMode: "spline",
    keySplines: "0.5 0 0.5 1; 0.4 0 0.6 1; 0.5 0 0.5 1; 0.5 0 0.5 1; 0.5 0 0.5 1"
  })), React.createElement("g", {
    id: "raven-legs",
    opacity: settled ? 1 : 0,
    fill: "none",
    stroke: INK,
    strokeWidth: "1.5",
    strokeLinecap: "round"
  }, React.createElement("path", {
    d: "M 0 5 L 0 18 L 0 28",
    strokeWidth: "2"
  }), React.createElement("path", {
    d: "M 0 28 C 2 30 5 30 7 29"
  }), React.createElement("path", {
    d: "M 0 28 C 1 30 3 31 4 32"
  }), React.createElement("path", {
    d: "M 0 28 C 0 30 0 32 -1 33"
  }), React.createElement("path", {
    d: "M 0 28 C -2 29 -4 30 -5 30"
  }), React.createElement("path", {
    d: "M 7 5 L 8 18 L 8 28",
    strokeWidth: "2"
  }), React.createElement("path", {
    d: "M 8 28 C 10 30 13 30 15 29"
  }), React.createElement("path", {
    d: "M 8 28 C 9 30 11 31 12 32"
  }), React.createElement("path", {
    d: "M 8 28 C 8 30 8 32 7 33"
  }), React.createElement("path", {
    d: "M 8 28 C 6 29 4 30 3 30"
  }), !settled && React.createElement("animate", {
    attributeName: "opacity",
    values: "0;0;1",
    keyTimes: "0;0.9;1",
    dur: `${d}s`,
    fill: "freeze"
  }))))));
}
window.CG_MOTIFS = {
  PhotoPlaceholder,
  PaperFrame,
  GasLamp,
  LampMan,
  HangingLantern,
  FloorLamp,
  LanternDefs,
  Raven,
  IvyVine,
  IvyCurl,
  FernFrond,
  BotanicalDivider,
  BranchSprig,
  LooseSprig,
  BotanicalDefs
};
function LampMan({
  height = 74,
  style = {}
}) {
  const INK = '#0a0807';
  return React.createElement("svg", {
    viewBox: "0 0 120 150",
    width: height * 120 / 150,
    height: height,
    style: {
      display: 'block',
      overflow: 'visible',
      ...style
    }
  }, React.createElement("g", {
    style: {
      transformOrigin: '54px 104px',
      animation: 'cg-man-lean 5s ease-in-out infinite'
    }
  }, React.createElement("path", {
    d: "M 60 66 C 67 76, 73 88, 76 100",
    stroke: INK,
    strokeWidth: "5",
    fill: "none",
    strokeLinecap: "round"
  }), React.createElement("circle", {
    cx: "76",
    cy: "101",
    r: "3.4",
    fill: INK
  }), React.createElement("g", {
    style: {
      transformOrigin: '50px 104px',
      animation: 'cg-man-leg-a 4s ease-in-out infinite'
    }
  }, React.createElement("path", {
    d: "M 50 102 C 47 116, 45 130, 44 142",
    stroke: INK,
    strokeWidth: "5.5",
    fill: "none",
    strokeLinecap: "round"
  }), React.createElement("path", {
    d: "M 44 142 C 43 145, 42 147, 39 148",
    stroke: INK,
    strokeWidth: "4.5",
    fill: "none",
    strokeLinecap: "round"
  })), React.createElement("g", {
    style: {
      transformOrigin: '56px 104px',
      animation: 'cg-man-leg-b 4.6s ease-in-out infinite'
    }
  }, React.createElement("path", {
    d: "M 56 102 C 56 116, 57 130, 58 142",
    stroke: INK,
    strokeWidth: "5.5",
    fill: "none",
    strokeLinecap: "round"
  }), React.createElement("path", {
    d: "M 58 142 C 58 145, 58 147, 55 148",
    stroke: INK,
    strokeWidth: "4.5",
    fill: "none",
    strokeLinecap: "round"
  })), React.createElement("path", {
    d: "M 46 104 C 44 90, 48 74, 58 66 C 62 63, 66 64, 66 69 C 66 82, 62 96, 60 104 C 56 108, 50 108, 46 104 Z",
    fill: INK
  }), React.createElement("circle", {
    cx: "64",
    cy: "56",
    r: "7.2",
    fill: INK
  }), React.createElement("g", {
    style: {
      transformOrigin: '59px 68px',
      animation: 'cg-man-freearm 6.5s ease-in-out infinite'
    }
  }, React.createElement("path", {
    d: "M 59 68 C 52 74, 47 82, 45 92",
    stroke: INK,
    strokeWidth: "4.6",
    fill: "none",
    strokeLinecap: "round"
  }), React.createElement("circle", {
    cx: "45",
    cy: "93",
    r: "3.3",
    fill: INK
  }))));
}
})();
// ── portfolio.jsx
(function () {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const {
  PhotoPlaceholder,
  PaperFrame,
  GasLamp,
  LampMan,
  HangingLantern,
  FloorLamp,
  LanternDefs,
  Raven,
  IvyVine,
  IvyCurl,
  FernFrond,
  BotanicalDivider,
  BranchSprig,
  LooseSprig,
  BotanicalDefs
} = window.CG_MOTIFS;
const D = window.CG_DATA;
const THEME = window.CG_THEME;
function usePrefersReducedMotion() {
  const [reduced, setReduced] = React.useState(() => typeof window !== 'undefined' && window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)').matches : false);
  React.useEffect(() => {
    if (!window.matchMedia) return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener ? mq.addEventListener('change', onChange) : mq.addListener(onChange);
    return () => {
      mq.removeEventListener ? mq.removeEventListener('change', onChange) : mq.removeListener(onChange);
    };
  }, []);
  return reduced;
}
const TILE_HUES = ['linear-gradient(150deg, #6a4a2c 0%, #2a1a0e 100%)', 'linear-gradient(150deg, #8a5a36 0%, #321e10 100%)', 'linear-gradient(150deg, #c97a48 0%, #4a2616 100%)', 'linear-gradient(150deg, #5e6a4c 0%, #1e2418 100%)', 'linear-gradient(150deg, #d99a3d 0%, #5a3a1a 100%)', 'linear-gradient(150deg, #4a3a2a 0%, #15100a 100%)', 'linear-gradient(150deg, #936a44 0%, #2a1a10 100%)', 'linear-gradient(150deg, #6a4438 0%, #1e120c 100%)', 'linear-gradient(150deg, #8a9670 0%, #2a3220 100%)'];
function ytThumb(url) {
  if (!url) return '';
  const m = String(url).match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/|shorts\/|live\/))([\w-]{11})/);
  return m ? `https://img.youtube.com/vi/${m[1]}/hqdefault.jpg` : '';
}
function videoEmbed(url) {
  if (!url) return '';
  let m = String(url).match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/|shorts\/|live\/))([\w-]{11})/);
  if (m) return `https://www.youtube-nocookie.com/embed/${m[1]}?autoplay=1&rel=0`;
  m = String(url).match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (m) return `https://player.vimeo.com/video/${m[1]}?autoplay=1`;
  return '';
}
function isPdfData(v) {
  return typeof v === 'string' && v.startsWith('data:application/pdf');
}
function dataUrlToBlobUrl(dataUrl) {
  try {
    const [meta, b64] = dataUrl.split(',');
    const mime = (meta.match(/data:(.*?);base64/) || [])[1] || 'application/pdf';
    const bin = atob(b64);
    const arr = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
    return URL.createObjectURL(new Blob([arr], {
      type: mime
    }));
  } catch (e) {
    return '';
  }
}
function Nav() {
  const [scrolled, setScrolled] = React.useState(false);
  const [menuOpen, setMenuOpen] = React.useState(false);
  React.useEffect(() => {
    const f = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', f, {
      passive: true
    });
    return () => window.removeEventListener('scroll', f);
  }, []);
  React.useEffect(() => {
    if (!menuOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [menuOpen]);
  const links = D.nav.map(n => {
    const anchor = {
      video: '#sec-work',
      work: '#sec-work'
    }[n.toLowerCase()] || `#sec-${n.toLowerCase()}`;
    return {
      n,
      anchor
    };
  });
  return React.createElement(React.Fragment, null, React.createElement("nav", {
    className: "cg-nav",
    style: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 50,
      background: scrolled ? 'rgba(15, 10, 6, 0.78)' : 'transparent',
      backdropFilter: scrolled ? 'blur(14px)' : 'none',
      borderBottom: scrolled ? '1px solid var(--rule)' : '1px solid transparent',
      transition: 'background .4s ease, border-color .4s ease, backdrop-filter .4s ease',
      padding: '22px 64px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      fontFamily: 'var(--ui-font)'
    }
  }, React.createElement("a", {
    href: "#sec-top",
    className: "cg-nav-logo",
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 14,
      textDecoration: 'none',
      minHeight: 44
    }
  }, React.createElement("div", {
    className: "cg-nav-mark",
    style: {
      width: 38,
      height: 38,
      border: '1px solid var(--ink-dim)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, React.createElement("span", {
    className: "cg-candle-pulse cg-nav-mark-glow"
  }), React.createElement("img", {
    src: "assets/logo.png",
    alt: "Carter Groff",
    style: {
      width: '76%',
      height: '76%',
      objectFit: 'contain'
    }
  })), React.createElement("div", null, React.createElement("div", {
    style: {
      fontFamily: 'var(--display-font)',
      fontSize: 17,
      fontWeight: 500,
      letterSpacing: '-0.01em',
      color: 'var(--ink)',
      lineHeight: 1
    }
  }, "Carter Groff"), React.createElement("div", {
    style: {
      fontSize: 13,
      color: 'var(--ink-mute)',
      marginTop: 4
    }
  }, "Marketing & Media"))), React.createElement("div", {
    className: "cg-nav-links",
    style: {
      display: 'flex',
      gap: 38,
      alignItems: 'center'
    }
  }, links.map(({
    n,
    anchor
  }) => React.createElement("a", {
    key: n,
    href: anchor,
    style: {
      fontSize: 13,
      color: 'var(--ink-soft)',
      textDecoration: 'none',
      fontFamily: 'var(--ui-font)',
      fontWeight: 500,
      display: 'inline-flex',
      alignItems: 'center',
      minHeight: 44,
      padding: '0 2px'
    }
  }, n)), React.createElement("a", {
    href: "#sec-contact",
    style: {
      fontSize: 13,
      color: 'var(--ink)',
      border: '1px solid var(--ink-dim)',
      padding: '0 18px',
      minHeight: 44,
      display: 'inline-flex',
      alignItems: 'center',
      textDecoration: 'none',
      whiteSpace: 'nowrap',
      fontFamily: 'var(--ui-font)',
      fontWeight: 500
    }
  }, "Get in touch")), React.createElement("button", {
    className: "cg-nav-burger",
    "aria-label": menuOpen ? 'Close menu' : 'Open menu',
    "aria-expanded": menuOpen,
    onClick: () => setMenuOpen(o => !o)
  }, React.createElement("span", {
    className: 'cg-burger-ico' + (menuOpen ? ' is-open' : '')
  }, React.createElement("span", null), React.createElement("span", null), React.createElement("span", null)))), React.createElement("div", {
    className: 'cg-nav-drawer' + (menuOpen ? ' is-open' : ''),
    role: "dialog",
    "aria-modal": "true",
    "aria-hidden": !menuOpen,
    onClick: () => setMenuOpen(false)
  }, React.createElement("div", {
    className: "cg-nav-drawer-panel",
    onClick: e => e.stopPropagation()
  }, links.map(({
    n,
    anchor
  }) => React.createElement("a", {
    key: n,
    href: anchor,
    onClick: () => setMenuOpen(false)
  }, n)), React.createElement("a", {
    href: "#sec-contact",
    className: "cg-nav-drawer-cta",
    onClick: () => setMenuOpen(false)
  }, "Get in touch"))));
}
function RainLayer() {
  const drops = React.useMemo(() => {
    const n = 52;
    return Array.from({
      length: n
    }, (_, i) => {
      const r = s => {
        const x = Math.sin((i + 1) * s) * 43758.5453;
        return x - Math.floor(x);
      };
      return {
        left: (r(12.9) * 100).toFixed(2),
        height: (15 + r(7.1) * 10).toFixed(1),
        dur: (8 + r(3.3) * 6).toFixed(2),
        delay: (-r(9.7) * 14).toFixed(2),
        opacity: (0.08 + r(5.2) * 0.04).toFixed(3)
      };
    });
  }, []);
  return React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      overflow: 'hidden',
      pointerEvents: 'none',
      zIndex: 1
    }
  }, drops.map((d, i) => React.createElement("span", {
    key: i,
    className: "cg-rain-drop",
    style: {
      left: d.left + '%',
      height: d.height + 'px',
      opacity: (parseFloat(d.opacity) + 0.08).toFixed(3),
      animationDuration: d.dur + 's',
      animationDelay: d.delay + 's',
      transform: 'rotate(6deg)'
    }
  })));
}
const CANDLE_DEPTH = {
  near: {
    scale: 1.0,
    blur: 0,
    sat: 1.0,
    bright: 1.0,
    spread: 120,
    peak: 0.22,
    ground: true,
    smoke: true,
    drips: true
  },
  mid: {
    scale: 0.62,
    blur: 0.7,
    sat: 0.82,
    bright: 0.8,
    spread: 72,
    peak: 0.14,
    ground: true,
    smoke: true,
    drips: true
  },
  far: {
    scale: 0.42,
    blur: 1.4,
    sat: 0.62,
    bright: 0.55,
    spread: 38,
    peak: 0.08,
    ground: false,
    smoke: false,
    drips: true
  }
};
function CandlePool({
  pos,
  lit
}) {
  const d = CANDLE_DEPTH[pos.depth] || CANDLE_DEPTH.near;
  const scale = d.scale,
    R = d.spread * 2 + 24 * scale;
  const anchor = 48 * scale;
  return React.createElement("div", {
    style: {
      position: 'absolute',
      left: `calc(${pos.left} + ${13 * scale - R / 2}px)`,
      bottom: `calc(${pos.bottom} + ${anchor - R / 2}px)`,
      width: R,
      height: R,
      borderRadius: '50%',
      pointerEvents: 'none',
      background: `radial-gradient(circle, rgba(210,140,30,${d.peak}) 0%, rgba(210,140,30,${(d.peak * 0.4).toFixed(3)}) 24%, rgba(210,140,30,0) 70%)`,
      mixBlendMode: 'screen',
      filter: `blur(${(d.blur * 3 + 4).toFixed(1)}px)`,
      opacity: lit ? 1 : 0,
      transition: 'opacity 0.6s ease'
    }
  });
}
const FLAME_DANCES = ['cg-flame-dance', 'cg-flame-dance-b', 'cg-flame-dance-c', 'cg-flame-dance-d'];
const FLAME_SHAPES = ['M 13 2.5 C 17.6 10, 18.8 16, 14 24.5 C 9.2 20, 7.8 11.5, 13 2.5 Z', 'M 13 5 C 18.4 11, 19 17.5, 14 24.5 C 9 20.5, 7.6 13.5, 13 5 Z', 'M 12.4 1 C 18 8, 16.8 17, 14.2 24.5 C 9.4 21, 9.2 11, 12.4 1 Z'];
const CORE_SHAPES = ['M 13 9 C 15.2 13, 15 18, 13 22.5 C 11 18, 10.9 13, 13 9 Z', 'M 13 11 C 15 14.5, 15 18.5, 13 22.5 C 11 18.5, 11 14.5, 13 11 Z', 'M 12.7 8 C 14.8 12.5, 14.6 18, 13 22.5 C 11.4 18, 11.4 12.5, 12.7 8 Z'];
function Candle({
  pos,
  lit
}) {
  const d = CANDLE_DEPTH[pos.depth] || CANDLE_DEPTH.near;
  const scale = d.scale;
  const W = 26 * scale,
    H = 72 * scale;
  const danceDur = (1.25 + pos.seed % 10 * 0.17).toFixed(2);
  const coreDur = (1.05 + pos.seed % 7 * 0.205).toFixed(2);
  const glowDur = (2.0 + pos.seed % 8 * 0.16).toFixed(2);
  const delay = (pos.seed % 13 * -0.19).toFixed(2);
  const coreDelay = (pos.seed % 9 * -0.14 - 0.07).toFixed(2);
  const smokeDelay = (pos.seed % 6 * -1).toFixed(2);
  const danceName = FLAME_DANCES[pos.seed % 4];
  const coreName = FLAME_DANCES[(pos.seed + 2) % 4];
  const flamePath = FLAME_SHAPES[pos.seed % 3];
  const corePath = CORE_SHAPES[(pos.seed + 1) % 3];
  const lean = (pos.seed % 2 ? 1 : -1) * (5 + pos.seed * 3 % 11);
  const danceAnim = lit ? `${danceName} ${danceDur}s ease-in-out ${delay}s infinite, cg-candle-appear 1s ease-out` : 'none';
  const coreAnim = lit ? `${coreName} ${coreDur}s ease-in-out ${coreDelay}s infinite` : 'none';
  const melt = pos.seed % 3;
  const topY = [30, 37, 45][melt];
  const dy = topY - 30;
  const haloR = 72 * scale;
  return React.createElement("div", {
    style: {
      position: 'absolute',
      left: pos.left,
      bottom: pos.bottom,
      width: W,
      transformOrigin: 'bottom center',
      opacity: lit ? 1 : 0,
      transition: 'opacity 0.55s ease',
      filter: `${d.blur ? `blur(${d.blur}px) ` : ''}saturate(${d.sat}) brightness(${d.bright})`
    }
  }, d.ground && React.createElement("div", {
    style: {
      position: 'absolute',
      left: '50%',
      bottom: -8 * scale,
      width: haloR * 1.9,
      height: haloR * 0.6,
      transform: 'translateX(-50%)',
      background: 'radial-gradient(ellipse at 50% 50%, rgba(180,110,15,0.2) 0%, rgba(180,110,15,0) 70%)',
      pointerEvents: 'none'
    }
  }), d.ground && React.createElement("div", {
    style: {
      position: 'absolute',
      left: '50%',
      top: (15 + dy) * scale,
      width: haloR,
      height: haloR * 1.15,
      transform: 'translate(-50%, -50%)',
      background: 'radial-gradient(circle, rgba(220,140,20,0.25) 0%, rgba(220,140,20,0) 66%)',
      filter: 'blur(11px)',
      pointerEvents: 'none'
    }
  }), React.createElement("svg", {
    "aria-hidden": "true",
    viewBox: "0 0 26 72",
    width: W,
    height: H,
    style: {
      display: 'block',
      overflow: 'visible',
      position: 'relative'
    }
  }, React.createElement("defs", null, React.createElement("linearGradient", {
    id: `wax-${pos.key}`,
    x1: "0",
    y1: "0",
    x2: "0",
    y2: "1"
  }, React.createElement("stop", {
    offset: "0%",
    stopColor: "#e6dcbb"
  }), React.createElement("stop", {
    offset: "48%",
    stopColor: "#d8ceaa"
  }), React.createElement("stop", {
    offset: "100%",
    stopColor: "#9c8c64"
  })), React.createElement("linearGradient", {
    id: `flameBody-${pos.key}`,
    x1: "0.5",
    y1: "1",
    x2: "0.5",
    y2: "0"
  }, React.createElement("stop", {
    offset: "0%",
    stopColor: "#a82d06"
  }), React.createElement("stop", {
    offset: "30%",
    stopColor: "#ef7913"
  }), React.createElement("stop", {
    offset: "62%",
    stopColor: "#f8b62f"
  }), React.createElement("stop", {
    offset: "100%",
    stopColor: "#fff4c2"
  })), React.createElement("radialGradient", {
    id: `flameGlow-${pos.key}`,
    cx: "50%",
    cy: "58%",
    r: "55%"
  }, React.createElement("stop", {
    offset: "0%",
    stopColor: "#ffcd5c",
    stopOpacity: "0.85"
  }), React.createElement("stop", {
    offset: "45%",
    stopColor: "#f59a1f",
    stopOpacity: "0.34"
  }), React.createElement("stop", {
    offset: "100%",
    stopColor: "#f59a1f",
    stopOpacity: "0"
  })), React.createElement("radialGradient", {
    id: `waxInner-${pos.key}`,
    cx: "50%",
    cy: "30%",
    r: "62%"
  }, React.createElement("stop", {
    offset: "0%",
    stopColor: "#ffcf6a",
    stopOpacity: "0.5"
  }), React.createElement("stop", {
    offset: "55%",
    stopColor: "#e89a2e",
    stopOpacity: "0.12"
  }), React.createElement("stop", {
    offset: "100%",
    stopColor: "#e89a2e",
    stopOpacity: "0"
  })), React.createElement("filter", {
    id: `waxGlow-${pos.key}`,
    x: "-70%",
    y: "-40%",
    width: "240%",
    height: "180%"
  }, React.createElement("feDropShadow", {
    dx: "0",
    dy: "0",
    stdDeviation: "2.4",
    floodColor: "#c88214",
    floodOpacity: "0.42"
  }))), React.createElement("path", {
    d: `M 9.4 ${topY + 2} C 8.5 ${topY + 13}, 9.8 54, 10.2 70 L 15.8 70 C 16.3 55, 17.5 ${topY + 11}, 16.6 ${topY + 2} C 16 ${topY - 1}, 14.6 ${topY + 1.5}, 13.3 ${topY - 0.5} C 12 ${topY + 1.5}, 10.3 ${topY - 0.5}, 9.4 ${topY + 2} Z`,
    fill: `url(#wax-${pos.key})`,
    filter: d.ground ? `url(#waxGlow-${pos.key})` : undefined
  }), React.createElement("ellipse", {
    cx: "13",
    cy: topY + 8,
    rx: "3.4",
    ry: "9",
    fill: `url(#waxInner-${pos.key})`
  }), React.createElement("line", {
    x1: "11.4",
    y1: topY + 4,
    x2: "11.2",
    y2: "68",
    stroke: "#fff",
    strokeOpacity: "0.2",
    strokeWidth: "0.6"
  }), React.createElement("ellipse", {
    cx: "13",
    cy: topY,
    rx: "3.7",
    ry: "1.4",
    fill: "#dccfa3"
  }), React.createElement("g", {
    transform: `translate(0 ${dy})`
  }, React.createElement("rect", {
    x: "12.4",
    y: "19",
    width: "1.2",
    height: "7",
    rx: "0.6",
    fill: "#2e2114"
  }), d.smoke && React.createElement("path", {
    d: "M 13 1 q -3.5 -7 0.5 -13 q 3.5 -5.5 -0.5 -12",
    fill: "none",
    stroke: "#d8d2c8",
    strokeWidth: "1.4",
    strokeLinecap: "round",
    opacity: "0.06",
    style: {
      transformBox: 'fill-box',
      transformOrigin: '50% 100%',
      animation: lit ? `cg-smoke-rise 6s ease-in-out ${smokeDelay}s infinite` : 'none'
    }
  }), React.createElement("ellipse", {
    cx: "13",
    cy: "16",
    rx: "12",
    ry: "16",
    fill: `url(#flameGlow-${pos.key})`,
    style: {
      transformOrigin: '13px 25px',
      animation: lit ? `cg-flame-glow ${glowDur}s ease-in-out ${delay}s infinite` : 'none'
    }
  }), React.createElement("g", {
    transform: `rotate(${lean} 13 25)`
  }, React.createElement("ellipse", {
    cx: "13",
    cy: "23.5",
    rx: "2.6",
    ry: "3.4",
    fill: "#6ba3e0",
    opacity: "0.3"
  }), React.createElement("path", {
    d: flamePath,
    fill: `url(#flameBody-${pos.key})`,
    style: {
      transformOrigin: '13px 25px',
      animation: danceAnim
    }
  }), React.createElement("path", {
    d: corePath,
    fill: "#fff7dc",
    opacity: "0.9",
    style: {
      transformOrigin: '13px 24px',
      animation: coreAnim
    }
  })))));
}
const CANDLE_SPOTS = [{
  key: 'c0',
  left: '12%',
  bottom: '7%',
  depth: 'near',
  seed: 3
}, {
  key: 'c1',
  left: '26%',
  bottom: '6%',
  depth: 'near',
  seed: 8
}, {
  key: 'c2',
  left: '40%',
  bottom: '9%',
  depth: 'near',
  seed: 5
}, {
  key: 'c3',
  left: '52%',
  bottom: '6%',
  depth: 'near',
  seed: 12
}, {
  key: 'c4',
  left: '6%',
  bottom: '12%',
  depth: 'near',
  seed: 1
}, {
  key: 'c5',
  left: '4%',
  bottom: '22%',
  depth: 'mid',
  seed: 9
}, {
  key: 'c6',
  left: '60%',
  bottom: '15%',
  depth: 'mid',
  seed: 6
}, {
  key: 'c7',
  left: '70%',
  bottom: '23%',
  depth: 'mid',
  seed: 14
}, {
  key: 'c8',
  left: '49%',
  bottom: '19%',
  depth: 'mid',
  seed: 2
}, {
  key: 'c9',
  left: '64%',
  bottom: '30%',
  depth: 'mid',
  seed: 10
}, {
  key: 'c10',
  left: '3%',
  bottom: '38%',
  depth: 'far',
  seed: 4
}, {
  key: 'c11',
  left: '5%',
  bottom: '52%',
  depth: 'far',
  seed: 7
}, {
  key: 'c12',
  left: '2%',
  bottom: '66%',
  depth: 'far',
  seed: 13
}, {
  key: 'c13',
  left: '48%',
  bottom: '34%',
  depth: 'far',
  seed: 0
}, {
  key: 'c14',
  left: '57%',
  bottom: '41%',
  depth: 'far',
  seed: 11
}, {
  key: 'c15',
  left: '66%',
  bottom: '48%',
  depth: 'far',
  seed: 15
}, {
  key: 'c16',
  left: '72%',
  bottom: '38%',
  depth: 'far',
  seed: 5
}, {
  key: 'c17',
  left: '61%',
  bottom: '56%',
  depth: 'far',
  seed: 9
}, {
  key: 'c18',
  left: '53%',
  bottom: '28%',
  depth: 'far',
  seed: 3
}, {
  key: 'c19',
  left: '69%',
  bottom: '62%',
  depth: 'far',
  seed: 12
}, {
  key: 'c20',
  left: '5%',
  bottom: '30%',
  depth: 'far',
  seed: 8
}, {
  key: 'c21',
  left: '3%',
  bottom: '28%',
  depth: 'far',
  seed: 6
}];
function Hero() {
  const [lampOut, setLampOut] = React.useState(false);
  const [spots, setSpots] = React.useState([]);
  const [litCount, setLitCount] = React.useState(0);
  const timers = React.useRef([]);
  const busy = React.useRef(false);
  const clearTimers = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };
  const after = (ms, fn) => {
    const t = setTimeout(fn, ms);
    timers.current.push(t);
    return t;
  };
  React.useEffect(() => clearTimers, []);
  const lightFrom = (i, total) => {
    if (i >= total) {
      busy.current = false;
      return;
    }
    setLitCount(i + 1);
    after(420 + Math.random() * 480, () => lightFrom(i + 1, total));
  };
  const snuffFrom = n => {
    if (n <= 0) {
      setLampOut(false);
      after(560, () => {
        setSpots([]);
        busy.current = false;
      });
      return;
    }
    setLitCount(n - 1);
    after(220 + Math.random() * 260, () => snuffFrom(n - 1));
  };
  const toggleLamp = () => {
    if (busy.current) return;
    clearTimers();
    if (!lampOut) {
      busy.current = true;
      setLampOut(true);
      const count = Math.min(CANDLE_SPOTS.length, 13 + Math.floor(Math.random() * 6));
      const chosen = [...CANDLE_SPOTS].sort(() => Math.random() - 0.5).slice(0, count);
      setSpots(chosen);
      setLitCount(0);
      after(800, () => lightFrom(0, chosen.length));
    } else {
      busy.current = true;
      snuffFrom(litCount);
    }
  };
  const glow = lampOut && spots.length ? litCount / spots.length : lampOut ? 0 : 1;
  const sceneBright = lampOut ? 0.12 + 0.88 * glow : 1;
  const contentLit = {
    filter: `brightness(${sceneBright.toFixed(3)})`,
    transition: 'filter 0.7s ease'
  };
  const nameGlow = lampOut ? `0 0 ${(18 + 46 * glow).toFixed(0)}px rgba(220,150,45,${(0.32 * glow).toFixed(3)}), 0 0 ${(8 * glow).toFixed(0)}px rgba(255,205,110,${(0.22 * glow).toFixed(3)})` : 'none';
  return React.createElement("section", {
    id: "sec-top",
    className: "cg-wood",
    style: {
      position: 'relative',
      overflow: 'hidden',
      minHeight: '100vh',
      padding: '180px 80px 80px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between'
    }
  }, React.createElement("div", {
    className: "cg-candlelight",
    style: {
      top: '-12%',
      right: '-8%',
      width: 720,
      height: 720
    }
  }), React.createElement("div", {
    className: "cg-candlelight",
    style: {
      bottom: '-10%',
      left: '-6%',
      width: 500,
      height: 500,
      opacity: 0.6
    }
  }), React.createElement("div", {
    className: "cg-fog-band",
    style: {
      top: '24%',
      animation: 'cg-fog-roll 26s linear infinite',
      zIndex: 1
    }
  }), React.createElement("div", {
    className: "cg-fog-band",
    style: {
      top: '50%',
      animation: 'cg-fog-roll 34s linear infinite',
      animationDelay: '-12s',
      zIndex: 1
    }
  }), React.createElement("div", {
    className: "cg-fog-band",
    style: {
      top: '72%',
      animation: 'cg-fog-roll 30s linear infinite',
      animationDelay: '-20s',
      zIndex: 1
    }
  }), React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      pointerEvents: 'none',
      background: 'radial-gradient(ellipse at 65% 30%, transparent 0%, rgba(8,5,2,0.55) 70%, rgba(8,5,2,0.85) 100%)'
    }
  }), React.createElement("div", {
    className: "cg-fadeup cg-fadeup-3 cg-hero-lamp",
    style: {
      position: 'absolute',
      right: '6vw',
      bottom: 0,
      zIndex: 2,
      pointerEvents: 'none'
    }
  }, React.createElement("div", {
    style: {
      position: 'relative'
    }
  }, React.createElement(GasLamp, {
    height: 680,
    variant: "near-R",
    out: lampOut,
    onGlobeClick: toggleLamp
  }))), React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      zIndex: 3,
      pointerEvents: 'none',
      background: 'rgba(0,0,0,0.78)',
      opacity: lampOut ? 1 : 0,
      transition: 'opacity 0.5s ease'
    }
  }), React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      zIndex: 4,
      pointerEvents: 'none'
    }
  }, spots.map((p, i) => p.depth === 'far' && React.createElement(React.Fragment, {
    key: p.key
  }, React.createElement(CandlePool, {
    pos: p,
    lit: i < litCount
  }), React.createElement(Candle, {
    pos: p,
    lit: i < litCount
  })))), React.createElement("div", {
    className: "cg-egg-fog",
    style: {
      position: 'absolute',
      inset: 0,
      zIndex: 5,
      pointerEvents: 'none',
      opacity: lampOut ? 1 : 0,
      transition: 'opacity 0.9s ease'
    }
  }), React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      zIndex: 6,
      pointerEvents: 'none'
    }
  }, spots.map((p, i) => p.depth !== 'far' && React.createElement(React.Fragment, {
    key: p.key
  }, React.createElement(CandlePool, {
    pos: p,
    lit: i < litCount
  }), React.createElement(Candle, {
    pos: p,
    lit: i < litCount
  })))), React.createElement("div", {
    style: {
      position: 'relative',
      zIndex: 7,
      marginTop: 60,
      pointerEvents: 'none',
      ...contentLit
    }
  }, React.createElement("h1", {
    className: "cg-fadeup cg-fadeup-1",
    style: {
      fontFamily: 'var(--display-font)',
      fontSize: 'clamp(96px, 14vw, 220px)',
      fontWeight: 500,
      lineHeight: 0.88,
      letterSpacing: '-0.025em',
      margin: 0,
      color: 'var(--ink)',
      position: 'relative',
      textShadow: nameGlow,
      transition: 'text-shadow 0.7s ease'
    }
  }, (() => {
    const parts = (D.name || 'Carter Groff').trim().split(' ');
    const last = parts.length > 1 ? parts.pop() : '';
    return React.createElement(React.Fragment, null, parts.join(' '), React.createElement("br", null), React.createElement("span", {
      style: {
        fontStyle: 'italic',
        fontWeight: 400
      }
    }, last), React.createElement("span", {
      style: {
        color: 'var(--amber)'
      }
    }, "."));
  })()), React.createElement("div", {
    className: "cg-fadeup cg-fadeup-2 cg-hero-tagrow",
    style: {
      marginTop: 56,
      display: 'grid',
      gridTemplateColumns: '1fr auto',
      gap: 60,
      alignItems: 'end',
      maxWidth: 1280
    }
  }, React.createElement("p", {
    style: {
      fontFamily: 'var(--display-font)',
      fontStyle: 'italic',
      fontSize: 32,
      lineHeight: 1.3,
      maxWidth: 680,
      color: 'var(--ink-soft)',
      margin: 0,
      fontWeight: 400,
      textShadow: nameGlow,
      transition: 'text-shadow 0.7s ease'
    }
  }, THEME.tagline), React.createElement("div", {
    style: {
      textAlign: 'right'
    }
  }, React.createElement("div", {
    className: "cg-eyebrow",
    style: {
      marginBottom: 8
    }
  }, "Practicing since"), React.createElement("div", {
    style: {
      fontFamily: 'var(--display-font)',
      fontSize: 28,
      color: 'var(--ink)'
    }
  }, D.sinceYear || '2021')))), React.createElement("div", {
    className: "cg-fadeup cg-fadeup-3 cg-hero-foot",
    style: {
      position: 'relative',
      zIndex: 7,
      ...contentLit,
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-end',
      paddingTop: 50,
      borderTop: '1px solid var(--rule)'
    }
  }, React.createElement("a", {
    href: "#sec-work",
    className: "cg-hero-cta",
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 14,
      padding: '0 26px',
      color: 'var(--bg-deep)',
      background: 'var(--amber)',
      border: '1px solid var(--amber)',
      textDecoration: 'none',
      fontFamily: 'var(--ui-font)',
      fontSize: 15,
      fontWeight: 600,
      minHeight: 48,
      pointerEvents: 'auto'
    }
  }, "See the work"), React.createElement("div", {
    className: "cg-hero-meta",
    style: {
      display: 'flex',
      gap: 56,
      fontFamily: 'var(--ui-font)',
      fontSize: 13,
      color: 'var(--ink-mute)'
    }
  }, React.createElement("div", null, React.createElement("div", {
    style: {
      color: 'var(--ink-mute)',
      marginBottom: 6
    }
  }, "Discipline"), React.createElement("div", {
    style: {
      color: 'var(--ink-soft)'
    }
  }, "Marketing, video and design")), React.createElement("div", null, React.createElement("div", {
    style: {
      color: 'var(--ink-mute)',
      marginBottom: 6
    }
  }, "Based"), React.createElement("div", {
    style: {
      color: 'var(--ink-soft)'
    }
  }, D.location)), React.createElement("div", null, React.createElement("div", {
    style: {
      color: 'var(--ink-mute)',
      marginBottom: 6
    }
  }, "Reach"), React.createElement("div", {
    style: {
      color: 'var(--ink-soft)'
    }
  }, D.email)), React.createElement("div", null, React.createElement("div", {
    style: {
      color: 'var(--ink-mute)',
      marginBottom: 6
    }
  }, "This site"), React.createElement("div", {
    style: {
      color: 'var(--ink-soft)'
    }
  }, "Designed and developed by me")))));
}
function About() {
  return React.createElement("section", {
    id: "sec-about",
    style: {
      position: 'relative',
      padding: '160px 80px',
      background: 'var(--bg-soft)'
    }
  }, React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      overflow: 'hidden',
      pointerEvents: 'none',
      zIndex: 0
    }
  }, React.createElement("div", {
    className: "cg-candlelight",
    style: {
      top: '20%',
      left: '-10%',
      width: 500,
      height: 500,
      opacity: 0.4
    }
  }), React.createElement("div", {
    className: "cg-botanical",
    style: {
      position: 'absolute',
      top: -20,
      right: -30,
      transitionDelay: '.1s'
    }
  }, React.createElement(FernFrond, {
    height: 300,
    opacity: 0.5
  })), React.createElement("div", {
    className: "cg-botanical",
    style: {
      position: 'absolute',
      bottom: -10,
      left: 30,
      transitionDelay: '.3s'
    }
  }, React.createElement(BranchSprig, {
    size: 160,
    opacity: 0.55
  }))), React.createElement("div", {
    className: "cg-about-grid",
    style: {
      display: 'grid',
      gridTemplateColumns: '460px 1fr',
      gap: 100,
      maxWidth: 1320,
      margin: '0 auto',
      position: 'relative',
      zIndex: 2
    }
  }, React.createElement("div", {
    className: "cg-portrait-col"
  }, React.createElement("div", {
    style: {
      position: 'sticky',
      top: 100,
      paddingTop: 30
    }
  }, React.createElement("div", {
    className: "cg-portrait-reveal"
  }, React.createElement("div", {
    className: "cg-portrait-float"
  }, React.createElement(PaperFrame, {
    padding: 14,
    style: {
      background: '#15100a'
    }
  }, React.createElement("div", {
    style: {
      aspectRatio: '4/5',
      position: 'relative',
      overflow: 'hidden',
      background: '#0e0805'
    }
  }, React.createElement("img", {
    src: "assets/portrait.jpg",
    alt: "Carter Groff",
    width: 900,
    height: 1200,
    loading: "lazy",
    decoding: "async",
    style: {
      position: 'absolute',
      inset: 0,
      width: '100%',
      height: '100%',
      objectFit: 'cover',
      objectPosition: 'center 30%',
      filter: 'saturate(0.85) contrast(1.04)'
    }
  }), React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      pointerEvents: 'none',
      background: 'linear-gradient(180deg, rgba(228,180,90,0.06) 0%, transparent 35%), radial-gradient(ellipse at 50% 30%, rgba(228,180,90,0.10) 0%, transparent 55%)',
      mixBlendMode: 'screen'
    }
  }), React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      pointerEvents: 'none',
      boxShadow: 'inset 0 0 80px rgba(8,5,2,0.6)'
    }
  }), React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 8,
      border: '1px solid rgba(236,217,178,0.10)',
      pointerEvents: 'none'
    }
  })), React.createElement("div", {
    className: "cg-plate-caption",
    style: {
      marginTop: 14,
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'baseline',
      padding: '0 4px',
      fontFamily: 'var(--ui-font)',
      fontSize: 13,
      color: 'var(--ink-mute)',
      whiteSpace: 'nowrap'
    }
  }, React.createElement("span", null, "Plate I"), React.createElement("span", {
    style: {
      color: 'var(--amber)'
    }
  }, "Carter Groff"), React.createElement("span", null, "MMIII"))))))), React.createElement("div", {
    style: {
      paddingTop: 8
    }
  }, React.createElement("div", {
    className: "cg-reveal"
  }, React.createElement("h2", {
    style: {
      fontFamily: 'var(--display-font)',
      fontWeight: 500,
      fontSize: 80,
      lineHeight: 1.0,
      letterSpacing: '-0.02em',
      margin: '18px 0 40px',
      color: 'var(--ink)'
    }
  }, "A studio of one,", React.createElement("br", null), React.createElement("span", {
    style: {
      fontStyle: 'italic',
      fontWeight: 400
    }
  }, "telling stories worth keeping."))), React.createElement("div", {
    className: "cg-reveal",
    style: {
      fontFamily: 'var(--body-font)',
      fontSize: 19,
      lineHeight: 1.75,
      color: 'var(--ink-soft)',
      maxWidth: 640,
      transitionDelay: '.12s'
    }
  }, D.bio.map((p, i) => React.createElement("p", {
    key: i,
    style: {
      margin: '0 0 26px',
      textIndent: i === 0 ? 0 : '2em'
    }
  }, p))), React.createElement("div", {
    className: "cg-about-stats",
    style: {
      marginTop: 48,
      paddingTop: 36,
      borderTop: '1px solid var(--rule)',
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: 40,
      maxWidth: 640
    }
  }, React.createElement("div", null, React.createElement("div", {
    className: "cg-eyebrow",
    style: {
      marginBottom: 10
    }
  }, "Based in"), React.createElement("div", {
    style: {
      fontFamily: 'var(--display-font)',
      fontSize: 22,
      color: 'var(--ink)'
    }
  }, D.location)), React.createElement("div", null, React.createElement("div", {
    className: "cg-eyebrow",
    style: {
      marginBottom: 10
    }
  }, "Working since"), React.createElement("div", {
    style: {
      fontFamily: 'var(--display-font)',
      fontSize: 22,
      color: 'var(--ink)'
    }
  }, D.sinceYear || '2021')), React.createElement("div", null, React.createElement("div", {
    className: "cg-eyebrow",
    style: {
      marginBottom: 10
    }
  }, "Craft"), React.createElement("div", {
    style: {
      fontFamily: 'var(--body-font)',
      fontSize: 15,
      color: 'var(--ink-soft)',
      lineHeight: 1.55,
      fontStyle: 'italic'
    }
  }, (D.tools || 'video, copy, design, strategy').split(' · ').join(', ')))))));
}
function VideoWork({
  onOpen
}) {
  return React.createElement("section", {
    id: "sec-work",
    style: {
      position: 'relative',
      padding: '160px 80px',
      background: 'var(--bg)',
      overflow: 'hidden'
    }
  }, React.createElement("div", {
    className: "cg-candlelight",
    style: {
      top: '5%',
      right: '-12%',
      width: 600,
      height: 600,
      opacity: 0.5
    }
  }), React.createElement("header", {
    className: "cg-sec-head cg-reveal",
    style: {
      position: 'relative',
      zIndex: 2,
      maxWidth: 1320,
      margin: '0 auto 80px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-end'
    }
  }, React.createElement("div", null, React.createElement("h2", {
    style: {
      fontFamily: 'var(--display-font)',
      fontWeight: 500,
      fontSize: 88,
      lineHeight: 0.95,
      letterSpacing: '-0.02em',
      margin: '20px 0 0',
      color: 'var(--ink)'
    }
  }, "Six recent ", React.createElement("span", {
    style: {
      fontStyle: 'italic',
      fontWeight: 400
    }
  }, "pictures"), ".")), React.createElement("p", {
    style: {
      fontFamily: 'var(--body-font)',
      fontSize: 16,
      lineHeight: 1.65,
      color: 'var(--ink-soft)',
      margin: 0,
      maxWidth: 360,
      textAlign: 'right',
      fontStyle: 'italic'
    }
  }, "Brand work, documentary, and the occasional thing that just had to exist. Click any tile for the full picture.")), React.createElement("div", {
    className: "cg-work-grid cg-reveal",
    style: {
      position: 'relative',
      zIndex: 2,
      maxWidth: 1320,
      margin: '0 auto',
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: 36,
      transitionDelay: '.1s'
    }
  }, D.videos.map((v, i) => {
    const tint = v.color || TILE_HUES[i % TILE_HUES.length];
    const effImg = v.image || ytThumb(v.url);
    const autoThumb = !v.image && !!effImg;
    return React.createElement("article", {
      key: v.title,
      className: "cg-video-card",
      onClick: () => onOpen(i, 'video'),
      style: {
        cursor: 'pointer'
      }
    }, React.createElement("div", {
      className: "cg-photo",
      style: {
        aspectRatio: '16/10',
        position: 'relative',
        overflow: 'hidden'
      }
    }, React.createElement("div", {
      style: {
        position: 'absolute',
        inset: 0,
        background: tint
      }
    }), effImg && React.createElement("img", {
      src: effImg,
      alt: "",
      loading: "lazy",
      decoding: "async",
      style: {
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        objectFit: 'cover'
      }
    }), autoThumb && React.createElement("div", {
      style: {
        position: 'absolute',
        inset: 0,
        background: tint,
        mixBlendMode: 'color',
        opacity: 0.82
      }
    }), React.createElement("div", {
      style: {
        position: 'absolute',
        inset: 0,
        backgroundImage: "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence baseFrequency='0.85' numOctaves='2'/><feColorMatrix values='0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.6 0'/></filter><rect width='100%25' height='100%25' filter='url(%23n)' opacity='0.55'/></svg>\")",
        mixBlendMode: 'multiply'
      }
    }), React.createElement("div", {
      style: {
        position: 'absolute',
        inset: 0,
        background: 'radial-gradient(ellipse at 50% 40%, rgba(228,180,90,0.20) 0%, transparent 55%), linear-gradient(180deg, transparent 60%, rgba(8,5,2,0.7) 100%)'
      }
    }), React.createElement("div", {
      style: {
        position: 'absolute',
        inset: 8,
        border: '1px solid rgba(236,217,178,0.10)',
        pointerEvents: 'none'
      }
    }), React.createElement("div", {
      className: "play-btn",
      style: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 60,
        height: 60,
        border: '1px solid var(--ink-soft)',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(15, 10, 6, 0.55)',
        backdropFilter: 'blur(4px)',
        transition: 'background .3s ease, border-color .3s ease, transform .4s ease'
      }
    }, React.createElement("svg", {
      "aria-hidden": "true",
      width: "14",
      height: "14",
      viewBox: "0 0 14 14",
      fill: "var(--ink)"
    }, React.createElement("path", {
      d: "M3 1.5 L 12 7 L 3 12.5 Z"
    }))), React.createElement("div", {
      style: {
        position: 'absolute',
        top: 16,
        right: 16,
        fontFamily: 'var(--ui-font)',
        fontSize: 13,
        color: 'var(--ink-soft)'
      }
    }, v.length), React.createElement("div", {
      style: {
        position: 'absolute',
        top: 14,
        left: 16,
        fontFamily: 'var(--display-font)',
        fontSize: 12,
        letterSpacing: '0.1em',
        color: 'var(--amber)',
        fontStyle: 'italic'
      }
    }, "No. ", String(i + 1).padStart(2, '0'))), React.createElement("div", {
      style: {
        paddingTop: 22,
        paddingBottom: 4
      }
    }, React.createElement("div", {
      style: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'baseline',
        marginBottom: 10
      }
    }, React.createElement("span", {
      style: {
        fontFamily: 'var(--ui-font)',
        fontSize: 13,
        color: 'var(--amber)'
      }
    }, v.kind), React.createElement("span", {
      style: {
        fontFamily: 'var(--ui-font)',
        fontSize: 10,
        color: 'var(--ink-mute)',
        letterSpacing: '0.18em'
      }
    }, v.year)), React.createElement("h3", {
      style: {
        fontFamily: 'var(--display-font)',
        fontWeight: 500,
        fontSize: 26,
        lineHeight: 1.15,
        letterSpacing: '-0.01em',
        margin: 0,
        color: 'var(--ink)'
      }
    }, v.title)));
  })), React.createElement("div", {
    style: {
      position: 'relative',
      zIndex: 2,
      textAlign: 'center',
      marginTop: 90
    }
  }, React.createElement(BotanicalDivider, {
    width: 420,
    style: {
      margin: '0 auto'
    }
  })));
}
function DesignWork({
  onOpen
}) {
  return React.createElement("section", {
    id: "sec-design",
    style: {
      position: 'relative',
      padding: '160px 80px',
      background: 'var(--bg-soft)',
      overflow: 'hidden'
    }
  }, React.createElement("div", {
    className: "cg-candlelight",
    style: {
      top: '15%',
      left: '-12%',
      width: 540,
      height: 540,
      opacity: 0.45
    }
  }), React.createElement("header", {
    className: "cg-sec-head cg-reveal",
    style: {
      position: 'relative',
      zIndex: 2,
      maxWidth: 1320,
      margin: '0 auto 80px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-end'
    }
  }, React.createElement("div", null, React.createElement("h2", {
    style: {
      fontFamily: 'var(--display-font)',
      fontWeight: 500,
      fontSize: 88,
      lineHeight: 0.95,
      letterSpacing: '-0.02em',
      margin: '20px 0 0',
      color: 'var(--ink)'
    }
  }, "Design ", React.createElement("span", {
    style: {
      fontStyle: 'italic',
      fontWeight: 400
    }
  }, "work"), ".")), React.createElement("p", {
    style: {
      fontFamily: 'var(--body-font)',
      fontSize: 16,
      lineHeight: 1.65,
      color: 'var(--ink-soft)',
      margin: 0,
      maxWidth: 380,
      textAlign: 'right',
      fontStyle: 'italic'
    }
  }, "Identity, packaging, editorial. The slow craft of getting the letters and the colors right.")), React.createElement("div", {
    className: "cg-botanical",
    style: {
      position: 'absolute',
      top: 60,
      left: -50,
      pointerEvents: 'none',
      zIndex: 1,
      transitionDelay: '.15s'
    }
  }, React.createElement(IvyCurl, {
    size: 170,
    opacity: 0.45
  })), React.createElement("div", {
    className: "cg-design-grid cg-reveal",
    style: {
      position: 'relative',
      zIndex: 2,
      maxWidth: 1320,
      margin: '0 auto',
      transitionDelay: '.1s',
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      gridAutoRows: '260px',
      gap: 22
    }
  }, D.designs.map((d, i) => {
    const [cspan, rspan] = d.span;
    const disp = d.image && !isPdfData(d.image) ? d.image : d.thumb || '';
    const pdfOnly = (d.pdf || isPdfData(d.image)) && !disp;
    return React.createElement("div", {
      key: d.title,
      className: "cg-design-tile",
      onClick: () => onOpen(i, 'design'),
      style: {
        gridColumn: `span ${cspan}`,
        gridRow: `span ${rspan}`,
        cursor: 'pointer',
        position: 'relative'
      }
    }, React.createElement("div", {
      className: "cg-photo",
      style: {
        width: '100%',
        height: '100%',
        position: 'relative',
        overflow: 'hidden'
      }
    }, React.createElement("div", {
      style: {
        position: 'absolute',
        inset: 0,
        background: d.color || TILE_HUES[i % TILE_HUES.length]
      }
    }), disp && React.createElement("img", {
      src: disp,
      alt: "",
      loading: "lazy",
      decoding: "async",
      style: {
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        objectFit: 'cover'
      }
    }), pdfOnly && React.createElement("div", {
      style: {
        position: 'absolute',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        color: 'var(--ink)'
      }
    }, React.createElement("svg", {
      "aria-hidden": "true",
      width: cspan >= 2 ? 54 : 40,
      height: cspan >= 2 ? 54 : 40,
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "1.2",
      strokeLinejoin: "round"
    }, React.createElement("path", {
      d: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
    }), React.createElement("path", {
      d: "M14 2v6h6"
    }))), disp && d.color && React.createElement("div", {
      style: {
        position: 'absolute',
        inset: 0,
        background: d.color,
        mixBlendMode: 'color',
        opacity: 0.7
      }
    }), React.createElement("div", {
      style: {
        position: 'absolute',
        inset: 0,
        backgroundImage: "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence baseFrequency='0.9' numOctaves='2'/><feColorMatrix values='0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.55 0'/></filter><rect width='100%25' height='100%25' filter='url(%23n)' opacity='0.5'/></svg>\")",
        mixBlendMode: 'multiply'
      }
    }), React.createElement("div", {
      style: {
        position: 'absolute',
        inset: 0,
        background: 'radial-gradient(ellipse at 50% 35%, rgba(228,180,90,0.16) 0%, transparent 55%), linear-gradient(180deg, transparent 55%, rgba(8,5,2,0.7) 100%)'
      }
    }), React.createElement("div", {
      style: {
        position: 'absolute',
        inset: 8,
        border: '1px solid rgba(236,217,178,0.08)',
        pointerEvents: 'none'
      }
    }), React.createElement("div", {
      style: {
        position: 'absolute',
        left: 22,
        right: 22,
        bottom: 22,
        color: 'var(--ink)',
        textShadow: '0 1px 6px rgba(0,0,0,0.7)'
      }
    }, React.createElement("div", {
      style: {
        fontFamily: 'var(--ui-font)',
        fontSize: 13,
        color: 'var(--amber)',
        marginBottom: 8
      }
    }, d.kind), React.createElement("div", {
      className: "cg-design-tile-title",
      style: {
        fontFamily: 'var(--display-font)',
        fontSize: cspan >= 2 ? 36 : 24,
        fontWeight: 500,
        lineHeight: 1.05,
        letterSpacing: '-0.015em'
      }
    }, d.title)), React.createElement("div", {
      className: "cg-tile-arrow",
      style: {
        position: 'absolute',
        top: 18,
        right: 18,
        width: 32,
        height: 32,
        border: '1px solid var(--ink-soft)',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(15, 10, 6, 0.4)',
        opacity: 0,
        transition: 'opacity .3s ease'
      }
    }, React.createElement("svg", {
      "aria-hidden": "true",
      width: "11",
      height: "11",
      viewBox: "0 0 11 11",
      fill: "none",
      stroke: "var(--ink)",
      strokeWidth: "1.2"
    }, React.createElement("path", {
      d: "M2 9 L 9 2 M 4 2 H 9 V 7"
    }))), React.createElement("div", {
      style: {
        position: 'absolute',
        top: 18,
        left: 18,
        fontFamily: 'var(--display-font)',
        fontStyle: 'italic',
        fontSize: 11,
        color: 'var(--ink-mute)',
        letterSpacing: '0.06em'
      }
    }, "No. ", String(i + 1).padStart(2, '0'))));
  })));
}
const TV_LAT_TOP = 84,
  TV_LAT_BOT = -56;
const TV_W = 1000,
  TV_H = 389;
const tvX = lon => (lon + 180) / 360 * TV_W;
const tvY = lat => (TV_LAT_TOP - lat) / (TV_LAT_TOP - TV_LAT_BOT) * TV_H;
const tvLeft = lon => (lon + 180) / 360 * 100;
const tvTop = lat => (TV_LAT_TOP - lat) / (TV_LAT_TOP - TV_LAT_BOT) * 100;
const TV_LANDS = [[[-159, 70], [-156, 71], [-130, 70], [-110, 69], [-95, 72], [-82, 73], [-78, 68], [-66, 60], [-56, 52], [-60, 47], [-67, 45], [-70, 41], [-74, 40], [-76, 35], [-81, 31], [-80, 25], [-83, 29], [-90, 29], [-97, 28], [-97, 22], [-95, 18], [-92, 15], [-87, 13], [-83, 9], [-77, 8], [-83, 12], [-86, 16], [-92, 17], [-105, 19], [-110, 23], [-113, 27], [-117, 32], [-122, 37], [-124, 42], [-124, 48], [-128, 51], [-135, 57], [-141, 60], [-150, 59], [-160, 58], [-165, 60], [-166, 65], [-168, 66], [-159, 70]], [[-46, 83], [-20, 82], [-17, 76], [-22, 70], [-43, 60], [-50, 64], [-55, 69], [-58, 75], [-50, 80], [-46, 83]], [[-77, 8], [-72, 11], [-64, 10], [-60, 5], [-51, 4], [-50, 0], [-44, -2], [-38, -6], [-35, -8], [-39, -13], [-41, -22], [-48, -25], [-53, -34], [-58, -39], [-62, -41], [-65, -45], [-69, -51], [-66, -55], [-71, -54], [-74, -45], [-73, -37], [-71, -30], [-70, -23], [-71, -18], [-76, -14], [-81, -6], [-80, -2], [-79, 1], [-77, 8]], [[-17, 15], [-16, 20], [-10, 27], [-6, 36], [10, 37], [11, 33], [20, 32], [25, 32], [32, 31], [34, 28], [35, 23], [37, 18], [43, 12], [51, 12], [51, 7], [42, -1], [40, -10], [35, -18], [33, -26], [26, -34], [20, -35], [18, -32], [12, -17], [9, -1], [9, 4], [3, 6], [-5, 5], [-8, 4], [-13, 8], [-17, 15]], [[44, -16], [50, -16], [50, -25], [45, -25], [44, -16]], [[-10, 36], [-9, 43], [-2, 43], [1, 46], [-2, 49], [2, 51], [8, 54], [8, 57], [11, 58], [14, 55], [19, 54], [24, 57], [30, 60], [30, 66], [24, 66], [22, 70], [28, 71], [40, 68], [44, 68], [40, 60], [48, 56], [50, 46], [42, 43], [37, 47], [32, 46], [28, 46], [25, 41], [20, 40], [16, 43], [12, 45], [8, 44], [3, 43], [-3, 36], [-10, 36]], [[40, 68], [60, 70], [70, 72], [90, 76], [105, 78], [140, 73], [160, 70], [178, 66], [170, 60], [163, 58], [155, 52], [143, 46], [135, 44], [131, 43], [127, 40], [122, 40], [121, 32], [117, 24], [110, 21], [108, 16], [106, 10], [104, 8], [100, 8], [98, 12], [97, 16], [92, 21], [88, 21], [80, 15], [77, 8], [73, 18], [68, 24], [62, 25], [57, 25], [52, 27], [48, 30], [45, 38], [40, 42], [48, 48], [52, 54], [60, 62], [55, 66], [48, 66], [40, 68]], [[132, 31], [136, 34], [140, 35], [142, 36.5], [143, 38.5], [143.5, 41], [143, 43], [141, 43], [139, 40], [137, 37], [135, 35.5], [133, 35], [130, 33], [131, 31], [132, 31]], [[-24, 65], [-22, 66], [-14, 66], [-13, 65], [-15, 64], [-19, 63], [-22, 64], [-24, 65]], [[-5, 50], [-3, 51], [0, 51], [1, 53], [-1, 54], [-3, 55], [-5, 57], [-6, 58], [-5, 54], [-4, 53], [-5, 50]], [[-10, 52], [-6, 52], [-6, 55], [-10, 54], [-10, 52]], [[114, -22], [114, -34], [121, -34], [129, -32], [138, -35], [141, -38], [147, -38], [150, -37], [153, -31], [153, -25], [146, -19], [142, -11], [136, -12], [137, -16], [130, -15], [125, -14], [122, -18], [114, -22]], [[167, -46], [171, -44], [174, -41], [176, -38], [175, -42], [170, -46], [167, -46]], [[109, 2], [117, 5], [118, 1], [114, -3], [110, -3], [109, 2]], [[95, 5], [98, 2], [104, -5], [100, -3], [95, 5]], [[131, -1], [141, -3], [150, -7], [147, -9], [138, -8], [131, -5], [131, -1]], [[120, 18], [124, 17], [126, 10], [122, 6], [120, 10], [120, 18]]];
const TRAVELS = [{
  id: 'japan',
  name: 'Japan',
  year: '2024',
  lon: 139.6,
  lat: 35.6,
  blurb: 'Spent time studying Japanese business and culture through a formal study abroad program at James Madison University. Immersed in daily life across Tokyo and surrounding regions, gaining firsthand exposure to Japanese professional customs, communication styles, and creative industries.'
}, {
  id: 'romania',
  name: 'Romania',
  year: '2025',
  lon: 24.9,
  lat: 45.9,
  blurb: 'Traveled with Project Ruth to work alongside a local school, leading educational workshops for teachers and spending time with children in the community. The experience was hands-on and relational, focused on meaningful cross-cultural exchange and service.'
}, {
  id: 'iceland',
  name: 'Iceland',
  year: '2025',
  lon: -18.1,
  lat: 64.9,
  blurb: 'Completed a solo van journey along the Iceland Ring Road over the course of a week. Navigated remote landscapes, volcanic terrain, and coastal cliffs entirely independently, an exercise in self-reliance, adaptability, and finding stillness in unfamiliar places.'
}, {
  id: 'guatemala',
  name: 'Guatemala',
  year: '2025',
  lon: -90.4,
  lat: 15.5,
  blurb: 'Joined a Teams Commissioned for Christ International mission, contributing to construction projects, painting, and community outreach. Worked alongside a diverse team in a rural setting, focused on practical service and building connections across language and culture.'
}];
function tvGeoPath(geom) {
  if (!geom) return '';
  const ring = r => {
    let d = '',
      px = null;
    for (let k = 0; k < r.length; k++) {
      const X = tvX(r[k][0]),
        Y = tvY(r[k][1]);
      const cmd = k === 0 || px !== null && Math.abs(X - px) > TV_W / 2 ? 'M' : 'L';
      d += cmd + X.toFixed(1) + ' ' + Y.toFixed(1) + ' ';
      px = X;
    }
    return d + 'Z';
  };
  if (geom.type === 'Polygon') return geom.coordinates.map(ring).join(' ');
  if (geom.type === 'MultiPolygon') return geom.coordinates.map(p => p.map(ring).join(' ')).join(' ');
  return '';
}
const TV_GEO_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-50m.json';
function TravelDrawer() {
  const [open, setOpen] = React.useState(false);
  const [activeIdx, setActiveIdx] = React.useState(null);
  const [geo, setGeo] = React.useState(null);
  const [lightbox, setLightbox] = React.useState(false);
  const [hover, setHover] = React.useState(false);
  const [tip, setTip] = React.useState({
    x: 0,
    y: 0
  });
  const [lbPos, setLbPos] = React.useState({
    sx: 0,
    sy: 0,
    below: true,
    right: true
  });
  const [closing, setClosing] = React.useState(false);
  const [cardPos, setCardPos] = React.useState({
    left: 0,
    top: 0
  });
  const svgRef = React.useRef(null);
  const frameRef = React.useRef(null);
  const pinRefs = React.useRef([]);
  const viewRef = React.useRef({
    x: 0,
    y: 0,
    w: TV_W,
    h: TV_H
  });
  const rafRef = React.useRef(0);
  const cardRef = React.useRef(null);
  const closeTimerRef = React.useRef(0);
  const reopenLightboxRef = React.useRef(false);
  const travels = Array.isArray(D.travels) && D.travels.length ? D.travels : TRAVELS;
  const n = travels.length;
  const ZOOM = 2.4;
  const detail = activeIdx != null;
  React.useEffect(() => {
    let alive = true;
    fetch(TV_GEO_URL).then(r => r.json()).then(j => {
      if (!alive) return;
      let feats = null;
      if (window.topojson && j && j.objects && j.objects.countries) {
        feats = window.topojson.feature(j, j.objects.countries).features;
      } else if (j && j.features) {
        feats = j.features;
      }
      if (feats) setGeo(feats);
    }).catch(() => {});
    return () => {
      alive = false;
    };
  }, []);
  const paths = React.useMemo(() => geo ? geo.map(f => tvGeoPath(f.geometry)) : null, [geo]);
  const byName = React.useMemo(() => {
    const m = {};
    if (geo) geo.forEach(f => {
      const nm = f.properties && (f.properties.name || f.properties.NAME);
      if (nm) m[String(nm).toLowerCase()] = tvGeoPath(f.geometry);
    });
    return m;
  }, [geo]);
  const cur = detail ? travels[Math.min(activeIdx, n - 1)] : null;
  const highlightD = cur ? byName[(cur.name || '').toLowerCase()] : null;
  const select = i => {
    clearTimeout(closeTimerRef.current);
    reopenLightboxRef.current = lightbox;
    setLightbox(false);
    setClosing(false);
    setHover(false);
    setActiveIdx((i + n) % n);
  };
  const viewAll = () => {
    clearTimeout(closeTimerRef.current);
    setLightbox(false);
    setClosing(false);
    setHover(false);
    setActiveIdx(null);
  };
  const openLightbox = () => {
    const fr = frameRef.current;
    if (fr && cur) {
      const W = fr.clientWidth,
        H = fr.clientHeight;
      const {
        x,
        y,
        w,
        h
      } = viewRef.current;
      const s = Math.max(W / w, H / h);
      const sx = W / 2 + (tvX(cur.lon) - (x + w / 2)) * s;
      const sy = H / 2 + (tvY(cur.lat) - (y + h / 2)) * s;
      setLbPos({
        sx,
        sy,
        below: sy < H / 2,
        right: sx < W / 2
      });
    }
    setLightbox(true);
    setClosing(false);
  };
  const closeLightbox = () => {
    if (!lightbox) return;
    clearTimeout(closeTimerRef.current);
    setLightbox(false);
    setClosing(true);
    closeTimerRef.current = setTimeout(() => setClosing(false), 210);
  };
  const placeCard = React.useCallback(() => {
    const fr = frameRef.current,
      card = cardRef.current;
    if (!fr || !card) return;
    const W = fr.clientWidth,
      H = fr.clientHeight,
      cw = card.offsetWidth,
      ch = card.offsetHeight,
      pad = 10;
    let left = lbPos.right ? lbPos.sx + 16 : lbPos.sx - 16 - cw;
    let top = lbPos.below ? lbPos.sy + 16 : lbPos.sy - 16 - ch;
    left = Math.max(pad, Math.min(Math.max(pad, W - cw - pad), left));
    top = Math.max(pad, Math.min(Math.max(pad, H - ch - pad), top));
    setCardPos({
      left,
      top
    });
  }, [lbPos]);
  React.useLayoutEffect(() => {
    if (lightbox) placeCard();
  }, [lightbox, cur, placeCard]);
  const placeMarkers = React.useCallback(() => {
    const fr = frameRef.current;
    if (!fr) return;
    const W = fr.clientWidth,
      H = fr.clientHeight;
    const {
      x,
      y,
      w,
      h
    } = viewRef.current;
    const s = detail ? Math.max(W / w, H / h) : Math.min(W / w, H / h);
    travels.forEach((t, i) => {
      const el = pinRefs.current[i];
      if (!el) return;
      const sx = W / 2 + (tvX(t.lon) - (x + w / 2)) * s;
      const sy = H / 2 + (tvY(t.lat) - (y + h / 2)) * s;
      el.style.left = sx + 'px';
      el.style.top = sy + 'px';
      el.style.display = sx < -24 || sx > W + 24 || sy < -24 || sy > H + 24 ? 'none' : 'block';
    });
  }, [travels, detail]);
  const viewFor = React.useCallback(i => {
    const t = travels[i];
    const zw = TV_W / ZOOM,
      zh = TV_H / ZOOM;
    return {
      x: tvX(t.lon) - zw / 2,
      y: tvY(t.lat) - zh / 2,
      w: zw,
      h: zh
    };
  }, [travels]);
  const animateView = React.useCallback((target, dur = 640, onDone) => {
    cancelAnimationFrame(rafRef.current);
    const from = {
      ...viewRef.current
    };
    const t0 = performance.now();
    const ease = t => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    const step = now => {
      const p = Math.min(1, (now - t0) / dur),
        e = ease(p);
      const v = {
        x: from.x + (target.x - from.x) * e,
        y: from.y + (target.y - from.y) * e,
        w: from.w + (target.w - from.w) * e,
        h: from.h + (target.h - from.h) * e
      };
      viewRef.current = v;
      if (svgRef.current) svgRef.current.setAttribute('viewBox', `${v.x.toFixed(2)} ${v.y.toFixed(2)} ${v.w.toFixed(2)} ${v.h.toFixed(2)}`);
      placeMarkers();
      if (p < 1) rafRef.current = requestAnimationFrame(step);else if (onDone) onDone();
    };
    rafRef.current = requestAnimationFrame(step);
  }, [placeMarkers]);
  React.useEffect(() => {
    if (open) return;
    clearTimeout(closeTimerRef.current);
    reopenLightboxRef.current = false;
    setActiveIdx(null);
    setLightbox(false);
    setClosing(false);
    setHover(false);
    cancelAnimationFrame(rafRef.current);
    viewRef.current = {
      x: 0,
      y: 0,
      w: TV_W,
      h: TV_H
    };
    if (svgRef.current) svgRef.current.setAttribute('viewBox', `0 0 ${TV_W} ${TV_H}`);
  }, [open]);
  React.useEffect(() => {
    if (!open) return;
    animateView(detail ? viewFor(activeIdx) : {
      x: 0,
      y: 0,
      w: TV_W,
      h: TV_H
    }, 640, () => {
      if (reopenLightboxRef.current) {
        reopenLightboxRef.current = false;
        openLightbox();
      }
    });
  }, [open, activeIdx, detail, animateView, viewFor]);
  React.useEffect(() => {
    if (!open) return;
    const id = setTimeout(placeMarkers, 60);
    window.addEventListener('resize', placeMarkers);
    return () => {
      clearTimeout(id);
      window.removeEventListener('resize', placeMarkers);
    };
  }, [open, activeIdx, geo, placeMarkers]);
  React.useEffect(() => () => cancelAnimationFrame(rafRef.current), []);
  React.useEffect(() => {
    if (!lightbox) return;
    const onKey = e => {
      if (e.key === 'Escape') closeLightbox();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [lightbox]);
  return React.createElement("div", {
    style: {
      marginTop: 64
    }
  }, React.createElement("style", null, `
        @keyframes cg-tv-bob { 0%,100% { transform: translateY(0); } 50% { transform: translateY(3px); } }
        @keyframes cg-tv-slidein { from { opacity: 0; transform: translateX(40px); } to { opacity: 1; transform: none; } }
        @keyframes cg-tv-ping { 0% { transform: translate(-50%,-50%) scale(1); opacity: 0.55; } 70% { opacity: 0; } 100% { transform: translate(-50%,-50%) scale(3.4); opacity: 0; } }
        .cg-tv-drawer { transition: grid-template-rows .6s cubic-bezier(.22,1,.36,1); }
        .cg-tv-drawer > * { min-height: 0; }
        .cg-tv-trigger { cursor: pointer; background: none; border: 0;
          display: inline-flex; align-items: flex-end; gap: 12px;
          font-family: var(--ui-font); font-size: 12px; color: var(--amber); font-weight: 500;
          padding: 16px 0 6px; min-height: 44px;
          border-bottom: 1px solid var(--amber);
          transition: color .3s ease, border-color .3s ease; }
        .cg-tv-trigger:hover { color: var(--amber-lit); }
        .cg-tv-chev { transition: transform .6s cubic-bezier(.2,.7,.3,1); }
        .cg-tv-trigger:not(.is-open) .cg-tv-chev { animation: cg-tv-bob 1.8s ease-in-out infinite; }
        .cg-tv-trigger.is-open .cg-tv-chev { transform: rotate(180deg); }
        /* Stage: grid that animates from full-width map → split */
        .cg-tv-stage { display: grid; grid-template-columns: 1fr 0fr; column-gap: 0; align-items: stretch; position: relative;
          margin-top: 40px; transition: grid-template-columns .6s cubic-bezier(.4,0,.2,1), column-gap .6s cubic-bezier(.4,0,.2,1); }
        .cg-tv-stage.is-detail { grid-template-columns: 1.3fr 1fr; column-gap: 24px; }
        .cg-tv-left { display: flex; flex-direction: column; min-width: 0; height: 520px; }
        .cg-tv-mapframe { position: relative; flex: 1; min-height: 260px; background: #080604; overflow: visible;
          border: 1px solid #3d2a10; box-shadow: inset 0 0 0 1px rgba(0,0,0,0.5), inset 0 0 70px rgba(0,0,0,0.5); }
        /* HTML pins (constant size, tracked to the zoom) */
        .cg-tv-markers { position: absolute; inset: 0; pointer-events: none; z-index: 4; }
        .cg-tv-pin { position: absolute; width: 24px; height: 24px; transform: translate(-50%,-50%);
          pointer-events: all; cursor: pointer; }
        .cg-tv-dot { position: absolute; left: 50%; top: 50%; width: 11px; height: 11px; border-radius: 50%;
          transform: translate(-50%,-50%); background: #c8821e;
          box-shadow: 0 0 10px 2px rgba(200,130,30,0.6), 0 0 0 3px rgba(200,130,30,0.12); transition: background .25s, box-shadow .25s; }
        .cg-tv-pin:hover .cg-tv-dot { box-shadow: 0 0 14px 3px rgba(244,200,105,0.85), 0 0 0 5px rgba(244,200,105,0.16); }
        .cg-tv-dot.on { background: #f4c869; box-shadow: 0 0 16px 4px rgba(244,200,105,0.85), 0 0 0 5px rgba(244,200,105,0.2); }
        .cg-tv-pin:hover .cg-tv-dot.lb-open { filter: brightness(0.72); box-shadow: 0 0 7px 1px rgba(200,130,30,0.45), 0 0 0 4px rgba(200,130,30,0.12); }
        .cg-tv-ring { position: absolute; left: 50%; top: 50%; width: 11px; height: 11px; border-radius: 50%;
          border: 1px solid rgba(200,130,30,0.85); transform: translate(-50%,-50%);
          animation: cg-tv-ping 2.5s ease-out infinite; pointer-events: none; }
        /* View-all button (top-left of the map, split view only) */
        .cg-tv-viewall { position: absolute; top: 12px; left: 12px; z-index: 6; display: inline-flex; align-items: center; gap: 7px;
          background: rgba(13,9,5,0.78); border: 1px solid rgba(217,154,61,0.45); color: var(--amber); cursor: pointer;
          font-family: var(--ui-font); font-size: 13px;
          padding: 8px 12px; border-radius: 2px; backdrop-filter: blur(2px);
          transition: background .2s ease, border-color .2s ease; }
        .cg-tv-viewall:hover { background: rgba(13,9,5,0.95); border-color: var(--amber); }
        /* Country tabs (below the map) */
        .cg-tv-tabs { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 14px; }
        .cg-tv-caption + .cg-tv-tabs { margin-top: 8px; }
        .cg-tv-tab { background: none; border: 1px solid var(--card-edge); cursor: pointer;
          padding: 11px 16px; min-height: 44px;
          border-radius: 2px; font-family: var(--ui-font); font-size: 13px; color: var(--ink-mute);
          transition: color .2s ease, border-color .2s ease, background .2s ease; }
        .cg-tv-tab:hover { color: var(--ink-soft); border-color: var(--rule-strong); }
        .cg-tv-tab.is-on { color: #1a120b; background: var(--amber); border-color: var(--amber); font-weight: 600; }
        .cg-tv-caption { margin-top: 12px; text-align: left; font-family: var(--ui-font); font-size: 13px; color: var(--amber); opacity: 0.82; }
        /* Info panel */
        .cg-tv-info { min-width: 0; overflow: hidden; display: flex; height: 520px;
          background: #160e07; border: 1px solid rgba(217,154,61,0.22); box-shadow: var(--shadow); }
        .cg-tv-stage:not(.is-detail) .cg-tv-info { border-color: transparent; background: none; box-shadow: none; }
        .cg-tv-info-inner { width: 100%; min-width: 300px; padding: 32px; display: flex; flex-direction: column;
          animation: cg-tv-slidein .5s cubic-bezier(.2,.8,.25,1) both; }
        .cg-tv-place { font-family: var(--display-font); font-weight: 500; font-size: 46px; line-height: 1.02;
          letter-spacing: -0.02em; color: var(--amber); margin: 0 0 18px; }
        .cg-tv-desc { font-family: var(--body-font); font-size: 15px; line-height: 1.72; color: var(--ink-soft); margin: 0; }
        .cg-tv-viewphoto { margin-top: 24px; align-self: flex-start; background: none; border: 0; padding: 0 0 3px;
          cursor: pointer; display: inline-flex; align-items: center; gap: 8px; font-family: var(--ui-font);
          font-size: 13px; color: var(--amber);
          border-bottom: 1px solid transparent; transition: border-color .25s ease, color .25s ease; }
        .cg-tv-viewphoto:hover { border-bottom-color: var(--amber); color: var(--amber-lit); }
        .cg-tv-tip { position: absolute; z-index: 6; pointer-events: none; transform: translateY(-50%);
          background: rgba(13,9,5,0.82); border: 1px solid rgba(217,154,61,0.4); color: var(--amber);
          font-family: var(--ui-font); font-size: 13px;
          padding: 5px 9px; white-space: nowrap; }
        .cg-tv-lb { position: absolute; inset: 0; z-index: 20; background: transparent; }
        .cg-tv-lb-card { position: absolute; cursor: default; transform: rotate(2.5deg);
          animation: cg-tv-lbpop .3s cubic-bezier(.2,.8,.25,1) both; }
        .cg-tv-lb-card.is-closing { animation: cg-tv-lbpop-out .2s ease both; pointer-events: none; }
        @keyframes cg-tv-lbpop { from { transform: scale(0.1) rotate(2.5deg); opacity: 0; } to { transform: scale(1) rotate(2.5deg); opacity: 1; } }
        @keyframes cg-tv-lbpop-out { from { transform: scale(1) rotate(2.5deg); opacity: 1; } to { transform: scale(0.1) rotate(2.5deg); opacity: 0; } }
        .cg-tv-lb-card img { display: block; width: 220px; height: auto; border: 1px solid #c8821e;
          box-shadow: 0 4px 20px rgba(0,0,0,0.7); }
        .cg-tv-lb-empty { width: 220px; height: 160px; border: 1px solid #c8821e; box-shadow: 0 4px 20px rgba(0,0,0,0.7);
          background: #0d0905; display: flex; align-items: center; justify-content: center;
          color: rgba(217,154,61,0.4); font-size: 26px; }
        .cg-tv-lb-pin { position: absolute; width: 9px; height: 9px; border-radius: 50%; background: #c8821e;
          transform: translate(-50%,-50%); box-shadow: 0 0 8px 2px rgba(200,130,30,0.7); pointer-events: none; z-index: 1; }
      `), React.createElement("div", {
    style: {
      textAlign: 'center'
    }
  }, React.createElement("button", {
    className: 'cg-tv-trigger' + (open ? ' is-open' : ''),
    "aria-expanded": open,
    onClick: () => setOpen(o => !o)
  }, "Explore my travels", React.createElement("svg", {
    className: "cg-tv-chev",
    width: "14",
    height: "9",
    viewBox: "0 0 14 9",
    fill: "none",
    "aria-hidden": "true"
  }, React.createElement("path", {
    d: "M1 1.5L7 7.5L13 1.5",
    stroke: "currentColor",
    strokeWidth: "1.5",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  })))), React.createElement("div", {
    className: "cg-tv-drawer",
    style: {
      display: 'grid',
      gridTemplateRows: open ? '1fr' : '0fr',
      overflow: 'hidden'
    }
  }, React.createElement("div", {
    className: 'cg-tv-stage' + (detail ? ' is-detail' : '')
  }, React.createElement("div", {
    className: "cg-tv-left"
  }, React.createElement("div", {
    className: "cg-tv-mapframe",
    ref: frameRef
  }, React.createElement("svg", {
    ref: svgRef,
    role: "img",
    "aria-label": "World map of the places I have travelled",
    viewBox: `0 0 ${TV_W} ${TV_H}`,
    preserveAspectRatio: detail ? 'xMidYMid slice' : 'xMidYMid meet',
    style: {
      position: 'absolute',
      inset: 0,
      width: '100%',
      height: '100%',
      display: 'block'
    }
  }, React.createElement("defs", null, React.createElement("radialGradient", {
    id: "cgTvLand",
    cx: "50%",
    cy: "46%",
    r: "72%"
  }, React.createElement("stop", {
    offset: "0%",
    stopColor: "#241b0f"
  }), React.createElement("stop", {
    offset: "62%",
    stopColor: "#1f160c"
  }), React.createElement("stop", {
    offset: "100%",
    stopColor: "#18110a"
  })), React.createElement("radialGradient", {
    id: "cgTvVig",
    cx: "50%",
    cy: "50%",
    r: "80%"
  }, React.createElement("stop", {
    offset: "60%",
    stopColor: "#050302",
    stopOpacity: "0"
  }), React.createElement("stop", {
    offset: "100%",
    stopColor: "#050302",
    stopOpacity: "0.4"
  }))), React.createElement("rect", {
    x: "0",
    y: "0",
    width: TV_W,
    height: TV_H,
    fill: "#080604"
  }), React.createElement("g", {
    fill: "url(#cgTvLand)",
    stroke: "#2a1c0a",
    strokeWidth: "0.4",
    strokeOpacity: "0.5",
    strokeLinejoin: "round",
    vectorEffect: "non-scaling-stroke"
  }, paths ? paths.map((d, i) => React.createElement("path", {
    key: i,
    d: d,
    fillRule: "evenodd"
  })) : TV_LANDS.map((ring, i) => React.createElement("polygon", {
    key: i,
    points: ring.map(([lon, lat]) => `${tvX(lon).toFixed(1)},${tvY(lat).toFixed(1)}`).join(' ')
  }))), highlightD && React.createElement("path", {
    d: highlightD,
    fillRule: "evenodd",
    className: "cg-tv-country",
    fill: hover ? '#f4c869' : '#d99a3d',
    fillOpacity: hover ? 0.55 : 0.34,
    stroke: "#f4c869",
    strokeWidth: hover ? 1.4 : 1,
    strokeOpacity: "0.95",
    vectorEffect: "non-scaling-stroke",
    onClick: () => lightbox ? closeLightbox() : openLightbox(),
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    onMouseMove: e => {
      const r = frameRef.current && frameRef.current.getBoundingClientRect();
      if (r) setTip({
        x: e.clientX - r.left,
        y: e.clientY - r.top
      });
    },
    style: {
      cursor: 'pointer',
      pointerEvents: 'all',
      filter: hover ? 'drop-shadow(0 0 5px rgba(244,200,105,0.95))' : 'drop-shadow(0 0 2px rgba(244,200,105,0.7))'
    }
  }), React.createElement("rect", {
    x: "0",
    y: "0",
    width: TV_W,
    height: TV_H,
    fill: "url(#cgTvVig)",
    pointerEvents: "none"
  })), React.createElement("div", {
    className: "cg-tv-markers"
  }, travels.map((t, i) => {
    const act = detail && i === activeIdx;
    return React.createElement("div", {
      key: i,
      ref: el => pinRefs.current[i] = el,
      className: "cg-tv-pin",
      style: {
        display: 'none'
      },
      "aria-label": act ? lightbox ? 'Close photo' : 'View photo' : t.name,
      onClick: () => act ? lightbox ? closeLightbox() : openLightbox() : select(i),
      onMouseEnter: act ? () => setHover(true) : undefined,
      onMouseLeave: act ? () => setHover(false) : undefined,
      onMouseMove: act ? e => {
        const r = frameRef.current && frameRef.current.getBoundingClientRect();
        if (r) setTip({
          x: e.clientX - r.left,
          y: e.clientY - r.top
        });
      } : undefined
    }, React.createElement("span", {
      className: "cg-tv-ring"
    }), React.createElement("span", {
      className: 'cg-tv-dot' + (activeIdx === i ? ' on' : '') + (act && lightbox ? ' lb-open' : '')
    }));
  })), detail && React.createElement("button", {
    className: "cg-tv-viewall",
    onClick: viewAll,
    "aria-label": "Back to the world map"
  }, React.createElement("svg", {
    width: "11",
    height: "11",
    viewBox: "0 0 12 12",
    fill: "none"
  }, React.createElement("circle", {
    cx: "6",
    cy: "6",
    r: "5",
    stroke: "currentColor",
    strokeWidth: "1.2"
  }), React.createElement("path", {
    d: "M1 6h10M6 1c1.6 1.4 1.6 8.6 0 10M6 1c-1.6 1.4-1.6 8.6 0 10",
    stroke: "currentColor",
    strokeWidth: "0.9"
  })), "View all"), detail && hover && React.createElement("div", {
    className: "cg-tv-tip",
    style: {
      left: tip.x + 15,
      top: tip.y + 16,
      opacity: lightbox ? 0.7 : 1
    }
  }, lightbox ? 'Close' : 'View Photo')), !detail && React.createElement("div", {
    className: "cg-tv-caption"
  }, "Select a destination"), React.createElement("div", {
    className: "cg-tv-tabs"
  }, travels.map((t, i) => React.createElement("button", {
    key: i,
    className: 'cg-tv-tab' + (activeIdx === i ? ' is-on' : ''),
    onClick: () => select(i)
  }, t.name)))), React.createElement("div", {
    className: "cg-tv-info"
  }, cur && React.createElement("div", {
    className: "cg-tv-info-inner",
    key: activeIdx
  }, React.createElement("h3", {
    className: "cg-tv-place"
  }, cur.name), React.createElement("p", {
    className: "cg-tv-desc"
  }, cur.blurb), React.createElement("button", {
    className: "cg-tv-viewphoto",
    onClick: openLightbox,
    "aria-label": "View photo"
  }, React.createElement("svg", {
    width: "14",
    height: "14",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.7",
    strokeLinejoin: "round",
    strokeLinecap: "round"
  }, React.createElement("rect", {
    x: "2.5",
    y: "6.5",
    width: "19",
    height: "13",
    rx: "2"
  }), React.createElement("path", {
    d: "M8 6.5l1.6-2.2h4.8L16 6.5"
  }), React.createElement("circle", {
    cx: "12",
    cy: "13",
    r: "3.4"
  })), "View Photo"))), (lightbox || closing) && cur && React.createElement("div", {
    className: "cg-tv-lb",
    onClick: closeLightbox,
    style: {
      cursor: hover ? 'pointer' : 'default'
    },
    onMouseMove: e => {
      const r = frameRef.current && frameRef.current.getBoundingClientRect();
      if (r) setTip({
        x: e.clientX - r.left,
        y: e.clientY - r.top
      });
      const overCountry = document.elementsFromPoint(e.clientX, e.clientY).some(el => el.classList && el.classList.contains('cg-tv-country'));
      setHover(overCountry);
    }
  }, React.createElement("span", {
    className: "cg-tv-lb-pin",
    style: {
      left: lbPos.sx,
      top: lbPos.sy
    }
  }), React.createElement("div", {
    ref: cardRef,
    className: 'cg-tv-lb-card' + (closing ? ' is-closing' : ''),
    onClick: e => e.stopPropagation(),
    onMouseMove: e => {
      e.stopPropagation();
      setHover(false);
    },
    style: {
      left: cardPos.left,
      top: cardPos.top,
      transformOrigin: `${lbPos.sx - cardPos.left}px ${lbPos.sy - cardPos.top}px`
    }
  }, cur.image ? React.createElement("img", {
    src: cur.image,
    alt: cur.name,
    onLoad: placeCard
  }) : React.createElement("div", {
    className: "cg-tv-lb-empty"
  }, "\u25C6"))))));
}
function Resume() {
  return React.createElement("section", {
    id: "sec-resume",
    style: {
      position: 'relative',
      padding: '160px 80px',
      background: 'var(--bg-deep)',
      overflow: 'hidden'
    }
  }, React.createElement("div", {
    className: "cg-candlelight",
    style: {
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      width: 800,
      height: 800,
      opacity: 0.25
    }
  }), React.createElement("div", {
    style: {
      position: 'relative',
      zIndex: 2,
      maxWidth: 1100,
      margin: '0 auto'
    }
  }, React.createElement("header", {
    className: "cg-reveal",
    style: {
      textAlign: 'center',
      marginBottom: 90
    }
  }, React.createElement("h2", {
    style: {
      fontFamily: 'var(--display-font)',
      fontWeight: 500,
      fontSize: 88,
      lineHeight: 1,
      letterSpacing: '-0.02em',
      margin: '20px 0 24px',
      color: 'var(--ink)'
    }
  }, "Where I\u2019ve ", React.createElement("span", {
    style: {
      fontStyle: 'italic',
      fontWeight: 400
    }
  }, "been"), "."), React.createElement(BotanicalDivider, {
    width: 320,
    style: {
      margin: '0 auto'
    }
  })), React.createElement("div", {
    className: "cg-reveal",
    style: {
      position: 'relative',
      transitionDelay: '.1s'
    }
  }, React.createElement("div", {
    className: "cg-resume-rail",
    style: {
      position: 'absolute',
      left: 144,
      top: 6,
      bottom: 6,
      width: 1,
      background: 'var(--rule)'
    }
  }), D.resume.map((r, i) => React.createElement("div", {
    key: i,
    style: {
      position: 'relative',
      marginBottom: 56,
      paddingBottom: 40,
      borderBottom: i < D.resume.length - 1 ? '1px solid var(--rule)' : 'none'
    }
  }, React.createElement("div", {
    className: "cg-resume-row",
    style: {
      display: 'grid',
      gridTemplateColumns: '128px 1fr',
      gap: 60,
      alignItems: 'baseline'
    }
  }, React.createElement("div", {
    style: {
      paddingTop: 8,
      textAlign: 'right'
    }
  }, React.createElement("div", {
    style: {
      fontFamily: 'var(--ui-font)',
      fontSize: 13,
      color: 'var(--amber)',
      fontWeight: 500,
      marginBottom: 8
    }
  }, r.dates), React.createElement("div", {
    style: {
      fontFamily: 'var(--body-font)',
      fontSize: 13,
      color: 'var(--ink-mute)',
      fontStyle: 'italic'
    }
  }, r.city)), React.createElement("div", {
    className: "cg-resume-dot",
    style: {
      position: 'absolute',
      left: 138,
      top: 14,
      width: 13,
      height: 13,
      borderRadius: '50%',
      animationDelay: (0.2 + i / Math.max(1, D.resume.length - 1) * 0.9).toFixed(2) + 's',
      background: 'var(--bg-deep)',
      border: '1px solid var(--amber)',
      boxShadow: '0 0 0 5px var(--bg-deep), 0 0 14px var(--amber-glow)'
    }
  }), React.createElement("div", {
    className: "cg-resume-body",
    style: {
      paddingLeft: 32
    }
  }, React.createElement("h3", {
    style: {
      fontFamily: 'var(--display-font)',
      fontWeight: 500,
      fontSize: 32,
      lineHeight: 1.15,
      letterSpacing: '-0.015em',
      margin: '0 0 6px',
      color: 'var(--ink)'
    }
  }, r.role), React.createElement("div", {
    style: {
      fontFamily: 'var(--display-font)',
      fontSize: 17,
      color: 'var(--ink-soft)',
      fontStyle: 'italic',
      marginBottom: r.promoted ? 10 : 18
    }
  }, r.company), r.promoted && React.createElement("div", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 8,
      marginBottom: 18,
      padding: '5px 11px',
      border: '1px solid var(--amber)',
      borderRadius: 2,
      fontFamily: 'var(--ui-font)',
      fontSize: 13,
      color: 'var(--amber)'
    }
  }, r.promoted), React.createElement("ul", {
    style: {
      margin: 0,
      padding: 0,
      listStyle: 'none'
    }
  }, r.bullets.map((b, j) => React.createElement("li", {
    key: j,
    style: {
      fontFamily: 'var(--body-font)',
      fontSize: 15,
      lineHeight: 1.7,
      color: 'var(--ink-soft)',
      marginBottom: 8,
      paddingLeft: 22,
      position: 'relative'
    }
  }, React.createElement("span", {
    style: {
      position: 'absolute',
      left: 0,
      top: 12,
      width: 12,
      height: 1,
      background: 'var(--ink-dim)'
    }
  }), b)))))))), React.createElement(TravelDrawer, null)));
}
function Contact() {
  const [state, setState] = React.useState({
    name: '',
    email: '',
    message: ''
  });
  const [sent, setSent] = React.useState(false);
  const [sending, setSending] = React.useState(false);
  const [errors, setErrors] = React.useState({});
  const [sendErr, setSendErr] = React.useState('');
  async function submit(e) {
    e.preventDefault();
    const errs = {};
    if (!state.name.trim()) errs.name = 'A name, please.';
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(state.email)) errs.email = 'A working email helps me write back.';
    if (!state.message.trim()) errs.message = 'A message, please.';
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    setSending(true);
    setSendErr('');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(state)
      });
      if (!res.ok) throw new Error('send failed');
      setSent(true);
    } catch (e2) {
      setSendErr('Could not send just now — try again, or email me directly below.');
    }
    setSending(false);
  }
  const AUTOCOMPLETE = {
    name: 'name',
    email: 'email',
    message: 'off'
  };
  const field = (label, key, type = 'text', rows = 0) => React.createElement("label", {
    style: {
      display: 'block',
      marginBottom: 32
    }
  }, React.createElement("div", {
    style: {
      fontFamily: 'var(--ui-font)',
      fontSize: 13,
      color: 'var(--ink-mute)',
      marginBottom: 12
    }
  }, label), rows ? React.createElement("textarea", {
    value: state[key],
    rows: rows,
    onChange: e => setState({
      ...state,
      [key]: e.target.value
    }),
    autoComplete: AUTOCOMPLETE[key],
    "aria-required": "true",
    "aria-invalid": errors[key] ? 'true' : undefined,
    "aria-describedby": errors[key] ? `cg-err-${key}` : undefined,
    style: {
      width: '100%',
      background: 'transparent',
      border: 'none',
      borderBottom: `1px solid ${errors[key] ? 'var(--terracotta)' : 'var(--rule-strong)'}`,
      fontFamily: 'var(--display-font)',
      fontSize: 22,
      lineHeight: 1.5,
      color: 'var(--ink)',
      padding: '10px 0',
      resize: 'none',
      outline: 'none'
    }
  }) : React.createElement("input", {
    value: state[key],
    type: type,
    onChange: e => setState({
      ...state,
      [key]: e.target.value
    }),
    autoComplete: AUTOCOMPLETE[key],
    "aria-required": "true",
    "aria-invalid": errors[key] ? 'true' : undefined,
    "aria-describedby": errors[key] ? `cg-err-${key}` : undefined,
    style: {
      width: '100%',
      background: 'transparent',
      border: 'none',
      borderBottom: `1px solid ${errors[key] ? 'var(--terracotta)' : 'var(--rule-strong)'}`,
      fontFamily: 'var(--display-font)',
      fontSize: 24,
      color: 'var(--ink)',
      padding: '10px 0',
      outline: 'none'
    }
  }), errors[key] && React.createElement("div", {
    id: `cg-err-${key}`,
    role: "alert",
    style: {
      fontFamily: 'var(--body-font)',
      fontStyle: 'italic',
      fontSize: 13,
      color: 'var(--terracotta-lit)',
      marginTop: 8
    }
  }, errors[key]));
  return React.createElement("section", {
    id: "sec-contact",
    style: {
      position: 'relative',
      padding: '160px 80px 100px',
      background: 'var(--bg)',
      overflow: 'hidden'
    }
  }, React.createElement("div", {
    className: "cg-candlelight",
    style: {
      top: '-15%',
      left: '50%',
      transform: 'translateX(-50%)',
      width: 900,
      height: 700,
      opacity: 0.45
    }
  }), React.createElement("div", {
    className: "cg-botanical",
    style: {
      position: 'absolute',
      top: 40,
      left: -40,
      pointerEvents: 'none',
      zIndex: 1,
      transitionDelay: '.1s'
    }
  }, React.createElement(LooseSprig, {
    size: 240,
    opacity: 0.45
  })), React.createElement("div", {
    className: "cg-botanical",
    style: {
      position: 'absolute',
      top: 40,
      right: -40,
      pointerEvents: 'none',
      zIndex: 1,
      transitionDelay: '.25s'
    }
  }, React.createElement(LooseSprig, {
    size: 240,
    opacity: 0.45,
    flip: true
  })), React.createElement("div", {
    style: {
      position: 'relative',
      zIndex: 2,
      maxWidth: 900,
      margin: '0 auto'
    }
  }, sent ? React.createElement("div", {
    className: "cg-fadeup",
    style: {
      textAlign: 'center',
      padding: '60px 0',
      position: 'relative',
      zIndex: 2
    }
  }, React.createElement("div", {
    className: "cg-divider",
    style: {
      width: 220
    }
  }, React.createElement("span", {
    className: "line",
    style: {
      background: 'var(--amber)'
    }
  }), React.createElement("span", {
    className: "dot"
  }), React.createElement("span", {
    className: "line",
    style: {
      background: 'var(--amber)'
    }
  })), React.createElement("h3", {
    style: {
      fontFamily: 'var(--display-font)',
      fontSize: 48,
      fontWeight: 500,
      color: 'var(--ink)',
      margin: '36px 0 16px',
      letterSpacing: '-0.015em'
    }
  }, "Thank you, ", state.name.split(' ')[0], "."), React.createElement("p", {
    style: {
      fontFamily: 'var(--body-font)',
      fontSize: 17,
      fontStyle: 'italic',
      color: 'var(--ink-soft)',
      maxWidth: 480,
      marginInline: 'auto',
      lineHeight: 1.7
    }
  }, "Your letter\u2019s on its way. I\u2019ll write back within the week, usually sooner.")) : React.createElement(React.Fragment, null, React.createElement("header", {
    className: "cg-reveal",
    style: {
      textAlign: 'center',
      marginBottom: 70
    }
  }, React.createElement("h2", {
    style: {
      fontFamily: 'var(--display-font)',
      fontWeight: 500,
      fontSize: 96,
      lineHeight: 0.95,
      letterSpacing: '-0.02em',
      margin: '20px 0 28px',
      color: 'var(--ink)'
    }
  }, "Write me a ", React.createElement("span", {
    style: {
      fontStyle: 'italic',
      fontWeight: 400
    }
  }, "letter"), "."), React.createElement("p", {
    style: {
      fontFamily: 'var(--body-font)',
      fontSize: 18,
      fontStyle: 'italic',
      color: 'var(--ink-soft)',
      margin: 0,
      maxWidth: 540,
      marginInline: 'auto',
      lineHeight: 1.65
    }
  }, "Project ideas, collaborations, or just a kind word. I read everything that comes in, and I write back the same week.")), React.createElement("form", {
    onSubmit: submit,
    style: {
      maxWidth: 700,
      marginInline: 'auto'
    }
  }, React.createElement("div", {
    className: "cg-contact-grid cg-reveal",
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 56,
      transitionDelay: '.1s'
    }
  }, field('Your name', 'name'), field('Your email', 'email', 'email')), field('Your message', 'message', 'text', 4), sendErr && React.createElement("div", {
    style: {
      fontFamily: 'var(--body-font)',
      fontStyle: 'italic',
      fontSize: 13,
      color: 'var(--terracotta-lit)',
      marginTop: -8,
      marginBottom: 24
    }
  }, sendErr), React.createElement("div", {
    className: "cg-contact-foot",
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: 44,
      paddingTop: 32,
      borderTop: '1px solid var(--rule)'
    }
  }, React.createElement("p", {
    style: {
      fontFamily: 'var(--body-font)',
      fontStyle: 'italic',
      fontSize: 14,
      color: 'var(--ink-mute)',
      margin: 0,
      maxWidth: 340
    }
  }, "Or, if it\u2019s easier: ", React.createElement("a", {
    href: `mailto:${D.email}`,
    style: {
      color: 'var(--amber)',
      textDecoration: 'none',
      borderBottom: '1px solid currentColor'
    }
  }, D.email)), React.createElement("button", {
    type: "submit",
    className: "cg-send",
    disabled: sending,
    style: {
      background: 'transparent',
      color: 'var(--ink)',
      border: '1px solid var(--amber)',
      padding: '18px 36px',
      cursor: sending ? 'wait' : 'pointer',
      opacity: sending ? 0.6 : 1,
      fontFamily: 'var(--ui-font)',
      fontSize: 13,
      fontWeight: 500,
      transition: 'background .3s ease, color .3s ease'
    }
  }, sending ? 'Sending…' : 'Send it off')))), React.createElement("div", {
    style: {
      marginTop: 110,
      textAlign: 'center',
      fontFamily: 'var(--display-font)',
      fontStyle: 'italic',
      fontSize: 24,
      color: 'var(--ink-soft)'
    }
  }, THEME.closing)));
}
function SocialGlyph({
  kind
}) {
  const p = {
    width: 26,
    height: 26,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.6,
    strokeLinecap: 'round',
    strokeLinejoin: 'round'
  };
  if (kind === 'tiktok') return React.createElement("svg", _extends({
    "aria-hidden": "true"
  }, p), React.createElement("path", {
    d: "M9 8.5a4 4 0 1 0 4 4V3c.8 1.9 2.4 3.2 4.5 3.4"
  }));
  if (kind === 'instagram') return React.createElement("svg", _extends({
    "aria-hidden": "true"
  }, p), React.createElement("rect", {
    x: "3",
    y: "3",
    width: "18",
    height: "18",
    rx: "5"
  }), React.createElement("circle", {
    cx: "12",
    cy: "12",
    r: "4"
  }), React.createElement("circle", {
    cx: "17",
    cy: "7",
    r: "0.6",
    fill: "currentColor",
    stroke: "none"
  }));
  return (React.createElement("svg", _extends({
      "aria-hidden": "true"
    }, p), React.createElement("rect", {
      x: "2.5",
      y: "5.5",
      width: "19",
      height: "13",
      rx: "3.5"
    }), React.createElement("path", {
      d: "M10 9.5l5 2.5-5 2.5z",
      fill: "currentColor",
      stroke: "none"
    }))
  );
}
function SocialWindow({
  s,
  index,
  total,
  onClose
}) {
  const [hover, setHover] = React.useState(false);
  const mid = (total - 1) / 2;
  const offset = index - mid;
  const tilt = offset * 5;
  const lift = -Math.abs(offset) * 6;
  return React.createElement("a", {
    href: s.url || '#',
    target: "_blank",
    rel: "noopener noreferrer",
    onClick: e => {
      e.stopPropagation();
      if (!s.url) {
        e.preventDefault();
        return;
      }
      const w = window.open(s.url, '_blank', 'noopener');
      if (w) e.preventDefault();
    },
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    style: {
      display: 'block',
      width: 244,
      textDecoration: 'none',
      transform: `translateY(${lift}px) rotate(${hover ? 0 : tilt}deg) scale(${hover ? 1.035 : 1})`,
      transition: 'transform .3s cubic-bezier(.2,.8,.2,1)',
      animation: `cgWinIn .45s cubic-bezier(.2,.9,.25,1) ${index * 0.08}s`
    }
  }, React.createElement("div", {
    style: {
      background: 'var(--bg-soft)',
      border: '1px solid var(--card-edge)',
      borderRadius: 7,
      overflow: 'hidden',
      boxShadow: hover ? '0 26px 60px rgba(0,0,0,0.6)' : '0 16px 40px rgba(0,0,0,0.5)',
      transition: 'box-shadow .3s'
    }
  }, React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      padding: '9px 12px',
      background: 'var(--bg-deep)',
      borderBottom: '1px solid var(--rule)'
    }
  }, React.createElement("span", {
    style: {
      width: 9,
      height: 9,
      borderRadius: '50%',
      background: 'var(--terracotta)'
    }
  }), React.createElement("span", {
    style: {
      width: 9,
      height: 9,
      borderRadius: '50%',
      background: 'var(--amber)'
    }
  }), React.createElement("span", {
    style: {
      width: 9,
      height: 9,
      borderRadius: '50%',
      background: 'var(--sage)'
    }
  }), React.createElement("span", {
    style: {
      marginLeft: 'auto',
      fontFamily: 'var(--ui-font)',
      fontSize: 13,
      color: 'var(--ink-mute)'
    }
  }, s.label)), React.createElement("div", {
    style: {
      padding: '20px 18px 18px',
      textAlign: 'center'
    }
  }, React.createElement("div", {
    style: {
      width: 52,
      height: 52,
      margin: '0 auto 14px',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'var(--amber)',
      border: '1px solid var(--card-edge)',
      background: 'var(--bg)'
    }
  }, React.createElement(SocialGlyph, {
    kind: s.kind
  })), React.createElement("div", {
    style: {
      fontFamily: 'var(--display-font)',
      fontSize: 22,
      color: 'var(--ink)',
      letterSpacing: '-0.01em'
    }
  }, "@cargli"), React.createElement("div", {
    style: {
      marginTop: 12,
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      fontFamily: 'var(--ui-font)',
      fontSize: 13,
      color: hover ? 'var(--amber)' : 'var(--ink-soft)',
      transition: 'color .2s'
    }
  }, "Open ", s.label, " ", React.createElement("span", {
    style: {
      fontSize: 13
    }
  }, "\u2197")))));
}
function StatBand() {
  const ref = React.useRef(null);
  const [val, setVal] = React.useState(0);
  const [open, setOpen] = React.useState(false);
  const S = D.socials || {};
  const windows = [{
    kind: 'tiktok',
    label: 'TikTok',
    url: S.tiktok
  }, {
    kind: 'instagram',
    label: 'Instagram',
    url: S.instagram
  }, {
    kind: 'youtube',
    label: 'YouTube',
    url: S.youtube
  }];
  React.useEffect(() => {
    if (!open) return;
    const onKey = e => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);
  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let started = false,
      animRaf = 0;
    const animate = () => {
      const target = 400000,
        dur = 2000,
        t0 = performance.now();
      if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        setVal(target);
        return;
      }
      const easeOut = t => 1 - Math.pow(1 - t, 3);
      const step = now => {
        const p = Math.min(1, (now - t0) / dur);
        setVal(Math.round(target * easeOut(p)));
        if (p < 1) animRaf = requestAnimationFrame(step);
      };
      animRaf = requestAnimationFrame(step);
    };
    const io = new IntersectionObserver(entries => {
      if (started) return;
      if (entries.some(e => e.isIntersecting)) {
        started = true;
        animate();
        io.disconnect();
      }
    }, {
      threshold: 0.2
    });
    io.observe(el);
    return () => {
      io.disconnect();
      if (animRaf) cancelAnimationFrame(animRaf);
    };
  }, []);
  return React.createElement("section", {
    id: "sec-stat",
    ref: ref,
    style: {
      position: 'relative',
      padding: '96px 80px',
      background: 'var(--bg-soft)',
      textAlign: 'center',
      overflow: 'hidden'
    }
  }, React.createElement("div", {
    className: "cg-candlelight",
    style: {
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      width: 460,
      height: 460,
      opacity: 0.25
    }
  }), React.createElement("div", {
    style: {
      position: 'relative',
      zIndex: 2,
      maxWidth: 720,
      margin: '0 auto'
    }
  }, React.createElement("div", {
    style: {
      fontFamily: 'var(--display-font)',
      fontWeight: 500,
      fontSize: 'clamp(44px, 7vw, 84px)',
      lineHeight: 0.95,
      letterSpacing: '-0.03em',
      color: 'var(--ink)'
    }
  }, val.toLocaleString('en-US'), React.createElement("span", {
    style: {
      color: 'var(--amber)'
    }
  }, "+")), React.createElement("div", {
    style: {
      marginTop: 14,
      fontFamily: 'var(--display-font)',
      fontStyle: 'italic',
      fontSize: 'clamp(15px, 1.6vw, 19px)',
      color: 'var(--ink-soft)'
    }
  }, "followers across personal platforms."), React.createElement("div", {
    style: {
      marginTop: 16,
      fontFamily: 'var(--ui-font)',
      fontSize: 13,
      color: 'var(--ink-mute)'
    }
  }, React.createElement("button", {
    type: "button",
    onClick: () => setOpen(true),
    "aria-haspopup": "dialog",
    className: "cg-handle",
    style: {
      font: 'inherit',
      letterSpacing: 'inherit',
      textTransform: 'inherit',
      color: 'var(--amber)',
      background: 'none',
      border: 'none',
      padding: 0,
      cursor: 'pointer',
      borderBottom: '1px solid rgba(245,205,106,0.45)'
    }
  }, "@cargli"), ' ', "on TikTok, Instagram & YouTube")), open && React.createElement("div", {
    onClick: () => setOpen(false),
    role: "dialog",
    "aria-modal": "true",
    style: {
      position: 'fixed',
      inset: 0,
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      background: 'rgba(8,5,2,0.74)',
      backdropFilter: 'blur(3px)'
    }
  }, React.createElement("button", {
    type: "button",
    onClick: () => setOpen(false),
    "aria-label": "Close",
    style: {
      position: 'absolute',
      top: 22,
      right: 26,
      width: 42,
      height: 42,
      borderRadius: '50%',
      border: '1px solid var(--card-edge)',
      background: 'var(--bg-soft)',
      color: 'var(--ink-soft)',
      fontSize: 20,
      cursor: 'pointer',
      lineHeight: 1
    }
  }, "\xD7"), React.createElement("div", {
    onClick: e => e.stopPropagation(),
    style: {
      textAlign: 'center'
    }
  }, React.createElement("div", {
    style: {
      marginBottom: 26,
      fontFamily: 'var(--display-font)',
      fontStyle: 'italic',
      fontSize: 'clamp(20px, 3vw, 28px)',
      color: 'var(--ink)'
    }
  }, "Find me at ", React.createElement("span", {
    style: {
      color: 'var(--amber)'
    }
  }, "@cargli")), React.createElement("div", {
    style: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: 22,
      justifyContent: 'center',
      alignItems: 'flex-start'
    }
  }, windows.map((s, i) => React.createElement(SocialWindow, {
    key: s.kind,
    s: s,
    index: i,
    total: windows.length,
    onClose: () => setOpen(false)
  }))))));
}
function Footer() {
  return React.createElement("footer", {
    style: {
      position: 'relative',
      padding: '50px 80px',
      background: 'var(--bg-deep)',
      borderTop: '1px solid var(--rule)'
    }
  }, React.createElement("div", {
    className: "cg-footer-row",
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      fontFamily: 'var(--ui-font)',
      fontSize: 13,
      color: 'var(--ink-mute)'
    }
  }, React.createElement("span", null, "\xA9 MMIII, Carter Groff"), React.createElement("span", {
    style: {
      fontFamily: 'var(--display-font)',
      fontStyle: 'italic',
      fontSize: 15,
      letterSpacing: '0.04em',
      textTransform: 'none',
      color: 'var(--ink-soft)'
    }
  }, "made to weather well"), React.createElement("a", {
    href: "https://scaffold.cargroff.com/",
    style: {
      color: 'var(--ink-soft)',
      textDecoration: 'none',
      display: 'inline-flex',
      alignItems: 'center',
      minHeight: 44
    }
  }, "Design services at The Scaffold"), React.createElement("a", {
    href: `mailto:${D.email}`,
    style: {
      color: 'var(--ink-soft)',
      textDecoration: 'none',
      display: 'inline-flex',
      alignItems: 'center',
      minHeight: 44
    }
  }, D.email)), React.createElement("div", {
    style: {
      marginTop: 26,
      textAlign: 'center',
      fontFamily: 'var(--ui-font)',
      fontSize: 13,
      color: 'var(--ink-mute)'
    }
  }, "Website designed and developed by Carter Groff"));
}
function PdfDoc({
  dataUrl
}) {
  const ref = React.useRef(null);
  const [status, setStatus] = React.useState('loading');
  React.useEffect(() => {
    let cancelled = false;
    const container = ref.current;
    if (!container) return;
    container.innerHTML = '';
    if (!dataUrl) {
      setStatus('loading');
      return;
    }
    if (!window.pdfjsLib) {
      setStatus('error');
      return;
    }
    setStatus('loading');
    (async () => {
      try {
        const bin = atob(dataUrl.split(',')[1]);
        const arr = new Uint8Array(bin.length);
        for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
        const pdf = await window.pdfjsLib.getDocument({
          data: arr
        }).promise;
        if (cancelled) return;
        const cw = container.clientWidth || 760;
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        for (let n = 1; n <= pdf.numPages; n++) {
          const page = await pdf.getPage(n);
          if (cancelled) return;
          const base = page.getViewport({
            scale: 1
          });
          const vp = page.getViewport({
            scale: cw / base.width * dpr
          });
          const canvas = document.createElement('canvas');
          canvas.width = vp.width;
          canvas.height = vp.height;
          canvas.style.width = '100%';
          canvas.style.height = 'auto';
          canvas.style.display = 'block';
          canvas.style.marginBottom = '14px';
          canvas.style.boxShadow = '0 8px 30px rgba(0,0,0,0.5)';
          container.appendChild(canvas);
          await page.render({
            canvasContext: canvas.getContext('2d'),
            viewport: vp
          }).promise;
        }
        if (!cancelled) setStatus('done');
      } catch (e) {
        if (!cancelled) setStatus('error');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [dataUrl]);
  return React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      overflowY: 'auto',
      background: '#2b2925',
      padding: 16
    }
  }, React.createElement("div", {
    ref: ref
  }), status !== 'done' && React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'var(--ui-font)',
      fontSize: 13,
      color: 'var(--ink-soft)',
      pointerEvents: 'none'
    }
  }, status === 'error' ? 'Could not load document' : 'Loading document…'));
}
function Lightbox({
  open,
  item,
  onClose
}) {
  React.useEffect(() => {
    if (!open) return;
    const f = e => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', f);
    return () => window.removeEventListener('keydown', f);
  }, [open, onClose]);
  const hookData = item ? item.kind === 'video' ? D.videos[item.index] : D.designs[item.index] : null;
  const isPdfItem = !!(item && item.kind === 'design' && hookData && (hookData.pdf || isPdfData(hookData.image)));
  const pdfKey = isPdfItem ? hookData.pdf || '' : '';
  const pdfInline = isPdfItem && isPdfData(hookData.image) ? hookData.image : '';
  const [pdfData, setPdfData] = React.useState('');
  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!isPdfItem) {
        setPdfData('');
        return;
      }
      let dataUrl = pdfInline;
      if (!dataUrl && pdfKey && window.CGStore) {
        try {
          dataUrl = await window.CGStore.getAsset(pdfKey);
        } catch (e) {
          dataUrl = '';
        }
      }
      if (!cancelled) setPdfData(dataUrl || '');
    })();
    return () => {
      cancelled = true;
    };
  }, [isPdfItem, pdfKey, pdfInline]);
  if (!open || !item) return null;
  const data = item.kind === 'video' ? D.videos[item.index] : D.designs[item.index];
  const hue = (item.kind === 'video' ? D.videos[item.index] && D.videos[item.index].color : D.designs[item.index] && D.designs[item.index].color) || TILE_HUES[item.index % TILE_HUES.length];
  const embed = item.kind === 'video' ? videoEmbed(data.url) : '';
  const pdf = isPdfItem;
  const effImg = item.kind === 'video' ? data.image || ytThumb(data.url) : pdf ? '' : data.image;
  return React.createElement("div", {
    className: "cg-lightbox",
    onClick: onClose
  }, React.createElement("div", {
    onClick: e => e.stopPropagation(),
    style: {
      width: 'min(820px, 94%)',
      margin: 'auto',
      background: 'var(--card)',
      fontFamily: 'var(--body-font)',
      position: 'relative',
      border: '1px solid var(--card-edge)',
      boxShadow: '0 40px 100px rgba(0,0,0,0.8)'
    }
  }, React.createElement("button", {
    onClick: onClose,
    style: {
      position: 'absolute',
      top: 14,
      right: 14,
      zIndex: 2,
      background: 'rgba(15, 10, 6, 0.7)',
      color: 'var(--ink)',
      border: '1px solid var(--rule-strong)',
      width: 38,
      height: 38,
      cursor: 'pointer',
      fontFamily: 'var(--ui-font)',
      fontSize: 14
    }
  }, "\xD7"), React.createElement("div", {
    style: {
      ...(pdf ? {
        height: '80vh'
      } : {
        aspectRatio: '16/9'
      }),
      background: hue,
      position: 'relative',
      overflow: 'hidden'
    }
  }, pdf ? React.createElement(PdfDoc, {
    dataUrl: pdfData
  }) : embed ? React.createElement("iframe", {
    src: embed,
    title: data.title,
    referrerPolicy: "strict-origin-when-cross-origin",
    allow: "autoplay; encrypted-media; fullscreen; picture-in-picture",
    allowFullScreen: true,
    style: {
      position: 'absolute',
      inset: 0,
      width: '100%',
      height: '100%',
      border: 'none'
    }
  }) : React.createElement(React.Fragment, null, effImg && React.createElement("img", {
    src: effImg,
    alt: "",
    style: {
      position: 'absolute',
      inset: 0,
      width: '100%',
      height: '100%',
      objectFit: 'cover'
    }
  }), React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      backgroundImage: "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence baseFrequency='0.9'/><feColorMatrix values='0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.55 0'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>\")",
      mixBlendMode: 'multiply',
      opacity: 0.55
    }
  }), React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      background: 'radial-gradient(ellipse at 45% 35%, rgba(228,180,90,0.20) 0%, transparent 55%)'
    }
  }), item.kind === 'video' && React.createElement("div", {
    style: {
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      width: 80,
      height: 80,
      borderRadius: '50%',
      border: '1px solid var(--ink-soft)',
      background: 'rgba(15, 10, 6, 0.55)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, React.createElement("svg", {
    "aria-hidden": "true",
    width: "20",
    height: "20",
    viewBox: "0 0 14 14",
    fill: "var(--ink)"
  }, React.createElement("path", {
    d: "M3 1.5 L 12 7 L 3 12.5 Z"
  }))))), React.createElement("div", {
    style: {
      padding: '40px 48px 44px'
    }
  }, React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'baseline',
      marginBottom: 16
    }
  }, React.createElement("span", {
    style: {
      fontFamily: 'var(--ui-font)',
      fontSize: 13,
      color: 'var(--amber)'
    }
  }, data.kind, data.year ? `, ${data.year}` : ''), React.createElement("span", {
    style: {
      fontFamily: 'var(--display-font)',
      fontStyle: 'italic',
      fontSize: 13,
      color: 'var(--ink-mute)'
    }
  }, "No. ", String(item.index + 1).padStart(2, '0'))), React.createElement("h3", {
    style: {
      fontFamily: 'var(--display-font)',
      fontSize: 48,
      lineHeight: 1.05,
      fontWeight: 500,
      letterSpacing: '-0.02em',
      margin: '0 0 22px',
      color: 'var(--ink)'
    }
  }, data.title), React.createElement("p", {
    style: {
      fontSize: 16,
      lineHeight: 1.7,
      color: 'var(--ink-soft)',
      margin: 0
    }
  }, data.desc || 'A piece I\u2019m proud of.'), item.kind === 'video' && data.url && React.createElement("a", {
    href: data.url,
    target: "_blank",
    rel: "noopener noreferrer",
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 8,
      marginTop: 24,
      fontFamily: 'var(--ui-font)',
      fontSize: 13,
      color: 'var(--amber)',
      textDecoration: 'none'
    }
  }, "Watch on YouTube ", React.createElement("span", {
    style: {
      fontSize: 13
    }
  }, "\u2197")))));
}
function Portfolio() {
  const [lb, setLb] = React.useState({
    open: false,
    index: 0,
    kind: 'video'
  });
  const rootStyle = {
    ...THEME.vars,
    '--display-font': THEME.display,
    '--body-font': THEME.body,
    '--ui-font': THEME.ui,
    fontFamily: THEME.body
  };
  React.useEffect(() => {
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('is-in');
          io.unobserve(e.target);
        }
      });
    }, {
      threshold: 0.15
    });
    document.querySelectorAll('.cg-reveal, .cg-botanical').forEach(el => io.observe(el));
    return () => io.disconnect();
  }, []);
  const DEFAULT_SECTION_ORDER = ['about', 'videos', 'designs', 'resume', 'contact'];
  const SECTION_RENDERERS = {
    about: () => React.createElement(About, {
      key: "about"
    }),
    videos: () => React.createElement(VideoWork, {
      key: "videos",
      onOpen: index => setLb({
        open: true,
        index,
        kind: 'video'
      })
    }),
    designs: () => React.createElement(DesignWork, {
      key: "designs",
      onOpen: index => setLb({
        open: true,
        index,
        kind: 'design'
      })
    }),
    resume: () => React.createElement(React.Fragment, {
      key: "resume"
    }, React.createElement(Resume, null), React.createElement(StatBand, null)),
    contact: () => React.createElement(Contact, {
      key: "contact"
    })
  };
  const wantedOrder = Array.isArray(D.sectionOrder) && D.sectionOrder.length ? D.sectionOrder : DEFAULT_SECTION_ORDER;
  const sectionOrder = [...wantedOrder.filter(id => SECTION_RENDERERS[id]), ...DEFAULT_SECTION_ORDER.filter(id => !wantedOrder.includes(id))];
  return React.createElement("div", {
    className: "cg-root cg-grain",
    style: rootStyle
  }, React.createElement(BotanicalDefs, null), React.createElement("a", {
    className: "cg-skip",
    href: "#cg-main"
  }, "Skip to content"), React.createElement(Nav, null), React.createElement("main", {
    id: "cg-main"
  }, React.createElement(Hero, null), sectionOrder.map(id => SECTION_RENDERERS[id]())), React.createElement(Footer, null), React.createElement(Lightbox, {
    open: lb.open,
    item: lb,
    onClose: () => setLb({
      ...lb,
      open: false
    })
  }), React.createElement("style", null, `
        html { scroll-behavior: smooth; }

        /* Hero action: the one filled button on the page */
        .cg-root .cg-hero-cta { transition: background-color .2s ease, border-color .2s ease, transform .2s ease; }
        .cg-root .cg-hero-cta:hover { background: var(--amber-lit); border-color: var(--amber-lit); }
        .cg-root .cg-hero-cta:active { transform: translateY(1px); }
        /* Skip link — invisible until keyboard focus, then a lit brass plate. */
        .cg-root .cg-skip { position: fixed; top: 14px; left: 14px; z-index: 300;
          transform: translateY(-160%); transition: transform .28s cubic-bezier(.2,.7,.3,1);
          background: var(--ink); color: #15100a; padding: 0 20px;
          min-height: 44px; display: inline-flex; align-items: center;
          font-family: var(--ui-font); font-size: 13px; font-weight: 600; text-decoration: none;
          box-shadow: 0 18px 40px -18px rgba(0,0,0,.9); }
        .cg-root .cg-skip:focus-visible { transform: none; }
        .cg-video-card:hover .cg-photo { transform: translateY(-6px); box-shadow: 0 40px 80px -28px rgba(0,0,0,0.95), 0 0 0 1px var(--card-edge); }
        .cg-video-card:hover .play-btn { background: rgba(217,154,61,0.85) !important; border-color: var(--amber) !important; transform: translate(-50%, -50%) scale(1.06); }
        .cg-design-tile:hover .cg-photo { transform: translateY(-4px); }
        .cg-design-tile:hover .cg-tile-arrow { opacity: 1 !important; }
        .cg-send:hover { background: var(--amber); color: #15100a; }
        nav a:hover { color: var(--amber) !important; }
        a:hover { color: var(--amber); }

        /* Nav mark — a faint amber ember breathes behind the antler at rest,
           and it catches like a struck match on hover. */
        .cg-nav-mark { position: relative; overflow: hidden; transition: border-color .4s ease, box-shadow .4s ease; }
        .cg-nav-mark-glow { inset: -40%; opacity: 0.32; }
        .cg-nav-mark img { position: relative; z-index: 1; transition: transform .5s cubic-bezier(.2,.7,.3,1); }
        .cg-nav-logo:hover .cg-nav-mark { border-color: var(--amber); box-shadow: 0 0 16px rgba(217,154,61,0.4); }
        .cg-nav-logo:hover .cg-nav-mark img { transform: scale(1.1) rotate(-4deg); }
        .cg-nav-logo:hover .cg-nav-mark-glow { opacity: 0.6; }

        /* Resume timeline — the rail draws downward and each dot catches
           like a struck match as the line reaches it. */
        @keyframes cg-rail-draw { from { transform: scaleY(0); } to { transform: scaleY(1); } }
        @keyframes cg-dot-light { from { opacity: 0; transform: scale(0.3); } to { opacity: 1; transform: scale(1); } }
        .cg-resume-rail { transform: scaleY(0); transform-origin: top; }
        .cg-resume-dot { opacity: 0; transform: scale(0.3); }
        .cg-reveal.is-in .cg-resume-rail { animation: cg-rail-draw 1.1s cubic-bezier(.4,0,.2,1) both; }
        .cg-reveal.is-in .cg-resume-dot { animation: cg-dot-light .5s cubic-bezier(.22,1,.36,1) both; }

        /* ── Mobile nav: hamburger + slide-in drawer ─────────────────
           Base styles exist at all widths but the burger + drawer are
           hidden on desktop; only revealed under 1024px. */
        .cg-nav-burger { display: none; width: 44px; height: 44px; padding: 0;
          min-width: 44px; flex: none;
          background: none; border: 0; cursor: pointer; align-items: center;
          justify-content: center; color: var(--ink); margin: -8px -8px -8px 0; }
        .cg-burger-ico { position: relative; display: block; width: 26px; height: 16px; }
        .cg-burger-ico span { position: absolute; left: 0; width: 100%; height: 1.5px;
          background: var(--ink); transition: transform .3s ease, opacity .2s ease, top .3s ease; }
        .cg-burger-ico span:nth-child(1) { top: 0; }
        .cg-burger-ico span:nth-child(2) { top: 7px; }
        .cg-burger-ico span:nth-child(3) { top: 14px; }
        .cg-burger-ico.is-open span:nth-child(1) { top: 7px; transform: rotate(45deg); }
        .cg-burger-ico.is-open span:nth-child(2) { opacity: 0; }
        .cg-burger-ico.is-open span:nth-child(3) { top: 7px; transform: rotate(-45deg); }
        .cg-nav-drawer { position: fixed; inset: 0; z-index: 120;
          background: rgba(8,5,2,0.55); opacity: 0; pointer-events: none;
          transition: opacity .4s ease; }
        .cg-nav-drawer-panel { position: absolute; top: 0; right: 0; height: 100%;
          width: min(80vw, 340px); background: var(--bg-warm);
          border-left: 1px solid var(--rule); box-shadow: -30px 0 60px rgba(0,0,0,0.6);
          display: flex; flex-direction: column; justify-content: center; gap: 6px;
          padding: 32px 30px; transform: translateX(100%); transition: transform .45s cubic-bezier(.25,.9,.25,1); }
        .cg-nav-drawer.is-open { opacity: 1; pointer-events: auto; }
        .cg-nav-drawer.is-open .cg-nav-drawer-panel { transform: none; }
        .cg-nav-drawer-panel a { display: flex; align-items: center; min-height: 52px;
          font-family: var(--ui-font); font-size: 14px; color: var(--ink-soft); text-decoration: none;
          font-weight: 500; border-bottom: 1px solid var(--rule); }
        .cg-nav-drawer-panel a:last-of-type { border-bottom: 0; }
        .cg-nav-drawer-cta { margin-top: 18px; justify-content: center !important;
          border: 1px solid var(--amber) !important; color: var(--amber) !important;
          letter-spacing: 0.24em !important; }

        /* ════ TABLET & BELOW (≤1023px) ════ */
        @media (max-width: 1023px) {
          .cg-root { overflow-x: clip; }
          .cg-nav { padding: 16px 24px !important; }
          .cg-nav-links { display: none !important; }
          .cg-nav-burger { display: flex !important; }
          #sec-top { padding: 130px 24px 64px !important; }
          #sec-about, #sec-work, #sec-design, #sec-resume { padding: 110px 24px !important; }
          #sec-contact { padding: 110px 24px 80px !important; }
          #sec-stat { padding: 84px 24px !important; }
          footer { padding: 46px 24px !important; }
          .cg-work-grid { grid-template-columns: 1fr 1fr !important; }
          .cg-design-grid { grid-template-columns: 1fr 1fr !important; }
        }

        /* ════ PHONE (≤768px) ════ */
        @media (max-width: 768px) {
          .cg-nav { padding: 14px 16px !important; }
          .cg-nav-mark { width: 32px !important; height: 32px !important; font-size: 15px !important; }
          #sec-top { padding: 116px 16px 48px !important; min-height: 100svh !important; }
          #sec-about, #sec-work, #sec-design, #sec-resume { padding: 80px 16px !important; }
          #sec-contact { padding: 80px 16px 64px !important; }
          #sec-stat { padding: 64px 16px !important; }
          footer { padding: 40px 16px !important; }

          /* Hero — calmer on a small screen: fewer competing ambient layers,
             meta footer condensed to a 2x2 grid instead of a 4-row stack */
          #sec-top h1 { font-size: clamp(58px, 17vw, 96px) !important; }
          /* Keep clear of the lamp graphic (its scaled-down left edge sits
             around 88% across on a phone width) — was overlapping/touching it */
          .cg-fog-band { display: none !important; }
          .cg-candlelight { opacity: 0.5 !important; }
          .cg-hero-tagrow { grid-template-columns: 1fr !important; gap: 30px !important; margin-top: 40px !important; }
          .cg-hero-tagrow p { font-size: 21px !important; }
          .cg-hero-tagrow > div:last-child { text-align: left !important; }
          .cg-hero-foot { flex-direction: column !important; align-items: flex-start !important; gap: 30px !important; padding-top: 30px !important; }
          .cg-hero-meta { display: grid !important; grid-template-columns: 1fr 1fr !important; gap: 20px 16px !important; }
          .cg-hero-lamp { right: -48px !important; transform: scale(0.62); transform-origin: bottom right; opacity: 0.78; }

          /* Section headers (two-col → stacked) */
          .cg-sec-head { flex-direction: column !important; align-items: flex-start !important; gap: 16px !important; margin-bottom: 52px !important; }
          .cg-sec-head p { text-align: left !important; max-width: 100% !important; }
          #sec-about h2, #sec-work h2, #sec-design h2, #sec-resume h2, #sec-contact h2 { font-size: clamp(40px, 12vw, 62px) !important; }

          /* About — smaller portrait plate so the bio starts sooner, and a
             touch tighter paragraph rhythm so there's less to wade through */
          .cg-about-grid { grid-template-columns: 1fr !important; gap: 32px !important; }
          .cg-about-grid > div:first-child > div { position: static !important; padding-top: 0 !important; }
          .cg-portrait-col { width: 100%; max-width: 280px; margin: 0 auto; }
          .cg-plate-caption { font-size: 8px !important; letter-spacing: 0.1em !important; gap: 4px; }
          #sec-about p { font-size: 17px !important; line-height: 1.6 !important; margin-bottom: 18px !important; }
          .cg-about-stats { grid-template-columns: 1fr 1fr !important; gap: 26px !important; }

          /* Video work → 2-up compact cards instead of one long single column */
          .cg-work-grid { grid-template-columns: repeat(2, 1fr) !important; gap: 14px 12px !important; }
          .cg-video-card > div:last-child { padding-top: 10px !important; }
          .cg-video-card h3 { font-size: 15px !important; line-height: 1.2 !important; }
          .cg-video-card .play-btn { width: 38px !important; height: 38px !important; }
          .cg-video-card .play-btn svg { width: 10px !important; height: 10px !important; }

          /* Design work → 2-up, keeping each tile's relative size (large/wide
             still read as bigger, dense packing closes gaps) instead of
             flattening everything to one uniform-height column */
          .cg-design-grid { grid-template-columns: repeat(2, 1fr) !important;
            grid-auto-rows: 148px !important; grid-auto-flow: dense !important; gap: 12px !important; }
          .cg-design-tile-title { font-size: 17px !important; }

          /* Resume — drop the rail/dot, stack date over body */
          .cg-resume-rail, .cg-resume-dot { display: none !important; }
          .cg-resume-row { grid-template-columns: 1fr !important; gap: 14px !important; }
          .cg-resume-row > div:first-child { text-align: left !important; padding-top: 0 !important; }
          .cg-resume-body { padding-left: 0 !important; }

          /* Contact form full-width + full-width submit */
          .cg-contact-grid { grid-template-columns: 1fr !important; gap: 0 !important; }
          .cg-contact-foot { flex-direction: column !important; align-items: stretch !important; gap: 22px !important; }
          .cg-contact-foot p { max-width: 100% !important; text-align: center; }
          .cg-send { width: 100% !important; }

          /* Footer stacks centered */
          .cg-footer-row { flex-direction: column !important; gap: 14px !important; text-align: center; }

          /* ── Travel drawer: stacked map / info ── */
          .cg-tv-stage, .cg-tv-stage.is-detail { grid-template-columns: 1fr !important; column-gap: 0 !important; }
          .cg-tv-left { height: auto !important; }
          .cg-tv-mapframe { min-height: 250px !important; height: 250px !important; flex: none !important; }
          .cg-tv-info, .cg-tv-stage.is-detail .cg-tv-info { height: auto !important; margin-top: 14px; }
          .cg-tv-info-inner { min-width: 0 !important; padding: 22px !important; }
          .cg-tv-place { font-size: 34px !important; }
          /* tabs become a horizontal scroller, no wrap */
          .cg-tv-tabs { flex-wrap: nowrap !important; overflow-x: auto; -webkit-overflow-scrolling: touch;
            scrollbar-width: none; padding-bottom: 2px; }
          .cg-tv-tabs::-webkit-scrollbar { display: none; }
          .cg-tv-tab { flex: none; min-height: 44px; }
          /* enlarge dot hit target to 44px (dot visual stays small) */
          .cg-tv-pin { width: 44px !important; height: 44px !important; }
          /* photo popup: center on the map panel (fixed 250px tall at stage top), sized to fit */
          .cg-tv-lb-card { left: 50% !important; top: 125px !important;
            transform: translate(-50%, -50%) rotate(2.5deg) !important; transform-origin: center !important; }
          .cg-tv-lb-card img, .cg-tv-lb-empty { width: auto !important; height: auto !important;
            max-width: min(72vw, 220px) !important; max-height: 188px !important; }

          /* Work/design/video lightbox modal padding + title */
          .cg-lightbox { padding: 4vh 14px !important; }
          .cg-lightbox h3 { font-size: 32px !important; }
          .cg-lightbox > div > div:last-child { padding: 28px 22px 30px !important; }
        }

        /* ════ SMALL PHONE (≤480px) — trim decorative weight ════ */
        @media (max-width: 480px) {
          .cg-candlelight { opacity: 0.18 !important; }
          .cg-botanical { display: none !important; }
          .cg-about-stats { grid-template-columns: 1fr !important; }
        }

        /* ════ Respect reduced-motion ════ */
        @media (prefers-reduced-motion: reduce) {
          /* Kill ambient/decorative animation and travel, but keep colour and
             opacity transitions alive — those are hover/focus feedback, and a
             blanket 0.001ms makes every control feel dead. */
          *, *::before, *::after {
            animation-duration: 0.001ms !important;
            animation-iteration-count: 1 !important;
            scroll-behavior: auto !important;
            transition-property: color, background-color, border-color, box-shadow, opacity !important;
            transition-duration: 120ms !important;
          }
          /* Purely ambient/decorative loops — hide rather than freeze mid-cycle */
          .cg-fog-band, .cg-rain-drop, .cg-egg-fog { display: none !important; }
          /* Reveal-gated content must still be visible with no JS-timed motion */
          .cg-reveal, .cg-fadeup, .cg-portrait-reveal, .cg-botanical { opacity: 1 !important; transform: none !important; }
          .cg-portrait-float { transform: none !important; }
        }
      `));
}
window.CG_Portfolio = Portfolio;
})();
// ── app.jsx
(function () {
const Portfolio = window.CG_Portfolio;
const __mount = () => ReactDOM.createRoot(document.getElementById('root')).render(React.createElement(Portfolio, null));
(window.CG_READY || Promise.resolve()).then(__mount, __mount);
})();
