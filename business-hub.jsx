// business-hub.jsx — The Business Hub, door 03 of The Backroom: the job
// workflow, brief to paid (2026-11-06).
//
//   new -> proposed -> drafts -> final -> paid
//
// Every brief from scaffold.cargroff.com becomes a job. Carter writes a
// proposal, sends directions, sends the final; the client accepts, picks,
// approves and pays on their private page (/j/<token>, Job.html), and each of
// their actions comes back here and to Carter's inbox. Billing per job:
// split (50% deposit on accept, 50% on approval) or end (one invoice on
// approval). No card fee.
//
// Tools: Today (what needs you), Jobs (the board and each job's page),
// Proposals, Mail (sent log and templates), Money (invoices), Clients.
// Data: command-center-data.jsx (window.CC). Server: api/job.js,
// api/brief-reply.js, api/scaffold-read.js / scaffold-write.js.
const {
  fetchClients, saveClient, fetchInvoices, saveInvoice,
  fetchJobs, saveJob, fetchProposals, saveProposal, fetchJobFiles, fetchJobEvents, fetchAllEvents, saveJobEvent,
  jobAction, uploadJobFile,
  fetchDesignBriefs, fetchDesignBriefAttachments, briefAction,
} = window.CC;

const STAGES = [
  ['new', 'New'], ['proposed', 'Proposed'], ['drafts', 'Drafts'], ['final', 'Final'], ['paid', 'Paid'],
];
const STAGE_LABEL = Object.fromEntries([...STAGES, ['closed', 'Closed']]);
const JOB_URL = (token) => 'https://scaffold.cargroff.com/j/' + token;

const usd = (n) => (n == null || n === '' ? '—' : '$' + Number(n).toLocaleString('en-US', { maximumFractionDigits: 2 }));
const fdate = (s) => { if (!s) return '—'; return new Date(s).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }); };
const daysSince = (s) => (s ? Math.floor((Date.now() - new Date(s).getTime()) / 864e5) : 0);
const pill = (txt, kind) => <span className={'pill ' + (kind || 'mute')}>{txt}</span>;
const stageKind = (s) => ({ new: 'warn', proposed: 'mute', drafts: 'mute', final: 'warn', paid: 'ok', closed: 'mute' }[s] || 'mute');
const firstName = (n) => String(n || '').trim().split(/\s+/)[0] || 'there';
const fill = (t, f) => String(t || '').replace(/\{(\w+)\}/g, (m, k) => (f[k] != null && f[k] !== '' ? String(f[k]) : m));
const sumItems = (items) => (items || []).reduce((s, i) => s + (Number(i.amount) || 0), 0);

// ── Mail templates. {fields} fill from the job; the email goes out in the
// branded frame (lib/mail.js) with a button to the client's project page.
const TEMPLATES = {
  proposal: { when: 'When the proposal is written. Sending moves the job to Proposed.', label: 'Proposal', subject: 'Your proposal: {title}', heading: "Here's the plan for your {title}.",
    body: "Hi {first},\n\nThanks for the brief. I've drawn it up properly: what's included, the timeline, and the price ({total}, {billing}). Have a look, and accept it on your project page when you're happy.", button: 'See the proposal' },
  drafts: { when: 'When the first directions are ready. Moves the job to Directions.', label: 'Directions ready', subject: 'Your directions are ready: {title}', heading: 'The first directions are on the table.',
    body: "Hi {first},\n\nThe early takes on {title} are ready. This is the fun part: nothing is locked in yet, so tell me what grabs you and what doesn't.", button: 'Pick a direction' },
  final: { when: 'When the finished work is ready to review. Moves the job to Final.', label: 'Final ready', subject: 'Your final is ready to review: {title}', heading: "It's finished. Come and see it.",
    body: "Hi {first},\n\nThe finished {title} is ready for you. Take your time with it. If it's right, approve it; if something is off, tell me and I'll fix it ({left} round{leftS} of changes left).", button: 'Review the final' },
  invoice: { when: 'When money is due and ready to pay on their page.', label: 'Invoice', subject: 'Your invoice: {title}', heading: 'One small step, then the work begins.',
    body: 'Hi {first},\n\n{due} is ready to pay on your project page, by card or bank. Thank you.', button: 'Pay now' },
  reminder: { when: 'A gentle nudge for anything waiting on the client.', label: 'Reminder', subject: 'A quick nudge: {title}', heading: "I've kept a lamp lit for you.",
    body: "Hi {first},\n\nJust checking in on {title}. Your project page is exactly as you left it, and it's ready whenever you are. No rush.", button: 'Pick up where you left off' },
  note: { when: 'A blank message in the same frame.', label: 'Blank', subject: '{title}', heading: '', body: 'Hi {first},\n\n\n\n', button: 'Open your project page' },
};

// Made-up values so a template can be previewed without picking a job.
const SAMPLE_FIELDS = { first: 'Dana', name: 'Dana Reyes', title: 'Booking tool', business: 'Reyes Plumbing', total: '$2,000', billing: 'half to start and half when you approve the final', left: 2, leftS: 's', due: 'Deposit (50%) ($1,000)' };

function fieldsFor(job, proposal, invoices) {
  const total = proposal ? Number(proposal.total) || sumItems(proposal.items) : 0;
  const billing = (proposal ? proposal.billing : job.billing) === 'end' ? 'paid in full when you approve the final' : 'half to start and half when you approve the final';
  const due = (invoices || []).filter((i) => i.job_id === job.id && i.status === 'sent');
  const left = Math.max(0, job.revisions_included - job.revisions_used);
  return {
    first: firstName(job.name), name: job.name, title: job.title, business: job.business || '',
    total: usd(total), billing, left, leftS: left === 1 ? '' : 's',
    due: due.length ? due.map((i) => `${i.label || 'Invoice'} (${usd(i.amount)})`).join(' and ') : 'Your invoice',
  };
}

// One "Mark paid" for the job page and the Money tab (api/job.js
// 'mark-paid'): marks it paid, switches off its Stripe link, logs it on the
// job, and moves the job to Paid when nothing issued is left unpaid.
const markInvoicePaid = (i) => (i.job_id
  ? jobAction(i.job_id, 'mark-paid', { invoice_id: i.id })
  : saveInvoice({ id: i.id, status: 'paid', paid_at: new Date().toISOString() }));

// ── Needs you: what is waiting on Carter, oldest first ─────────────────
function needsYou(jobs, proposals, invoices, briefs, events) {
  const out = [];
  const briefOf = (j) => briefs.find((b) => b.id === j.brief_id);
  const propOf = (j) => proposals.find((p) => p.job_id === j.id);
  const lastClient = (j) => events.find((e) => e.job_id === j.id && e.who === 'client');
  // Did Carter already send this kind of email after the client's last move?
  // (Clears "send the directions" / "revise and resend" once that is done.)
  const sentSince = (j, kind, after) => events.some((e) => e.job_id === j.id && e.kind === 'email' && e.meta && e.meta.kind === kind
    && new Date(e.created_at) > new Date(after.created_at));
  for (const j of jobs) {
    if (j.stage === 'closed' || j.stage === 'paid') continue;
    const b = briefOf(j); const p = propOf(j); const lc = lastClient(j);
    if (j.stage === 'new' && b && b.status !== 'answered' && !p) out.push({ j, what: 'Reply to the brief', age: daysSince(j.created_at), hot: true });
    else if (j.stage === 'new' && (!p || p.status === 'draft')) out.push({ j, what: 'Write and send the proposal', age: daysSince(j.created_at), hot: daysSince(j.created_at) >= 2 });
    if (j.stage === 'proposed' && p && p.status === 'sent' && daysSince(p.sent_at) >= 5) out.push({ j, what: 'Proposal waiting ' + daysSince(p.sent_at) + ' days: nudge them', age: daysSince(p.sent_at) });
    if (j.stage === 'drafts' && lc && lc.kind === 'accepted' && !sentSince(j, 'drafts', lc)) out.push({ j, what: 'Proposal accepted: send the directions', age: daysSince(lc.created_at), hot: true });
    if (j.stage === 'drafts' && lc && lc.kind === 'picked') out.push({ j, what: 'Direction picked: make and send the final', age: daysSince(lc.created_at), hot: true });
    if (j.stage === 'final' && lc && lc.kind === 'changes' && !sentSince(j, 'final', lc)) out.push({ j, what: 'Changes asked for: revise and resend', age: daysSince(lc.created_at), hot: true });
  }
  for (const i of invoices) {
    if (i.status === 'sent' && daysSince(i.sent_at) >= 14) {
      const j = jobs.find((x) => x.id === i.job_id);
      if (j) out.push({ j, what: `${i.label || 'Invoice'} unpaid ${daysSince(i.sent_at)} days: send a reminder`, age: daysSince(i.sent_at) });
    }
  }
  return out.sort((a, b) => (b.hot ? 1 : 0) - (a.hot ? 1 : 0) || b.age - a.age);
}

