// design.jsx — The Scaffold, by Carter Groff (cargroff.com/design). The
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
  { title: 'Cards and print', desc: 'Print-ready, correct bleed.', need: 'Business card or print', from: '$150', turn: '3 business days' },
  { title: 'Flyers and one-pagers', desc: 'For print or screen.', need: 'Flyer or one-pager', from: '$175', turn: '3 business days' },
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
const DESIGN_CHIPS = ['Social graphics', 'Business card or print', 'Flyer or one-pager', 'Document or report', 'Presentation or deck', 'Brand basics', 'Video', 'Something else'];
const AUTOMATION_CHIPS = [...TOOL_SERVICES.map((t) => t.need), 'Something else'];
const BUDGETS = ['Under $150', '$150–$500', '$500–$1,500', '$1,500–$5,000', '$5,000+', 'Not sure yet'];

// Real work only. Each item: { title, kind, src, alt }. Empty = hidden.
const WORK = [];
// Short client quotes. Each: { quote, name, business }. Empty = hidden.
const TESTIMONIALS = [];

const FAQ = [
  ['Do you use AI?', 'Yes. AI does the drafting and the first pass of the build. I make the decisions, check everything and finish it.'],
  ['What does it cost?', 'Design is priced per piece. Tools are quoted after a short brief. Either way, you see the price before anything starts.'],
  ['Will I need new software?', 'Not usually. Where I can, I build on what you already use.'],
  ['How fast is it?', 'Most design pieces: three directions within two business days of a complete brief. Tools: a plan within a few days, then a first working version.'],
  ['What if something breaks?', 'I fix it. Ongoing care is available as a monthly plan.'],
  ['Who owns the work?', 'You do, once it’s paid.'],
  ['Do we need a call?', 'No. The brief covers it. If a call would help, I’ll say so.'],
];

const STEPS = [
  ['I', "Who's asking"],
  ['II', 'What you need'],
  ['III', 'Details that save time'],
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
          <span><b>The <i>Scaffold</i></b><span className="dsub">by Carter Groff</span></span>
        </a>
        <div className="dnavlinks">
          <a href="#make">What I make</a><a href="#how">How it works</a><a href="#faq">FAQ</a>
          <a href="/">Portfolio ↗</a>
        </div>
        <a className="p-btn" href="#brief">Start a brief</a>
      </div>
    </nav>
  );
}

// Two equal halves: what a design job looks like, what a tool job looks
// like. Both illustrative and generic.
function HeroVisual() {
  return (
    <div className="dduo dhero-duo up">
      <figure className="dhalf">
        <span className="dhalf-k">Design</span>
        <div className="dhv-drafts">
          <div className="dhv-d d1"><span>Spring<br />menu.</span><i>From March 4th</i></div>
          <div className="dhv-d d2"><span>SPRING MENU</span><i>from march 4th</i></div>
          <div className="dhv-d d3"><span>spring<br /><b>menu</b></span><i>Mar 4 →</i></div>
        </div>
        <figcaption>One brief, three real directions. You pick one.</figcaption>
      </figure>
      <figure className="dhalf">
        <span className="dhalf-k">Tools</span>
        <div className="dpipe" aria-label="Example: an inquiry comes in, gets an auto-reply, becomes a quote, then a follow-up">
          {['Inquiry in', 'Auto-reply', 'Quote', 'Follow-up'].map((s, i) => (
            <span className="dpipe-step" key={s}><b>{String(i + 1).padStart(2, '0')}</b>{s}</span>
          ))}
        </div>
        <figcaption>One brief, a working tool. A person approves what customers see.</figcaption>
      </figure>
    </div>
  );
}

