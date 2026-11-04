// design.jsx — The Scaffold, by Carter Groff (cargroff.com/design). The
// public studio page. Tools first (small working systems for businesses,
// proven on the operations platform Carter builds for a log-home company),
// design second. AI drafts, Carter finishes. See DECISIONS.md.
//
// This file is the source. The page loads the precompiled design.js
// (no in-browser Babel); after editing, run:  npm run build:design
// The brief posts to api/design-brief.js.

// ── Offer config ─────────────────────────────────────────────────────
// Prices are NOT set yet (an open decision). The design figures below are
// placeholders; set SHOW_PRICES to true once the real numbers are in.
const SHOW_PRICES = false;

// Tools Carter has actually built, for a log-home restoration company's
// operations platform. Described generically on purpose: no internal names,
// screenshots or data on the public page without Carter's OK.
const BUILT = [
  { title: 'Scheduling that suggests itself', desc: 'Looks at open jobs, crews and timing, and recommends the next schedule. A person still decides.', flow: ['Open jobs', 'Rules', 'Suggested schedule', 'You approve'] },
  { title: 'Calls and texts from the job', desc: 'One button to call or text the customer. Every call is logged, recorded, transcribed and summarised on their record.', flow: ['Tap call', 'Recorded', 'AI summary', 'On the record'] },
  { title: 'A field app for crews', desc: 'One screen per job on a phone: customer, scope, videos and a checklist that changes with the phase of the work.', flow: ['Job', 'Phone', 'Checklist', 'Done'] },
  { title: 'Labels that print themselves', desc: 'When a job is won, the office and field labels are made and queued for one batch print.', flow: ['Job won', 'Labels made', 'Print queue'] },
  { title: 'Customer choices, signed', desc: 'Customers pick their options on a private link. It turns into a PDF the office and crew can work from.', flow: ['Emailed link', 'Customer picks', 'PDF', 'Office notified'] },
  { title: 'Proposals and contracts', desc: 'Scope, price and e-signature in one place, plus multi-year maintenance contracts with a signature pad and PDF.', flow: ['Scope', 'Proposal', 'Signed', 'PDF'] },
  { title: 'Email you can track', desc: 'Which emails went out, which are planned and which got opened, with templates grouped by stage of the job.', flow: ['Stage', 'Template', 'Sent', 'Opened'] },
  { title: 'A map of the business', desc: 'A live page showing how jobs move from first call to finished, built from the system itself so it never goes stale.', flow: ['Database', 'Registry', 'Live map'] },
];

// What a client can ask for. Keep in sync with api/design-brief.js
// (AUTOMATION_SERVICES) and the brief chips below.
const TOOL_KINDS = [
  ['Inquiries and leads', 'Every inquiry in one place, answered right away.'],
  ['Quotes', 'From job details to a priced quote in minutes.'],
  ['Invoices and payments', 'Send, take a card, nudge when late.'],
  ['Job board or dashboard', 'Leads, jobs and money on one screen.'],
  ['Review requests', 'Ask happy customers at the right moment.'],
  ['Weekly numbers', 'One Monday email with what matters.'],
  ['Content on a schedule', 'On-brand posts drafted, waiting for your OK.'],
  ['AI assistant', 'Knows your prices, policies and tone.'],
];

const DESIGN_SERVICES = [
  { n: '01', title: 'Social graphics', desc: 'One post or a series with one look.', need: 'Social graphics', from: '$75', turn: '2 business days' },
  { n: '02', title: 'Cards and print', desc: 'Print-ready, correct bleed.', need: 'Business card or print', from: '$150', turn: '3 business days' },
  { n: '03', title: 'Flyers and one-pagers', desc: 'For print or screen.', need: 'Flyer or one-pager', from: '$175', turn: '3 business days' },
  { n: '04', title: 'Documents and reports', desc: 'Proposals, menus, multi-page layouts.', need: 'Document or report', from: '$400', turn: '5–7 business days' },
  { n: '05', title: 'Presentations', desc: 'Designed slides, not a template.', need: 'Presentation or deck', from: '$400', turn: '5–7 business days' },
  { n: '06', title: 'Monthly content', desc: 'A steady run of posts, one look.', need: 'Social graphics', from: '$600/mo', turn: 'Rolling' },
];
const DESIGN_CHIPS = ['Social graphics', 'Business card or print', 'Flyer or one-pager', 'Document or report', 'Presentation or deck', 'Brand basics', 'Video', 'Something else'];
const AUTOMATION_CHIPS = [...TOOL_KINDS.map(([k]) => k), 'Something else'];
const BUDGETS = ['Under $150', '$150–$500', '$500–$1,500', '$1,500–$5,000', '$5,000+', 'Not sure yet'];

