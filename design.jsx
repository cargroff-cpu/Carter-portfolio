// design.jsx — The Scaffold, by Carter Groff (scaffold.cargroff.com). The
// public studio page: design and tools, given equal weight, for small
// businesses. AI drafts, Carter finishes. See DECISIONS.md.
//
// This file is the source. The page loads the precompiled design.js
// (no in-browser Babel); after editing, run:  npm run build:design
// The brief posts to api/design-brief.js.

// ── Offer config ─────────────────────────────────────────────────────
// Prices are NOT set yet (an open decision). The design figures below are
// placeholders; set SHOW_PRICES to true once the real numbers are in.
const SHOW_PRICES = false;

// Six of each, so the two halves of the page weigh the same. Broad on
// purpose: things almost any small business needs, no one company's tools.
const DESIGN_SERVICES = [
  { title: 'Social graphics', desc: 'One post or a series with one look.', need: 'Social graphics', from: '$75', turn: '2 business days' },
  { title: 'Websites', sub: 'front and back end', desc: 'Designed, built and launched, then kept running: the pages people see and the logins, databases, payments and forms behind them.', need: 'Website', from: '', turn: 'Quoted' },
  { title: 'Cards, flyers and print', desc: 'Print-ready with correct bleed, or sized for screen.', need: 'Business card or print', from: '$150', turn: '3 business days' },
  { title: 'Documents and reports', desc: 'Proposals, menus, multi-page layouts.', need: 'Document or report', from: '$400', turn: '5–7 business days' },
  { title: 'Presentations', desc: 'Designed slides, not a template.', need: 'Presentation or deck', from: '$400', turn: '5–7 business days' },
  { title: 'Brand basics', desc: 'Logo refinement, colors, type.', need: 'Brand basics', from: '$400', turn: 'Quoted' },
];
// Keep in sync with api/design-brief.js (AUTOMATION_SERVICES) and the Hub.
const TOOL_SERVICES = [
  { title: 'Inquiries and leads', desc: 'Every inquiry in one place, answered fast.', need: 'Inquiries and leads' },
  { title: 'Quotes and invoices', desc: 'From job details to a priced quote and a payment link.', need: 'Quotes and invoices' },
  { title: 'Scheduling and bookings', desc: 'Fewer back-and-forth messages.', need: 'Scheduling and bookings' },
  { title: 'Dashboards and reports', desc: 'The numbers that matter, on one screen.', need: 'Dashboards and reports' },
  { title: 'Reminders and follow-ups', desc: 'The right message at the right time.', need: 'Reminders and follow-ups' },
  { title: 'AI assistants', desc: 'Drafts replies using your prices and tone.', need: 'AI assistants' },
];
const DESIGN_CHIPS = ['Website', 'Social graphics', 'Business card or print', 'Flyer or one-pager', 'Document or report', 'Presentation or deck', 'Brand basics', 'Video', 'Something else'];
const AUTOMATION_CHIPS = [...TOOL_SERVICES.map((t) => t.need), 'Something else'];
const BUDGETS = ['Under $150', '$150–$500', '$500–$1,500', '$1,500–$5,000', '$5,000+', 'Not sure yet'];

// Real work only. Each item: { title, kind, src, alt }. Empty = hidden.
const WORK = [];
// Short client quotes. Each: { quote, name, business }. Empty = hidden.
const TESTIMONIALS = [];

const FAQ = [
  ['Do you use AI?', 'Yes. AI does the drafting and the first pass of the build. I make the decisions, check everything and finish it.'],
  ['What does it cost?', 'Graphics and print are priced per piece. Websites and tools are quoted after a short brief. Either way, you see the price before anything starts.'],
  ['Can you build the back end of a website too?', 'Yes. Besides the pages people see, I build what runs behind them: logins, databases, payments, booking and contact forms that land somewhere useful, and the admin pages you run it from.'],
  ['Will I need new software?', 'Not usually. Where I can, I build on what you already use.'],
  ['How fast is it?', 'Most design pieces: three directions within two business days of a complete brief. Tools: a plan within a few days, then a first working version.'],
  ['What if something breaks?', 'I fix it. Ongoing care is available as a monthly plan.'],
  ['Who owns the work?', 'You do, once it’s paid.'],
  ['Do we need a call?', 'No. The brief covers it. If a call would help, I’ll say so.'],
];

const STEPS = [
  ['I', 'Who’s asking'],
  ['II', 'What you need'],
  ['III', 'Details that save time'],
];

function Nav() {
  return (
    <nav className="dnav">
      <div className="dnavin">
        <a className="dbrand" href="#top">
          <img src="assets/antler.png" alt="" />
          <span><b>The Scaffold</b><span className="dsub">by Carter Groff</span></span>
        </a>
        <div className="dnavlinks">
          <a href="#make">What I make</a><a href="#how">How it works</a><a href="#faq">Questions</a>
          <a href="https://www.cargroff.com/">Portfolio</a>
        </div>
        <a className="p-btn" href="#brief">Start a brief</a>
      </div>
    </nav>
  );
}