function Hero({ onAddNeed }) {
  return (
    <header className="dhero" id="top">
      <Rings />
      <div className="dwrap">
        <div className="dcrest"><img src="assets/antler.png" alt="The Scaffold, by Carter Groff" /></div>
        <span className="p-eyebrow">Design and tools for small businesses</span>
        <h1 className="ddisplay">Design that looks right.<br /><em>Tools that work right.</em></h1>
        <p className="ddeck">Graphics, print and documents. And the small tools that take busywork off your plate.</p>
        <div className="dacts">
          <a className="p-btn" href="#brief" onClick={(e) => { e.preventDefault(); onAddNeed('design'); }}>Start a design brief →</a>
          <a className="p-btn" href="#brief" onClick={(e) => { e.preventDefault(); onAddNeed('automation'); }}>Start a tools brief →</a>
        </div>
        <HeroVisual />
      </div>
    </header>
  );
}

function Proofline() {
  return (
    <div className="dproofline">
      <span>AI drafts, I finish</span><span>A person approves what customers see</span><span>Replies within a day</span><span>No call needed</span>
    </div>
  );
}

function Price({ s }) {
  if (!SHOW_PRICES || !s.from) return null;
  return <span className="dprice">From {s.from} · {s.turn}</span>;
}

function Half({ lane, eyebrow, title, blurb, items, cta, onAddNeed }) {
  return (
    <section className={'dhalf-sec up' + (lane === 'automation' ? ' dauto' : '')}>
      <span className="p-eyebrow">{eyebrow}</span>
      <h3 className="ddisplay">{title}</h3>
      <p className="dp">{blurb}</p>
      <ul className="dlist">
        {items.map((s) => (
          <li key={s.title}>
            <a href="#brief" onClick={(e) => { e.preventDefault(); onAddNeed(lane, s.need); }}>
              <b>{s.title}</b><span>{s.desc}</span><Price s={s} />
            </a>
          </li>
        ))}
      </ul>
      <p style={{ marginTop: 24 }}>
        <a className={'p-btn' + (lane === 'design' ? ' ghost' : ' ghost')} href="#brief" onClick={(e) => { e.preventDefault(); onAddNeed(lane); }}>{cta}</a>
      </p>
    </section>
  );
}

function Make({ onAddNeed }) {
  return (
    <section id="make" className="dsection">
      <div className="dwrap">
        <div className="dshead up">
          <div className="didxrow"><span className="didx">01 / 04</span><span className="dln" /></div>
          <span className="p-eyebrow">What I make</span>
          <h2 className="ddisplay">Two kinds of work, one person.</h2>
        </div>
        <div className="dduo dmake">
          <Half lane="design" eyebrow="Design" title="What your customers see"
            blurb="AI drafts three directions. I finish the one you pick. Two revision rounds included."
            items={DESIGN_SERVICES} cta="Start a design brief →" onAddNeed={onAddNeed} />
          <Half lane="automation" eyebrow="Tools" title="What runs behind the scenes"
            blurb="Small, specific tools for businesses without a developer. Proven by hand first, then automated."
            items={TOOL_SERVICES} cta="Start a tools brief →" onAddNeed={onAddNeed} />
        </div>
        {WORK.length > 0 && (
          <React.Fragment>
            <div className="dworkhead"><h3>Recent work</h3></div>
            <div className="dsamples">
              {WORK.map((w) => (
                <figure className="dslot" key={w.title}>
                  <img src={w.src} alt={w.alt} loading="lazy" />
                  <figcaption><b>{w.title}</b> · {w.kind}</figcaption>
                </figure>
              ))}
            </div>
          </React.Fragment>
        )}
      </div>
    </section>
  );
}

