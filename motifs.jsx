// motifs.jsx — placeholder photo tile + paper frame for the dark Parlor theme.
// Decorative botanical / postal motifs from the earlier directions are gone —
// the room itself is the decoration now.

// A textured colored field labeled with a project name. Caller picks the
// dominant hue from the theme palette so tiles harmonize with the page.
function PhotoPlaceholder({ title, subtitle, hue, ratio = '4/3', icon, tilt = 0, badge = null, fill = false, dim = false }) {
  // Layered: base hue → film grain → subtle vignette → optional dim wash.
  const noise = "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2'/><feColorMatrix values='0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.7 0'/></filter><rect width='100%25' height='100%25' filter='url(%23n)' opacity='0.6'/></svg>\")";
  return (
    <div className="cg-photo" style={{
      aspectRatio: fill ? undefined : ratio,
      height: fill ? '100%' : undefined,
      width: '100%',
      transform: `rotate(${tilt}deg)`,
      position: 'relative', overflow: 'hidden', cursor: 'pointer',
    }}>
      <div style={{ position: 'absolute', inset: 0, background: hue }} />
      <div style={{ position: 'absolute', inset: 0, backgroundImage: noise, mixBlendMode: 'multiply', opacity: 0.6 }} />
      {/* spotlight + corner shadow — cinematic */}
      <div style={{ position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse at 35% 30%, rgba(228,180,90,0.18) 0%, transparent 50%), linear-gradient(135deg, transparent 50%, rgba(10,6,2,0.55) 100%)' }} />
      {dim && <div style={{ position: 'absolute', inset: 0, background: 'rgba(10,6,2,0.35)' }} />}
      {/* film-edge inner border */}
      <div style={{ position: 'absolute', inset: 6, border: '1px solid rgba(236,217,178,0.08)', pointerEvents: 'none' }} />
      {icon && (
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -60%)',
          color: 'rgba(236,217,178,0.20)', fontSize: 64, fontFamily: 'serif' }}>{icon}</div>
      )}
      {(title || subtitle) && (
        <div style={{ position: 'absolute', left: 18, right: 18, bottom: 16,
          color: 'var(--ink)', textShadow: '0 1px 6px rgba(0,0,0,0.7)' }}>
          {subtitle && <div style={{ fontFamily: 'var(--ui-font)', fontSize: 10, letterSpacing: '0.22em',
            textTransform: 'uppercase', color: 'var(--amber)', marginBottom: 6, opacity: 0.9 }}>{subtitle}</div>}
          {title && <div style={{ fontFamily: 'var(--display-font)', fontSize: 22, lineHeight: 1.1,
            letterSpacing: '-0.01em' }}>{title}</div>}
        </div>
      )}
      {badge && (<div style={{ position: 'absolute', top: 14, right: 14 }}>{badge}</div>)}
    </div>
  );
}

// Minimal paper frame: card + shadow. Used for video cards.
function PaperFrame({ children, tilt = 0, padding = 0, style = {} }) {
  return (
    <div style={{
      background: 'var(--card)',
      padding,
      boxShadow: 'var(--shadow)',
      border: '1px solid var(--card-edge)',
      transform: `rotate(${tilt}deg)`,
      position: 'relative',
      transition: 'transform .5s cubic-bezier(.2,.7,.3,1), box-shadow .4s ease',
      ...style,
    }}>
      {children}
    </div>
  );
}


// ── Decorative illustrations ──────────────────────────────────────
// Hand-drawn-feeling SVG ornaments in sage greens and dusty amber.
// Each is a self-contained, scalable component sized via its `height` prop.