// ── The tools ──────────────────────────────────────────────────────────
// Each tool shows a line icon that says what it is. The antler artwork the
// plates used before is kept in assets/tool-*.png (the antler field below) for later.
const TOOL_LIST = [
  { id: 'today', label: 'Today', glyph: 'today', antler: 'assets/tool-brief.png', desc: 'What needs you, what just happened, money in and out.' },
  { id: 'jobs', label: 'Jobs', glyph: 'jobs', antler: 'assets/tool-work.png', desc: 'Every job from brief to paid, one column per stage.' },
  { id: 'proposals', label: 'Proposals', glyph: 'proposals', antler: 'assets/tool-vault.png', desc: 'Every proposal, where it stands, and what it is worth.' },
  { id: 'mail', label: 'Mail', glyph: 'mail', antler: 'assets/tool-leads.png', desc: 'Everything sent to clients, and the templates behind it.' },
  { id: 'money', label: 'Money', glyph: 'money', antler: 'assets/tool-money.png', desc: 'Deposits and finals: due, paid, and what to chase.' },
  { id: 'clients', label: 'Clients', glyph: 'clients', antler: 'assets/tool-acquire.png', desc: 'Who you work for and everything you have done for them.' },
];
const GLYPHS = {
  today: <React.Fragment><circle cx="12" cy="12" r="4" /><path d="M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M5.3 5.3l1.6 1.6M17.1 17.1l1.6 1.6M5.3 18.7l1.6-1.6M17.1 6.9l1.6-1.6" /></React.Fragment>,
  jobs: <React.Fragment><rect x="3" y="7" width="18" height="13" rx="2" /><path d="M9 7V5.2c0-.7.5-1.2 1.2-1.2h3.6c.7 0 1.2.5 1.2 1.2V7M3 12.5h18M11 12.5v2h2v-2" /></React.Fragment>,
  proposals: <React.Fragment><path d="M6 3h8.5L19 7.5V21H6z" /><path d="M14 3v5h5M9 12.5h7M9 16h7M9 9h3" /></React.Fragment>,
  mail: <React.Fragment><rect x="3" y="5.5" width="18" height="13" rx="2" /><path d="M3.5 7l8.5 6.2L20.5 7" /></React.Fragment>,
  money: <path d="M12 3v18M16.6 7.6C16 6 14.3 5 12 5 9.5 5 7.5 6.3 7.5 8.3S9.5 11.4 12 12s4.5 1.6 4.5 3.7S14.5 19 12 19c-2.3 0-4.1-1-4.7-2.7" />,
  clients: <React.Fragment><circle cx="9" cy="8.5" r="3.2" /><path d="M3 20c0-3.4 2.7-6 6-6s6 2.6 6 6" /><circle cx="17" cy="9" r="2.5" /><path d="M16.2 14.1c2.8.3 4.8 2.6 4.8 5.9" /></React.Fragment>,
};
function ToolIcon({ name }) {
  return (
    <svg className="ticon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {GLYPHS[name]}
    </svg>
  );
}
function toolMetaOf(id, d, short) {
  if (id === 'today') return d.needs.length ? d.needs.length + ' need you' : 'All clear';
  if (id === 'jobs') return d.jobs.filter((j) => j.stage !== 'paid' && j.stage !== 'closed').length + ' open';
  if (id === 'proposals') return d.proposals.filter((p) => p.status === 'sent').length + ' out';
  if (id === 'mail') return d.events.filter((e) => e.kind === 'email').length + ' sent';
  if (id === 'money') return usd(d.invoices.filter((i) => i.status === 'sent').reduce((a, i) => a + Number(i.amount || 0), 0)) + ' due';
  if (id === 'clients') return d.clients.length + (short ? (d.clients.length === 1 ? ' client' : ' clients') : ' on the books');
  return '';
}
function ToolSidebar({ tab, go, data }) {
  return (
    <nav className="tools on" aria-label="Tools">
      {TOOL_LIST.map((n) => (
        <button key={n.id} aria-current={tab === n.id ? 'true' : undefined} onClick={() => go(n.id)}>
          <span className="tplate"><ToolIcon name={n.glyph} /></span>
          <span><span className="tname">{n.label}</span><span className="tmeta">{toolMetaOf(n.id, data)}</span></span>
        </button>
      ))}
    </nav>
  );
}

function useCollection(fetcher) {
  const [rows, setRows] = React.useState(null);
  const [error, setError] = React.useState(null);
  const reload = React.useCallback(() => fetcher().then((r) => { setRows(r); setError(null); }).catch((e) => setError(e.message || 'Could not load.')), [fetcher]);
  React.useEffect(() => { reload(); }, [reload]);
  return [rows, reload, error];
}

