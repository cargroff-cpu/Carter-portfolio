// design.jsx — The Scaffold, by Carter Groff (cargroff.com/design).
// The public studio page: two lanes (Design, Automation), one lane-aware
// brief that posts to api/design-brief.js. Precompiled to design.js by
// scripts/build-design.mjs; the page loads design.js, not this file, so
// re-run the build after editing. See DECISIONS.md.

const DESIGN_SERVICES = [
  { name: 'Social graphics', need: 'Social graphics', what: 'A single post or a full series that shares one look, sized for every platform you use.' },
  { name: 'Business cards and print', need: 'Business card or print', what: 'Double-sided, print-ready, correct bleed. Files your printer accepts the first time.' },
  { name: 'Flyers and one-pagers', need: 'Flyer or one-pager', what: 'For the counter, the mailbox, or the inbox. Print and digital versions from one design.' },
  { name: 'Documents and decks', need: 'Document or report', what: 'Proposals, menus, reports, and slides that are designed, not dropped into a template.' },
  { name: 'Brand basics', need: 'Brand basics', what: 'Logo refinement, a color and type system, and a one-page guide so everything stays consistent.' },
  { name: 'Monthly content', need: 'Monthly content plan', what: 'A set number of on-brand posts every month, planned ahead, delivered on schedule.' },
];
const DESIGN_NEEDS = ['Social graphics', 'Business card or print', 'Flyer or one-pager', 'Document or report', 'Presentation or deck', 'Brand basics', 'Monthly content plan', 'Something else'];

const AUTOMATIONS = [
  { name: 'Lead and inquiry handling', what: 'Every form, call note, and email inquiry lands in one place, gets an instant reply, and reminds you to follow up.' },
  { name: 'Content pipelines', what: 'On-brand posts and emails drafted on a schedule from your own brand guide, waiting for your approval.' },
  { name: 'Dashboards and trackers', what: 'Your numbers and to-dos on one screen instead of six tabs and a spreadsheet nobody updates.' },
  { name: 'Custom AI assistants', what: 'An assistant that knows your services, prices, and tone, trained on your own documents.' },
];
const AUTOMATION_NEEDS = ['Lead and inquiry handling', 'Content pipeline', 'Dashboard or tracker', 'Custom AI assistant', 'Something else'];
const BUDGETS = ['Under $250', '$250–$750', '$750–$2,000', '$2,000+', 'Not sure yet'];

const FAQ = [
  ['Do you use AI?', 'Yes, openly. AI drafts the first directions and handles the busywork, which is why you get three real options in days instead of one in weeks. I choose what goes forward, fix what AI gets wrong, and finish every file by hand. Nothing goes to you without my review.'],
  ['What if I don’t like any of the three directions?', 'Tell me what’s off and I’ll send a fresh round before we start refining. A brief that misses usually means the brief was missing something, and that’s on me to ask about.'],
  ['How do revisions work?', 'Two rounds of revisions are included in every design quote. A round is one consolidated list of changes. More rounds are available, and I’ll say what they cost before doing them.'],
  ['Who owns the files?', 'You do. Once the invoice is paid, the final files and the rights to use them are yours, including the editable source files.'],
  ['How do I pay?', 'Every job gets a fixed quote before any work starts. You pay by card through a secure Stripe link. No subscriptions unless you ask for a monthly plan.'],
  ['Do you only work with local businesses?', 'No. I’m in Harrisonburg, Virginia, and happy to meet locally, but everything works by email, so location doesn’t matter.'],
  ['What do you need from me?', 'The brief covers it: what you need, where it runs, when you need it, the exact wording, and your logo and colors if you have them. The more of that you send, the closer the first draft lands.'],
];

function Crest({ size = 28 }) {
  return <img src="assets/antler.png" alt="" width={size} height={Math.round(size * 0.7)} style={{ width: size, height: 'auto' }} />;
}