// An engraved ring of 120 ticks with an amber mark every 30 degrees, drawn
// in a 600 box. Shared by the hero medallion and the brief.
function TickRing({ r1 = 268, r1Major = 258, r2 = 280 }) {
  const ticks = [];
  for (let i = 0; i < 120; i++) {
    const major = i % 10 === 0, t = (i * 3 * Math.PI) / 180, a = major ? r1Major : r1;
    ticks.push(<line key={i} className={major ? 'major' : ''}
      x1={(300 + a * Math.sin(t)).toFixed(2)} y1={(300 - a * Math.cos(t)).toFixed(2)}
      x2={(300 + r2 * Math.sin(t)).toFixed(2)} y2={(300 - r2 * Math.cos(t)).toFixed(2)} />);
  }
  return <g className="dm-ticks">{ticks}</g>;
}

// The hero mark: the gold crest over a soft green glow, inside twelve amber
// marks hung in a wide circle like the hours, with fine rays of light
// reaching out between them. The marks light one after
// another so the pulse travels round the crest, the circle turns slowly, the
// glow breathes, and light passes over the gold. No band, no hard disc.
const HOURS = Array.from({ length: 12 }, (_, i) => {
  const big = i % 3 === 0, t = (i * 30 * Math.PI) / 180, r1 = 232, r2 = big ? 270 : 256;
  return { big, delay: i * 0.5, x1: 300 + r1 * Math.sin(t), y1: 300 - r1 * Math.cos(t), x2: 300 + r2 * Math.sin(t), y2: 300 - r2 * Math.cos(t) };
});

// Twenty-four fine rays of light between the hours, long and short in turn.
const RAYS = Array.from({ length: 24 }, (_, i) => ({ a: i * 15 + 7.5, len: i % 2 ? 150 : 230 }));

function Medallion() {
  return (
    <svg className="dmedal" viewBox="0 0 600 600" role="img" aria-label="The Scaffold, by Carter Groff">
      <defs>
        <radialGradient id="dm-wash">
          <stop offset="0%" className="dm-wash-0" /><stop offset="65%" className="dm-wash-1" /><stop offset="100%" className="dm-wash-2" />
        </radialGradient>
        <linearGradient id="dm-gold" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" className="dm-gold-hi" /><stop offset="100%" className="dm-gold-lo" />
        </linearGradient>
        <linearGradient id="dm-sheen" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" className="dm-sheen-0" /><stop offset="50%" className="dm-sheen-1" /><stop offset="100%" className="dm-sheen-0" />
        </linearGradient>
        <mask id="dm-crest" maskUnits="userSpaceOnUse" x="0" y="0" width="600" height="600">
          <image href="assets/antler.png" x="145" y="186" width="310" height="237" />
        </mask>
        <linearGradient id="dm-ray" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" className="dm-ray-0" /><stop offset="100%" className="dm-ray-1" />
        </linearGradient>
        {/* the rays fade out below the crest so they never cross the headline */}
        <linearGradient id="dm-fadeg" gradientUnits="userSpaceOnUse" x1="0" y1="430" x2="0" y2="620">
          <stop offset="0%" className="dm-fade-0" /><stop offset="100%" className="dm-fade-1" />
        </linearGradient>
        <mask id="dm-fade" maskUnits="userSpaceOnUse" x="-600" y="-600" width="1800" height="1800">
          <rect x="-600" y="-600" width="1800" height="1800" fill="url(#dm-fadeg)" />
        </mask>
      </defs>
      <circle className="dm-wash" cx="300" cy="300" r="250" fill="url(#dm-wash)" />
      <g mask="url(#dm-fade)"><g className="dm-rays">
        {RAYS.map((r, i) => (
          <rect key={i} className="dm-ray" x="299" y={20 - r.len} width="2" height={r.len} fill="url(#dm-ray)" transform={'rotate(' + r.a + ' 300 300)'} />
        ))}
      </g></g>
      <g className="dm-spin-in"><g className="dm-spin">
        {HOURS.map((h, i) => (
          <line key={i} className={'dm-hour' + (h.big ? ' big' : '')} style={{ animationDelay: h.delay + 's' }}
            x1={h.x1.toFixed(2)} y1={h.y1.toFixed(2)} x2={h.x2.toFixed(2)} y2={h.y2.toFixed(2)} />
        ))}
      </g></g>
      <rect x="135" y="176" width="330" height="257" fill="url(#dm-gold)" mask="url(#dm-crest)" />
      <g mask="url(#dm-crest)"><rect className="dm-sheen" x="55" y="176" width="140" height="257" fill="url(#dm-sheen)" /></g>
    </svg>
  );
}