// A Victorian cast-iron lamp post — modeled on the reference.
// Composition (viewBox 200 × 900): finial → low dome cap → SHORT WIDE
// frosted globe (≈12% of height) → neck → slender shaft with three
// decorative collar bands → flared bell base → ground plinth.
// Lit by a warm amber halo from inside the globe.
function GasLamp({ height = 640, style = {}, out = false, onGlobeClick }) {
  // Transition timing: snuff fast (0.3s), reignite a touch slower (0.5s).
  const halo = { opacity: out ? 0 : 1, transition: `opacity ${out ? 0.3 : 0.5}s ease` };
  const darkGlobe = { opacity: out ? 1 : 0, transition: `opacity ${out ? 0.3 : 0.5}s ease` };
  return (
    <svg viewBox="0 0 200 900" width={(height * 200) / 900} height={height}
      style={{ display: 'block', overflow: 'visible', ...style }}>
      <defs>
        {/* Cast iron — dark with a hint of warmth on the lit right edge */}
        <linearGradient id="lamp-iron" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%"   stopColor="#070403" />
          <stop offset="50%"  stopColor="#100a06" />
          <stop offset="100%" stopColor="#241608" />
        </linearGradient>
        {/* Copper/rust underneath worn paint */}
        <linearGradient id="lamp-rust" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"  stopColor="#5a2a10" />
          <stop offset="100%" stopColor="#2a1408" />
        </linearGradient>
        {/* Frosted glass — warm cream, glowing amber from inside */}
        <radialGradient id="lamp-glass" cx="50%" cy="45%" r="70%">
          <stop offset="0%"   stopColor="#fff5d0" />
          <stop offset="40%"  stopColor="#f4c478" />
          <stop offset="80%"  stopColor="#c6862c" />
          <stop offset="100%" stopColor="#6e3a10" />
        </radialGradient>
        {/* Right-side bright streak inside the glass */}
        <linearGradient id="lamp-glassHi" x1="0" y1="0" x2="1" y2="0">
          <stop offset="78%"  stopColor="#fff5d8" stopOpacity="0" />
          <stop offset="94%"  stopColor="#fff5d8" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#fff5d8" stopOpacity="0" />
        </linearGradient>
        {/* Soft amber halo — very gradual falloff so it diffuses, no hard ring */}
        <radialGradient id="lamp-halo" cx="50%" cy="50%" r="50%">
          <stop offset="0%"   stopColor="#f5cd6a" stopOpacity="0.62" />
          <stop offset="22%"  stopColor="#e7b357" stopOpacity="0.34" />
          <stop offset="48%"  stopColor="#d99a3d" stopOpacity="0.15" />
          <stop offset="74%"  stopColor="#c98a34" stopOpacity="0.05" />
          <stop offset="100%" stopColor="#c98a34" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Halo — large, diffuse, irregular (overlapping offset blobs) so it
         reads as ambient haze rather than a perfect circle of light. No blur
         filter — the gradient itself already fades out gradually, and a
         large-radius feGaussianBlur here was rendering as a corrupted black
         blob on some Windows/GPU combinations (Opera in particular).
         Outer group fades the whole halo on/off; inner group keeps its flicker. */}
      <g style={halo}>
      <g>
        <animate attributeName="opacity"
          values="0.95;0.95;0.6;0.95;0.95;0.7;0.95"
          keyTimes="0;0.45;0.52;0.6;0.82;0.88;1"
          dur="9s" repeatCount="indefinite" />
        <ellipse cx="104" cy="96" rx="300" ry="250" fill="url(#lamp-halo)" />
        <ellipse cx="70" cy="150" rx="190" ry="230" fill="url(#lamp-halo)" opacity="0.7" />
        <ellipse cx="140" cy="70" rx="170" ry="150" fill="url(#lamp-halo)" opacity="0.6" />
      </g>
      </g>

      {/* ─── Finial — thin spike + tiny bead + small pedestal ─── */}
      <path d="M 100 6 L 100.8 24 L 100 27 L 99.2 24 Z" fill="url(#lamp-iron)" />
      <ellipse cx="100" cy="27" rx="1.6" ry="1.0" fill="url(#lamp-iron)" />
      <rect x="96" y="28" width="8" height="3" fill="url(#lamp-iron)" />

      {/* ─── Cap: one gentle low pyramid (no tiers, no steps) ────── */}
      {/* tiny flat top */}
      <rect x="93" y="31" width="14" height="1.5" fill="url(#lamp-iron)" />
      {/* low pyramid — base 52 wide, height 24 (≈ 2:1 width:height for a gentle tent) */}
      <path d="M 93 32.5 L 107 32.5 L 126 56 L 74 56 Z" fill="url(#lamp-iron)" />
      {/* faceted shading (dark left, lighter right) + center ridge */}
      <path d="M 93 32.5 L 100 32.5 L 100 33 L 74 56 Z" fill="#000" opacity="0.4" />
      <path d="M 100 32.5 L 107 32.5 L 126 56 L 100 33 Z" fill="#3a2614" opacity="0.55" />
      <line x1="100" y1="32.5" x2="100" y2="56" stroke="#000" strokeWidth="0.5" opacity="0.5" />

      {/* thin black trim under the pyramid */}
      <rect x="74" y="56" width="52" height="1.5" fill="#0a0604" />

      {/* ─── Plain iron base band under the cap (dentil teeth removed) ─ */}
      <rect x="74" y="58" width="52" height="4" fill="url(#lamp-iron)" />
      {/* rust accent line under the band */}
      <rect x="74" y="62" width="52" height="1" fill="url(#lamp-rust)" opacity="0.85" />

      {/* ─── Smooth flare from cap base to globe top (replaces stepped collar) ── */}
      <path d="M 74 63 L 126 63 L 132 72 L 68 72 Z" fill="url(#lamp-iron)" />

      {/* ─── Tapered paneled lantern body (cage of frosted glass panels) ── */}
      {/* top trim band sitting under the cap flare */}
      <rect x="68" y="72" width="64" height="3" fill="url(#lamp-iron)" />
      <rect x="68" y="75" width="64" height="1.2" fill="url(#lamp-rust)" opacity="0.85" />

      <g>
        {/* tapered glass cage — top 60 wide, bottom 44 wide, height ≈52 */}
        <path d="M 70 76.5 L 130 76.5 L 122 128 L 78 128 Z" fill="url(#lamp-glass)" />
        {/* warm specular wash from the right (light through frosted glass) */}
        <path d="M 70 76.5 L 130 76.5 L 122 128 L 78 128 Z" fill="url(#lamp-glassHi)" />
        {/* iron corner posts framing the glass cage */}
        <line x1="71" y1="76.5" x2="79" y2="128" stroke="#0a0604" strokeWidth="1.4" strokeLinecap="round" />
        <line x1="129" y1="76.5" x2="121" y2="128" stroke="#0a0604" strokeWidth="1.4" strokeLinecap="round" />
        {/* vertical mullions — divide the cage into three glass panels */}
        <line x1="87" y1="76.5" x2="91" y2="128" stroke="#1a1208" strokeWidth="0.8" />
        <line x1="113" y1="76.5" x2="109" y2="128" stroke="#1a1208" strokeWidth="0.8" />
        {/* faint center vertical glow (candle through frosted glass) */}
        <line x1="100" y1="79" x2="100" y2="126" stroke="#fff5db" strokeOpacity="0.42" strokeWidth="0.6" />
        {/* bright specular streak on the right pane */}
        <path d="M 118 84 Q 121 104, 116 124" stroke="#fff5db" strokeWidth="1.3" strokeOpacity="0.6" fill="none" />
      </g>

      {/* Dark fill that covers the glass when the lamp is snuffed out */}
      <path d="M 70 76.5 L 130 76.5 L 122 128 L 78 128 Z" fill="#1a1008" style={darkGlobe} />

      {/* ─── Bottom rim of lantern (thick iron trim) ───────────── */}
      <rect x="76" y="128" width="48" height="3" fill="url(#lamp-iron)" />
      <rect x="76" y="131" width="48" height="1.2" fill="url(#lamp-rust)" opacity="0.85" />

      {/* ─── Decorative pendant hanging from lantern bottom (acorn-style) ─ */}
      {/* inverted trapezoid bell, just under the rim */}
      <path d="M 80 132.2 L 120 132.2 L 113 139 L 87 139 Z" fill="url(#lamp-iron)" />
      {/* small ring */}
      <rect x="88" y="139" width="24" height="2" fill="url(#lamp-iron)" />
      {/* second narrower trapezoid */}
      <path d="M 88 141 L 112 141 L 107 146 L 93 146 Z" fill="url(#lamp-iron)" />
      {/* hanging acorn ball */}
      <ellipse cx="100" cy="148.5" rx="3.5" ry="3" fill="url(#lamp-iron)" />
      {/* tiny dangling tip */}
      <path d="M 100 151 L 100.6 154 L 100 155 L 99.4 154 Z" fill="url(#lamp-iron)" />

      {/* ─── Neck — short taper to shaft ──────────────────────── */}
      <path d="M 86 151 L 114 151 L 110 164 L 90 164 Z" fill="url(#lamp-iron)" />
      <path d="M 90 164 L 110 164 L 106 176 L 94 176 Z" fill="url(#lamp-iron)" />

      {/* ─── Upper turned collar on shaft ─────────────────────── */}
      <rect x="92" y="176" width="16" height="3" fill="url(#lamp-iron)" />
      <path d="M 94 179 L 106 179 Q 108 188, 104 198 L 96 198 Q 92 188, 94 179 Z" fill="url(#lamp-iron)" />
      <rect x="92" y="198" width="16" height="3" fill="url(#lamp-iron)" />
      <rect x="92" y="201" width="16" height="1" fill="url(#lamp-rust)" opacity="0.8" />

      {/* ─── Long slender shaft (with 2 ring bands) ─────────── */}
      <rect x="97" y="202" width="6" height="200" fill="url(#lamp-iron)" />
      <line x1="103" y1="205" x2="103" y2="400" stroke="#3a2614" strokeWidth="0.6" opacity="0.7" />
      <line x1="98" y1="205" x2="98" y2="400" stroke="#000" strokeWidth="0.4" opacity="0.6" />

      {/* mid-shaft ring band — turned collar */}
      <rect x="92" y="402" width="16" height="3" fill="url(#lamp-iron)" />
      <rect x="94" y="405" width="12" height="4" fill="url(#lamp-iron)" />
      <rect x="92" y="409" width="16" height="3" fill="url(#lamp-iron)" />
      <rect x="92" y="412" width="16" height="1" fill="url(#lamp-rust)" opacity="0.8" />

      {/* lower shaft */}
      <rect x="97" y="413" width="6" height="200" fill="url(#lamp-iron)" />
      <line x1="103" y1="416" x2="103" y2="611" stroke="#3a2614" strokeWidth="0.6" opacity="0.7" />
      <line x1="98" y1="416" x2="98" y2="611" stroke="#000" strokeWidth="0.4" opacity="0.6" />

      {/* second turned collar */}
      <rect x="92" y="613" width="16" height="3" fill="url(#lamp-iron)" />
      <path d="M 94 616 L 106 616 Q 108 624, 104 632 L 96 632 Q 92 624, 94 616 Z" fill="url(#lamp-iron)" />
      <rect x="92" y="632" width="16" height="3" fill="url(#lamp-iron)" />
      <rect x="92" y="635" width="16" height="1" fill="url(#lamp-rust)" opacity="0.8" />

      {/* bottommost shaft section */}
      <rect x="97" y="636" width="6" height="48" fill="url(#lamp-iron)" />

      {/* ─── Base: ogee bell + stepped Victorian pedestal ───── */}
      {/* collar where the shaft meets the base */}
      <rect x="92" y="684" width="16" height="4" fill="url(#lamp-iron)" />
      <rect x="89" y="688" width="22" height="3" fill="url(#lamp-iron)" />
      <rect x="89" y="691" width="22" height="1.5" fill="url(#lamp-rust)" opacity="0.8" />

      {/* ogee bell — concave shoulder swelling out to a convex foot */}
      <path d="M 90 693 C 85 708, 76 715, 73 734 C 70 754, 79 772, 88 786 L 112 786
               C 121 772, 130 754, 127 734 C 124 715, 115 708, 110 693 Z" fill="url(#lamp-iron)" />
      {/* form shading: dark left, faint warm right edge */}
      <path d="M 90 693 C 85 708, 76 715, 73 734 C 70 754, 79 772, 88 786 L 100 786 L 100 693 Z"
        fill="#000" opacity="0.18" />
      <g fill="none" opacity="0.6">
        <path d="M 84 700 C 79 720, 80 760, 86 784" stroke="#000" strokeWidth="0.5" />
        <path d="M 100 698 L 100 784" stroke="#2a1810" strokeWidth="0.5" />
        <path d="M 116 700 C 121 720, 120 760, 114 784" stroke="#3a2514" strokeWidth="0.5" />
      </g>

      {/* upper torus molding ring */}
      <rect x="70" y="786" width="60" height="5" fill="url(#lamp-iron)" />
      <rect x="68" y="791" width="64" height="3" fill="url(#lamp-iron)" />
      <rect x="68" y="794" width="64" height="1.5" fill="url(#lamp-rust)" opacity="0.85" />

      {/* pedestal tier 1 — recessed panel face */}
      <rect x="66" y="796" width="68" height="26" fill="url(#lamp-iron)" />
      <rect x="64" y="800" width="72" height="2" fill="#000" opacity="0.22" />
      <rect x="77" y="802" width="46" height="16" fill="#3a2514" opacity="0.14"
        stroke="#000" strokeOpacity="0.4" strokeWidth="0.6" />

      {/* pedestal tier 2 — wider, recessed panel face */}
      <rect x="58" y="822" width="84" height="32" fill="url(#lamp-iron)" />
      <rect x="56" y="826" width="88" height="2" fill="#000" opacity="0.22" />
      <rect x="71" y="828" width="58" height="20" fill="#3a2514" opacity="0.14"
        stroke="#000" strokeOpacity="0.4" strokeWidth="0.6" />

      {/* chamfered ground block — widest, reaches the bottom of the viewBox
          so the base sits flush on the ground */}
      <path d="M 50 854 L 150 854 L 154 878 L 46 878 Z" fill="url(#lamp-iron)" />
      <rect x="42" y="878" width="116" height="21" fill="url(#lamp-iron)" />
      <line x1="42" y1="880" x2="158" y2="880" stroke="#000" strokeWidth="0.6" opacity="0.6" />
      <rect x="42" y="895" width="116" height="4" fill="url(#lamp-rust)" opacity="0.7" />

      {/* Ground contact shadow pooled under the base */}
      <ellipse cx="100" cy="898" rx="86" ry="6" fill="#000" opacity="0.55" />

      {/* Once snuffed, a faint slow-breathing ember hints the globe is still
          clickable (to relight) without giving away the easter egg upfront —
          only appears in the "out" state, after it's already been found. */}
      {out && onGlobeClick && (
        <ellipse cx="100" cy="102" rx="60" ry="78" fill="rgba(217,154,61,0.16)"
          style={{ filter: 'blur(9px)', pointerEvents: 'none' }}>
          <animate attributeName="opacity" values="0.5;1;0.5" dur="3.4s" repeatCount="indefinite" />
        </ellipse>
      )}

      {/* Invisible click target over the glass globe — re-enables pointer
          events inside the otherwise non-interactive lamp container.
          No label/tooltip: discovered, not announced. outline/tap-highlight
          suppressed since browsers otherwise flash a default focus box here
          on click. */}
      {onGlobeClick && (
        <rect x="26" y="18" width="148" height="200" rx="24" fill="transparent"
          onClick={onGlobeClick}
          style={{ cursor: 'pointer', pointerEvents: 'auto', outline: 'none', WebkitTapHighlightColor: 'transparent' }} />
      )}
    </svg>
  );
}