// Decorative ring instrument carried over from the previous design (pure CSS).
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
    <nav className="snav" aria-label="Main">
      <div className="snavin">
        <a className="sbrand" href="#top" aria-label="The Scaffold, by Carter Groff, home">
          <Crest />
          <span><b>The Scaffold</b><span className="ssub">by Carter Groff</span></span>
        </a>
        <div className="snavlinks">
          <a href="#design">Design</a><a href="#automation">Automation</a><a href="#how">How it works</a><a href="#faq">FAQ</a><a href="/">Portfolio</a>
        </div>
        <a className="sbtn" href="#brief">Start a brief</a>
      </div>
    </nav>
  );
}

// One brief, three directions: an illustrated example of the promise.
// Fictional bakery; every element is HTML/CSS so it stays sharp.
function BriefToDrafts() {
  return (
    <figure className="bdx" aria-label="Example: one brief for a spring menu flyer becomes three different design directions">
      <div className="bdx-brief">
        <span className="bdx-tag">The brief</span>
        <p className="bdx-name">Rye &amp; Ember Bakery</p>
        <dl>
          <div><dt>Need</dt><dd>Spring menu flyer</dd></div>
          <div><dt>Runs on</dt><dd>Counter, Instagram</dd></div>
          <div><dt>Copy</dt><dd>“New for spring. Lemon rye, rhubarb tarts.”</dd></div>
          <div><dt>Due</dt><dd>March 4</dd></div>
        </dl>
      </div>
      <svg className="bdx-arrow" viewBox="0 0 60 24" aria-hidden="true"><path d="M2 12h52M46 4l8 8-8 8" fill="none" stroke="currentColor" strokeWidth="1.5" /></svg>
      <div className="bdx-drafts">
        <div className="bdx-d bdx-d1">
          <span className="sun" />
          <b>Spring</b>
          <i>at Rye &amp; Ember</i>
          <small>Lemon rye · Rhubarb tarts</small>
        </div>
        <div className="bdx-d bdx-d2">
          <small>New for spring</small>
          <b>Lemon<br />Rye</b>
          <ul><li>Rhubarb tart</li><li>Honey loaf</li><li>Sorrel scone</li></ul>
        </div>
        <div className="bdx-d bdx-d3">
          <b>NEW</b>
          <b>FOR</b>
          <b className="hot">SPRING</b>
          <small>Rye &amp; Ember</small>
        </div>
      </div>
      <figcaption>Example brief. Three different directions back, not one layout in three colors.</figcaption>
    </figure>
  );
}

function Hero() {
  return (
    <header className="shero" id="top">
      <Rings />
      <div className="swrap shero-in">
        <div className="shero-copy">
          <h1 className="sdisplay">Drafted by AI.<br /><em>Finished by hand.</em></h1>
          <p className="sdeck">The Scaffold is a one-person studio for businesses without a designer or developer on staff. Marketing design in days, and automations that take the busywork off your plate.</p>
          <div className="sacts">
            <a className="sbtn" href="#brief">Start a brief</a>
            <a className="sbtn ghost" href="#how">How it works</a>
          </div>
          <ul className="sproof">
            <li>Three real directions</li><li>Two revision rounds</li><li>Fixed quote in one business day</li><li>No call required</li>
          </ul>
        </div>
        <BriefToDrafts />
      </div>
    </header>
  );
}