// The brief's backdrop: the same engraved ring, large, turning slowly behind
// the heading, the way the original page's rings sat behind its brief.
function BriefRing() {
  return (
    <svg className="dbrief-ring" viewBox="0 0 600 600" aria-hidden="true">
      <circle className="dm-ripple" cx="300" cy="300" r="250" />
      <circle className="dm-rule" cx="300" cy="300" r="294" />
      <g className="dm-spin slow"><TickRing /></g>
      <circle className="dm-rule" cx="300" cy="300" r="250" />
      <circle className="dm-rule dashed dm-spin-back" cx="300" cy="300" r="232" />
      <circle className="dm-rule" cx="300" cy="300" r="214" />
    </svg>
  );
}

// A lane of lamp posts: four pairs, each farther pair higher up the lane,
// smaller and dimmer, with a bank of fog rolling in front of it so the lane
// drifts away behind the medallion. Each globe can be clicked to snuff it.
const LANE = [['back', 260], ['far', 380], ['mid', 560], ['near', 820]];
function HeroLamp({ side, row, height }) {
  const [out, setOut] = React.useState(false);
  return (
    <div className={'dhero-lamp ' + side + ' ' + row + (out ? ' out' : '')} aria-hidden="true">
      <div className="dhero-candle" />
      <GasLamp height={height} out={out} onGlobeClick={() => setOut((o) => !o)} />
    </div>
  );
}
function LaneFog({ row, dur, delay }) {
  return (
    <React.Fragment>
      <div className={'dhero-veil ' + row} aria-hidden="true" />
      <div className={'dhero-wisp ' + row} aria-hidden="true" style={{ animationDuration: dur + 's', animationDelay: delay + 's' }} />
    </React.Fragment>
  );
}
const LANE_FOG = { back: [40, -8], far: [34, -14], mid: [28, -4] };

function Hero({ onAddNeed }) {
  return (
    <header className="dhero dpanel dlive" id="top">
      {/* The portfolio's room: fog banks rolling across the wood, under a deep vignette */}
      <div className="dhero-fog" aria-hidden="true" style={{ top: '24%', animationDuration: '26s' }} />
      <div className="dhero-fog" aria-hidden="true" style={{ top: '50%', animationDuration: '34s', animationDelay: '-12s' }} />
      <div className="dhero-fog" aria-hidden="true" style={{ top: '72%', animationDuration: '30s', animationDelay: '-20s' }} />
      <div className="dhero-vignette" aria-hidden="true" />
      <div className="dhero-path" aria-hidden="true" />
      {LANE.map(([row, h]) => (
        <React.Fragment key={row}>
          <HeroLamp side="l" row={row} height={h} />
          <HeroLamp side="r" row={row} height={h} />
          {LANE_FOG[row] && <LaneFog row={row} dur={LANE_FOG[row][0]} delay={LANE_FOG[row][1]} />}
        </React.Fragment>
      ))}
      <div className="dwrap dhero-in">
        <div className="dhero-medal"><Medallion /></div>
        <h1 className="ddisplay">Design that looks right. Tools that work right.</h1>
        <p className="ddeck">Websites, graphics and print, and the tools that take busywork off your plate.</p>
        <div className="dacts">
          <a className="p-btn" href="#brief" onClick={(e) => { e.preventDefault(); onAddNeed('design'); }}>Start a brief</a>
          <a className="p-btn ghost" href="#doors">See the work</a>
        </div>
      </div>
    </header>
  );
}

// ── Two doors: what a design job and a tools job look like, side by side
// and the same size. Both illustrative and generic. ──
const DRAFTS = [
  { cls: 'd1', body: <React.Fragment><span>Spring<br />menu.</span><i>From March 4th</i></React.Fragment> },
  { cls: 'd2', body: <React.Fragment><span>Spring menu</span><i>from March 4th</i></React.Fragment> },
  { cls: 'd3', body: <React.Fragment><span>spring<br /><b>menu</b></span><i>March 4</i></React.Fragment> },
];
const SESSION = [
  ['$', 'inquiry in', '# kitchen remodel, website form'],
  ['+', 'auto-reply sent', ''],
  ['+', 'quote drafted from your prices', ''],
  ['?', 'send it?', '# you approve'],
  ['+', 'follow-up set for three days out', ''],
];

