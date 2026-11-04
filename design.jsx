// design.jsx — The Scaffold, by Carter Groff (cargroff.com/design). The
// public studio page: two lanes (Design, Automation) under one promise,
// AI-assisted and human-finished. Reworked 2026-11-04 from the assessment
// ("Carter Groff Design — Full Assessment"); see DECISIONS.md.
//
// This file is the source. The page loads the precompiled design.js
// (no in-browser Babel); after editing, run:  npm run build:design
// The brief posts to api/design-brief.js.

// ── Offer config ─────────────────────────────────────────────────────
// Prices are NOT set yet (an open decision). The figures below are the
// assessment's placeholders, kept here so publishing them is one switch:
// set SHOW_PRICES to true once the real numbers are in.
const SHOW_PRICES = false;
const DESIGN_SERVICES = [
  { n: '01', title: 'Social graphics', desc: 'A single post or a full series that shares one look.', need: 'Social graphics', from: '$75', turn: '2 business days' },
  { n: '02', title: 'Business cards and print', desc: 'Double-sided, print-ready, correct bleed.', need: 'Business card or print', from: '$150', turn: '3 business days' },
  { n: '03', title: 'Flyers and one-pagers', desc: 'For print or digital.', need: 'Flyer or one-pager', from: '$175', turn: '3 business days' },
  { n: '04', title: 'Documents and reports', desc: 'Proposals, menus, lookbooks, multi-page layouts.', need: 'Document or report', from: '$400', turn: '5–7 business days' },
  { n: '05', title: 'Presentations and decks', desc: 'Designed slides, not a template.', need: 'Presentation or deck', from: '$400', turn: '5–7 business days' },
  { n: '06', title: 'Monthly content plan', desc: 'A steady run of on-brand posts every month, one look throughout.', need: 'Social graphics', from: '$600/mo', turn: 'Rolling' },
];
const AUTOMATION_SERVICES = [
  { n: 'A', title: 'Stop losing inquiries', desc: 'A form that lands in a simple CRM, answers the customer right away, and pings you.', need: 'Inquiries and leads', proof: 'This page runs on one: every brief is saved, logged and emailed to me.' },
  { n: 'B', title: 'Content on a schedule', desc: 'Brand-locked social posts or emails drafted on a schedule, ready for you to approve.', need: 'Content on a schedule', proof: 'Built and used for the local brands I market.' },
  { n: 'C', title: 'See the business at a glance', desc: 'A dashboard or tracker for leads, jobs, invoices and to-dos, instead of five spreadsheets.', need: 'Job board or dashboard', proof: 'I run my own studio on one I built.' },
  { n: 'D', title: 'An assistant that knows your business', desc: 'An AI helper that reads your own docs and drafts in your tone, with you approving what goes out.', need: 'AI assistant', proof: 'Every brief here gets an AI read before I reply.' },
];
const DESIGN_CHIPS = ['Social graphics', 'Business card or print', 'Flyer or one-pager', 'Document or report', 'Presentation or deck', 'Brand basics', 'Video', 'Something else'];
const AUTOMATION_CHIPS = ['Inquiries and leads', 'Quotes', 'Invoices and payments', 'Job board or dashboard', 'Review requests', 'Weekly numbers', 'Content on a schedule', 'AI assistant', 'Something else'];
const BUDGETS = ['Under $150', '$150–$500', '$500–$1,500', '$1,500–$5,000', '$5,000+', 'Not sure yet'];

// Real work only. Each item: { title, kind, src, alt }. Empty = the section
// is hidden; never ship placeholder slots to the public page.
const WORK = [];
// Short client quotes. Each: { quote, name, business }. Empty = hidden.
const TESTIMONIALS = [];

const FAQ = [
  ['Do you use AI?', 'Yes, openly. AI drafts the first set of directions, which is how you get three real options in a couple of days instead of one. I choose what goes forward, fix what the AI gets wrong, and finish every file by hand. Nothing reaches you that I haven’t looked at.'],
  ['How fast is it?', 'Most single pieces come back as three directions within two business days of a complete brief. Bigger jobs get a date in the quote, before you commit to anything.'],
  ['How many revisions do I get?', 'Two rounds are included on design work. Most extra rounds come from copy that changes late, which is why the brief asks for exact wording up front.'],
  ['Who owns the files?', 'You do. Once the job is paid, the final files are yours to use, print and edit.'],
  ['How do I pay?', 'By card, through a secure Stripe link sent with the invoice. You see the price before any work starts.'],
  ['Do we need a call?', 'No. The brief covers what a discovery call usually would. If a call would genuinely help, I’ll suggest one.'],
  ['What kinds of businesses do you work with?', 'Any business without an in-house designer or developer that needs marketing material regularly, from a one-person shop to a team of about fifty.'],
  ['What if my project isn’t listed?', 'Describe it in the brief. Video, motion and marketing strategy are all possible and quoted individually. The answer is usually yes.'],
];

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
          <span><b>The <i>Scaffold</i></b><span className="dsub">by Carter Groff</span></span>
        </a>
        <div className="dnavlinks">
          <a href="#make">Design</a><a href="#automation">Automation</a><a href="#how">How it works</a><a href="#faq">FAQ</a>
          <a href="/">Portfolio ↗</a>
        </div>
        <a className="p-btn" href="#brief">Start a brief</a>
      </div>
    </nav>
  );
}

