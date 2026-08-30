// design.jsx — Cargroff Design (cargroff.com/design), recreated from
// design-reference/Carter Groff Design v2.dc.html (merged with anything v1
// had that v2 dropped — nothing material found). Structure, copy, and the
// three-movement brief walker are ported faithfully; the heavier decorative
// motion (parallax props, masked word reveal, ember particles) was not —
// see DECISIONS.md. The brief posts to a real endpoint, api/design-brief.js.

const SERVICE_CARDS = [
  ['01', 'Social graphics', 'A single post or a full series that shares one look.', 'Social graphics'],
  ['02', 'Business cards and print', 'Double-sided, print-ready, correct bleed.', 'Business card or print'],
  ['03', 'Flyers and one-pagers', 'For print or digital.', 'Flyer or one-pager'],
  ['04', 'Documents and reports', 'Proposals, menus, lookbooks, multi-page layouts.', 'Document or report'],
  ['05', 'Presentations and decks', 'Designed slides, not a template.', 'Presentation or deck'],
  ['06', 'Brand basics', 'Logo refinement, color and type systems, simple guidelines.', 'Brand basics'],
];
const CHIPS = ['Social graphics', 'Business card or print', 'Flyer or one-pager', 'Document or report', 'Presentation or deck', 'Brand basics', 'Video', 'Something else'];
const STEPS = [
  ['I', "Who's asking"],
  ['II', 'What you need'],
  ['III', 'Details that save rounds'],
];

// Decorative concentric-ring instrument, reused behind the hero and the
// brief — pure CSS (see cargroff-design.css's .rings rules), no JS.
function Rings() {
  return (
    <div className="rings" aria-hidden="true">
      <span className="r1" /><span className="r2" /><span className="r3" />
      <span className="t1" /><span className="t2" /><span className="t3" />
    </div>
  );
}

function Nav() {
  return (
    <nav className="dnav">
      <div className="dnavin">
        <a className="dbrand" href="#top">
          <img src="assets/antler.png" alt="" />
          <span><b>Carter Groff <i>Design</i></b><span className="dsub">cargroff.com</span></span>
        </a>
        <div className="dnavlinks">
          <a href="#make">What I make</a><a href="#how">How it works</a><a href="#why">Why me</a><a href="#beyond">Beyond static</a>
          <a href="/">Portfolio ↗</a>
        </div>
        <a className="p-btn" href="#brief">Start a brief</a>
      </div>
    </nav>
  );
}

function Hero() {
  return (
    <header className="dhero" id="top">
      <Rings />
      <div className="dwrap">
        <div className="dcrest"><img src="assets/antler.png" alt="Carter Groff" /></div>
        <span className="p-eyebrow">Static design, delivered fast</span>
        <h1 className="ddisplay">Design work,<br /><em>drafted fast.</em></h1>
        <p className="ddeck">Social graphics, print, and documents — done right, done soon, with real options instead of one guess.</p>
        <div className="dacts"><a className="p-btn" href="#brief">Start a brief →</a><a className="p-btn ghost" href="#how">See how it works</a></div>
      </div>
    </header>
  );
}

function Proofline() {
  return (
    <div className="dproofline">
      <span>Replies within a day</span><span>Two revision rounds included</span><span>Print-ready files</span><span>No call required</span>
    </div>
  );
}

function Make({ onAddNeed }) {
  return (
    <section id="make" className="dsection">
      <div className="dwrap">
        <div className="dshead up">
          <div className="didxrow"><span className="didx">01 / 05</span><span className="dln" /></div>
          <span className="p-eyebrow">What I make</span>
          <h2 className="ddisplay">Six things I turn around quickly.</h2>
          <p className="dp">Close to one of these? It's in scope — describe it in the brief and I'll tell you straight.</p>
        </div>
        <div className="dcards">
          {SERVICE_CARDS.map(([n, title, desc, need]) => (
            <div className="dcard up" key={n}>
              <span className="dcardn">{n}</span><h3>{title}</h3><p>{desc}</p>
              <a href="#brief" onClick={(e) => { e.preventDefault(); onAddNeed(need); }}>Add to brief →</a>
            </div>
          ))}
        </div>
        <div className="dworkhead"><h3>Recent work</h3><span className="p-eyebrow" style={{ color: 'var(--ink-dim)' }}>Four slots · drop images here</span></div>
        <div className="dsamples">
          <div className="dslot"><span className="p-eyebrow">Sample 01</span><em>Social series — 1080 × 1080</em></div>
          <div className="dslot"><span className="p-eyebrow">Sample 02</span><em>Business card, both sides</em></div>
          <div className="dslot"><span className="p-eyebrow">Sample 03</span><em>Multi-page document spread</em></div>
          <div className="dslot"><span className="p-eyebrow">Sample 04</span><em>Flyer or one-pager</em></div>
        </div>
      </div>
    </section>
  );
}