function Doors({ onAddNeed }) {
  const [pick, setPick] = React.useState(1);
  const [typed, setTyped] = React.useState(false);
  const sessionRef = React.useRef(null);
  React.useEffect(() => {
    const el = sessionRef.current;
    if (!el || !('IntersectionObserver' in window)) { setTyped(true); return; }
    const io = new IntersectionObserver((es) => { if (es[0].isIntersecting) { setTyped(true); io.disconnect(); } }, { threshold: 0.35 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <section id="doors" className="dsection ddoors dsoft">
      <div className="dwrap">
        <div className="dshead up">
          <h2 className="ddisplay">What each half looks like.</h2>
        </div>
        <div className="dduo">
          <div className="ddoor up">
            <span className="dk">Design</span>
            <h3 className="ddisplay">Three drafts. You pick one.</h3>
            <div className="dsheet up">
              <div className="dhv-drafts" role="group" aria-label="Three drafts of a spring menu flyer">
                {DRAFTS.map((d, i) => (
                  <button key={d.cls} type="button" className="dprint" aria-pressed={pick === i} aria-label={'Draft ' + (i + 1)} onClick={() => setPick(i)}>
                    <span className={'dhv-d ' + d.cls}>{d.body}</span>
                    <span className="dprint-n">{i + 1}<small>Your pick</small></span>
                  </button>
                ))}
              </div>
            </div>
            <p className="dcap">Example: a spring menu flyer. Pick a draft.</p>
            <p><a className="p-btn" href="#brief" onClick={(e) => { e.preventDefault(); onAddNeed('design'); }}>Start a design brief</a></p>
          </div>
          <div className="ddoor dauto up">
            <span className="dk">Tools</span>
            <h3 className="ddisplay">An inquiry, handled.</h3>
            <div className={'dsession' + (typed ? ' on' : '')} ref={sessionRef} aria-label="Example: an inquiry gets an auto-reply, a drafted quote you approve, then a follow-up">
              <ol>
                {SESSION.map(([p, t, c], i) => (
                  <li key={i} style={{ transitionDelay: (i * 0.4) + 's' }}><span className="dsp">{p}</span><span>{t}{c && <span className="dsc"> {c}</span>}</span></li>
                ))}
                <li style={{ transitionDelay: (SESSION.length * 0.4) + 's' }}><span className="dsp">$</span><span><span className="dcursor" aria-hidden="true" /></span></li>
              </ol>
            </div>
            <p className="dcap">Example: one tool. You approve what customers see.</p>
            <p><a className="p-btn" href="#brief" onClick={(e) => { e.preventDefault(); onAddNeed('automation'); }}>Start a tools brief</a></p>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── How it works: the four steps on a dial. Every step name stays visible
// in the list; choosing one moves the needle and opens its detail. ──
const HOW_STEPS = [
  ['Send a brief', 'A short form: what you need, and what it has to do. About three minutes, no account, no call.'],
  ['Get options', 'Design: three directions within two business days. Tools: a one-page plan and a fixed quote.'],
  ['I finish it', 'Design: refined by hand, two revision rounds included. Tools: built and tested on real work.'],
  ['You get it', 'Design: print-ready files. Tools: a working build, handed over and explained. Yours once it’s paid.'],
];

// Geometry for the seal: angles run clockwise from the top, in degrees.
const SEAL = 200;
function sealPt(r, a) {
  const t = (a * Math.PI) / 180;
  return [+(SEAL + r * Math.sin(t)).toFixed(2), +(SEAL - r * Math.cos(t)).toFixed(2)];
}
// An arc centred on angle a, wide enough for a step name. The bottom one runs
// the other way so its lettering stays upright.
function sealArc(a, r) {
  const flip = a === 180;
  const [x1, y1] = sealPt(r, flip ? a + 58 : a - 58);
  const [x2, y2] = sealPt(r, flip ? a - 58 : a + 58);
  return 'M' + x1 + ' ' + y1 + ' A' + r + ' ' + r + ' 0 0 ' + (flip ? 0 : 1) + ' ' + x2 + ' ' + y2;
}
const SEAL_TRACK = 2 * Math.PI * 128;

function Dial() {
  const [at, setAt] = React.useState(0);
  return (
    <section id="how" className="dsection dwood dpanel">
      <div className="dsec-candle" aria-hidden="true" />
      <div className="dwrap ddialwrap">
        <div className="ddial up" aria-hidden="true">
          <svg viewBox="0 0 400 400" role="presentation">
            <defs>
              {HOW_STEPS.map((s, i) => <path key={i} id={'dseal-' + i} d={sealArc(i * 90, i === 2 ? 170 : 158)} />)}
            </defs>
            <circle className="dseal-rule" cx="200" cy="200" r="190" />
            <circle className="dseal-rule" cx="200" cy="200" r="184" />
            <circle className="dseal-rule" cx="200" cy="200" r="142" />
            {HOW_STEPS.map(([title], i) => (
              <g key={title} className={'dseal-name' + (at === i ? ' on' : '')} onClick={() => setAt(i)}>
                <text><textPath href={'#dseal-' + i} startOffset="50%" textAnchor="middle">{title}</textPath></text>
              </g>
            ))}
            {[45, 135, 225, 315].map((a) => {
              const [x, y] = sealPt(163, a);
              return <circle key={a} className="dseal-dot" cx={x} cy={y} r="2" />;
            })}
            <circle className="dseal-track" cx="200" cy="200" r="128" />
            <circle className="dseal-done" cx="200" cy="200" r="128" transform="rotate(-90 200 200)"
              strokeDasharray={SEAL_TRACK} strokeDashoffset={SEAL_TRACK * (1 - at / 4)} />
            {HOW_STEPS.map((s, i) => {
              const [x, y] = sealPt(128, i * 90);
              const [nx, ny] = sealPt(98, i * 90);
              return (
                <g key={i} className={'dseal-stop' + (i <= at ? ' done' : '')} onClick={() => setAt(i)}>
                  <rect x={x - 5} y={y - 5} width="10" height="10" transform={'rotate(45 ' + x + ' ' + y + ')'} />
                  <text x={nx} y={ny} dy="0.35em" textAnchor="middle">{i + 1}</text>
                </g>
              );
            })}
            <g className="dseal-mark" style={{ transform: 'rotate(' + at * 90 + 'deg)' }}>
              <rect x="191" y="63" width="18" height="18" transform="rotate(45 200 72)" />
            </g>
            <image href="assets/antler.png" x="152" y="164" width="96" height="73" className="dseal-crest" />
          </svg>
        </div>
        <div>
          <div className="dshead up">
            <h2 className="ddisplay">Four steps. No surprises.</h2>
          </div>
          <ol className="dsteplist">
            {HOW_STEPS.map(([title, body], i) => (
              <li key={title} className={at === i ? 'on' : ''}>
                <button type="button" aria-expanded={at === i} aria-controls={'dstep-' + i} onClick={() => setAt(i)}>
                  <span className="dstep-n">{i + 1}</span><span className="dstep-t">{title}</span>
                </button>
                <p id={'dstep-' + i} hidden={at !== i}>{body}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

// Design rows carry their turnaround; tool rows are all quoted after a brief,
// which the shelf says once instead of on every row.
function Turn({ s, lane }) {
  const turn = lane === 'design' ? (s.turn || 'Quoted') : null;
  const price = SHOW_PRICES && s.from;
  if (!turn && !price) return null;
  return (
    <em className="dturn">
      {price && <span className="dprice">From {s.from}</span>}
      {turn && <span>{turn}</span>}
    </em>
  );
}

function Shelf({ lane, label, title, blurb, items, cta, onAddNeed }) {
  return (
    <div className={'dhalf-sec up' + (lane === 'automation' ? ' dauto' : '')}>
      <span className="dk">{label}</span>
      <h3 className="ddisplay">{title}</h3>
      <p className="dp">{blurb}</p>
      <ul className="dlist">
        {items.map((s) => (
          <li key={s.title}>
            <a href="#brief" onClick={(e) => { e.preventDefault(); onAddNeed(lane, s.need); }}>
              <span className="dlist-main"><b>{s.title}{s.sub && <small className="dlist-sub">{s.sub}</small>}</b></span>
              <Turn s={s} lane={lane} />
            </a>
          </li>
        ))}
      </ul>
      <p style={{ marginTop: 24 }}>
        <a className="p-btn ghost" href="#brief" onClick={(e) => { e.preventDefault(); onAddNeed(lane); }}>{cta}</a>
      </p>
    </div>
  );
}

function Make({ onAddNeed }) {
  // On a phone one list shows at a time, chosen with the Design | Tools switch.
  const [show, setShow] = React.useState('design');
  return (
    <section id="make" className="dsection dplain">
      <div className="dwrap">
        <div className="dshead">
          <h2 className="ddisplay">Two kinds of work, one person.</h2>
        </div>
        <div className="dmaketabs" role="tablist" aria-label="Kind of work">
          {[['design', 'Design'], ['automation', 'Tools']].map(([v, label]) => (
            <button key={v} type="button" role="tab" aria-selected={show === v}
              className={'dlane' + (show === v ? ' on' : '') + (v === 'automation' ? ' auto' : '')} onClick={() => setShow(v)}>{label}</button>
          ))}
        </div>
        <div className={'dduo dmake show-' + show}>
          <Shelf lane="design" label="Design" title="What your customers see"
            blurb="Three directions, you pick one, I finish it."
            items={DESIGN_SERVICES} cta="Start a design brief" onAddNeed={onAddNeed} />
          <Shelf lane="automation" label="Tools" title="What runs behind the scenes"
            blurb="Proven by hand first. Quoted after a short brief."
            items={TOOL_SERVICES} cta="Start a tools brief" onAddNeed={onAddNeed} />
        </div>
        {WORK.length > 0 && (
          <React.Fragment>
            <div className="dworkhead"><h3>Recent work</h3></div>
            <div className="dsamples">
              {WORK.map((w) => (
                <figure className="dslot" key={w.title}>
                  <img src={w.src} alt={w.alt} loading="lazy" />
                  <figcaption><b>{w.title}</b>, {w.kind}</figcaption>
                </figure>
              ))}
            </div>
          </React.Fragment>
        )}
      </div>
    </section>
  );
}

function Why() {
  return (
    <section id="why" className="dsection dpanel">
      <div className="dsec-candle left" aria-hidden="true" />
      <div className="dwrap">
        <div className="dwhyhead up">
          <img className="dportrait" src="assets/portrait.jpg" alt="Carter Groff" loading="lazy" />
          <div>
            <h2 className="ddisplay">I’m Carter.</h2>
            <p className="dp">A marketer, designer and builder in Harrisonburg, Virginia. By day I lead marketing and automation at a local company, so I know what small teams actually need.</p>
            <span className="dk drules-k">My rules</span>
            <ol className="drules">
              <li><b>1</b><span>Prove it by hand before automating it.</span></li>
              <li><b>2</b><span>Automate the bottleneck, not everything.</span></li>
              <li><b>3</b><span>A person approves anything that reaches a customer.</span></li>
            </ol>
          </div>
        </div>
        {TESTIMONIALS.length > 0 && (
          <div className="dquotes">
            {TESTIMONIALS.map((t) => (
              <blockquote className="up" key={t.name}><p>“{t.quote}”</p><cite>{t.name}{t.business ? ', ' + t.business : ''}</cite></blockquote>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function Faq() {
  return (
    <section id="faq" className="dsection dsoft">
      <div className="dwrap dfaqgrid">
        <div className="dshead up">
          <h2 className="ddisplay">Short answers.</h2>
        </div>
        <div className="dfaq">
          {FAQ.map(([q, a]) => (
            <details className="up" key={q}><summary>{q}</summary><p>{a}</p></details>
          ))}
        </div>
      </div>
    </section>
  );
}

// Reads chosen files as base64 for the JSON post. Limits match
// api/design-brief.js (3 files, 2.5 MB each, images or PDF).
const FILE_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'image/svg+xml', 'application/pdf'];
const MAX_FILE_BYTES = 2.5 * 1024 * 1024;
function readFile(file) {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve({ name: file.name, type: file.type, data: String(r.result).split(',')[1] || '' });
    r.onerror = () => reject(new Error('Could not read ' + file.name));
    r.readAsDataURL(file);
  });
}

// ── The brief: a controlled three-step form, posted to a real endpoint ──
const Brief = React.forwardRef(function Brief(props, ref) {
  const [step, setStep] = React.useState(0);
  const [sent, setSent] = React.useState(null);
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState('');
  const [files, setFiles] = React.useState([]);
  const [f, setF] = React.useState({
    lane: 'design', name: '', email: '', business: '', need: [], about: '', where: '', when: '', flexible: false,
    assets: '', copy: '', refs: '', notes: '', budget: '', auto_slow: '', auto_tools: '', auto_who: '', website: '',
  });
  const auto = f.lane === 'automation';

  const set = (k) => (e) => setF((s) => ({ ...s, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));
  const toggleNeed = (v) => setF((s) => ({ ...s, need: s.need.includes(v) ? s.need.filter((x) => x !== v) : [...s.need, v] }));
  const setLane = (lane) => setF((s) => (s.lane === lane ? s : { ...s, lane, need: [] }));

  React.useImperativeHandle(ref, () => ({
    addNeed: (lane, v) => {
      setStep(0);
      setF((s) => {
        const need = s.lane === lane ? s.need : [];
        return { ...s, lane, need: v && !need.includes(v) ? [...need, v] : need };
      });
    },
  }));

  const onFiles = (e) => {
    setError('');
    const chosen = Array.from(e.target.files || []).slice(0, 3);
    const bad = chosen.find((x) => !FILE_TYPES.includes(x.type) || x.size > MAX_FILE_BYTES);
    if (bad) { setError(`${bad.name}: images or PDFs only, up to 2.5 MB each.`); e.target.value = ''; setFiles([]); return; }
    setFiles(chosen);
  };

  const stepValid = (i) => {
    if (i === 0) return f.name.trim().length > 1 && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(f.email.trim());
    if (i === 1) return f.about.trim().length > 1;
    return true;
  };

  const next = () => {
    if (!stepValid(step)) return;
    if (step < 2) setStep(step + 1);
    else submit();
  };
  const back = () => setStep((s) => Math.max(0, s - 1));

  const submit = async () => {
    setBusy(true); setError('');
    try {
      const payload = { ...f, files: await Promise.all(files.map(readFile)) };
      const r = await fetch('/api/design-brief', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
      });
      const data = await r.json().catch(() => ({}));
      if (!r.ok || data.error) { setError(data.error || 'Something went wrong. Try again, or email car.groff@gmail.com.'); return; }
      setSent(data);
    } catch (e) {
      setError('Something went wrong. Try again, or email car.groff@gmail.com.');
    } finally {
      setBusy(false);
    }
  };

  if (sent) {
    return (
      <section id="brief" className="dsection ddeep">
        <div className="dwrap">
          <div className="dsent">
            <h3 className="ddisplay">Brief received.</h3>
            {sent.reference && <p className="dref">Reference {sent.reference}</p>}
            <p className="dp">
              {sent.confirmation ? 'A copy is on its way to your inbox. ' : ''}
              I’ll read it properly and come back with a price and a delivery date, usually within one business day. If anything’s missing I’ll ask for exactly that.
            </p>
          </div>
        </div>
      </section>
    );
  }

  const chips = auto ? AUTOMATION_CHIPS : DESIGN_CHIPS;

  return (
    <section id="brief" className={'dsection ddeep dlive' + (auto ? ' dauto' : '')}>
      <div className="dbrief-glow" aria-hidden="true" />
      <BriefRing />
      <div className="dwrap dbriefwrap">
        <div className="dbriefhead">
          <img className="dbrief-crest" src="assets/antler.png" alt="" />
          <h2 className="ddisplay">Write me a brief.</h2>
          <p className="ddeck">Three short steps. The more you tell me, the sooner you get a price.</p>
          <p className="dbriefmeta">About three minutes. No account, and no call. {auto ? 'A price and a timeline within a day.' : 'Three design directions within two business days.'}</p>
        </div>

        <div className="dlanes" role="radiogroup" aria-label="What kind of project">
          {[['design', 'Design'], ['automation', 'Tools']].map(([v, label]) => (
            <button key={v} type="button" role="radio" aria-checked={f.lane === v}
              className={'dlane' + (f.lane === v ? ' on' : '') + (v === 'automation' ? ' auto' : '')} onClick={() => setLane(v)}>{label}</button>
          ))}
        </div>

        <div className="dprog">
          <div className="dprogrow"><span>Step {step + 1} of 3: {STEPS[step][1].toLowerCase()}</span><span>{step === 2 ? 'Last step' : step === 1 ? 'One left' : 'Two left'}</span></div>
          <div className="dprogbars">{[0, 1, 2].map((i) => <i key={i} className={i <= step ? 'done' : ''} />)}</div>
        </div>

        <form className="dform" onSubmit={(e) => { e.preventDefault(); next(); }}>
          {/* Honeypot: hidden from people, irresistible to bots. */}
          <div className="dhp" aria-hidden="true">
            <label>Website<input tabIndex={-1} autoComplete="off" value={f.website} onChange={set('website')} /></label>
          </div>
          {step === 0 && (
            <div className="dmv">
              <div className="dfields two">
                <label className="dfl"><span className="dlb">Your name <i>required</i></span>
                  <input value={f.name} onChange={set('name')} placeholder="Jane Carter" autoComplete="name" /></label>
                <label className="dfl"><span className="dlb">Where do I reply <i>required</i></span>
                  <input type="email" value={f.email} onChange={set('email')} placeholder="jane@business.com" autoComplete="email" /></label>
              </div>
              <div className="dfields">
                <label className="dfl"><span className="dlb">The business or project name</span>
                  <input value={f.business} onChange={set('business')} placeholder="Carter & Co." autoComplete="organization" /></label>
              </div>
            </div>
          )}
          {step === 1 && (
            <div className="dmv">
              <div className="dfields">
                <div>
                  <span className="dqlb">{auto ? 'What should it do?' : 'What are we making?'}</span>
                  <div className="dchips">
                    {chips.map((c) => (
                      <label key={c} className={'dchip' + (f.need.includes(c) ? ' on' : '')}>
                        <input type="checkbox" checked={f.need.includes(c)} onChange={() => toggleNeed(c)} />{c}
                      </label>
                    ))}
                  </div>
                </div>
                <label className="dfl"><span className="dlb">Tell me about it <i>required</i></span>
                  <span className="dhint">{auto ? 'What you want to stop doing by hand.' : 'Who it’s for and what it has to do.'}</span>
                  <textarea rows={3} value={f.about} onChange={set('about')} placeholder={auto ? 'Every website inquiry gets copied into a spreadsheet by hand…' : 'A five-post series announcing our spring menu…'} /></label>
              </div>
              {auto ? (
                <div className="dfields two">
                  <label className="dfl"><span className="dlb">What’s slow today</span><span className="dhint">The step that eats the most time.</span>
                    <textarea rows={2} value={f.auto_slow} onChange={set('auto_slow')} placeholder="Replying to quote requests" /></label>
                  <label className="dfl"><span className="dlb">Tools you already use</span><span className="dhint">Email, a CRM, spreadsheets, booking software.</span>
                    <textarea rows={2} value={f.auto_tools} onChange={set('auto_tools')} placeholder="Gmail, Google Sheets, Square" /></label>
                  <label className="dfl"><span className="dlb">Who does it now</span>
                    <input value={f.auto_who} onChange={set('auto_who')} placeholder="Me, after hours" /></label>
                </div>
              ) : (
                <div className="dfields two">
                  <label className="dfl"><span className="dlb">Where will it run</span>
                    <span className="dhint">Instagram, a printed handout, a website, an email.</span>
                    <input value={f.where} onChange={set('where')} placeholder="Instagram feed" /></label>
                  <div className="dfl"><span className="dlb">When do you need it</span><span className="dhint">A date, or tell me it can move.</span>
                    <div className="ddatewrap">
                      <input type="date" value={f.when} onChange={set('when')} />
                      <label className="dflex"><input type="checkbox" checked={f.flexible} onChange={set('flexible')} />Flexible</label>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
          {step === 2 && (
            <div className="dmv">
              <div className="dfields">
                {!auto && (
                  <div>
                    <span className="dqlb">Do you have brand assets?</span>
                    <div className="dchoices">
                      {['Yes: logo, colors, fonts', 'Some of them', 'No, help me figure it out'].map((label, i) => {
                        const value = ['Yes', 'Some', 'No'][i];
                        return (
                          <label key={value} className={'dchoice' + (f.assets === value ? ' on' : '')}>
                            <input type="radio" name="assets" checked={f.assets === value} onChange={() => setF((s) => ({ ...s, assets: value }))} />{label}
                          </label>
                        );
                      })}
                    </div>
                  </div>
                )}
                {!auto && (
                  <label className="dfl"><span className="dlb">Exact copy that must appear</span>
                    <span className="dhint">Paste it verbatim. Wording that changes later is the most common cause of extra rounds.</span>
                    <textarea rows={3} value={f.copy} onChange={set('copy')} placeholder="Spring menu. Available from March 4th…" /></label>
                )}
              </div>
              <div className="dfields two">
                {!auto && (
                  <label className="dfl"><span className="dlb">A look you like</span><span className="dhint">One to three examples.</span>
                    <textarea rows={2} value={f.refs} onChange={set('refs')} placeholder="Links, or a description" /></label>
                )}
                <label className="dfl"><span className="dlb">Anything else</span><span className="dhint">Constraints, past attempts, deadlines.</span>
                  <textarea rows={2} value={f.notes} onChange={set('notes')} placeholder="Whatever I should know" /></label>
              </div>
              <div className="dfields">
                <div>
                  <span className="dqlb">Budget range</span>
                  <div className="dchips">
                    {BUDGETS.map((b) => (
                      <label key={b} className={'dchip' + (f.budget === b ? ' on' : '')}>
                        <input type="radio" name="budget" checked={f.budget === b} onChange={() => setF((s) => ({ ...s, budget: b }))} />{b}
                      </label>
                    ))}
                  </div>
                </div>
                <label className="dfl"><span className="dlb">{auto ? 'Screenshots or examples' : 'Logo, brand files or references'}</span>
                  <span className="dhint">Optional. Up to three images or PDFs, 2.5 MB each.</span>
                  <input className="dfile" type="file" multiple accept={FILE_TYPES.join(',')} onChange={onFiles} />
                  {files.length > 0 && <span className="dhint">{files.map((x) => x.name).join(', ')}</span>}
                </label>
              </div>
            </div>
          )}

          {error && <p className="derr" role="alert">{error}</p>}

          <div className="dwalk">
            {step > 0 && <button className="dback" type="button" onClick={back}>Back</button>}
            <p className="dfine">
              {step === 2 ? "Price and timeline back within a day."
                : step === 1 ? 'One more step. All optional.'
                : 'Three short steps.'}
            </p>
            <button className="p-btn" type="submit" disabled={busy || !stepValid(step)}>
              {busy ? 'Sending…' : step === 2 ? 'Send brief' : 'Continue'}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
});

function Footer() {
  return (
    <footer className="dfooter">
      <div className="dwrap dfootin">
        <div className="dcrest"><img src="assets/antler.png" alt="" /></div>
        <div>
          <p className="ddisplay" style={{ fontSize: 22 }}>The Scaffold</p>
          <p className="dfootsub">Tools and design by Carter Groff. Harrisonburg, Virginia.</p>
        </div>
        <div className="dfootlinks">
          <a href="https://www.cargroff.com/">Portfolio</a>
          <a href="mailto:car.groff@gmail.com">car.groff@gmail.com</a>
          <span>© {new Date().getFullYear()} Carter Groff</span>
        </div>
      </div>
    </footer>
  );
}

// Fades .up-marked elements in as they enter view — a scoped stand-in for
// the source's reveal(), see cargroff-design.css.
function useReveal() {
  React.useEffect(() => {
    const els = document.querySelectorAll('.up');
    if (!els.length) return;
    if (!('IntersectionObserver' in window)) { els.forEach((el) => el.classList.add('shown')); return; }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('shown'); io.unobserve(e.target); } });
    }, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });
    els.forEach((el) => io.observe(el));
    // Looping motion (the medallion, the brief ring) pauses while off screen.
    const lives = document.querySelectorAll('.dlive');
    const live = new IntersectionObserver((entries) => {
      entries.forEach((e) => e.target.classList.toggle('idle', !e.isIntersecting));
    });
    lives.forEach((el) => live.observe(el));
    return () => { io.disconnect(); live.disconnect(); };
  }, []);
}

function TheScaffold() {
  const briefRef = React.useRef(null);
  useReveal();
  const onAddNeed = (lane, v) => {
    if (briefRef.current) briefRef.current.addNeed(lane, v);
    document.getElementById('brief').scrollIntoView({ behavior: 'smooth' });
  };
  return (
    <div className="cgd p-grain">
      <Nav />
      <Hero onAddNeed={onAddNeed} />
      <Doors onAddNeed={onAddNeed} />
      <Dial />
      <Make onAddNeed={onAddNeed} />
      <Why />
      <Brief ref={briefRef} />
      <Faq />
      <Footer />
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<TheScaffold />);