// ── Botanical illustrations ──────────────────────────────────
// Style: 1800s naturalist field guide. Natural-weight linework, leaves
// with visible midribs + lateral veins, asymmetric placement, muted
// olive-sage palette, rendered at 50% opacity so they recede into the
// dark page as atmospheric accents.

// Pseudo-random float in [0,1) keyed by i; deterministic so layouts are
// stable between renders.
function hash(i) {
  const x = Math.sin(i * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
}

// Shared filter / gradient defs for the botanicals — lives inside an
// invisible SVG mounted once in Portfolio. Filters defined here are
// referenced by `url(#cg-...)` from any SVG in the same document.
function BotanicalDefs() {
  return (
    <svg width="0" height="0" aria-hidden="true"
      style={{ position: 'absolute', overflow: 'hidden', pointerEvents: 'none' }}>
      <defs>
        {/* Subtle paper-grain noise overlay for leaf fills */}
        <filter id="cg-leaf-grain" x="-10%" y="-10%" width="120%" height="120%">
          <feTurbulence type="fractalNoise" baseFrequency="1.4" numOctaves="2" seed="7" />
          <feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.28 0" />
          <feComposite in2="SourceGraphic" operator="in" />
          <feMerge>
              <feMergeNode in="SourceGraphic" />
              <feMergeNode />
          </feMerge>
        </filter>
        {/* Berry: 3D sphere shading — highlight upper-left, shadow lower-right */}
        <radialGradient id="cg-berry" cx="32%" cy="30%" r="75%">
          <stop offset="0%"   stopColor="#e8b878" />
          <stop offset="45%"  stopColor="#b46a32" />
          <stop offset="100%" stopColor="#3a1808" />
        </radialGradient>
        {/* Leaf inner-shadow gradient — used for the curl/cup near the stem */}
        <radialGradient id="cg-leaf-shade" cx="15%" cy="50%" r="40%">
          <stop offset="0%"   stopColor="#000" stopOpacity="0.35" />
          <stop offset="60%"  stopColor="#000" stopOpacity="0.10" />
          <stop offset="100%" stopColor="#000" stopOpacity="0" />
        </radialGradient>
      </defs>
    </svg>
  );
}

// A single botanical leaf at origin, pointing along +x.
// Two styles, matching the reference sheet's hand-drawn vocabulary:
//   'solid'    — confidently filled almond silhouette (most leaves)
//   'outlined' — clean outline almond with a tiny midrib (lighter accents)
function Leaf({ L = 20, weight = 0.8, style = 'solid', flipBelly = false }) {
  // Asymmetric almond — fuller belly, pointy tip. flipBelly mirrors the
  // asymmetry across the midrib for natural variation.
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
    return (
      <g>
        <path d={body} fill="none" stroke="var(--sage)" strokeWidth={weight}
          strokeLinejoin="round" strokeLinecap="round" />
        {/* tiny inner midrib — just a hint */}
        <line x1={L * 0.18} y1="0" x2={L * 0.78} y2="0"
          stroke="var(--sage)" strokeWidth={weight * 0.5} opacity="0.55" strokeLinecap="round" />
      </g>
    );
  }
  // Solid filled almond — the dominant style on the reference sheet.
  return (
    <path d={body} fill="var(--sage-deep)" stroke="var(--sage-deep)"
      strokeWidth={weight * 0.5} strokeLinejoin="round" />
  );
}