// One brief beside the three different drafts it produced: the AI value in
// one glance. An illustration of the process, labelled as such.
function HeroVisual() {
  return (
    <figure className="dhv up" aria-label="Illustration: one brief, three different first drafts">
      <div className="dhv-brief">
        <span className="dhv-k">The brief</span>
        <p>“Five posts announcing our spring menu. Warm, a bit playful. Copy: <em>Spring menu. From March 4th.</em>”</p>
      </div>
      <span className="dhv-arrow" aria-hidden="true">→</span>
      <div className="dhv-drafts">
        <div className="dhv-d d1"><span>Spring<br />menu.</span><i>From March 4th</i></div>
        <div className="dhv-d d2"><span>SPRING MENU</span><i>from march 4th</i></div>
        <div className="dhv-d d3"><span>spring<br /><b>menu</b></span><i>Mar 4 →</i></div>
      </div>
      <figcaption>Three real directions, not one layout in three colorways. AI drafts them; I finish the one you pick.</figcaption>
    </figure>
  );
}

function Hero() {
  return (
    <header className="dhero" id="top">
      <Rings />
      <div className="dwrap">
        <div className="dcrest"><img src="assets/antler.png" alt="The Scaffold, by Carter Groff" /></div>
        <span className="p-eyebrow">Design and automation studio</span>
        <h1 className="ddisplay">Design work,<br /><em>drafted fast.</em></h1>
        <p className="ddeck">Social graphics, print and documents, plus the small automations that take busywork off your plate. AI drafts the options. I make the calls and finish every file by hand.</p>
        <div className="dacts"><a className="p-btn" href="#brief">Start a brief →</a><a className="p-btn ghost" href="#how">See how it works</a></div>
        <HeroVisual />
      </div>
    </header>
  );
}

function Proofline() {
  return (
    <div className="dproofline">
      <span>AI drafts the options, I finish every file</span><span>Replies within a day</span><span>Two revision rounds included</span><span>No call required</span>
    </div>
  );
}

function Price({ s }) {
  if (!SHOW_PRICES) return null;
  return <span className="dprice">From {s.from} · {s.turn}</span>;
}

