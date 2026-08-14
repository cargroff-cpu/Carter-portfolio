// themes.jsx — single direction: "Parlor"
// Dark, candle-lit, wood-paneled. Confident editorial serif + clean
// labels. No folksy hand-drawn flourishes. The palette and lighting are
// the personality.

const PARLOR = {
  name: 'Parlor',
  vars: {
    // Page is two very-near-black browns; a hint of wood grain rides on top.
    '--bg':        '#1a120b',
    '--bg-soft':   '#221710',       // about / contact rooms
    '--bg-deep':   '#0f0a06',       // resume room (deepest)
    '--bg-warm':   '#2a1c11',       // raised cards
    // Type: warm bone, never pure white. Cinematic sepia hierarchy.
    '--ink':       '#ecd9b2',       // primary headings (bone)
    '--ink-soft':  '#c9b48a',       // body
    '--ink-mute':  '#8a7758',       // labels
    '--ink-dim':   '#5a4a36',       // captions / dividers
    // Accents: pooled amber (candle) + dusty terracotta + sage — the sage
    // is what carries the new green character into ornaments + accents.
    '--amber':     '#d99a3d',
    '--amber-glow':'rgba(217, 154, 61, 0.32)',
    '--terracotta':'#b8643f',
    '--sage':      '#8e9462',       // warmer olive-sage (yellow undertone)
    '--sage-deep': '#5a6132',       // deep warm moss
    '--sage-pale': '#aab074',       // pale sage for fills
    '--rule':      'rgba(236,217,178,0.16)',
    '--rule-strong':'rgba(236,217,178,0.32)',
    '--card':      '#241810',
    '--card-edge': 'rgba(236,217,178,0.10)',
    '--shadow':    '0 30px 60px -30px rgba(0,0,0,0.85), 0 2px 6px rgba(0,0,0,0.6)',
    '--grain':     '0.10',
  },
  // Cormorant for display — heavier weight reads masculine + editorial.
  // Spectral for body — readable, slightly weathered.
  // Karla for UI labels — quiet sans for caps.
  display: '"Cormorant Garamond", "Newsreader", Georgia, serif',
  body:    '"Spectral", Georgia, serif',
  ui:      '"Karla", "Spectral", system-ui, sans-serif',
  displayWeight: 500,
  letterspacing: '-0.012em',
  tagline: 'Storytelling through strategy, screen, and design.',
  closing: '"Let’s make something worth remembering."',
};

window.CG_THEME = PARLOR;

// One-time global CSS injection — fonts, base rules, wood-panel + paper
// textures, ambient keyframes.
(function injectGlobal() {
  if (document.getElementById('cg-globals')) return;

  const fontLink = document.createElement('link');
  fontLink.rel = 'stylesheet';
  fontLink.href = 'https://fonts.googleapis.com/css2'
    + '?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500;1,600'
    + '&family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,500;0,6..72,600;1,6..72,400'
    + '&family=Spectral:ital,wght@0,300;0,400;0,500;0,600;1,400;1,500'
    + '&family=Karla:wght@400;500;600'
    + '&display=swap';
  document.head.appendChild(fontLink);

  const s = document.createElement('style');
  s.id = 'cg-globals';
  s.textContent = `
    html, body { background: #0d0905; }
    .cg-root, .cg-root * { box-sizing: border-box; }
    .cg-root { color: var(--ink); background: var(--bg); position: relative; }
    .cg-root img { display: block; max-width: 100%; }
    .cg-root a { color: inherit; }
    .cg-root ::selection { background: var(--amber); color: #0d0905; }

    /* Filmic grain overlay across the entire page. Sits above bg, below content. */
    .cg-grain::before {
      content: ''; position: fixed; inset: 0; pointer-events: none; z-index: 100;
      background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='220' height='220'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 1  0 0 0 0 0.85  0 0 0 0 0.55  0 0 0 0.45 0'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>");
      background-size: 220px 220px;
      mix-blend-mode: overlay;
      opacity: var(--grain);
    }

    /* Vertical wood-panel rhythm — used on certain sections.
       Each panel is ~9% wide; faint vertical seams between them. */
    .cg-wood {
      background-color: var(--bg);
      background-image:
        repeating-linear-gradient(
          to right,
          transparent 0,
          transparent calc(9% - 1px),
          rgba(0,0,0,0.35) calc(9% - 1px),
          rgba(0,0,0,0.35) 9%,
          rgba(236,217,178,0.025) 9%,
          rgba(236,217,178,0.025) calc(9% + 1px),
          transparent calc(9% + 1px),
          transparent 18%
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

    /* Section eyebrow — labels feel like a cinema title card */
    .cg-eyebrow {
      font-family: var(--ui-font); font-size: 11px; letter-spacing: 0.32em; text-transform: uppercase;
      color: var(--amber); font-weight: 500;
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
    .cg-handle:hover { color: var(--amber-light, #f5cd6a) !important; border-bottom-color: var(--amber) !important; }

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