// A small node-bump at a leaf-stem junction (used by larger sprigs).
function StemNode({ cx, cy, size = 1.3 }) {
  return (
    <ellipse cx={cx} cy={cy} rx={size} ry={size * 0.85} fill="var(--sage-deep)" />
  );
}

// A small curling tendril — a thin spring of vine. cx,cy is the
// attachment point on the main stem.
function Tendril({ size = 14, angle = 0, opacity = 0.65 }) {
  return (
    <g transform={`rotate(${angle})`} opacity={opacity}>
      <path d={`M 0 0 q ${size * 0.6} ${size * 0.2}, ${size * 0.5} ${size * 0.7} q -${size * 0.3} ${size * 0.4}, ${size * 0.1} ${size * 0.9}`}
        stroke="var(--sage)" strokeWidth="0.7" fill="none" strokeLinecap="round" />
    </g>
  );
}

// ── Horizontal trailing sprig ──────────────────────────────
// A horizontal stem with solid almond leaves sprouting perpendicular,
// alternating top/bottom — modeled on the hand-drawn reference sheet.
function IvyVine({ width = 380, opacity = 0.5, style = {}, flip = false }) {
  // Stem is three Q-bezier segments — evaluate the actual path so leaves
  // sit exactly on the curve, not on an approximated sine wave.
  // Path: M 20 40 Q 80 26, 140 42 T 260 38 T 380 40
  // T command reflects the previous control point about the join.
  const segs = [
    [[20, 40], [80, 26], [140, 42]],
    [[140, 42], [200, 58], [260, 38]],
    [[260, 38], [320, 18], [380, 40]],
  ];
  const stem = (t) => {
    const i = Math.min(2, Math.floor(t * 3));
    const s = t * 3 - i;
    const [P0, P1, P2] = segs[i];
    return [
      (1 - s) * (1 - s) * P0[0] + 2 * (1 - s) * s * P1[0] + s * s * P2[0],
      (1 - s) * (1 - s) * P0[1] + 2 * (1 - s) * s * P1[1] + s * s * P2[1],
    ];
  };
  // Tangent at parameter t — sample stem just before/after and atan2.
  const tangent = (t) => {
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
    // Perpendicular to the local stem tangent, with a slight tip-ward
    // tilt and a small per-leaf wobble.
    const rot = ang + side * 80 + (side === 1 ? -8 : 8) + (hash(i + 4) - 0.5) * 14;
    leaves.push({ x, y, rot, L, outlined: i % 5 === 4, key: i });
  }
  return (
    <svg viewBox="0 0 400 80" width={width} height={(width * 80) / 400}
      style={{ display: 'block', opacity, transform: flip ? 'scaleX(-1)' : 'none', ...style }}>
      <path d="M 20 40 Q 80 26, 140 42 T 260 38 T 380 40"
        stroke="var(--sage-deep)" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      <path d="M 20 40 Q 80 26, 140 42 T 260 38 T 380 40"
        stroke="var(--sage)" strokeWidth="0.5" fill="none" strokeLinecap="round" opacity="0.55" />
      {leaves.map((l) => (
        <g key={l.key} transform={`translate(${l.x.toFixed(2)} ${l.y.toFixed(2)}) rotate(${l.rot.toFixed(1)})`}>
          <Leaf L={l.L} style={l.outlined ? 'outlined' : 'solid'} flipBelly={l.key % 3 === 0} />
        </g>
      ))}
      <ellipse cx="388" cy="40" rx="3" ry="1.4" fill="var(--sage-deep)" transform="rotate(-20 388 40)" />
      <ellipse cx="12"  cy="40" rx="3" ry="1.4" fill="var(--sage-deep)" transform="rotate(160 12 40)" />
    </svg>
  );
}

// ── A loose curling sprig — corner accent ──────────────────
function IvyCurl({ size = 140, opacity = 0.5, style = {}, flip = false }) {
  return (
    <svg viewBox="0 0 140 140" width={size} height={size}
      style={{ display: 'block', opacity, transform: flip ? 'scaleX(-1)' : 'none', ...style }}>
      <path d="M 8 10 Q 40 30, 52 64 Q 60 96, 92 108 Q 122 114, 132 96"
        stroke="var(--sage-deep)" strokeWidth="1.4" fill="none" strokeLinecap="round" />
      <path d="M 8 10 Q 40 30, 52 64 Q 60 96, 92 108 Q 122 114, 132 96"
        stroke="var(--sage)" strokeWidth="0.5" fill="none" strokeLinecap="round" opacity="0.55" />
      <g transform="translate(24 22) rotate(-72)"><Leaf L={20} /></g>
      <g transform="translate(39 39) rotate(64)"><Leaf L={18} flipBelly /></g>
      <g transform="translate(52 63) rotate(-58)"><Leaf L={22} /></g>
      <g transform="translate(62 86) rotate(78)"><Leaf L={20} flipBelly /></g>
      <g transform="translate(78 101) rotate(-44)"><Leaf L={22} /></g>
      <g transform="translate(113 109) rotate(40)"><Leaf L={18} /></g>
      <ellipse cx="132" cy="96" rx="2.6" ry="1.4" fill="var(--sage-deep)" transform="rotate(-26 132 96)" />
    </svg>
  );
}