function How() {
  const steps = [
    ['1', 'Send a brief', "A short form covering what a designer needs — copy, sizes, where it's going — so nothing stalls later."],
    ['2', 'Get options', 'A few genuinely different directions, usually within days — not one layout in three colorways.'],
    ['3', 'Pick and refine', 'Choose a direction and we tighten it. Two revision rounds are included, stated in the quote up front.'],
    ['4', 'Get your files', "Print-ready, correctly sized, bleed where bleed belongs — files you can hand straight to a printer."],
  ];
  return (
    <section id="how" className="dsection dwood">
      <div className="dwrap">
        <div className="dshead up">
          <div className="didxrow"><span className="didx">02 / 05</span><span className="dln" /></div>
          <span className="p-eyebrow">How it works</span>
          <h2 className="ddisplay">Four steps. You always know where the job stands.</h2>
          <p className="dp">No meeting required — the brief covers what a discovery call usually would, so the first draft comes back in days, not weeks.</p>
        </div>
        <div className="dsteps">
          {steps.map(([n, title, body]) => (
            <div className="dstp up" key={n}><span className="dcardn">{n}</span><h3>{title}</h3><p>{body}</p></div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Why() {
  const items = [
    ['01', 'One person, both jobs', 'A strategist who also ships the design, so the work fits the message it carries.'],
    ['02', 'Real alternatives', 'You see multiple real directions, not one attempt you have to accept or reject.'],
    ['03', 'Fast, and not anonymous', 'Quick turnaround without the guesswork of hiring an anonymous freelancer.'],
  ];
  return (
    <section id="why" className="dsection">
      <div className="dwrap">
        <div className="dshead up">
          <div className="didxrow"><span className="didx">03 / 05</span><span className="dln" /></div>
          <span className="p-eyebrow">Why work with me</span>
          <h2 className="ddisplay">A strategist who also does the design.</h2>
        </div>
        <div className="dwhy">
          {items.map(([n, title, body]) => (
            <div className="up" key={n}><b>{title}</b><p>{body}</p></div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Beyond() {
  return (
    <section id="beyond" className="dsection">
      <div className="dwrap up">
        <div className="didxrow"><span className="didx">04 / 05</span><span className="dln" /></div>
        <span className="p-eyebrow">Beyond static design</span>
        <h2 className="ddisplay">Static is the quickest place to start. It isn't the limit.</h2>
        <p className="dbig">I also work in video, motion graphics, and marketing strategy. If it's not on this page, describe it in the brief — the answer is usually yes.</p>
        <div className="dalso">
          <span>Long-form video</span><span>Short-form video</span><span>Motion graphics</span><span>Marketing strategy</span><span>Campaign systems</span>
        </div>
        <p className="dquiet">Larger and custom-scope projects are quoted individually.</p>
        <p style={{ marginTop: 34 }}><a className="p-btn" href="#brief">Start a brief ↓</a></p>
      </div>
    </section>
  );
}

// ── The brief: a controlled three-movement form, posted to a real endpoint ──
const Brief = React.forwardRef(function Brief(props, ref) {
  const [step, setStep] = React.useState(0);
  const [sent, setSent] = React.useState(false);
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState('');
  const [f, setF] = React.useState({
    name: '', email: '', business: '', need: [], about: '', where: '', when: '', flexible: false,
    assets: '', copy: '', refs: '', notes: '', budget: '',
  });

  const set = (k) => (e) => setF((s) => ({ ...s, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));
  const toggleNeed = (v) => setF((s) => ({ ...s, need: s.need.includes(v) ? s.need.filter((x) => x !== v) : [...s.need, v] }));

  React.useImperativeHandle(ref, () => ({ addNeed: (v) => { setStep(0); toggleNeed(v); } }));

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

  const submit = () => {
    setBusy(true); setError('');
    fetch('/api/design-brief', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(f),
    }).then((r) => r.json()).then((data) => {
      if (data.error) { setError(data.error); return; }
      setSent(true);
    }).catch(() => setError('Something went wrong — try again.')).finally(() => setBusy(false));
  };

  if (sent) {
    return (
      <section id="brief" className="dsection ddeep">
        <Rings />
        <div className="dwrap">
          <div className="dsent">
            <h3 className="ddisplay">Brief received.</h3>
            <p className="dp">I'll read it properly and come back with a price and a delivery date, usually within a day. If anything's missing I'll just ask.</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="brief" className="dsection ddeep">
      <Rings />
      <div className="dwrap">
        <div className="dbriefhead up">
          <div className="didxrow" style={{ justifyContent: 'center' }}><span className="dln" /><span className="didx">05 / 05</span><span className="dln" /></div>
          <span className="p-eyebrow">The brief</span>
          <h2 className="ddisplay">Write me a <em>brief</em>.</h2>
          <p className="ddeck">Three short movements. The more you fill in, the closer the first draft lands — and the sooner you get a price back.</p>
          <div className="dbriefmeta"><span>About three minutes</span><span>No account</span><span>No call</span></div>
        </div>

        <div className="dprog">
          <div className="dprogrow"><span>Movement {STEPS[step][0]} of III · {STEPS[step][1]}</span><span>{step === 2 ? 'Last movement' : step === 1 ? 'One movement left' : 'Two movements left'}</span></div>
          <div className="dprogbars">{[0, 1, 2].map((i) => <i key={i} className={i <= step ? 'done' : ''} />)}</div>
        </div>

        <form className="dform" onSubmit={(e) => { e.preventDefault(); next(); }}>
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
                  <span className="dqlb">What are we making?</span>
                  <div className="dchips">
                    {CHIPS.map((c) => (
                      <label key={c} className={'dchip' + (f.need.includes(c) ? ' on' : '')}>
                        <input type="checkbox" checked={f.need.includes(c)} onChange={() => toggleNeed(c)} />{c}
                      </label>
                    ))}
                  </div>
                </div>
                <label className="dfl"><span className="dlb">Tell me about it <i>required</i></span>
                  <span className="dhint">Who it's for, what it has to do, anything that shapes it.</span>
                  <textarea rows={3} value={f.about} onChange={set('about')} placeholder="A five-post series announcing our spring menu…" /></label>
              </div>
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
            </div>
          )}
          {step === 2 && (
            <div className="dmv">
              <div className="dfields">
                <div>
                  <span className="dqlb">Do you have brand assets?</span>
                  <div className="dchoices">
                    {['Yes — logo, colors, fonts', 'Some of them', 'No — help me figure it out'].map((label, i) => {
                      const value = ['Yes', 'Some', 'No'][i];
                      return (
                        <label key={value} className={'dchoice' + (f.assets === value ? ' on' : '')}>
                          <input type="radio" name="assets" checked={f.assets === value} onChange={() => setF((s) => ({ ...s, assets: value }))} />{label}
                        </label>
                      );
                    })}
                  </div>
                </div>
                <label className="dfl"><span className="dlb">Exact copy that must appear</span>
                  <span className="dhint">Paste it verbatim. Wording that changes later is the most common cause of extra rounds.</span>
                  <textarea rows={3} value={f.copy} onChange={set('copy')} placeholder="Spring menu. Available from March 4th…" /></label>
              </div>
              <div className="dfields two">
                <label className="dfl"><span className="dlb">A look you like</span><span className="dhint">One to three examples.</span>
                  <textarea rows={2} value={f.refs} onChange={set('refs')} placeholder="Links, or a description" /></label>
                <label className="dfl"><span className="dlb">Anything else</span><span className="dhint">Constraints, past attempts, internal politics.</span>
                  <textarea rows={2} value={f.notes} onChange={set('notes')} placeholder="Whatever I should know" /></label>
              </div>
              <div className="dfields">
                <label className="dfl"><span className="dlb">Budget range, if you have one</span><span className="dhint">It helps me scope the job rather than guess at it.</span>
                  <input value={f.budget} onChange={set('budget')} placeholder="A range is fine" /></label>
              </div>
            </div>
          )}

          {error && <p className="derr">{error}</p>}

          <div className="dwalk">
            {step > 0 && <button className="dback" type="button" onClick={back}>← Back</button>}
            <p className="dfine">
              {step === 2 ? "I'll reply with a price and a timeline, usually within a day. No call required."
                : step === 1 ? 'One more movement after this — the optional details.'
                : 'Three short movements. Nothing here is asked twice.'}
            </p>
            <button className="p-btn" type="submit" disabled={busy || !stepValid(step)}>
              {busy ? 'Sending…' : step === 2 ? 'Send brief →' : 'Continue →'}
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
        <div className="dcrest"><img src="assets/antler.png" alt="Carter Groff" /></div>
        <div>
          <p className="ddisplay" style={{ fontSize: 22 }}>Carter Groff <i>Design</i></p>
          <p style={{ color: 'var(--ink-mute)', fontSize: 15.5, marginTop: 12, fontStyle: 'italic' }}>Storytelling through strategy, screen, and design.</p>
        </div>
        <div className="dfootlinks">
          <a href="/">← Portfolio</a>
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
    return () => io.disconnect();
  }, []);
}

function CargroffDesign() {
  const briefRef = React.useRef(null);
  useReveal();
  const onAddNeed = (v) => {
    if (briefRef.current) briefRef.current.addNeed(v);
    document.getElementById('brief').scrollIntoView({ behavior: 'smooth' });
  };
  return (
    <div className="cgd p-grain">
      <Nav />
      <Hero />
      <Proofline />
      <Make onAddNeed={onAddNeed} />
      <How />
      <Why />
      <Beyond />
      <Brief ref={briefRef} />
      <Footer />
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<CargroffDesign />);