function Make({ onAddNeed }) {
  return (
    <section id="make" className="dsection">
      <div className="dwrap">
        <div className="dshead up">
          <div className="didxrow"><span className="didx">01 / 06</span><span className="dln" /></div>
          <span className="p-eyebrow">Design</span>
          <h2 className="ddisplay">Marketing graphics, in days, not weeks.</h2>
          <p className="dp">Close to one of these? It's in scope. Describe it in the brief and I'll tell you straight.</p>
        </div>
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

function Automation({ onAddNeed }) {
  return (
    <section id="automation" className="dsection dauto">
      <div className="dwrap">
        <div className="dshead up">
          <div className="didxrow"><span className="didx">02 / 06</span><span className="dln" /></div>
          <span className="p-eyebrow">Automation and tools</span>
          <h2 className="ddisplay">Stop doing busywork by hand.</h2>
          <p className="dp">Small, scoped builds for businesses without a developer. I've built each of these for myself first, so you're not paying for an experiment.</p>
        </div>
        <div className="dcards four">
          {AUTOMATION_SERVICES.map((s) => (
            <div className="dcard up" key={s.n}>
              <span className="dcardn">{s.n}</span><h3>{s.title}</h3><p>{s.desc}</p>
              <span className="dproof">{s.proof}</span>
              <a href="#brief" onClick={(e) => { e.preventDefault(); onAddNeed('automation', s.need); }}>Add to brief →</a>
            </div>
          ))}
        </div>
        <p className="dquiet">Automation work is scoped and quoted individually, after a short brief.</p>
        <p style={{ marginTop: 22 }}><a className="p-btn" href="#brief" onClick={(e) => { e.preventDefault(); onAddNeed('automation'); }}>Start an automation brief →</a></p>
      </div>
    </section>
  );
}

function How() {
  const steps = [
    ['1', 'You send a brief', "A short form that covers what a designer needs: exact copy, sizes, where it's going. Nothing stalls later."],
    ['2', 'AI drafts three directions', 'Three genuinely different looks, drafted with AI from your brief and brand. Usually within two business days.'],
    ['3', 'I finish the one you pick', 'You choose a direction; I refine it by hand. Two revision rounds are included, stated in the quote up front.'],
    ['4', 'Files and invoice', 'Print-ready, correctly sized files you can hand straight to a printer, with a card-payment link.'],
  ];
  return (
    <section id="how" className="dsection dwood">
      <div className="dwrap">
        <div className="dshead up">
          <div className="didxrow"><span className="didx">03 / 06</span><span className="dln" /></div>
          <span className="p-eyebrow">How it works</span>
          <h2 className="ddisplay">Four steps. You always know where the job stands.</h2>
          <p className="dp">No meeting required. The brief covers what a discovery call usually would, so the first drafts come back in days, not weeks.</p>
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
    ['One person, both jobs', 'A marketer who also ships the design, so the work fits the message it carries.'],
    ['Real alternatives', 'You see three real directions, not one attempt you have to accept or reject.'],
    ['Fast, and not anonymous', 'Quick turnaround, from someone you can actually reach, in Harrisonburg.'],
  ];
  return (
    <section id="why" className="dsection">
      <div className="dwrap">
        <div className="dwhyhead up">
          <img className="dportrait" src="assets/portrait.jpg" alt="Carter Groff" loading="lazy" />
          <div>
            <div className="didxrow"><span className="didx">04 / 06</span><span className="dln" /></div>
            <span className="p-eyebrow">Why work with me</span>
            <h2 className="ddisplay">I’m Carter. I do marketing for a living.</h2>
            <p className="dp">By day I run social, email and local marketing for a log-home restoration company in Harrisonburg, Virginia, and I studied media arts and design at James Madison University. The Scaffold is how I do the same work for other small businesses: AI for the drafting and the admin, my own eye and hands for every decision you see.</p>
          </div>
        </div>
        <div className="dwhy">
          {items.map(([title, body]) => (
            <div className="up" key={title}><b>{title}</b><p>{body}</p></div>
          ))}
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
          <div className="didxrow"><span className="didx">05 / 06</span><span className="dln" /></div>
          <span className="p-eyebrow">Questions</span>
          <h2 className="ddisplay">Before you ask.</h2>
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

// ── The brief: a controlled three-movement form, posted to a real endpoint ──
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
          <div className="didxrow" style={{ justifyContent: 'center' }}><span className="dln" /><span className="didx">06 / 06</span><span className="dln" /></div>
          <span className="p-eyebrow">The brief</span>
          <h2 className="ddisplay">Write me a <em>brief</em>.</h2>
          <p className="ddeck">Three short movements. The more you fill in, the closer the first drafts land, and the sooner you get a price back.</p>
          <div className="dbriefmeta"><span>About three minutes</span><span>No account</span><span>No call</span></div>
        </div>

        <div className="dlanes" role="radiogroup" aria-label="What kind of project">
          {[['design', 'Design'], ['automation', 'Automation or a tool']].map(([v, label]) => (
            <button key={v} type="button" role="radio" aria-checked={f.lane === v}
              className={'dlane' + (f.lane === v ? ' on' : '') + (v === 'automation' ? ' auto' : '')} onClick={() => setLane(v)}>{label}</button>
          ))}
        </div>

        <div className="dprog">
          <div className="dprogrow"><span>Movement {STEPS[step][0]} of III · {STEPS[step][1]}</span><span>{step === 2 ? 'Last movement' : step === 1 ? 'One movement left' : 'Two movements left'}</span></div>
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
                  <span className="dqlb">{auto ? 'What should it handle?' : 'What are we making?'}</span>
                  <div className="dchips">
                    {chips.map((c) => (
                      <label key={c} className={'dchip' + (f.need.includes(c) ? ' on' : '')}>
                        <input type="checkbox" checked={f.need.includes(c)} onChange={() => toggleNeed(c)} />{c}
                      </label>
                    ))}
                  </div>
                </div>
                <label className="dfl"><span className="dlb">Tell me about it <i>required</i></span>
                  <span className="dhint">{auto ? 'What you want to stop doing by hand, and what "done" would look like.' : "Who it's for, what it has to do, anything that shapes it."}</span>
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
              {step === 2 ? "I'll reply with a price and a timeline, usually within a day. No call required."
                : step === 1 ? 'One more movement after this, the optional details.'
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
        <div className="dcrest"><img src="assets/antler.png" alt="" /></div>
        <div>
          <p className="ddisplay" style={{ fontSize: 22 }}>The <i>Scaffold</i></p>
          <p className="dfootsub">Design and automation, by Carter Groff. Harrisonburg, Virginia.</p>
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
      <Make onAddNeed={onAddNeed} />
      <Automation onAddNeed={onAddNeed} />
      <How />
      <Why />
      <Faq />
      <Brief ref={briefRef} />
      <Footer />
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<TheScaffold />);