function DesignLane({ onAddNeed, work }) {
  return (
    <section id="design" className="ssection">
      <div className="swrap">
        <div className="shead">
          <h2 className="sdisplay">Design, in days.</h2>
          <p className="slead">Static marketing pieces with a fixed quote, three directions to choose from, and print-ready files at the end.</p>
        </div>
        <ul className="slist">
          {DESIGN_SERVICES.map((s) => (
            <li key={s.name}>
              <h3>{s.name}</h3>
              <p>{s.what}</p>
              <button type="button" className="slink" onClick={() => onAddNeed('design', s.need)}>Add to brief</button>
            </li>
          ))}
        </ul>
        <p className="saside">Video, motion graphics, and marketing strategy are available too. Describe it in the brief and I’ll quote it.</p>
        {work.length > 0 && (
          <div className="swork">
            <h3 className="sh3">Recent design work</h3>
            <div className="sworkgrid">
              {work.map((w) => (
                <figure key={w.title}>
                  <img src={w.thumb || w.image} alt={w.title + ', ' + w.kind} loading="lazy" />
                  <figcaption><b>{w.title}</b><span>{w.kind}</span></figcaption>
                </figure>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

function AutomationLane({ onAddNeed }) {
  return (
    <section id="automation" className="ssection swarm">
      <div className="swrap">
        <div className="shead">
          <h2 className="sdisplay">Stop doing busywork <em>by hand.</em></h2>
          <p className="slead">Small tools and automations, built around how your business already works. Every build starts with a short audit and a written plan, so you know exactly what you’re getting before anything is built.</p>
        </div>
        <div className="sauto">
          <ul className="slist slist-two">
            {AUTOMATIONS.map((a, i) => (
              <li key={a.name}>
                <h3>{a.name}</h3>
                <p>{a.what}</p>
                <button type="button" className="slink" onClick={() => onAddNeed('automation', AUTOMATION_NEEDS[i])}>Add to brief</button>
              </li>
            ))}
          </ul>
          <figure className="sshot">
            <img src="assets/shot-back-room.jpg" alt="The Back Room brief inbox, showing an AI triage of a sample brief with missing details, flags, scope, and a draft reply" loading="lazy" width="1400" height="875" />
            <figcaption>The Back Room, the lead, project, and invoice system I built and run this studio on. Every new brief gets an AI triage I review before replying. Shown with sample data.</figcaption>
          </figure>
        </div>
      </div>
    </section>
  );
}

function How() {
  const steps = [
    ['Send a brief', 'A short form that covers what a designer needs: the wording, the sizes, where it runs, when it’s due. No call.'],
    ['Get a fixed quote', 'Within one business day, a price and a delivery date. If anything’s missing, I ask before quoting.'],
    ['AI drafts, I direct', 'AI produces a wide set of first drafts from your brief and brand. I pick the strongest three and rework them.'],
    ['Choose and refine', 'Pick a direction. Two revision rounds are included to get every detail right.'],
    ['Get your files', 'Print-ready, correctly sized, with editable source files. Yours once the invoice is paid.'],
  ];
  return (
    <section id="how" className="ssection">
      <div className="swrap">
        <div className="shead">
          <h2 className="sdisplay">You always know where the job stands.</h2>
          <p className="slead">Five steps, the same every time. AI does the drafting and the admin. I make every decision you’ll see.</p>
        </div>
        <ol className="ssteps">
          {steps.map(([t, b]) => <li key={t}><h3>{t}</h3><p>{b}</p></li>)}
        </ol>
      </div>
    </section>
  );
}

function About() {
  return (
    <section id="about" className="ssection swarm">
      <div className="swrap sabout">
        <img className="sportrait" src="assets/portrait.jpg" alt="Carter Groff on a black-sand beach" width="900" height="1200" loading="lazy" />
        <div>
          <h2 className="sdisplay">One person, both jobs.</h2>
          <p className="slead">I’m Carter Groff, a marketer and designer in Harrisonburg, Virginia. My day job is running marketing for two local companies, so I design for businesses that need the work to bring in customers, not just look good.</p>
          <p className="sbody">I studied media arts and design at James Madison University, and I built the tools this studio runs on myself. AI lets me move at the speed of a team. The judgment, the taste, and the final file are still mine, and you’re always talking to me, not an account manager.</p>
          <a className="slink" href="/">See the full portfolio</a>
        </div>
      </div>
    </section>
  );
}

function Faq() {
  return (
    <section id="faq" className="ssection">
      <div className="swrap sfaq">
        <h2 className="sdisplay">Questions, answered.</h2>
        <div>
          {FAQ.map(([q, a], i) => (
            <details key={q} open={i === 0}>
              <summary>{q}</summary>
              <p>{a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── The brief: lane-aware, three short steps, posted to api/design-brief.js ──
const EMPTY = {
  lane: 'design', name: '', email: '', business: '', need: [], about: '', where: '', when: '', flexible: false,
  assets: '', copy: '', refs: '', notes: '', budget: '', slow: '', tools: '', who: '', website: '',
};

const Brief = React.forwardRef(function Brief(props, ref) {
  const [step, setStep] = React.useState(0);
  const [sent, setSent] = React.useState(false);
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState('');
  const [f, setF] = React.useState(EMPTY);
  const topRef = React.useRef(null);

  const set = (k) => (e) => setF((s) => ({ ...s, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));
  const setLane = (lane) => setF((s) => (s.lane === lane ? s : { ...s, lane, need: [] }));
  const toggleNeed = (v) => setF((s) => ({ ...s, need: s.need.includes(v) ? s.need.filter((x) => x !== v) : [...s.need, v] }));

  React.useImperativeHandle(ref, () => ({
    addNeed: (lane, v) => {
      setStep(0);
      setF((s) => {
        const base = s.lane === lane ? s : { ...s, lane, need: [] };
        return base.need.includes(v) ? base : { ...base, need: [...base.need, v] };
      });
    },
  }));

  const auto = f.lane === 'automation';
  const needs = auto ? AUTOMATION_NEEDS : DESIGN_NEEDS;
  const stepValid = (i) => {
    if (i === 0) return f.name.trim().length > 1 && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(f.email.trim());
    if (i === 1) return f.about.trim().length > 1;
    return true;
  };
  const go = (n) => { setStep(n); if (topRef.current) topRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' }); };
  const next = () => {
    if (!stepValid(step)) return;
    if (step < 2) go(step + 1);
    else submit();
  };

  const submit = () => {
    setBusy(true); setError('');
    fetch('/api/design-brief', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(f) })
      .then((r) => r.json())
      .then((data) => { if (data.error) setError(data.error); else setSent(true); })
      .catch(() => setError('The brief didn’t send. Check your connection and try again, or email car.groff@gmail.com.'))
      .finally(() => setBusy(false));
  };

  if (sent) {
    return (
      <section id="brief" className="ssection sdeep">
        <div className="swrap sbriefwrap">
          <div className="ssent" role="status">
            <Crest size={52} />
            <h2 className="sdisplay">Brief received.</h2>
            <p className="slead">I’ll read it properly and reply to <b>{f.email}</b> with a fixed price and a delivery date, usually within one business day. If anything’s missing, I’ll ask.</p>
          </div>
        </div>
      </section>
    );
  }

  const stepNames = ['Who’s asking', auto ? 'What’s slowing you down' : 'What you need', 'Details that save time'];

  return (
    <section id="brief" className="ssection sdeep" ref={topRef}>
      <Rings />
      <div className="swrap sbriefwrap">
        <div className="sbriefhead">
          <Crest size={44} />
          <h2 className="sdisplay">Write me a <em>brief</em>.</h2>
          <p className="slead">About three minutes, no account, no call. You’ll get a fixed price and a date back within one business day.</p>
        </div>

        <div className="slane" role="radiogroup" aria-label="What kind of work">
          {[['design', 'Design work'], ['automation', 'Automation or a tool']].map(([v, label]) => (
            <button key={v} type="button" role="radio" aria-checked={f.lane === v} className={f.lane === v ? 'on' : ''} onClick={() => setLane(v)}>{label}</button>
          ))}
        </div>

        <div className="sprog" aria-live="polite">
          <span>Step {step + 1} of 3 · {stepNames[step]}</span>
          <div className="sprogbars" aria-hidden="true">{[0, 1, 2].map((i) => <i key={i} className={i <= step ? 'done' : ''} />)}</div>
        </div>

        <form className="sform" onSubmit={(e) => { e.preventDefault(); next(); }} noValidate>
          <label className="shp" aria-hidden="true">Leave this empty<input tabIndex={-1} autoComplete="off" value={f.website} onChange={set('website')} /></label>

          {step === 0 && (
            <div className="sfields two">
              <label className="sfl"><span className="slb">Your name <i>required</i></span>
                <input value={f.name} onChange={set('name')} placeholder="Jane Carter" autoComplete="name" required /></label>
              <label className="sfl"><span className="slb">Email for my reply <i>required</i></span>
                <input type="email" value={f.email} onChange={set('email')} placeholder="jane@business.com" autoComplete="email" required /></label>
              <label className="sfl span2"><span className="slb">Business or project name</span>
                <input value={f.business} onChange={set('business')} placeholder="Carter & Co." autoComplete="organization" /></label>
            </div>
          )}

          {step === 1 && (
            <div className="sfields">
              <fieldset className="sfs">
                <legend className="slb">{auto ? 'What could be automated?' : 'What are we making?'}</legend>
                <div className="schips">
                  {needs.map((c) => (
                    <label key={c} className={'schip' + (f.need.includes(c) ? ' on' : '')}>
                      <input type="checkbox" checked={f.need.includes(c)} onChange={() => toggleNeed(c)} />{c}
                    </label>
                  ))}
                </div>
              </fieldset>
              <label className="sfl"><span className="slb">{auto ? 'What’s slow or repetitive today?' : 'Tell me about it'} <i>required</i></span>
                <span className="shint">{auto ? 'The task, how often it happens, and what goes wrong when it slips.' : 'Who it’s for, what it has to do, anything that shapes it.'}</span>
                <textarea rows={3} value={f.about} onChange={set('about')} placeholder={auto ? 'We copy every web inquiry into a spreadsheet by hand and forget to follow up…' : 'A five-post series announcing our spring menu…'} /></label>
              {auto ? (
                <div className="sfields two">
                  <label className="sfl"><span className="slb">Tools you use now</span><span className="shint">Email, spreadsheets, a CRM, booking software.</span>
                    <input value={f.tools} onChange={set('tools')} placeholder="Gmail, Google Sheets, Square" /></label>
                  <label className="sfl"><span className="slb">Who does this work today</span><span className="shint">You, a team member, nobody yet.</span>
                    <input value={f.who} onChange={set('who')} placeholder="Me, on Sunday nights" /></label>
                </div>
              ) : (
                <div className="sfields two">
                  <label className="sfl"><span className="slb">Where it will run</span><span className="shint">Instagram, a printed handout, a website, an email.</span>
                    <input value={f.where} onChange={set('where')} placeholder="Instagram feed" /></label>
                  <div className="sfl"><span className="slb">When you need it</span><span className="shint">A date, or mark it flexible.</span>
                    <div className="sdate">
                      <input type="date" value={f.when} onChange={set('when')} aria-label="Due date" />
                      <label className="sflex"><input type="checkbox" checked={f.flexible} onChange={set('flexible')} />Flexible</label>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {step === 2 && (
            <div className="sfields">
              {!auto && (
                <fieldset className="sfs">
                  <legend className="slb">Do you have brand assets?</legend>
                  <div className="schips">
                    {[['Yes', 'Yes: logo, colors, fonts'], ['Some', 'Some of them'], ['No', 'No, help me figure it out']].map(([value, label]) => (
                      <label key={value} className={'schip' + (f.assets === value ? ' on' : '')}>
                        <input type="radio" name="assets" checked={f.assets === value} onChange={() => setF((s) => ({ ...s, assets: value }))} />{label}
                      </label>
                    ))}
                  </div>
                </fieldset>
              )}
              {!auto && (
                <label className="sfl"><span className="slb">Exact wording that must appear</span>
                  <span className="shint">Paste it word for word. Wording that changes later is the most common cause of extra rounds.</span>
                  <textarea rows={3} value={f.copy} onChange={set('copy')} placeholder="Spring menu. Available from March 4th…" /></label>
              )}
              <div className="sfields two">
                {!auto && (
                  <label className="sfl"><span className="slb">A look you like</span><span className="shint">Links to one to three examples, or describe them.</span>
                    <textarea rows={2} value={f.refs} onChange={set('refs')} placeholder="Links, or a description" /></label>
                )}
                <label className={'sfl' + (auto ? ' span2' : '')}><span className="slb">Anything else</span><span className="shint">Constraints, past attempts, who needs to sign off.</span>
                  <textarea rows={2} value={f.notes} onChange={set('notes')} placeholder="Whatever I should know" /></label>
              </div>
              <fieldset className="sfs">
                <legend className="slb">Budget range</legend>
                <span className="shint">Helps me scope the job instead of guessing.</span>
                <div className="schips">
                  {BUDGETS.map((b) => (
                    <label key={b} className={'schip' + (f.budget === b ? ' on' : '')}>
                      <input type="radio" name="budget" checked={f.budget === b} onChange={() => setF((s) => ({ ...s, budget: b }))} />{b}
                    </label>
                  ))}
                </div>
              </fieldset>
            </div>
          )}

          {error && <p className="serr" role="alert">{error}</p>}

          <div className="swalk">
            {step > 0 && <button className="sback" type="button" onClick={() => go(step - 1)}>Back</button>}
            <p className="sfine">
              {step === 0 && !stepValid(0) ? 'Add your name and email to continue.'
                : step === 1 && !stepValid(1) ? 'One sentence about the job is enough to continue.'
                : step === 2 ? 'Everything on this step is optional.' : 'Nothing here is asked twice.'}
            </p>
            <button className="sbtn" type="submit" disabled={busy || !stepValid(step)}>
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
    <footer className="sfooter">
      <div className="swrap sfootin">
        <Crest size={44} />
        <div>
          <p className="sfootname">The Scaffold</p>
          <p className="sfoottag">Design and automation, by Carter Groff. Harrisonburg, Virginia.</p>
        </div>
        <div className="sfootlinks">
          <a href="/">Portfolio</a>
          <a href="mailto:car.groff@gmail.com">car.groff@gmail.com</a>
          <span>© {new Date().getFullYear()} Carter Groff</span>
        </div>
      </div>
    </footer>
  );
}

// Recent work comes from the portfolio's own Design Work (edited in the
// Back Room's Website Backend): only pieces with an image are shown, so the
// section never renders placeholders. No images, no section.
function useRecentWork() {
  const [work, setWork] = React.useState([]);
  React.useEffect(() => {
    fetch('https://rodxrkzwpsgeeatmbwku.supabase.co/rest/v1/site_content?select=data&id=eq.1', {
      headers: { apikey: 'sb_publishable_fWE-gd3uSKDe0BpUK5WSxQ_f3Uzgd0x' },
    }).then((r) => (r.ok ? r.json() : [])).then((rows) => {
      const designs = rows && rows[0] && rows[0].data && Array.isArray(rows[0].data.designs) ? rows[0].data.designs : [];
      setWork(designs.filter((d) => d && d.title && (d.thumb || d.image) && !/\.pdf($|\?)/i.test(d.thumb || d.image)).slice(0, 6));
    }).catch(() => {});
  }, []);
  return work;
}

function TheScaffold() {
  const briefRef = React.useRef(null);
  const work = useRecentWork();
  const onAddNeed = (lane, v) => {
    if (briefRef.current) briefRef.current.addNeed(lane, v);
    document.getElementById('brief').scrollIntoView({ behavior: 'smooth' });
  };
  return (
    <div className="scf p-grain">
      <a className="sskip" href="#brief">Skip to the brief</a>
      <Nav />
      <main>
        <Hero />
        <DesignLane onAddNeed={onAddNeed} work={work} />
        <AutomationLane onAddNeed={onAddNeed} />
        <How />
        <About />
        <Faq />
        <Brief ref={briefRef} />
      </main>
      <Footer />
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<TheScaffold />);