// ── Today ──────────────────────────────────────────────────────────────
// ── Today: the dashboard ───────────────────────────────────────────────
// A glance at the studio: what needs you, what is open, what is owed, what
// came in. Scaffold only. Every card opens the place it counts.
const EVENT_TEXT = {
  brief: 'Brief came in', accepted: 'Proposal accepted', picked: 'Direction picked', changes: 'Changes asked for',
  approved: 'Final approved', paid: 'Payment received', email: 'Email sent', file: 'File added', note: 'Note', reply: 'Reply sent',
};
function relTime(s) {
  const m = Math.floor((Date.now() - new Date(s).getTime()) / 6e4);
  if (m < 1) return 'now';
  if (m < 60) return m + 'm';
  const h = Math.floor(m / 60);
  return h < 24 ? h + 'h' : Math.floor(h / 24) + 'd';
}
function paidByMonth(invoices, n = 6) {
  const now = new Date(); const out = [];
  for (let k = n - 1; k >= 0; k--) {
    const d = new Date(now.getFullYear(), now.getMonth() - k, 1);
    out.push({ key: d.getFullYear() + '-' + d.getMonth(), label: d.toLocaleDateString('en-US', { month: 'short' }), total: 0 });
  }
  for (const i of invoices) {
    if (i.status !== 'paid' || !i.paid_at) continue;
    const d = new Date(i.paid_at);
    const row = out.find((r) => r.key === d.getFullYear() + '-' + d.getMonth());
    if (row) row.total += Number(i.amount || 0);
  }
  return out;
}
function greeting() { const h = new Date().getHours(); return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening'; }

// A number that counts up to its value when it first appears (a plain number
// or "$1,200"); anything else, or reduced motion, shows as is.
function CountUp({ value }) {
  const text = String(value);
  const m = /^(\$?)([\d,]+(?:\.\d+)?)$/.exec(text);
  const motionOk = !(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
  const [shown, setShown] = React.useState(m && motionOk && parseFloat(m[2].replace(/,/g, '')) > 0 ? m[1] + '0' : text);
  React.useEffect(() => {
    if (!m || !motionOk) { setShown(text); return; }
    const to = parseFloat(m[2].replace(/,/g, '')), dec = (m[2].split('.')[1] || '').length;
    if (!isFinite(to) || to === 0) { setShown(text); return; }
    let raf, t0;
    const step = (t) => {
      t0 = t0 || t;
      const k = Math.min(1, (t - t0) / 900), e = 1 - Math.pow(1 - k, 4);
      setShown(m[1] + (to * e).toLocaleString('en-US', { minimumFractionDigits: dec, maximumFractionDigits: dec }));
      if (k < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [text]);
  return shown;
}
function Kpi({ label, value, note, tone, onClick }) {
  return (
    <button type="button" className="dkpi" onClick={onClick}>
      <span className="dkpi-l">{label}</span>
      <span className="dkpi-v mono"><CountUp value={value} /></span>
      <span className={'dkpi-n' + (tone ? ' ' + tone : '')}>{note}</span>
    </button>
  );
}
function Widget({ title, badge, children, id }) {
  return (
    <section className="widget" id={id}>
      <div className="widget-h"><h2 className="h2">{title}</h2>{badge != null && <span className="widget-b">{badge}</span>}</div>
      {children}
    </section>
  );
}
function MonthBars({ months }) {
  const max = Math.max(1, ...months.map((m) => m.total));
  const any = months.some((m) => m.total > 0);
  const W = 320, H = 130, base = 104, bw = 30, gap = (W - months.length * bw) / (months.length + 1);
  if (!any) return <p className="sub" style={{ padding: '14px 0 6px' }}>No payments yet. They show here as invoices are paid.</p>;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Paid by month, last six months" style={{ width: '100%', height: 'auto', display: 'block' }}>
      <line x1="0" x2={W} y1={base} y2={base} stroke="rgba(236,217,178,.26)" />
      {months.map((m, k) => {
        const h = Math.max(m.total ? 3 : 0, (m.total / max) * (base - 22));
        const x = gap + k * (bw + gap);
        const last = k === months.length - 1;
        return (
          <g key={m.key}>
            <rect className="mbar" x={x} y={base - h} width={bw} height={h} fill={last ? '#f5cd6a' : '#d99a3d'} opacity={last ? 1 : .62} />
            {m.total > 0 && <text className="mlab" x={x + bw / 2} y={base - h - 6} textAnchor="middle" fontSize="11" fill="#ecd9b2">{m.total >= 1000 ? '$' + (m.total / 1000).toFixed(m.total % 1000 ? 1 : 0) + 'k' : '$' + Math.round(m.total)}</text>}
            <text x={x + bw / 2} y={base + 17} textAnchor="middle" fontSize="12" fill="#ad9a74">{m.label}</text>
          </g>
        );
      })}
    </svg>
  );
}

function Today({ data, open, go }) {
  const { needs, invoices, events, jobs, proposals } = data;
  const jobOf = (id) => jobs.find((j) => j.id === id);
  const isOpen = (j) => j.stage !== 'paid' && j.stage !== 'closed';
  const openJobs = jobs.filter(isOpen);
  const due = invoices.filter((i) => i.status === 'sent');
  const dueTotal = due.reduce((a, i) => a + Number(i.amount || 0), 0);
  const overdue = due.filter((i) => daysSince(i.sent_at) >= 14);
  const out = proposals.filter((p) => p.status === 'sent');
  const outTotal = out.reduce((a, p) => a + Number(p.total || 0), 0);
  const months = paidByMonth(invoices);
  const thisM = months[months.length - 1].total, lastM = months[months.length - 2].total;
  const delta = lastM ? Math.round(((thisM - lastM) / lastM) * 100) : null;
  const hot = needs.filter((n) => n.hot).length;
  const valueOf = (j) => { const p = proposals.find((x) => x.job_id === j.id); return p ? Number(p.total || 0) : 0; };
  const STAGE_ROWS = [['new', 'New'], ['proposed', 'Proposed'], ['drafts', 'Directions'], ['final', 'Final']];
  const maxStage = Math.max(1, ...STAGE_ROWS.map(([id]) => jobs.filter((j) => j.stage === id).length));
  const paidJobs = jobs.filter((j) => j.stage === 'paid').length;
  const feed = events.filter((e) => EVENT_TEXT[e.kind]).slice(0, 8);
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  return (
    <div className="stack">
      <div className="dash-h">
        <div><h1 className="h1">{greeting()}, Carter.</h1><p className="sub">{today}</p></div>
        <button className="btn" onClick={() => go('jobs', { newJob: true })}>New job</button>
      </div>
      <div className="dkpis">
        <Kpi label="Needs you" value={needs.length} note={needs.length ? (hot ? hot + ' to do first' : 'Nothing urgent') : 'All clear'} tone={hot ? 'hot' : ''} onClick={() => document.getElementById('needs')?.scrollIntoView({ behavior: 'smooth', block: 'start' })} />
        <Kpi label="Open jobs" value={openJobs.length} note={(openJobs.filter((j) => j.stage === 'new').length || 'No') + ' new'} onClick={() => go('jobs')} />
        <Kpi label="Proposals out" value={out.length} note={out.length ? usd(outTotal) + ' waiting' : 'None waiting'} onClick={() => go('proposals')} />
        <Kpi label="Due to you" value={usd(dueTotal)} note={overdue.length ? overdue.length + ' overdue' : due.length + ' invoice' + (due.length === 1 ? '' : 's') + ' out'} tone={overdue.length ? 'hot' : ''} onClick={() => go('money')} />
        <Kpi label="Paid this month" value={usd(thisM)} note={delta == null ? (thisM ? 'First month with income' : 'Nothing yet') : (delta >= 0 ? '+' : '') + delta + '% vs last month'} tone={delta != null && delta < 0 ? 'hot' : ''} onClick={() => go('money')} />
      </div>
      <div className="dash-g">
        <Widget title="Needs you" id="needs" badge={needs.length ? needs.length + ' waiting' : 'All clear'}>
          <div className="minirows">
            {needs.map((n, k) => (
              <button key={k} className="minirow" style={{ width: '100%', textAlign: 'left', cursor: 'pointer', background: 'none', border: 0 }} onClick={() => open(n.j.id)}>
                <span className="mtxt"><b>{n.j.title}</b> · {n.what}</span>
                <span className={'mono mval' + (n.hot ? ' hot' : '')}>{n.age ? n.age + 'd' : 'today'}</span>
              </button>
            ))}
            {!needs.length && <p className="sub" style={{ padding: '10px 0' }}>Nothing is waiting on you.</p>}
          </div>
        </Widget>
        <Widget title="Paid by month" badge="last 6 months"><MonthBars months={months} /></Widget>
        <Widget title="Pipeline" badge={openJobs.length + ' open'}>
          <div className="pipe">
            {STAGE_ROWS.map(([id, label]) => {
              const list = jobs.filter((j) => j.stage === id);
              const val = list.reduce((a, j) => a + valueOf(j), 0);
              return (
                <button key={id} type="button" className="pipe-r" onClick={() => go('jobs')}>
                  <span className="pipe-n">{label}</span>
                  <span className="pipe-bar"><i style={{ width: (list.length / maxStage) * 100 + '%' }} /></span>
                  <span className="pipe-c mono">{list.length}{val ? ' · ' + usd(val) : ''}</span>
                </button>
              );
            })}
            <div className="pipe-r static"><span className="pipe-n">Paid</span><span className="pipe-bar" /><span className="pipe-c mono">{paidJobs}</span></div>
          </div>
        </Widget>
        <Widget title="Just happened" badge={feed.length ? 'latest' : null}>
          <div className="minirows">
            {feed.map((e) => (
              <button key={e.id} className="minirow plain" style={{ width: '100%', textAlign: 'left', cursor: 'pointer', background: 'none', border: 0 }} onClick={() => open(e.job_id)}>
                <span className="mtxt"><b>{jobOf(e.job_id) ? jobOf(e.job_id).title : 'Job'}</b> · {EVENT_TEXT[e.kind]}</span>
                <span className="mono mval">{relTime(e.created_at)}</span>
              </button>
            ))}
            {!feed.length && <p className="sub" style={{ padding: '10px 0' }}>Nothing yet. Briefs, replies and payments show up here.</p>}
          </div>
        </Widget>
      </div>
    </div>
  );
}

// ── Jobs board ─────────────────────────────────────────────────────────
function NewJobForm({ onCreated, startOpen }) {
  const [open, setOpen] = React.useState(!!startOpen);
  const [f, setF] = React.useState({ title: '', name: '', email: '', business: '', lane: 'design' });
  const [err, setErr] = React.useState('');
  const set = (k) => (e) => setF((s) => ({ ...s, [k]: e.target.value }));
  const create = () => {
    if (!f.title.trim() || !f.name.trim()) { setErr('A title and the client’s name are needed.'); return; }
    saveJob({ title: f.title.trim(), name: f.name.trim(), email: f.email.trim() || null, business: f.business.trim() || null, lane: f.lane })
      .then((r) => { setOpen(false); setF({ title: '', name: '', email: '', business: '', lane: 'design' }); onCreated(r.row && r.row.id); })
      .catch((e) => setErr(e.message));
  };
  if (!open) return <button className="btn sm" onClick={() => setOpen(true)}>New job</button>;
  return (
    <div className="formgrid">
      <input className="input" placeholder="What it is, e.g. Website for Ridge Bakery" value={f.title} onChange={set('title')} />
      <input className="input" placeholder="Client name" value={f.name} onChange={set('name')} />
      <input className="input" placeholder="Client email" value={f.email} onChange={set('email')} />
      <input className="input" placeholder="Business (optional)" value={f.business} onChange={set('business')} />
      <select className="input" value={f.lane} onChange={set('lane')}><option value="design">Design</option><option value="automation">Tools</option></select>
      <div className="row" style={{ gap: 10, gridColumn: '1/-1' }}>
        <button className="btn sm" onClick={create}>Create job</button>
        <button className="btn ghost sm" onClick={() => setOpen(false)}>Cancel</button>
        {err && <span className="sub" style={{ color: 'var(--warn)' }}>{err}</span>}
      </div>
    </div>
  );
}

function Jobs({ data, open, reload, startNew }) {
  const [showClosed, setShowClosed] = React.useState(false);
  const { jobs, proposals } = data;
  const propOf = (j) => proposals.find((p) => p.job_id === j.id);
  return (
    <div className="stack">
      <section className="card">
        <div className="pad between" style={{ borderBottom: '1px solid var(--line)', gap: 12, flexWrap: 'wrap' }}>
          <h2 className="h2">Jobs</h2>
          <label className="sub" style={{ display: 'flex', gap: 8, alignItems: 'center' }}><input type="checkbox" checked={showClosed} onChange={(e) => setShowClosed(e.target.checked)} /> Show closed</label>
        </div>
        <div className="pad"><NewJobForm startOpen={startNew} onCreated={(id) => { reload(); if (id) open(id); }} /></div>
      </section>
      <div className="jboard">
        {[...STAGES, ...(showClosed ? [['closed', 'Closed']] : [])].map(([id, label]) => {
          const col = jobs.filter((j) => j.stage === id);
          return (
            <section key={id} className="card jcol">
              <div className="pad between" style={{ borderBottom: '1px solid var(--line)' }}><span className="lbl">{label}</span><span className="sub mono">{col.length}</span></div>
              <div className="jcards">
                {col.map((j) => {
                  const p = propOf(j);
                  return (
                    <button key={j.id} className="reclist" onClick={() => open(j.id)}>
                      <div style={{ fontSize: 14, fontWeight: 500 }}>{j.title}</div>
                      <div className="between" style={{ marginTop: 5, gap: 8 }}>
                        <span className="sub">{j.business || j.name}</span>
                        <span className="sub mono">{p && Number(p.total) ? usd(p.total) : ''}</span>
                      </div>
                      <div className="sub" style={{ marginTop: 4 }}>{daysSince(j.last_activity_at) ? daysSince(j.last_activity_at) + 'd since last move' : 'Moved today'}</div>
                    </button>
                  );
                })}
                {!col.length && <p className="sub" style={{ padding: '10px 4px' }}>None.</p>}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}

// ── One job ────────────────────────────────────────────────────────────
function Field({ label, children }) {
  return <label style={{ display: 'block', marginBottom: 10 }}><span className="lbl" style={{ display: 'block', marginBottom: 5 }}>{label}</span>{children}</label>;
}

function BriefPanel({ job, briefs, reload }) {
  const b = briefs.find((x) => x.id === job.brief_id);
  const [atts, setAtts] = React.useState([]);
  React.useEffect(() => { if (b) fetchDesignBriefAttachments(b.id).then(setAtts).catch(() => setAtts([])); }, [b && b.id]);
  if (!b) return null;
  const get = (att) => jobAction(job.id, 'brief-file', { attachment_id: att.id }).then((r) => window.open(r.url, '_blank', 'noopener')).catch((e) => alert(e.message));
  const rows = b.lane === 'automation'
    ? [['What is slow today', b.auto_slow], ['Tools they use', b.auto_tools], ['Who does it now', b.auto_who]]
    : [['Where it will be used', b.where], ['Assets', b.assets], ['Copy', b.copy], ['References', b.refs]];
  return (
    <section className="tile">
      <div className="tilehead"><h2 className="h2">The brief</h2><span className="lbl">{b.reference} · {fdate(b.created_at)}</span></div>
      <p style={{ margin: '0 0 10px', whiteSpace: 'pre-wrap' }}>{b.about}</p>
      <div className="vrow"><span className="lbl">Needs</span><span>{(b.need || []).join(', ') || '—'}</span></div>
      {rows.map(([k, v]) => v ? <div className="vrow" key={k}><span className="lbl">{k}</span><span>{v}</span></div> : null)}
      <div className="vrow"><span className="lbl">When</span><span>{b.when_date || (b.flexible ? 'Flexible' : '—')}</span></div>
      <div className="vrow"><span className="lbl">Budget</span><span>{b.budget || '—'}</span></div>
      {b.notes && <div className="vrow"><span className="lbl">Notes</span><span>{b.notes}</span></div>}
      {atts.length > 0 && (
        <div className="row" style={{ gap: 8, flexWrap: 'wrap', marginTop: 10 }}>
          {atts.map((a) => <button key={a.id} className="btn ghost sm" onClick={() => get(a)}>{a.bucket === 'brief-plans' ? 'Plan: ' : ''}{a.filename}</button>)}
        </div>
      )}
      <TriageCard b={b} reload={reload} />
    </section>
  );
}

// The reply to a brief. With an AI triage it starts from the draft reply;
// without one (no ANTHROPIC_API_KEY, or the triage failed) Carter writes the
// reply himself. Either way nothing goes out until he presses Send.
function TriageCard({ b, reload }) {
  const t = b.triage && b.triage.summary ? b.triage : null;
  const st = (b.triage && b.triage.status) || null;
  const first = firstName(b.name);
  const starter = `Hi ${first},\n\nThanks for the brief. `;
  const [reply, setReply] = React.useState(b.triage ? (b.triage.sent_reply || b.triage.draft_reply || starter) : starter);
  const [busy, setBusy] = React.useState('');
  const [msg, setMsg] = React.useState('');
  React.useEffect(() => { if (b.triage) setReply(b.triage.sent_reply || b.triage.draft_reply || starter); }, [b.triaged_at, st]);
  const run = (action, extra) => {
    if (action === 'reject' && !window.confirm('Mark this brief as needing no reply? Its job will be closed.')) return;
    setBusy(action); setMsg('');
    briefAction(b.id, action, extra)
      .then(() => { setMsg(action === 'send' ? 'Sent.' : action === 'reject' ? 'Marked answered and closed the job.' : 'Updated.'); reload(); })
      .catch((e) => setMsg(e.message)).finally(() => setBusy(''));
  };
  const decided = st === 'sent' || st === 'rejected' || b.status === 'answered';
  return (
    <div style={{ marginTop: 14, padding: '12px 14px', border: '1px solid var(--line)' }}>
      <div className="between" style={{ gap: 8, flexWrap: 'wrap' }}>
        <span className="lbl">{t ? 'AI summary · ' + t.scope + (t.suggested_price ? ' · ' + t.suggested_price : '') : 'Your reply'}</span>
        {pill(st === 'sent' ? 'reply sent' : st === 'rejected' ? 'no reply' : t ? 'draft reply ready' : 'not answered', decided ? 'mute' : 'warn')}
      </div>
      {t && (
        <React.Fragment>
          <p style={{ margin: '8px 0' }}>{t.summary}</p>
          {t.missing && t.missing.length ? <p className="sub">Missing: {t.missing.join('; ')}</p> : null}
          {t.red_flags && t.red_flags.length ? <p className="sub" style={{ color: 'var(--warn)' }}>Flags: {t.red_flags.join('; ')}</p> : null}
        </React.Fragment>
      )}
      <textarea className="input" rows={5} style={{ width: '100%', marginTop: 8, resize: 'vertical' }} value={reply} onChange={(e) => setReply(e.target.value)} disabled={decided}
        aria-label="Reply to the brief" placeholder="Write your reply to the brief" />
      {!decided && (
        <div className="row" style={{ gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
          <button className="btn sm" disabled={!!busy || reply.trim().length < 10} onClick={() => run('send', { reply })}>{busy === 'send' ? 'Sending…' : 'Send this reply'}</button>
          <button className="btn ghost sm" disabled={!!busy} onClick={() => run('triage')}>{busy === 'triage' ? 'Working…' : t ? 'Redo the summary' : 'Draft it with AI'}</button>
          <button className="btn quiet sm" disabled={!!busy} onClick={() => run('reject')}>No reply needed</button>
        </div>
      )}
      {msg && <p className="sub" style={{ marginTop: 6 }}>{msg}</p>}
    </div>
  );
}

function ProposalPanel({ job, proposal, reload, compose }) {
  const blank = { summary: '', items: [{ label: '', amount: '' }], timeline: '', terms: 'Two rounds of changes included. Files are yours once paid.', billing: job.billing || 'split' };
  const [p, setP] = React.useState(proposal ? { ...proposal, items: proposal.items && proposal.items.length ? proposal.items : blank.items } : blank);
  const [msg, setMsg] = React.useState('');
  React.useEffect(() => { if (proposal) setP({ ...proposal, items: proposal.items && proposal.items.length ? proposal.items : blank.items }); }, [proposal && proposal.updated_at]);
  const locked = proposal && proposal.status === 'accepted';
  const total = sumItems(p.items);
  const setItem = (k, key, v) => setP((s) => ({ ...s, items: s.items.map((it, i) => (i === k ? { ...it, [key]: v } : it)) }));
  const save = () => {
    const items = p.items.filter((i) => i.label.trim() || Number(i.amount)).map((i) => ({ label: i.label.trim(), amount: Number(i.amount) || 0 }));
    const row = { job_id: job.id, summary: p.summary, items, timeline: p.timeline, terms: p.terms, billing: p.billing, total: sumItems(items), updated_at: new Date().toISOString() };
    if (proposal) row.id = proposal.id;
    return saveProposal(row).then(() => saveJob({ id: job.id, billing: p.billing })).then(() => { setMsg('Saved.'); reload(); });
  };
  // For a proposal shared another way: no email, but the client's page shows
  // it with the Accept button, and the job moves to Proposed.
  const markSent = () => {
    if (!window.confirm('Mark the proposal as sent without emailing it? It will show on their project page, ready to accept.')) return;
    save().then(() => jobAction(job.id, 'mark-sent')).then(() => { setMsg('Marked as sent. Share their project link.'); reload(); }).catch((e) => setMsg(e.message));
  };
  return (
    <section className="tile">
      <div className="tilehead"><h2 className="h2">Proposal</h2>{proposal ? pill(proposal.status, proposal.status === 'accepted' ? 'ok' : proposal.status === 'sent' ? 'warn' : 'mute') : pill('not written', 'mute')}</div>
      <Field label="What you'll do"><textarea className="input" rows={3} style={{ width: '100%' }} disabled={locked} value={p.summary || ''} onChange={(e) => setP({ ...p, summary: e.target.value })} placeholder="One or two sentences on the job and the outcome." /></Field>
      <span className="lbl" style={{ display: 'block', marginBottom: 5 }}>What's included, with prices</span>
      {p.items.map((it, k) => (
        <div key={k} className="row itemrow" style={{ gap: 8, marginBottom: 6 }}>
          <input className="input" style={{ flex: 1 }} disabled={locked} placeholder="e.g. Three homepage directions" value={it.label} onChange={(e) => setItem(k, 'label', e.target.value)} />
          <input className="input" style={{ width: 110 }} disabled={locked} inputMode="decimal" placeholder="$" value={it.amount} onChange={(e) => setItem(k, 'amount', e.target.value)} />
          {!locked && p.items.length > 1 && <button className="btn quiet sm" onClick={() => setP((s) => ({ ...s, items: s.items.filter((_, i) => i !== k) }))}>Remove</button>}
        </div>
      ))}
      {!locked && <button className="btn quiet sm" onClick={() => setP((s) => ({ ...s, items: [...s.items, { label: '', amount: '' }] }))}>Add a line</button>}
      <div className="vrow" style={{ marginTop: 8 }}><span className="lbl">Total</span><span className="mono">{usd(total)}</span></div>
      <Field label="Timeline"><input className="input" style={{ width: '100%' }} disabled={locked} value={p.timeline || ''} onChange={(e) => setP({ ...p, timeline: e.target.value })} placeholder="e.g. Directions in 2 business days, final within a week of your pick" /></Field>
      <Field label="Terms"><input className="input" style={{ width: '100%' }} disabled={locked} value={p.terms || ''} onChange={(e) => setP({ ...p, terms: e.target.value })} /></Field>
      <Field label="Payment">
        <select className="input" disabled={locked} value={p.billing} onChange={(e) => setP({ ...p, billing: e.target.value })}>
          <option value="split">50% deposit on accepting, 50% on approval</option>
          <option value="end">All at the end, on approval</option>
        </select>
      </Field>
      {!locked && (
        <div className="row" style={{ gap: 8, flexWrap: 'wrap' }}>
          <button className="btn ghost sm" onClick={() => save().catch((e) => setMsg(e.message))}>Save</button>
          <button className="btn sm" disabled={!(total > 0)} onClick={() => save().then(() => compose('proposal')).catch((e) => setMsg(e.message))}>{proposal && proposal.status === 'sent' ? 'Save and resend' : 'Save and email it'}</button>
          {!(proposal && proposal.status === 'sent') && <button className="btn quiet sm" disabled={!(total > 0)} onClick={markSent} title="Shared it another way? Make it acceptable on their page without an email.">Mark as sent</button>}
          {msg && <span className="sub">{msg}</span>}
        </div>
      )}
      {locked && <p className="sub">Accepted {fdate(proposal.accepted_at)}. {proposal.billing === 'split' ? 'Deposit invoice created.' : 'Paid in full on approval.'}</p>}
    </section>
  );
}

function FilesPanel({ job, kind, files, reload, compose }) {
  const [label, setLabel] = React.useState('');
  const [link, setLink] = React.useState('');
  const [busy, setBusy] = React.useState(false);
  const [msg, setMsg] = React.useState('');
  const fileRef = React.useRef(null);
  const round = kind === 'final' ? job.revisions_used + 1 : 1;
  const mine = files.filter((f) => f.kind === kind);
  const add = async () => {
    setMsg(''); setBusy(true);
    try {
      const chosen = Array.from((fileRef.current && fileRef.current.files) || []);
      for (const file of chosen) await uploadJobFile(job.id, file, { kind, round, label: chosen.length === 1 && label ? label : file.name });
      if (link.trim()) await jobAction(job.id, 'add-file', { kind, round, label: label || link.trim(), url: link.trim() });
      if (!chosen.length && !link.trim()) { setMsg('Choose a file or paste a link.'); return; }
      setLabel(''); setLink(''); if (fileRef.current) fileRef.current.value = '';
      reload();
    } catch (e) { setMsg(e.message); } finally { setBusy(false); }
  };
  const remove = (f) => jobAction(job.id, 'remove-file', { file_id: f.id }).then(reload).catch((e) => setMsg(e.message));
  const title = kind === 'final' ? 'Final' : 'Directions';
  return (
    <section className="tile">
      <div className="tilehead"><h2 className="h2">{title}</h2><span className="lbl">{kind === 'final' ? `Round ${round} · ${job.revisions_used} of ${job.revisions_included} changes used` : 'Usually three'}</span></div>
      <div className="minirows">
        {mine.map((f) => (
          <div className="minirow plain" key={f.id}>
            <span className="mtxt">{kind === 'final' ? `R${f.round} · ` : ''}{f.label || f.filename || f.url}{job.picked_file_id === f.id ? ' · picked' : ''}{f.url ? ' (link)' : ''}</span>
            <button className="btn quiet sm" onClick={() => remove(f)}>Remove</button>
          </div>
        ))}
        {!mine.length && <p className="sub">Nothing added yet.</p>}
      </div>
      <div className="formgrid" style={{ marginTop: 10 }}>
        <input className="input" placeholder="Label (optional), e.g. Direction A: bold" value={label} onChange={(e) => setLabel(e.target.value)} />
        <input className="input" placeholder="Or paste a link (Canva, Figma, Drive)" value={link} onChange={(e) => setLink(e.target.value)} />
        <input ref={fileRef} className="input" type="file" multiple />
        <div className="row" style={{ gap: 8, flexWrap: 'wrap' }}>
          <button className="btn ghost sm" disabled={busy} onClick={add}>{busy ? 'Adding…' : 'Add'}</button>
          <button className="btn sm" disabled={!mine.length} onClick={() => compose(kind === 'final' ? 'final' : 'drafts')}>{kind === 'final' ? 'Email: final ready' : 'Email: directions ready'}</button>
        </div>
      </div>
      {msg && <p className="sub" style={{ marginTop: 6, color: 'var(--warn)' }}>{msg}</p>}
    </section>
  );
}

// A dialog: dark backdrop, a framed panel, Esc and a click outside close it.
function Modal({ title, sub, onClose, children, foot, wide }) {
  React.useEffect(() => {
    const k = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', k);
    const prev = document.body.style.overflow; document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', k); document.body.style.overflow = prev; };
  }, [onClose]);
  return ReactDOM.createPortal(
    <div className="modal-back" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className={'modal' + (wide ? ' wide' : '')} role="dialog" aria-modal="true" aria-label={title}>
        <div className="modal-h">
          <div><h2 className="h2">{title}</h2>{sub && <p className="sub">{sub}</p>}</div>
          <button className="btn quiet sm" onClick={onClose} aria-label="Close">Close</button>
        </div>
        <div className="modal-b">{children}</div>
        {foot && <div className="modal-f">{foot}</div>}
      </div>
    </div>,
    document.body
  );
}

// The email exactly as it will be sent: the server renders it with the real
// frame (lib/mail.js) and it shows here in an iframe. With no job it shows
// made-up details.
function EmailPreview({ jobId, kind, heading, body, button, buttonLabel, subject }) {
  const [html, setHtml] = React.useState('');
  const [err, setErr] = React.useState('');
  React.useEffect(() => {
    let live = true;
    const t = setTimeout(() => {
      jobAction(jobId || null, 'preview', { kind, heading, body, button: !!button, button_label: buttonLabel })
        .then((r) => { if (live) { setHtml(r.html); setErr(''); } })
        .catch((e) => { if (live) setErr(e.message); });
    }, 250);
    return () => { live = false; clearTimeout(t); };
  }, [jobId, kind, heading, body, button, buttonLabel]);
  return (
    <div className="mail-prev" aria-label="Email preview">
      {subject != null && <div className="mp-subj"><span>Subject</span>{subject || '(no subject)'}</div>}
      {err ? <p className="sub" style={{ color: 'var(--warn)' }}>The preview did not load: {err}</p> : null}
      <iframe title="Email preview" className="mp-frame" srcDoc={html} sandbox="" style={{ width: '100%', height: 760, border: 0, borderRadius: 6, background: '#0f0a06' }} />
    </div>
  );
}

function Composer({ job, proposal, invoices, kind, onClose, onSent }) {
  const f = fieldsFor(job, proposal, invoices);
  const make = (nk) => { const t = TEMPLATES[nk] || TEMPLATES.note; return { subject: fill(t.subject, f), heading: fill(t.heading, f), body: fill(t.body, f), button: true, button_label: t.button }; };
  const [k, setK] = React.useState(TEMPLATES[kind] ? kind : 'note');
  const [m, setM] = React.useState(() => make(TEMPLATES[kind] ? kind : 'note'));
  const [busy, setBusy] = React.useState('');
  const [res, setRes] = React.useState(null);
  const [view, setView] = React.useState('edit');
  const [done, setDone] = React.useState(false);
  const pick = (nk) => { setK(nk); setM(make(nk)); setRes(null); };
  const canSend = !!job.email && m.subject.trim() && m.body.trim() && !busy && !done;
  const send = (test) => {
    setBusy(test ? 'test' : 'send'); setRes(null);
    jobAction(job.id, 'send', { kind: k, subject: m.subject, heading: m.heading, body: m.body, button: m.button, button_label: m.button_label, test })
      .then(() => { setRes({ ok: true, text: test ? 'A test went to your own inbox.' : 'Sent to ' + job.email + '.' }); if (!test) { setDone(true); setTimeout(onSent, 900); } })
      .catch((e) => setRes({ ok: false, text: e.message })).finally(() => setBusy(''));
  };
  const moves = { proposal: 'proposed', drafts: 'drafts', final: 'final' }[k];
  return (
    <Modal wide title={'Email ' + job.name} onClose={onClose}
      sub="Sent from The Scaffold's email, with a button to their project page, and logged on the job. Replies come to you. Words in {braces} fill in from the job."
      foot={<React.Fragment>
        <span className={'cmp-res' + (res && !res.ok ? ' bad' : '')} role="status">{res ? res.text : moves ? 'Sending moves the job to ' + STAGE_LABEL[moves] + '.' : ''}</span>
        <button className="btn ghost sm" onClick={() => send(true)} disabled={!!busy || done || !m.body.trim()}>{busy === 'test' ? 'Sending…' : 'Send a test to me'}</button>
        <button className="btn sm" onClick={() => send(false)} disabled={!canSend}>{busy === 'send' ? 'Sending…' : done ? 'Sent' : 'Send'}</button>
      </React.Fragment>}>
      <div className="cmp-tabs" role="tablist"><button role="tab" aria-selected={view === 'edit'} className={view === 'edit' ? 'on' : ''} onClick={() => setView('edit')}>Write</button><button role="tab" aria-selected={view === 'preview'} className={view === 'preview' ? 'on' : ''} onClick={() => setView('preview')}>Preview</button></div>
      <div className="cmp">
        <div className={'cmp-form' + (view === 'edit' ? ' show' : '')}>
          <div className="chips" role="group" aria-label="Template">
            {Object.entries(TEMPLATES).map(([id, t]) => <button key={id} type="button" className={'chip' + (k === id ? ' on' : '')} aria-pressed={k === id} onClick={() => pick(id)}>{t.label}</button>)}
          </div>
          <Field label="To"><input className="input" value={job.email || 'No email on this job'} disabled /></Field>
          <Field label="Subject"><input className="input" value={m.subject} onChange={(e) => setM({ ...m, subject: e.target.value })} disabled={done} /></Field>
          <Field label="Heading"><input className="input" value={m.heading} onChange={(e) => setM({ ...m, heading: e.target.value })} disabled={done} /></Field>
          <Field label="Message"><textarea className="input" rows={9} style={{ resize: 'vertical', lineHeight: 1.5 }} value={m.body} onChange={(e) => setM({ ...m, body: e.target.value })} disabled={done} /></Field>
          <label className="cmp-btnrow">
            <input type="checkbox" checked={m.button} onChange={(e) => setM({ ...m, button: e.target.checked })} /> <span>Button to their project page</span>
            <input className="input" value={m.button_label} disabled={!m.button} onChange={(e) => setM({ ...m, button_label: e.target.value })} aria-label="Button label" />
          </label>
          {!job.email && <p className="sub" style={{ color: 'var(--warn)' }}>Add an email to this job to send. You can still send a test to yourself.</p>}
        </div>
        <div className={'cmp-prev' + (view === 'preview' ? ' show' : '')}>
          <EmailPreview jobId={job.id} kind={k} subject={m.subject} heading={m.heading} body={m.body} button={m.button} buttonLabel={m.button_label} />
        </div>
      </div>
    </Modal>
  );
}

function JobPage({ jobId, data, reload, back }) {
  const job = data.jobs.find((j) => j.id === jobId);
  const [files, setFiles] = React.useState([]);
  const [events, setEvents] = React.useState([]);
  const [compose, setCompose] = React.useState(null);
  const [note, setNote] = React.useState('');
  const [copied, setCopied] = React.useState(false);
  const loadMine = React.useCallback(() => {
    fetchJobFiles(jobId).then(setFiles).catch(() => {});
    fetchJobEvents(jobId).then(setEvents).catch(() => {});
  }, [jobId]);
  React.useEffect(loadMine, [loadMine]);
  if (!job) return <p className="sub">That job is not here. <button className="btn quiet sm" onClick={back}>Back to Jobs</button></p>;
  const proposal = data.proposals.find((p) => p.job_id === job.id);
  const invoices = data.invoices.filter((i) => i.job_id === job.id);
  const refresh = () => { reload(); loadMine(); };
  const copy = () => { navigator.clipboard && navigator.clipboard.writeText(JOB_URL(job.token)).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1500); }); };
  const addNote = () => { if (!note.trim()) return; saveJobEvent({ job_id: job.id, kind: 'note', who: 'me', body: note.trim() }).then(() => { setNote(''); loadMine(); }); };
  const setStage = (stage) => saveJob({ id: job.id, stage }).then(refresh);
  const markPaid = (i) => {
    if (!window.confirm(`Mark ${i.label || 'this invoice'} (${usd(i.amount)}) as paid? Its Stripe payment link will be switched off.`)) return;
    markInvoicePaid(i).then(refresh).catch((e) => alert(e.message));
  };
  // Clients are matched by id, or by email for jobs that came in as briefs.
  const matchClient = data.clients.find((c) => c.id === job.client_id)
    || (job.email ? data.clients.find((c) => c.email && c.email.toLowerCase() === job.email.toLowerCase()) : null);
  const saveAsClient = () => {
    const linkTo = matchClient
      ? Promise.resolve({ row: matchClient })
      : saveClient({ name: job.business || job.name, contact: job.business ? job.name : null, email: job.email || null, since: new Date().toISOString().slice(0, 10) });
    linkTo.then((r) => saveJob({ id: job.id, client_id: r.row.id })).then(refresh).catch((e) => alert(e.message));
  };
  return (
    <div className="stack">
      <section className="tile brief">
        <div className="between" style={{ gap: 10, flexWrap: 'wrap' }}>
          <button className="btn quiet sm" onClick={back}>All jobs</button>
          <div className="row" style={{ gap: 8, flexWrap: 'wrap' }}>
            <button className="btn ghost sm" onClick={copy}>{copied ? 'Copied' : 'Copy client link'}</button>
            <a className="btn ghost sm" href={JOB_URL(job.token)} target="_blank" rel="noopener">See their page</a>
            {!job.client_id && <button className="btn ghost sm" onClick={saveAsClient}>{matchClient ? 'Link to ' + matchClient.name : 'Save as client'}</button>}
            <button className="btn sm" onClick={() => setCompose('note')}>Email client</button>
          </div>
        </div>
        <h2 className="h2" style={{ marginTop: 12 }}>{job.title}</h2>
        <p className="sub">{job.name}{job.business ? ', ' + job.business : ''}{job.email ? ' · ' + job.email : ''} · {job.lane === 'automation' ? 'Tools' : 'Design'}{job.client_id && matchClient ? ' · client: ' + matchClient.name : ''}</p>
        <div className="row stagetrack" style={{ gap: 6, flexWrap: 'wrap', marginTop: 10 }}>
          {STAGES.map(([id, label]) => <span key={id}>{pill(label, id === job.stage ? stageKind(id) : 'mute')}</span>)}
          {job.stage === 'closed' && pill('Closed', 'bad')}
        </div>
        <div className="row" style={{ gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
          <span className="sub">Move by hand:</span>
          <select className="input" value={job.stage} onChange={(e) => setStage(e.target.value)}>
            {[...STAGES, ['closed', 'Closed (dropped)']].map(([id, label]) => <option key={id} value={id}>{label}</option>)}
          </select>
        </div>
      </section>
      {compose && <Composer job={job} proposal={proposal} invoices={data.invoices} kind={compose} onClose={() => setCompose(null)} onSent={() => { setCompose(null); refresh(); }} />}
      <BriefPanel job={job} briefs={data.briefs} reload={refresh} />
      <ProposalPanel job={job} proposal={proposal} reload={refresh} compose={setCompose} />
      <FilesPanel job={job} kind="draft" files={files} reload={loadMine} compose={setCompose} />
      <FilesPanel job={job} kind="final" files={files} reload={loadMine} compose={setCompose} />
      <section className="tile">
        <div className="tilehead"><h2 className="h2">Invoices</h2><span className="lbl">{job.billing === 'end' ? 'All at the end' : '50% deposit, 50% on approval'}</span></div>
        <div className="minirows">
          {invoices.map((i) => (
            <div className="minirow plain" key={i.id}>
              <span className="mtxt">{i.label || 'Invoice'} · {usd(i.amount)}</span>
              <span className="row" style={{ gap: 8 }}>{pill(i.status, i.status === 'paid' ? 'ok' : 'warn')}{i.status !== 'paid' && <button className="btn quiet sm" onClick={() => markPaid(i)}>Mark paid</button>}</span>
            </div>
          ))}
          {!invoices.length && <p className="sub">Invoices appear here when the client accepts (the deposit) and approves (the rest).</p>}
        </div>
        {invoices.some((i) => i.status === 'sent') && <button className="btn ghost sm" style={{ marginTop: 8 }} onClick={() => setCompose('invoice')}>Email: invoice ready</button>}
      </section>
      <section className="tile">
        <div className="tilehead"><h2 className="h2">History</h2></div>
        <div className="row" style={{ gap: 8, marginBottom: 10 }}>
          <input className="input" style={{ flex: 1 }} placeholder="Add a note (only you see it)" value={note} onChange={(e) => setNote(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') addNote(); }} />
          <button className="btn ghost sm" onClick={addNote}>Add</button>
        </div>
        <div className="minirows">
          {events.map((e) => (
            <div className="minirow plain" key={e.id} style={{ alignItems: 'flex-start' }}>
              <span className="mtxt" style={{ whiteSpace: 'pre-wrap' }}><b>{e.who === 'client' ? job.name.split(' ')[0] : e.who === 'me' ? 'You' : 'System'}</b> · {e.kind}{e.body ? ': ' + e.body.slice(0, 400) : ''}</span>
              <span className="mono mval">{fdate(e.created_at)}</span>
            </div>
          ))}
          {!events.length && <p className="sub">Nothing yet.</p>}
        </div>
      </section>
    </div>
  );
}

// ── Proposals, Mail, Money, Clients ────────────────────────────────────
function Proposals({ data, open }) {
  const jobOf = (id) => data.jobs.find((j) => j.id === id);
  return (
    <section className="card">
      <div className="pad" style={{ borderBottom: '1px solid var(--line)' }}><h2 className="h2">Proposals</h2></div>
      <div className="scroll-x"><table>
        <thead><tr><th>Job</th><th>Total</th><th>Payment</th><th>Status</th><th>Sent</th></tr></thead>
        <tbody>
          {data.proposals.map((p) => {
            const j = jobOf(p.job_id);
            return (
              <tr key={p.id} style={{ cursor: 'pointer' }} onClick={() => j && open(j.id)}>
                <td style={{ color: 'var(--text)' }}>{j ? j.title : '—'}</td><td className="mono">{usd(p.total)}</td>
                <td>{p.billing === 'end' ? 'At the end' : '50/50'}</td>
                <td>{pill(p.status, p.status === 'accepted' ? 'ok' : p.status === 'sent' ? 'warn' : 'mute')}</td>
                <td className="mono">{fdate(p.sent_at)}{p.status === 'sent' && daysSince(p.sent_at) >= 5 ? ' · ' + daysSince(p.sent_at) + 'd' : ''}</td>
              </tr>
            );
          })}
        </tbody>
      </table></div>
      {!data.proposals.length && <p className="sub pad">No proposals yet. Write one from a job's page.</p>}
    </section>
  );
}

function Mail({ data, open }) {
  const [view, setView] = React.useState(null);
  const sent = data.events.filter((e) => e.kind === 'email');
  const jobOf = (id) => data.jobs.find((j) => j.id === id);
  return (
    <div className="stack">
      <section className="card">
        <div className="pad" style={{ borderBottom: '1px solid var(--line)' }}><h2 className="h2">Sent</h2></div>
        <div className="minirows pad">
          {sent.map((e) => (
            <button key={e.id} className="minirow plain" style={{ width: '100%', textAlign: 'left', cursor: 'pointer', background: 'none', border: 0 }} onClick={() => open(e.job_id)}>
              <span className="mtxt"><b>{jobOf(e.job_id) ? jobOf(e.job_id).name : 'Client'}</b> · {String(e.body || '').split('\n')[0]}</span>
              <span className="mono mval">{fdate(e.created_at)}</span>
            </button>
          ))}
          {!sent.length && <p className="sub">Nothing sent yet. Emails go out from each job's page.</p>}
        </div>
      </section>
      <section>
        <div className="widget-h" style={{ borderBottom: 0, paddingBottom: 4 }}><h2 className="h2">Templates</h2><span className="widget-b">{Object.keys(TEMPLATES).length} ready</span></div>
        <p className="sub" style={{ marginBottom: 14 }}>Click one to read the whole email as your client will see it. Each starts the message on a job's page, where you can change anything before sending.</p>
        <div className="tplgrid">
          {Object.entries(TEMPLATES).map(([id, t]) => (
            <button key={id} type="button" className="tplcard" onClick={() => setView(id)}>
              <span className="tpl-name">{t.label}</span>
              <span className="tpl-subj">{fill(t.subject, SAMPLE_FIELDS)}</span>
              <span className="tpl-snip">{fill(t.body, SAMPLE_FIELDS).split('\n').filter(Boolean).slice(1, 2).join(' ')}</span>
              <span className="tpl-when">{t.when}</span>
            </button>
          ))}
        </div>
      </section>
      {view && (() => { const t = TEMPLATES[view]; return (
        <Modal title={t.label} sub={t.when} onClose={() => setView(null)}
          foot={<span className="cmp-res">Shown with made-up details. On a job, your client's own details fill in.</span>}>
          <EmailPreview kind={view} subject={fill(t.subject, SAMPLE_FIELDS)} heading={fill(t.heading, SAMPLE_FIELDS)} body={fill(t.body, SAMPLE_FIELDS)} button buttonLabel={t.button} />
          <details className="tpl-raw"><summary>The template text</summary><p>Subject: {t.subject}</p>{t.heading ? <p>Heading: {t.heading}</p> : null}<pre>{t.body}</pre></details>
        </Modal>); })()}
    </div>
  );
}

function Money({ data, open, reload }) {
  const jobOf = (id) => data.jobs.find((j) => j.id === id);
  const due = data.invoices.filter((i) => i.status === 'sent');
  const markPaid = (i) => {
    if (!window.confirm(`Mark ${i.label || 'this invoice'} (${usd(i.amount)}) as paid? Its Stripe payment link will be switched off.`)) return;
    markInvoicePaid(i).then(reload).catch((e) => alert(e.message));
  };
  return (
    <div className="stack">
      <div className="hgrid">
        <div className="tile"><div className="tilehead"><h2 className="h2">Due</h2></div><div className="bigline"><span className="big mono">{usd(due.reduce((a, i) => a + Number(i.amount || 0), 0))}</span></div></div>
        <div className="tile"><div className="tilehead"><h2 className="h2">Paid, all time</h2></div><div className="bigline"><span className="big mono">{usd(data.invoices.filter((i) => i.status === 'paid').reduce((a, i) => a + Number(i.amount || 0), 0))}</span></div></div>
      </div>
      <section className="card">
        <div className="pad" style={{ borderBottom: '1px solid var(--line)' }}><h2 className="h2">Invoices</h2></div>
        <div className="scroll-x"><table>
          <thead><tr><th>Job</th><th>What</th><th>Amount</th><th>Status</th><th>Paid</th><th></th></tr></thead>
          <tbody>
            {data.invoices.map((i) => (
              <tr key={i.id}>
                <td style={{ color: 'var(--text)', cursor: 'pointer' }} onClick={() => i.job_id && open(i.job_id)}>{jobOf(i.job_id) ? jobOf(i.job_id).title : '—'}</td>
                <td>{i.label || 'Invoice'}</td><td className="mono">{usd(i.amount)}</td>
                <td>{pill(i.status === 'sent' && daysSince(i.sent_at) >= 14 ? 'overdue' : i.status, i.status === 'paid' ? 'ok' : daysSince(i.sent_at) >= 14 ? 'bad' : 'warn')}</td>
                <td className="mono">{fdate(i.paid_at)}</td>
                <td>{i.status === 'sent' && <button className="btn quiet sm" onClick={() => markPaid(i)}>Mark paid</button>}</td>
              </tr>
            ))}
          </tbody>
        </table></div>
        {!data.invoices.length && <p className="sub pad">No invoices yet. They are made when a client accepts a proposal (the deposit) and approves the final.</p>}
      </section>
    </div>
  );
}

function Clients({ data, reload, open }) {
  const [sel, setSel] = React.useState(null);
  const [q, setQ] = React.useState('');
  const [adding, setAdding] = React.useState(false);
  const [f, setF] = React.useState({ name: '', email: '', notes: '' });
  const [err, setErr] = React.useState('');
  // Jobs match a client by email, since a brief arrives before anyone is "a client".
  const jobsOf = (c) => data.jobs.filter((j) => j.client_id === c.id || (c.email && j.email && j.email.toLowerCase() === c.email.toLowerCase()));
  const statsOf = (c) => {
    const jobs = jobsOf(c), ids = new Set(jobs.map((j) => j.id));
    const inv = data.invoices.filter((i) => ids.has(i.job_id));
    const sum = (st) => inv.filter((i) => i.status === st).reduce((a, i) => a + Number(i.amount || 0), 0);
    const last = [...jobs.map((j) => j.last_activity_at), ...inv.map((i) => i.paid_at || i.sent_at)].filter(Boolean).sort().pop();
    return { jobs, inv, openJobs: jobs.filter((j) => j.stage !== 'paid' && j.stage !== 'closed').length, paid: sum('paid'), due: sum('sent'), last };
  };
  const create = () => {
    if (!f.name.trim()) { setErr('Add a name.'); return; }
    saveClient({ name: f.name.trim(), email: f.email.trim() || null, notes: f.notes.trim() || null, since: new Date().toISOString().slice(0, 10) })
      .then(() => { setF({ name: '', email: '', notes: '' }); setAdding(false); setErr(''); reload(); })
      .catch((e) => setErr(e.message));
  };
  const client = data.clients.find((c) => c.id === sel);
  if (client) return <ClientPage key={client.id} client={client} stats={statsOf(client)} data={data} open={open} reload={reload} back={() => setSel(null)} gone={() => { setSel(null); reload(); }} />;

  const rows = data.clients.map((c) => ({ c, s: statsOf(c) }))
    .filter(({ c }) => !q.trim() || (c.name + ' ' + (c.email || '')).toLowerCase().includes(q.trim().toLowerCase()));
  const all = data.clients.map(statsOf);
  const total = all.reduce((a, s) => a + s.paid, 0), owed = all.reduce((a, s) => a + s.due, 0);
  return (
    <div className="stack">
      <div className="dash-h">
        <div><h1 className="h1">Clients</h1><p className="sub">The people you work for, with their jobs and money in one place.</p></div>
        <button className="btn" onClick={() => setAdding(!adding)}>{adding ? 'Close' : 'Add client'}</button>
      </div>
      {adding && (
        <section className="widget">
          <div className="formgrid">
            <input className="input" placeholder="Name or business" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} autoFocus />
            <input className="input" placeholder="Email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} />
            <input className="input" placeholder="A note (optional)" value={f.notes} onChange={(e) => setF({ ...f, notes: e.target.value })} />
            {err && <p className="sub" style={{ color: 'var(--warn)' }}>{err}</p>}
            <div><button className="btn sm" onClick={create}>Save client</button></div>
          </div>
        </section>
      )}
      <div className="dkpis four">
        <div className="dkpi static"><span className="dkpi-l">Clients</span><span className="dkpi-v mono">{data.clients.length}</span><span className="dkpi-n">{all.filter((s) => s.openJobs).length} with open work</span></div>
        <div className="dkpi static"><span className="dkpi-l">Open jobs</span><span className="dkpi-v mono">{all.reduce((a, s) => a + s.openJobs, 0)}</span><span className="dkpi-n">across all clients</span></div>
        <div className="dkpi static"><span className="dkpi-l">Paid, all time</span><span className="dkpi-v mono">{usd(total)}</span><span className="dkpi-n">no card fees</span></div>
        <div className="dkpi static"><span className="dkpi-l">Owed to you</span><span className="dkpi-v mono">{usd(owed)}</span><span className="dkpi-n">invoices sent</span></div>
      </div>
      {data.clients.length > 0 && <input className="input" placeholder="Search clients" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search clients" style={{ maxWidth: 360 }} />}
      {rows.length > 0 ? (
        <div className="widget" style={{ padding: '4px 18px 6px' }}>
          <div className="scroll-x"><table className="ctable">
            <thead><tr><th>Client</th><th>Jobs</th><th>Paid</th><th>Owed</th><th>Last activity</th></tr></thead>
            <tbody>
              {rows.map(({ c, s }) => (
                <tr key={c.id} tabIndex={0} onClick={() => setSel(c.id)} onKeyDown={(e) => { if (e.key === 'Enter') setSel(c.id); }}>
                  <td><b>{c.name}</b><div className="sub">{c.email || 'No email'}</div></td>
                  <td className="mono">{s.jobs.length}{s.openJobs ? <span className="sub"> · {s.openJobs} open</span> : null}</td>
                  <td className="mono">{usd(s.paid)}</td>
                  <td className="mono" style={s.due ? { color: 'var(--accent-lit)' } : undefined}>{s.due ? usd(s.due) : '—'}</td>
                  <td className="sub">{s.last ? relTime(s.last) + ' ago' : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table></div>
        </div>
      ) : (
        <p className="sub">{data.clients.length ? 'No client matches that search.' : 'No clients yet. Add one here, or press Save as client on a job.'}</p>
      )}
    </div>
  );
}

function ClientPage({ client, stats, data, open, reload, back, gone }) {
  const [tab, setTab] = React.useState('overview');
  const [notes, setNotes] = React.useState(client.notes || '');
  const [saved, setSaved] = React.useState(false);
  const [confirm, setConfirm] = React.useState(false);
  const [compose, setCompose] = React.useState(false);
  const latest = stats.jobs[0];
  const ids = new Set(stats.jobs.map((j) => j.id));
  const events = data.events.filter((e) => ids.has(e.job_id) && EVENT_TEXT[e.kind]).slice(0, 12);
  const titleOf = (id) => (stats.jobs.find((j) => j.id === id) || {}).title || 'Job';
  const saveNotes = () => saveClient({ id: client.id, notes: notes.trim() || null }).then(() => { setSaved(true); reload(); setTimeout(() => setSaved(false), 2000); }).catch(() => {});
  const remove = () => deleteClient(client.id).then(gone).catch(() => setConfirm(false));
  const TABS = [['overview', 'Overview'], ['jobs', 'Jobs (' + stats.jobs.length + ')'], ['money', 'Money'], ['activity', 'Activity']];
  return (
    <div className="stack">
      <button className="btn quiet sm" style={{ alignSelf: 'flex-start' }} onClick={back}>All clients</button>
      {compose && latest && <Composer job={latest} proposal={data.proposals.find((x) => x.job_id === latest.id)} invoices={data.invoices} kind="reminder" onClose={() => setCompose(false)} onSent={() => { setCompose(false); reload(); }} />}
      <div className="dash-h">
        <div>
          <h1 className="h1">{client.name}</h1>
          <p className="sub">{client.email || 'No email yet'}{client.since ? ' · client since ' + new Date(client.since + 'T12:00:00').toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : ''}</p>
        </div>
        {stats.jobs.length ? <button className="btn ghost" onClick={() => setCompose(true)}>Email {client.name.split(' ')[0]}</button> : client.email ? <a className="btn ghost" href={'mailto:' + client.email}>Email {client.name.split(' ')[0]}</a> : null}
      </div>
      <div className="ctabs" role="tablist">
        {TABS.map(([id, label]) => <button key={id} role="tab" aria-selected={tab === id} className={tab === id ? 'on' : ''} onClick={() => setTab(id)}>{label}</button>)}
      </div>
      <div key={tab} className="ctab-body">
        {tab === 'overview' && (
          <div className="dash-g">
            <Widget title="Lifetime">
              <div className="vrow"><span className="lbl">Paid</span><span className="mono">{usd(stats.paid)}</span></div>
              <div className="vrow"><span className="lbl">Owed</span><span className="mono">{usd(stats.due)}</span></div>
              <div className="vrow"><span className="lbl">Jobs</span><span className="mono">{stats.jobs.length} · {stats.openJobs} open</span></div>
              <div className="vrow"><span className="lbl">Last activity</span><span className="mono">{stats.last ? relTime(stats.last) + ' ago' : '—'}</span></div>
            </Widget>
            <Widget title="Notes">
              <textarea className="input" rows={5} value={notes} onChange={(e) => { setNotes(e.target.value); setSaved(false); }} placeholder="Anything worth remembering about this client" style={{ resize: 'vertical' }} />
              <div className="between" style={{ padding: '10px 0 6px' }}>
                <button className="btn sm" onClick={saveNotes} disabled={notes === (client.notes || '')}>Save notes</button>
                {saved && <span className="sub" role="status">Saved</span>}
              </div>
            </Widget>
            <Widget title="Recent activity" badge={events.length ? 'latest' : null}>
              <div className="minirows">
                {events.slice(0, 5).map((e) => <div key={e.id} className="minirow"><span className="mtxt"><b>{titleOf(e.job_id)}</b> · {EVENT_TEXT[e.kind]}</span><span className="mono mval">{relTime(e.created_at)}</span></div>)}
                {!events.length && <p className="sub" style={{ padding: '10px 0' }}>Nothing yet.</p>}
              </div>
            </Widget>
            <Widget title="Open jobs">
              <div className="minirows">
                {stats.jobs.filter((j) => j.stage !== 'paid' && j.stage !== 'closed').map((j) => (
                  <button key={j.id} className="minirow plain" style={{ width: '100%', textAlign: 'left', cursor: 'pointer', background: 'none', border: 0 }} onClick={() => open(j.id)}>
                    <span className="mtxt">{j.title}</span>{pill(STAGE_LABEL[j.stage], stageKind(j.stage))}
                  </button>
                ))}
                {!stats.openJobs && <p className="sub" style={{ padding: '10px 0' }}>No open work.</p>}
              </div>
            </Widget>
          </div>
        )}
        {tab === 'jobs' && (
          <div className="widget" style={{ padding: '4px 18px 6px' }}>
            {stats.jobs.length ? <div className="minirows">{stats.jobs.map((j) => (
              <button key={j.id} className="minirow plain" style={{ width: '100%', textAlign: 'left', cursor: 'pointer', background: 'none', border: 0 }} onClick={() => open(j.id)}>
                <span className="mtxt"><b>{j.title}</b><span className="sub"> · {relTime(j.last_activity_at)} ago</span></span>{pill(STAGE_LABEL[j.stage], stageKind(j.stage))}
              </button>
            ))}</div> : <p className="sub" style={{ padding: '12px 0' }}>No jobs yet.</p>}
          </div>
        )}
        {tab === 'money' && (
          <div className="widget" style={{ padding: '4px 18px 6px' }}>
            {stats.inv.length ? <div className="scroll-x"><table className="ctable"><thead><tr><th>Invoice</th><th>Amount</th><th>Status</th></tr></thead><tbody>
              {stats.inv.map((i) => <tr key={i.id} onClick={() => open(i.job_id)}><td><b>{titleOf(i.job_id)}</b><div className="sub">{i.label || 'Invoice'}</div></td><td className="mono">{usd(i.amount)}</td><td>{pill(i.status === 'paid' ? 'Paid' : i.status === 'sent' ? 'Sent' : i.status, i.status === 'paid' ? 'ok' : 'warn')}</td></tr>)}
            </tbody></table></div> : <p className="sub" style={{ padding: '12px 0' }}>No invoices yet. They are made when this client accepts or approves.</p>}
          </div>
        )}
        {tab === 'activity' && (
          <div className="widget" style={{ padding: '4px 18px 6px' }}>
            <div className="minirows">
              {events.map((e) => <div key={e.id} className="minirow"><span className="mtxt"><b>{titleOf(e.job_id)}</b> · {EVENT_TEXT[e.kind]}</span><span className="mono mval">{relTime(e.created_at)}</span></div>)}
              {!events.length && <p className="sub" style={{ padding: '12px 0' }}>Nothing yet.</p>}
            </div>
          </div>
        )}
      </div>
      <div style={{ paddingTop: 8 }}>
        {confirm
          ? <div className="row"><span className="sub">Remove {client.name}? Their jobs stay.</span><button className="btn sm ghost" onClick={remove}>Yes, remove</button><button className="btn sm quiet" onClick={() => setConfirm(false)}>Keep</button></div>
          : <button className="btn sm quiet" onClick={() => setConfirm(true)}>Remove client</button>}
      </div>
    </div>
  );
}

// ── The hub ────────────────────────────────────────────────────────────
function BusinessHub() {
  // The address holds the view (#jobs, #money, #job=<id>) so a reload or a
  // pasted link lands in the same place.
  // Today is home. (The old ring launcher is gone; an old #ring link lands on Today.)
  const TABS = ['today', 'jobs', 'proposals', 'mail', 'money', 'clients'];
  const fromHash = () => {
    const id = (location.hash.match(/job=([0-9a-f-]{36})/) || [])[1] || null;
    const t = location.hash.slice(1);
    return { tab: id ? 'jobs' : (TABS.includes(t) ? t : 'today'), id };
  };
  const [tab, setTab] = React.useState(() => fromHash().tab);
  const [jobId, setJobId] = React.useState(() => fromHash().id);
  React.useEffect(() => {
    const on = () => { const h = fromHash(); setTab(h.tab); setJobId(h.id); };
    window.addEventListener('hashchange', on);
    return () => window.removeEventListener('hashchange', on);
  }, []);
  const [jobs, reloadJobs, e1] = useCollection(fetchJobs);
  const [proposals, reloadProposals, e2] = useCollection(fetchProposals);
  const [invoices, reloadInvoices, e3] = useCollection(fetchInvoices);
  const [clients, reloadClients, e4] = useCollection(fetchClients);
  const [briefs, reloadBriefs, e5] = useCollection(fetchDesignBriefs);
  const [events, reloadEvents, e6] = useCollection(fetchAllEvents);
  const error = e1 || e2 || e3 || e4 || e5 || e6;
  const loading = [jobs, proposals, invoices, clients, briefs, events].some((r) => r === null);
  const reloadAll = () => { reloadJobs(); reloadProposals(); reloadInvoices(); reloadClients(); reloadBriefs(); reloadEvents(); };
  const data = loading ? null : { jobs, proposals, invoices, clients, briefs, events, needs: needsYou(jobs, proposals, invoices, briefs, events) };
  const [startNew, setStartNew] = React.useState(false);
  const go = (t, opts) => { setTab(t); setJobId(null); setStartNew(!!(opts && opts.newJob)); history.replaceState(null, '', '#' + t); };
  const open = (id) => { setTab('jobs'); setJobId(id); history.replaceState(null, '', '#job=' + id); window.scrollTo(0, 0); };

  return (
    <React.Fragment>
      <div className="room" aria-hidden="true">
        <div className="amb"><i className="a1" /><i className="a2" /><i className="a3" /></div>
        <div className="grain" />
      </div>
      <header className="top">
        <div className="topin">
          {jobId
            ? <a className="backlink" href="#jobs" onClick={(e) => { e.preventDefault(); go('jobs'); }}><i aria-hidden="true">←</i> Jobs</a>
            : <a className="backlink" href="/backroom"><i aria-hidden="true">←</i> Backroom</a>}
          <a className="mark" href="/backroom"><img src="assets/antler.png" alt="" /><div><b>Business Hub</b><span>The Backroom</span></div></a>
          <nav className="topnav">
            <a className="navhome" href="#today" onClick={(e) => { e.preventDefault(); go('today'); }} style={tab === 'today' && !jobId ? { color: 'var(--text)' } : undefined}>Today</a>
            <a href="/docket">Docket</a>
          </nav>
        </div>
      </header>
      <div className="shell">
        {data && <ToolSidebar tab={tab} go={go} data={data} />}
        <main id="app" key={tab + (jobId || '')}>
          {error && <p className="sub" style={{ padding: '20px 2px', color: 'var(--warn)' }}>{error} If this is the first run, the workflow tables may not be set up yet.</p>}
          {!error && loading && <p className="sub" style={{ padding: '20px 2px' }}>Loading…</p>}
          {data && (
            <React.Fragment>
              {tab === 'today' && <Today data={data} open={open} go={go} />}
              {tab === 'jobs' && (jobId ? <JobPage jobId={jobId} data={data} reload={reloadAll} back={() => go('jobs')} /> : <Jobs data={data} open={open} reload={reloadAll} startNew={startNew} />)}
              {tab === 'proposals' && <Proposals data={data} open={open} />}
              {tab === 'mail' && <Mail data={data} open={open} />}
              {tab === 'money' && <Money data={data} open={open} reload={reloadAll} />}
              {tab === 'clients' && <Clients data={data} reload={reloadClients} open={open} />}
            </React.Fragment>
          )}
        </main>
      </div>
    </React.Fragment>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<BusinessHub />);