// ── Hanging vertical frond ─────────────────────────────────
// Solid filled leaves alternating along a draping arched stem.
function FernFrond({ height = 260, opacity = 0.5, style = {}, flip = false }) {
  const rachis = (t) => [
    88 * (1-t)**3 + 3 * 100 * (1-t)**2 * t + 3 * 56 * (1-t) * t**2 + 28 * t**3,
    6  * (1-t)**3 + 3 * 110 * (1-t)**2 * t + 3 * 220 * (1-t) * t**2 + 300 * t**3,
  ];
  const tangent = (t) => {
    const [x1, y1] = rachis(Math.max(0, t - 0.005));
    const [x2, y2] = rachis(Math.min(1, t + 0.005));
    return Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;
  };
  const leaves = [];
  for (let i = 0; i < 11; i++) {
    const t = 0.05 + (i / 10) * 0.90;
    const [x, y] = rachis(t);
    const ang = tangent(t);
    const side = i % 2 === 0 ? 1 : -1;
    const rot = ang + side * 80 + (side === 1 ? -12 : 12);
    const L = 36 * (1 - t * 0.62);
    leaves.push({ x, y, rot, L, key: i });
  }
  return (
    <svg viewBox="0 0 140 320" width={(height * 140) / 320} height={height}
      style={{ display: 'block', opacity, transform: flip ? 'scaleX(-1)' : 'none', ...style }}>
      <path d="M 88 6 C 100 110, 56 220, 28 300"
        stroke="var(--sage-deep)" strokeWidth="1.7" fill="none" strokeLinecap="round" />
      <path d="M 88 6 C 100 110, 56 220, 28 300"
        stroke="var(--sage)" strokeWidth="0.5" fill="none" strokeLinecap="round" opacity="0.55" />
      {leaves.map((l) => (
        <g key={l.key} transform={`translate(${l.x.toFixed(2)} ${l.y.toFixed(2)}) rotate(${l.rot.toFixed(1)})`}>
          <Leaf L={l.L} flipBelly={l.key % 2 === 0} />
        </g>
      ))}
      <ellipse cx="28" cy="302" rx="3" ry="1.6" fill="var(--sage-deep)" transform="rotate(110 28 302)" />
    </svg>
  );
}

// ── Vertical berry sprig ───────────────────────────────────
function BranchSprig({ size = 140, opacity = 0.55, style = {}, flip = false }) {
  return (
    <svg viewBox="0 0 100 160" width={(size * 100) / 160} height={size}
      style={{ display: 'block', opacity, transform: flip ? 'scaleX(-1)' : 'none', ...style }}>
      <path d="M 48 152 C 52 116, 58 76, 56 36 C 56 24, 60 18, 64 12"
        stroke="var(--sage-deep)" strokeWidth="1.6" fill="none" strokeLinecap="round" />
      <path d="M 48 152 C 52 116, 58 76, 56 36 C 56 24, 60 18, 64 12"
        stroke="var(--sage)" strokeWidth="0.5" fill="none" strokeLinecap="round" opacity="0.55" />
      <g transform="translate(51 130) rotate(110)"><Leaf L={22} flipBelly /></g>
      <g transform="translate(53 110) rotate(-70)"><Leaf L={22} /></g>
      <g transform="translate(55 88)  rotate(100)"><Leaf L={20} flipBelly /></g>
      <g transform="translate(56 66)  rotate(-78)"><Leaf L={18} /></g>
      <g transform="translate(56 48)  rotate(110)"><Leaf L={15} flipBelly /></g>
      {/* Terminal bud at the stem tip — small almond aligned along the
          stem's final tangent direction. */}
      <g transform="translate(64 12) rotate(-56)"><Leaf L={10} /></g>
      <ellipse cx="64" cy="10" rx="1.6" ry="1.0" fill="var(--sage-deep)"
        transform="rotate(-56 64 10)" />
    </svg>
  );
}

// ── Horizontal sprawling sprig — corner / edge accent ──────
function LooseSprig({ size = 200, opacity = 0.45, style = {}, flip = false }) {
  return (
    <svg viewBox="0 0 220 160" width={size} height={(size * 160) / 220}
      style={{ display: 'block', opacity, transform: flip ? 'scaleX(-1)' : 'none', ...style }}>
      <path d="M 6 18 C 60 40, 120 70, 170 96 C 190 106, 206 116, 216 130"
        stroke="var(--sage-deep)" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      <path d="M 6 18 C 60 40, 120 70, 170 96 C 190 106, 206 116, 216 130"
        stroke="var(--sage)" strokeWidth="0.5" fill="none" strokeLinecap="round" opacity="0.55" />
      <path d="M 86 54 C 92 42, 102 28, 116 18"
        stroke="var(--sage-deep)" strokeWidth="1.1" fill="none" strokeLinecap="round" />
      <g transform="translate(27 27) rotate(-50)"><Leaf L={26} /></g>
      <g transform="translate(56 40) rotate(58)"><Leaf L={22} flipBelly /></g>
      <g transform="translate(93 57) rotate(-58)"><Leaf L={24} /></g>
      <g transform="translate(116 18) rotate(-86)"><Leaf L={18} /></g>
      <g transform="translate(131 76) rotate(54)"><Leaf L={22} flipBelly /></g>
      <g transform="translate(158 90) rotate(-48)"><Leaf L={24} /></g>
      <g transform="translate(192 108) rotate(50)"><Leaf L={20} flipBelly /></g>
      <ellipse cx="216" cy="130" rx="3" ry="1.4" fill="var(--sage-deep)" transform="rotate(50 216 130)" />
    </svg>
  );
}

// ── BotanicalDivider — vine variant with a centered amber bead ─────
function BotanicalDivider({ width = 380, style = {} }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 18, ...style }}>
      <IvyVine width={width * 0.42} opacity={0.5} />
      <span style={{ display: 'inline-block', width: 6, height: 6,
        background: 'var(--amber)', transform: 'rotate(45deg)' }} />
      <IvyVine width={width * 0.42} opacity={0.5} flip />
    </div>
  );
}

// ── Lantern variants (smaller, reusable) ────────────────────
// Shared gradient defs for the small lantern variants. Mount once per page.
function LanternDefs() {
  return (
    <svg width="0" height="0" aria-hidden="true"
      style={{ position: 'absolute', overflow: 'hidden', pointerEvents: 'none' }}>
      <defs>
        <linearGradient id="lh-iron" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%"   stopColor="#070403" />
          <stop offset="50%"  stopColor="#100a06" />
          <stop offset="100%" stopColor="#241608" />
        </linearGradient>
        <linearGradient id="lh-rust" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"  stopColor="#5a2a10" />
          <stop offset="100%" stopColor="#2a1408" />
        </linearGradient>
        <radialGradient id="lh-glass" cx="50%" cy="45%" r="70%">
          <stop offset="0%"   stopColor="#fff5d0" />
          <stop offset="40%"  stopColor="#f4c478" />
          <stop offset="80%"  stopColor="#c6862c" />
          <stop offset="100%" stopColor="#6e3a10" />
        </radialGradient>
        <linearGradient id="lh-glassHi" x1="0" y1="0" x2="1" y2="0">
          <stop offset="78%"  stopColor="#fff5d8" stopOpacity="0" />
          <stop offset="94%"  stopColor="#fff5d8" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#fff5d8" stopOpacity="0" />
        </linearGradient>
        <radialGradient id="lh-halo" cx="50%" cy="50%" r="50%">
          <stop offset="0%"   stopColor="#f5cd6a" stopOpacity="0.65" />
          <stop offset="40%"  stopColor="#d99a3d" stopOpacity="0.22" />
          <stop offset="100%" stopColor="#d99a3d" stopOpacity="0" />
        </radialGradient>
      </defs>
    </svg>
  );
}