// Real work only. Each item: { title, kind, src, alt }. Empty = hidden.
const WORK = [];
// Short client quotes. Each: { quote, name, business }. Empty = hidden.
const TESTIMONIALS = [];

const FAQ = [
  ['Do you use AI?', 'Yes. AI does the drafting and the first pass of code. I make the decisions, check every line and finish every file.'],
  ['Will I need new software?', 'Not usually. Where I can, I build on what you already use.'],
  ['What does a tool cost?', 'It depends on the job, so tools are quoted after a short brief. You see the price before anything starts.'],
  ['What if it breaks?', 'I fix it. Ongoing care is available as a monthly plan if you want it.'],
  ['How fast is design work?', 'Most single pieces: three directions within two business days of a complete brief.'],
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

function Flow({ steps }) {
  return (
    <div className="dflow" aria-label={steps.join(', then ')}>
      {steps.map((s, i) => <React.Fragment key={s}>{i > 0 && <i aria-hidden="true">→</i>}<span>{s}</span></React.Fragment>)}
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
          <a href="#tools">Tools</a><a href="#design">Design</a><a href="#how">How it works</a><a href="#faq">FAQ</a>
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
        <div className="dcrest"><img src="assets/antler.png" alt="The Scaffold, by Carter Groff" /></div>
        <span className="p-eyebrow">Tools and design for small businesses</span>
        <h1 className="ddisplay">I build the tools<br /><em>that run the busywork.</em></h1>
        <p className="ddeck">Scheduling, calls, quotes, follow-ups, dashboards. And the design your customers see.</p>
        <div className="dacts"><a className="p-btn" href="#brief">Start a brief →</a><a className="p-btn ghost" href="#tools">See what I've built</a></div>
        <div className="dpipe up" aria-label="Example: a job is won, labels print, the crew gets a checklist, the customer gets a follow-up">
          {['Job won', 'Labels printed', 'Crew checklist', 'Follow-up sent'].map((s, i) => (
            <React.Fragment key={s}>{i > 0 && <span className="dpipe-arrow" aria-hidden="true">→</span>}<span className="dpipe-step"><b>{String(i + 1).padStart(2, '0')}</b>{s}</span></React.Fragment>
          ))}
        </div>
        <p className="dpipe-cap">A real chain from tools I've built. People step in where they should.</p>
      </div>
    </header>
  );
}

function Proofline() {
  return (
    <div className="dproofline">
      <span>Built for a working company first</span><span>A person approves what customers see</span><span>Replies within a day</span><span>No call needed</span>
    </div>
  );
}

function Tools({ onAddNeed }) {
  return (
    <section id="tools" className="dsection dauto">
      <div className="dwrap">
        <div className="dshead up">
          <div className="didxrow"><span className="didx">01 / 05</span><span className="dln" /></div>
          <span className="p-eyebrow">Tools I've built</span>
          <h2 className="ddisplay">Running every day at a log-home restoration company.</h2>
          <p className="dp">I build the operations platform the office and crews work from. Here's some of what's in it.</p>
        </div>
        <div className="dcards four dbuilt">
          {BUILT.map((t) => (
            <div className="dcard up" key={t.title}>
              <h3>{t.title}</h3><p>{t.desc}</p>
              <Flow steps={t.flow} />
            </div>
          ))}
        </div>

        <div className="dkinds up">
          <div>
            <h3 className="ddisplay">What I can build for you</h3>
            <p className="dp">Small, specific tools for businesses without a developer. Proven by hand first, then automated.</p>
            <p style={{ marginTop: 22 }}><a className="p-btn" href="#brief" onClick={(e) => { e.preventDefault(); onAddNeed('automation'); }}>Start a tools brief →</a></p>
          </div>
          <ul>
            {TOOL_KINDS.map(([k, d]) => (
              <li key={k}>
                <a href="#brief" onClick={(e) => { e.preventDefault(); onAddNeed('automation', k); }}><b>{k}</b><span>{d}</span></a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

function How() {
  const steps = [
    ['1', 'Tell me the busywork', 'A short brief: what eats your time, and what you use today.'],
    ['2', 'I map it', 'One page: what happens, in what order, who approves. You get a fixed quote.'],
    ['3', 'I build it', 'Small first, tested on real work. AI speeds up the build; I check all of it.'],
    ['4', 'You run it', 'Handed over and explained. I stay on call if you want a care plan.'],
  ];
  return (
    <section id="how" className="dsection dwood">
      <div className="dwrap">
        <div className="dshead up">
          <div className="didxrow"><span className="didx">02 / 05</span><span className="dln" /></div>
          <span className="p-eyebrow">How a tool gets built</span>
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

function Price({ s }) {
  if (!SHOW_PRICES) return null;
  return <span className="dprice">From {s.from} · {s.turn}</span>;
}

// One brief beside the three different drafts it produced.
function Drafts() {
  return (
    <figure className="dhv up" aria-label="Illustration: one brief, three different first drafts">
      <div className="dhv-brief">
        <span className="dhv-k">The brief</span>
        <p>“Five posts for our spring menu. Warm, a bit playful.”</p>
      </div>
      <span className="dhv-arrow" aria-hidden="true">→</span>
      <div className="dhv-drafts">
        <div className="dhv-d d1"><span>Spring<br />menu.</span><i>From March 4th</i></div>
        <div className="dhv-d d2"><span>SPRING MENU</span><i>from march 4th</i></div>
        <div className="dhv-d d3"><span>spring<br /><b>menu</b></span><i>Mar 4 →</i></div>
      </div>
      <figcaption>Three real directions. You pick one; I finish it.</figcaption>
    </figure>
  );
}

function Design({ onAddNeed }) {
  return (
    <section id="design" className="dsection">
      <div className="dwrap">
        <div className="dshead up">
          <div className="didxrow"><span className="didx">03 / 05</span><span className="dln" /></div>
          <span className="p-eyebrow">Design</span>
          <h2 className="ddisplay">And the design that goes with it.</h2>
          <p className="dp">AI drafts three directions. I finish the one you pick. Two revision rounds included.</p>
        </div>
        <Drafts />
        <div className="dcards">
          {DESIGN_SERVICES.map((s) => (
            <div className="dcard up" key={s.n}>
              <span className="dcardn">{s.n}</span><h3>{s.title}</h3><p>{s.desc}</p>
              <Price s={s} />
              <a href="#brief" onClick={(e) => { e.preventDefault(); onAddNeed('design', s.need); }}>Add to brief →</a>
            </div>
          ))}
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

function Why() {
  return (
    <section id="why" className="dsection">
      <div className="dwrap">
        <div className="dwhyhead up">
          <img className="dportrait" src="assets/portrait.jpg" alt="Carter Groff" loading="lazy" />
          <div>
            <div className="didxrow"><span className="didx">04 / 05</span><span className="dln" /></div>
            <span className="p-eyebrow">Who you're working with</span>
            <h2 className="ddisplay">I’m Carter.</h2>
            <p className="dp">I’m the Marketing and Automation Lead at a log-home restoration company in Harrisonburg, Virginia. I run their marketing and build the systems they run on. The Scaffold is me doing the same for other businesses.</p>
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
          <div className="didxrow"><span className="didx">05 / 05</span><span className="dln" /></div>
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
    lane: 'automation', name: '', email: '', business: '', need: [], about: '', where: '', when: '', flexible: false,
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
          {[['automation', 'A tool'], ['design', 'Design']].map(([v, label]) => (
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
      <Hero />
      <Proofline />
      <Tools onAddNeed={onAddNeed} />
      <How />
      <Design onAddNeed={onAddNeed} />
      <Why />
      <Faq />
      <Brief ref={briefRef} />
      <Footer />
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<TheScaffold />);