function How() {
  const steps = [
    ['1', 'Send a brief', 'A short form: what you need, and what it has to do.'],
    ['2', 'Get options', 'Design: three directions. Tools: a one-page plan and a fixed quote.'],
    ['3', 'I finish it', 'Design: refined by hand. Tools: built small, tested on real work.'],
    ['4', 'You get it', 'Design: print-ready files. Tools: a working build, handed over and explained.'],
  ];
  return (
    <section id="how" className="dsection dwood">
      <div className="dwrap">
        <div className="dshead up">
          <div className="didxrow"><span className="didx">02 / 04</span><span className="dln" /></div>
          <span className="p-eyebrow">How it works</span>
          <h2 className="ddisplay">Four steps. No surprises.</h2>
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
  return (
    <section id="why" className="dsection">
      <div className="dwrap">
        <div className="dwhyhead up">
          <img className="dportrait" src="assets/portrait.jpg" alt="Carter Groff" loading="lazy" />
          <div>
            <div className="didxrow"><span className="didx">03 / 04</span><span className="dln" /></div>
            <span className="p-eyebrow">Who you're working with</span>
            <h2 className="ddisplay">I’m Carter.</h2>
            <p className="dp">A marketer, designer and builder in Harrisonburg, Virginia. By day I lead marketing and automation at a local company, so I know what small teams actually need.</p>
            <p className="dp">My rules: prove it by hand before automating it. Automate the bottleneck, not everything. A person approves anything that reaches a customer.</p>
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
    <section id="faq" className="dsection">
      <div className="dwrap">
        <div className="dshead up">
          <div className="didxrow"><span className="didx">04 / 04</span><span className="dln" /></div>
          <span className="p-eyebrow">Questions</span>
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
        <Rings />
        <div className="dwrap">
          <div className="dsent">
            <h3 className="ddisplay">Brief received.</h3>
            {sent.reference && <p className="dref">Reference {sent.reference}</p>}
            <p className="dp">
              {sent.confirmation ? 'A copy is on its way to your inbox. ' : ''}
              I'll read it properly and come back with a price and a delivery date, usually within one business day. If anything's missing I'll ask for exactly that.
            </p>
          </div>
        </div>
      </section>
    );
  }

  const chips = auto ? AUTOMATION_CHIPS : DESIGN_CHIPS;

  return (
    <section id="brief" className="dsection ddeep">
      <Rings />
      <div className="dwrap">
        <div className="dbriefhead up">
          <div className="didxrow" style={{ justifyContent: 'center' }}><span className="dln" /><span className="didx">Start here</span><span className="dln" /></div>
          <span className="p-eyebrow">The brief</span>
          <h2 className="ddisplay">Write me a <em>brief</em>.</h2>
          <p className="ddeck">Three short steps. The more you tell me, the sooner you get a price.</p>
          <div className="dbriefmeta"><span>About three minutes</span><span>No account</span><span>No call</span></div>
        </div>

        <div className="dlanes" role="radiogroup" aria-label="What kind of project">
          {[['design', 'Design'], ['automation', 'Tools']].map(([v, label]) => (
            <button key={v} type="button" role="radio" aria-checked={f.lane === v}
              className={'dlane' + (f.lane === v ? ' on' : '') + (v === 'automation' ? ' auto' : '')} onClick={() => setLane(v)}>{label}</button>
          ))}
        </div>

        <div className="dprog">
          <div className="dprogrow"><span>Step {step + 1} of 3 · {STEPS[step][1]}</span><span>{step === 2 ? 'Last step' : step === 1 ? 'One left' : 'Two left'}</span></div>
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
                  <span className="dhint">{auto ? 'What you want to stop doing by hand.' : "Who it's for and what it has to do."}</span>
                  <textarea rows={3} value={f.about} onChange={set('about')} placeholder={auto ? 'Every website inquiry gets copied into a spreadsheet by hand…' : 'A five-post series announcing our spring menu…'} /></label>
              </div>
              {auto ? (
                <div className="dfields two">
                  <label className="dfl"><span className="dlb">What's slow today</span><span className="dhint">The step that eats the most time.</span>
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
            {step > 0 && <button className="dback" type="button" onClick={back}>← Back</button>}
            <p className="dfine">
              {step === 2 ? "Price and timeline back within a day."
                : step === 1 ? 'One more step. All optional.'
                : 'Three short steps.'}
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
        <div className="dcrest"><img src="assets/antler.png" alt="" /></div>
        <div>
          <p className="ddisplay" style={{ fontSize: 22 }}>The <i>Scaffold</i></p>
          <p className="dfootsub">Tools and design by Carter Groff. Harrisonburg, Virginia.</p>
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
      <Proofline />
      <Make onAddNeed={onAddNeed} />
      <How />
      <Why />
      <Faq />
      <Brief ref={briefRef} />
      <Footer />
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<TheScaffold />);