// Just the lit cage + cap + acorn pendant (native size 100×80).
function LanternHead({ x = 0, y = 0, scale = 1 }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      {/* cap — flat top + low pyramid */}
      <rect x="46" y="0" width="8" height="1" fill="url(#lh-iron)" />
      <path d="M 46 1 L 54 1 L 64 15 L 36 15 Z" fill="url(#lh-iron)" />
      <path d="M 46 1 L 50 1 L 50 1.5 L 36 15 Z" fill="#000" opacity="0.45" />
      <line x1="50" y1="1" x2="50" y2="15" stroke="#000" strokeWidth="0.4" opacity="0.5" />

      {/* eave + dentils */}
      <path d="M 32 15 L 68 15 L 70 19 L 30 19 Z" fill="url(#lh-iron)" />
      <rect x="30" y="19" width="40" height="0.8" fill="#0a0604" />
      <g fill="url(#lh-iron)">
        {[34, 40, 46, 52, 58, 64].map((bx, i) => (
          <path key={i} d={`M ${bx} 19.8 L ${bx + 2} 19.8 L ${bx + 1.7} 22 L ${bx + 0.3} 22 Z`} />
        ))}
      </g>

      {/* tapered glass cage */}
      <rect x="32" y="23" width="36" height="2" fill="url(#lh-iron)" />
      <path d="M 33 25 L 67 25 L 62 60 L 38 60 Z" fill="url(#lh-glass)" />
      <path d="M 33 25 L 67 25 L 62 60 L 38 60 Z" fill="url(#lh-glassHi)" />
      <line x1="33.5" y1="25" x2="38.5" y2="60" stroke="#0a0604" strokeWidth="1" strokeLinecap="round" />
      <line x1="66.5" y1="25" x2="61.5" y2="60" stroke="#0a0604" strokeWidth="1" strokeLinecap="round" />
      <line x1="44" y1="25" x2="46" y2="60" stroke="#1a1208" strokeWidth="0.5" />
      <line x1="56" y1="25" x2="54" y2="60" stroke="#1a1208" strokeWidth="0.5" />
      <line x1="50" y1="27" x2="50" y2="58" stroke="#fff5db" strokeOpacity="0.4" strokeWidth="0.5" />
      <path d="M 60 28 Q 62 42, 59 56" stroke="#fff5db" strokeWidth="1" strokeOpacity="0.55" fill="none" />

      {/* bottom rim + acorn pendant */}
      <rect x="36" y="60" width="28" height="2" fill="url(#lh-iron)" />
      <path d="M 40 62 L 60 62 L 56 66 L 44 66 Z" fill="url(#lh-iron)" />
      <rect x="44" y="66" width="12" height="1" fill="url(#lh-iron)" />
      <path d="M 45 67 L 55 67 L 52 70 L 48 70 Z" fill="url(#lh-iron)" />
      <ellipse cx="50" cy="72" rx="2.2" ry="1.8" fill="url(#lh-iron)" />
      <path d="M 50 74 L 50.4 76 L 50 76.5 L 49.6 76 Z" fill="url(#lh-iron)" />
    </g>
  );
}

// Hanging lantern (chain from above, lantern head at bottom).
function HangingLantern({ height = 260, chainLength = 0.5, style = {} }) {
  const chainPx = 80 * chainLength;
  const headTop = chainPx + 10;
  return (
    <svg viewBox="0 0 100 200" width={(height * 100) / 200} height={height}
      style={{ display: 'block', overflow: 'visible', ...style }}>
      {/* halo around the lantern */}
      <ellipse cx="50" cy={headTop + 35} rx="90" ry="80" fill="url(#lh-halo)">
        <animate attributeName="opacity" values="0.9;1;0.78;0.95;0.9" dur="6s" repeatCount="indefinite" />
      </ellipse>
      {/* mounting anchor */}
      <rect x="46" y="0" width="8" height="2" fill="url(#lh-iron)" />
      <rect x="44" y="2" width="12" height="3" fill="url(#lh-iron)" />
      {/* chain — alternating oval links */}
      <g stroke="url(#lh-iron)" strokeWidth="1.2" fill="none">
        {Array.from({ length: Math.max(3, Math.round(chainPx / 6)) }).map((_, i) => {
          const cy = 6 + i * 6;
          return i % 2 === 0
            ? <ellipse key={i} cx="50" cy={cy} rx="2.5" ry="3.2" />
            : <ellipse key={i} cx="50" cy={cy} rx="3.2" ry="2.5" />;
        })}
      </g>
      {/* connector ring */}
      <ellipse cx="50" cy={chainPx + 6} rx="3.5" ry="2" fill="none" stroke="url(#lh-iron)" strokeWidth="1.2" />
      <LanternHead x={0} y={headTop} scale={1} />
    </svg>
  );
}

// Floor lamp (small base + short post + lantern head on top).
function FloorLamp({ height = 320, style = {} }) {
  return (
    <svg viewBox="0 0 100 280" width={(height * 100) / 280} height={height}
      style={{ display: 'block', overflow: 'visible', ...style }}>
      {/* halo */}
      <ellipse cx="50" cy="50" rx="90" ry="80" fill="url(#lh-halo)">
        <animate attributeName="opacity" values="0.9;1;0.78;0.95;0.9" dur="6s" repeatCount="indefinite" />
      </ellipse>
      {/* finial spike */}
      <path d="M 50 -4 L 50.5 -1 L 50 0 L 49.5 -1 Z" fill="url(#lh-iron)" />
      <ellipse cx="50" cy="0" rx="1.4" ry="0.8" fill="url(#lh-iron)" />
      {/* lantern head */}
      <LanternHead x={0} y={2} scale={1} />
      {/* short post */}
      <rect x="49" y="80" width="2.5" height="158" fill="url(#lh-iron)" />
      <rect x="46" y="148" width="8" height="2" fill="url(#lh-iron)" />
      <rect x="47" y="150" width="6" height="1.5" fill="url(#lh-iron)" />
      {/* flared base */}
      <path d="M 42 238 L 58 238 L 64 252 L 36 252 Z" fill="url(#lh-iron)" />
      <rect x="32" y="252" width="36" height="4" fill="url(#lh-iron)" />
      <rect x="32" y="254" width="36" height="1.2" fill="url(#lh-rust)" opacity="0.6" />
      <ellipse cx="50" cy="258" rx="22" ry="3" fill="url(#lh-iron)" />
      <ellipse cx="50" cy="266" rx="28" ry="3" fill="#000" opacity="0.4" />
    </svg>
  );
}

// ── Raven — cohesive ink-black silhouette, flies in + perches ──
// One unified shape (single fill, overlapping parts so there are no seams),
// no eye/highlight. Named groups raven-body / raven-head / raven-wing-left /
// raven-wing-right / raven-tail carry the animation. Flies in from the upper
// left with real wingbeats (~3.6s), brakes, folds, and tucks onto the lamp
// cap, then runs a slow idle loop forever. A faint amber rim hugs the belly.
function Raven({ flightDur = 3.6, perchedOnly = false, reducedMotion = false, style = {} }) {
  const d = flightDur;
  // reducedMotion always settles immediately — flying in is itself motion.
  const settled = perchedOnly || reducedMotion;
  const begin = settled ? '0s' : `${d}s`;
  const INK = '#0a0807';
  // Near + far wing path pairs (identical command structure so `d` morphs
  // cleanly from extended → folded).
  const nearExt = 'M 2 -8 Q -16 -20 -38 -18 L -32 -13 L -40 -13 L -32 -8 Q -16 -7 2 -4 Z';
  const nearHalf = 'M 2 -9 Q -10 -12 -22 -6 L -20 -3 L -24 -1 L -19 1 Q -9 0 3 -4 Z';
  const nearFold = 'M 2 -9 Q -2 -2 -5 7 L -6 10 L -7 10 L -6 12 Q -2 6 3 -4 Z';
  const farExt = 'M 0 -7 Q -16 -18 -36 -16 L -30 -12 L -38 -12 L -30 -7 Q -16 -6 0 -3 Z';
  const farHalf = 'M 0 -8 Q -9 -11 -20 -5 L -18 -2 L -22 0 L -17 1 Q -8 0 1 -3 Z';
  const farFold = 'M 0 -8 Q -3 -1 -5 7 L -6 10 L -7 10 L -6 12 Q -2 6 1 -3 Z';
  return (
    <svg viewBox="0 0 520 360" width="520" height="360"
      style={{ display: 'block', overflow: 'visible', ...style }}>
      <defs>
        <linearGradient id="raven-amber" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"  stopColor="#e8b056" stopOpacity="0" />
          <stop offset="74%" stopColor="#e8b056" stopOpacity="0" />
          <stop offset="100%" stopColor="#f0bf6a" stopOpacity="0.9" />
        </linearGradient>
        {/* radial breast/underside glow per spec: rgba(200,120,30,0.15) */}
        <radialGradient id="raven-breast" cx="60%" cy="78%" r="60%">
          <stop offset="0%"   stopColor="rgba(200,120,30,0.28)" />
          <stop offset="55%"  stopColor="rgba(200,120,30,0.12)" />
          <stop offset="100%" stopColor="rgba(200,120,30,0)" />
        </radialGradient>
        <clipPath id="raven-clip"><use href="#raven-body-shape" /></clipPath>
        <clipPath id="raven-clip-tail"><use href="#raven-tail-shape" /></clipPath>
        <clipPath id="raven-clip-wing"><use href="#raven-wing-shape" /></clipPath>
      </defs>

      <g id="rv-move" transform={settled ? 'translate(440 282)' : undefined}>
        {/* Flight path — descending arc from off the upper-left to the cap. */}
        {!settled && (
        <animateMotion dur={`${d}s`} fill="freeze" calcMode="spline"
          keyTimes="0; 1" keySplines="0.3 0 0.4 1"
          path="M -260 -60 C -40 40, 220 140, 440 282" />
        )}

        <g id="raven-tilt">
          {/* Body bank: descending glide lean → pitch-up brake → upright. */}
          {!settled && (
          <animateTransform attributeName="transform" type="rotate"
            values="-26 0 0; -18 0 0; -8 0 0; 14 0 0; 2 0 0; 0 0 0"
            keyTimes="0; 0.4; 0.66; 0.86; 0.95; 1" dur={`${d}s`} fill="freeze" />
          )}

          <g id="raven-breath">
            {/* breathing rise/fall — perched only, skipped under reduced motion */}
            {!reducedMotion && (
            <animateTransform attributeName="transform" type="translate"
              values="0 0; 0 -0.9; 0 0; 0 0.5; 0 0" keyTimes="0; 0.34; 0.6; 0.82; 1"
              dur="3s" begin={begin} repeatCount="indefinite" />
            )}

            {/* ─── TAIL ─── long fanned tail, 4–5 graduated feather points */}
            <g id="raven-tail">
              <path id="raven-tail-shape" fill={INK}
                d="M -10 -6 C -22 -3, -34 4, -45 15 L -39 16 L -41 19 L -34 18 L -35 22 L -28 20 L -29 23 L -22 20 C -15 13, -12 3, -8 -1 Z" />
              {/* amber underside glow */}
              <rect x="-46" y="-6" width="42" height="31" fill="url(#raven-amber)"
                clipPath="url(#raven-clip-tail)" style={{ mixBlendMode: 'screen' }} />
              {/* flight: streamlined back → drops to perch angle */}
              {!settled && (
              <animateTransform attributeName="transform" type="rotate"
                values="-8 -7 4; -8 -7 4; 16 -7 4" keyTimes="0; 0.86; 1"
                dur={`${d}s`} fill="freeze" />
              )}
              {/* idle: occasional flick — skipped under reduced motion */}
              {!reducedMotion && (
              <animateTransform attributeName="transform" type="rotate"
                values="16 -7 4; 16 -7 4; 24 -7 4; 16 -7 4; 16 -7 4"
                keyTimes="0; 0.62; 0.7; 0.78; 1" dur="7s" begin={begin}
                repeatCount="indefinite" />
              )}
            </g>

            {/* ─── FAR WING ─── (behind body) — flight only */}
            {!settled && (
            <g id="raven-wing-right">
              <path fill={INK} d={farExt}>
                <animate attributeName="d"
                  values={`${farExt}; ${farExt}; ${farHalf}; ${farFold}; ${farFold}`}
                  keyTimes="0; 0.8; 0.9; 0.96; 1" dur={`${d}s`} fill="freeze" />
              </path>
              <animateTransform attributeName="transform" type="rotate"
                values="-26 0 -7; 36 0 -7; -26 0 -7; 36 0 -7; -26 0 -7; 40 0 -7; -30 0 -7; 8 0 -7; 0 0 -7"
                keyTimes="0; 0.13; 0.26; 0.39; 0.52; 0.64; 0.78; 0.9; 1"
                dur={`${d}s`} fill="freeze" calcMode="spline"
                keySplines="0.4 0 0.6 1; 0.4 0 0.6 1; 0.4 0 0.6 1; 0.4 0 0.6 1; 0.4 0 0.6 1; 0.4 0 0.6 1; 0.3 0 0.7 1; 0.3 0 0.7 1" />
              <animate attributeName="opacity" values="1;1;0" keyTimes="0;0.93;0.99" dur={`${d}s`} fill="freeze" />
            </g>
            )}

            {/* ─── BODY ─── one broad horizontal torso (~2.4× wide as tall) */}
            <g id="raven-body">
              <path id="raven-body-shape" fill={INK}
                d="M 11 -9 C 16 -8, 18 -3, 15 1 C 12 4, 5 5, -3 5 C -11 5, -17 3, -18 -2 C -19 -7, -12 -10, -3 -10 C 3 -10, 8 -10, 11 -9 Z" />
              {/* radial breast glow (spec) + amber under-rim, clipped to body */}
              <rect x="-19" y="-10" width="38" height="16" fill="url(#raven-breast)"
                clipPath="url(#raven-clip)" style={{ mixBlendMode: 'screen' }} />
              <rect x="-19" y="-10" width="38" height="16" fill="url(#raven-amber)"
                clipPath="url(#raven-clip)" style={{ mixBlendMode: 'screen' }}>
                {!reducedMotion && (
                <animate attributeName="opacity" values="0.85;1;0.72;0.95;0.85"
                  dur="6s" begin={begin} repeatCount="indefinite" />
                )}
              </rect>
            </g>

            {/* ─── NEAR WING ─── (over the body) — flight only */}
            {!settled && (
            <g id="raven-wing-left">
              <path fill={INK} d={nearExt}>
                <animate attributeName="d"
                  values={`${nearExt}; ${nearExt}; ${nearHalf}; ${nearFold}; ${nearFold}`}
                  keyTimes="0; 0.8; 0.9; 0.96; 1" dur={`${d}s`} fill="freeze" />
              </path>
              <animateTransform attributeName="transform" type="rotate"
                values="-30 2 -8; 38 2 -8; -30 2 -8; 38 2 -8; -30 2 -8; 42 2 -8; -34 2 -8; 10 2 -8; 0 2 -8"
                keyTimes="0; 0.13; 0.26; 0.39; 0.52; 0.64; 0.78; 0.9; 1"
                dur={`${d}s`} fill="freeze" calcMode="spline"
                keySplines="0.4 0 0.6 1; 0.4 0 0.6 1; 0.4 0 0.6 1; 0.4 0 0.6 1; 0.4 0 0.6 1; 0.4 0 0.6 1; 0.3 0 0.7 1; 0.3 0 0.7 1" />
              <animate attributeName="opacity" values="1;1;0" keyTimes="0;0.93;0.99" dur={`${d}s`} fill="freeze" />
            </g>
            )}

            {/* ─── PERCHED WING ─── folded wing over the body, irregular
                bottom edge (5–6 primary feather points); fades in on landing */}
            <g id="raven-wing" opacity={settled ? 1 : 0}>
              <path id="raven-wing-shape" fill={INK}
                d="M 8 -9 C 12 -6, 11 0, 6 5 L 3 3 L 1 6 L -3 4 L -5 7 L -9 5 L -11 8 L -16 5 C -10 -1, -2 -7, 8 -9 Z" />
              {/* amber underside glow on the folded wing */}
              <rect x="-17" y="-9" width="26" height="18" fill="url(#raven-amber)"
                clipPath="url(#raven-clip-wing)" style={{ mixBlendMode: 'screen' }} />
              {!settled && (
              <animate attributeName="opacity" values="0;0;1" keyTimes="0;0.92;1" dur={`${d}s`} fill="freeze" />
              )}
            </g>

            {/* ─── HEAD ─── dome crown, clear neck indent, hooked notched beak */}
            <g id="raven-head">
              {/* crown + neck + upper mandible (hooked, with a tip notch) */}
              <path fill={INK}
                d="M 5 -9 C 2 -16, 7 -22, 14 -22 C 20 -22, 24 -18, 23 -14 L 35 -13 C 37 -12.5, 37 -11.4, 35 -11 L 33 -11.6 L 32 -9.6 L 30 -11.4 C 25 -12, 12 -11, 5 -9 Z" />
              {/* idle head tilt every ~4s — pivots at the neck (8,-13); skipped under reduced motion */}
              {!reducedMotion && (
              <animateTransform attributeName="transform" type="rotate"
                values="0 8 -13; 0 8 -13; -16 8 -13; -16 8 -13; 0 8 -13; 0 8 -13"
                keyTimes="0; 0.18; 0.34; 0.54; 0.7; 1" dur="8s" begin={begin}
                repeatCount="indefinite" calcMode="spline"
                keySplines="0.5 0 0.5 1; 0.4 0 0.6 1; 0.5 0 0.5 1; 0.5 0 0.5 1; 0.5 0 0.5 1" />
              )}
            </g>

            {/* ─── LEGS & TALONS ─── two thin legs, 3 forward + 1 rear claw */}
            <g id="raven-legs" opacity={settled ? 1 : 0} fill="none" stroke={INK} strokeWidth="1.5" strokeLinecap="round">
              {/* rear leg */}
              <path d="M 0 5 L 0 18 L 0 28" strokeWidth="2" />
              <path d="M 0 28 C 2 30 5 30 7 29" />
              <path d="M 0 28 C 1 30 3 31 4 32" />
              <path d="M 0 28 C 0 30 0 32 -1 33" />
              <path d="M 0 28 C -2 29 -4 30 -5 30" />
              {/* front leg */}
              <path d="M 7 5 L 8 18 L 8 28" strokeWidth="2" />
              <path d="M 8 28 C 10 30 13 30 15 29" />
              <path d="M 8 28 C 9 30 11 31 12 32" />
              <path d="M 8 28 C 8 30 8 32 7 33" />
              <path d="M 8 28 C 6 29 4 30 3 30" />
              {!settled && (
              <animate attributeName="opacity" values="0;0;1" keyTimes="0;0.9;1" dur={`${d}s`} fill="freeze" />
              )}
            </g>
          </g>
        </g>
      </g>
    </svg>
  );
}

window.CG_MOTIFS = { PhotoPlaceholder, PaperFrame, GasLamp, LampMan, HangingLantern, FloorLamp, LanternDefs, Raven, IvyVine, IvyCurl, FernFrond, BotanicalDivider, BranchSprig, LooseSprig, BotanicalDefs };

// ── Man — spawns, climbs up, and sits on a letter of the name ──
// Outer container carries the climb-in travel (set by the caller's class);
// this figure is the seated end-pose: perched on a letter edge, legs
// dangling and swaying, with a gentle lean and an occasional overhead wave.
function LampMan({ height = 74, style = {} }) {
  const INK = '#0a0807';
  return (
    <svg viewBox="0 0 120 150" width={(height * 120) / 150} height={height}
      style={{ display: 'block', overflow: 'visible', ...style }}>
      {/* gentle seated lean about the seat (54,104) */}
      <g style={{ transformOrigin: '54px 104px', animation: 'cg-man-lean 5s ease-in-out infinite' }}>
        {/* prop arm planted behind on the letter top */}
        <path d="M 60 66 C 67 76, 73 88, 76 100" stroke={INK} strokeWidth="5" fill="none" strokeLinecap="round" />
        <circle cx="76" cy="101" r="3.4" fill={INK} />
        {/* legs dangle over the front edge of the letter, swaying */}
        <g style={{ transformOrigin: '50px 104px', animation: 'cg-man-leg-a 4s ease-in-out infinite' }}>
          <path d="M 50 102 C 47 116, 45 130, 44 142" stroke={INK} strokeWidth="5.5" fill="none" strokeLinecap="round" />
          <path d="M 44 142 C 43 145, 42 147, 39 148" stroke={INK} strokeWidth="4.5" fill="none" strokeLinecap="round" />
        </g>
        <g style={{ transformOrigin: '56px 104px', animation: 'cg-man-leg-b 4.6s ease-in-out infinite' }}>
          <path d="M 56 102 C 56 116, 57 130, 58 142" stroke={INK} strokeWidth="5.5" fill="none" strokeLinecap="round" />
          <path d="M 58 142 C 58 145, 58 147, 55 148" stroke={INK} strokeWidth="4.5" fill="none" strokeLinecap="round" />
        </g>
        {/* seat + torso */}
        <path d="M 46 104 C 44 90, 48 74, 58 66 C 62 63, 66 64, 66 69
                 C 66 82, 62 96, 60 104 C 56 108, 50 108, 46 104 Z" fill={INK} />
        {/* head */}
        <circle cx="64" cy="56" r="7.2" fill={INK} />
        {/* free arm — rests, then lifts overhead and waves back and forth */}
        <g style={{ transformOrigin: '59px 68px', animation: 'cg-man-freearm 6.5s ease-in-out infinite' }}>
          <path d="M 59 68 C 52 74, 47 82, 45 92" stroke={INK} strokeWidth="4.6" fill="none" strokeLinecap="round" />
          <circle cx="45" cy="93" r="3.3" fill={INK} />
        </g>
      </g>
    </svg>
  );
}
