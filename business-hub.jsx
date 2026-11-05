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
  proposal: { label: 'Proposal', subject: 'Your proposal: {title}', heading: 'Your proposal',
    body: 'Hi {first},\n\nThanks for the brief. Your proposal for {title} is ready: {total}, {billing}.\n\nOpen your project page to see what is included and the timeline, and accept it when you are happy. Any questions, just reply.\n\nCarter', button: 'See the proposal' },
  drafts: { label: 'Directions ready', subject: 'Your directions are ready: {title}', heading: 'Your directions are ready',
    body: 'Hi {first},\n\nThe first directions for {title} are ready. Have a look, pick the one you like best, and tell me anything you would change.\n\nCarter', button: 'Pick a direction' },
  final: { label: 'Final ready', subject: 'Your final is ready to review: {title}', heading: 'Your final is ready',
    body: 'Hi {first},\n\nThe finished {title} is ready to review. Approve it, or ask for changes ({left} round{leftS} of changes left).\n\nCarter', button: 'Review the final' },
  invoice: { label: 'Invoice', subject: 'Your invoice: {title}', heading: 'Your invoice is ready',
    body: 'Hi {first},\n\n{due} is ready to pay on your project page, by card or bank. Thank you.\n\nCarter', button: 'Pay now' },
  reminder: { label: 'Reminder', subject: 'A quick nudge: {title}', heading: 'A quick nudge',
    body: 'Hi {first},\n\nJust checking in on {title}. Everything is waiting on your project page whenever you are ready.\n\nCarter', button: 'Open your project page' },
  note: { label: 'Blank', subject: '{title}', heading: '', body: 'Hi {first},\n\n\n\nCarter', button: 'Open your project page' },
};

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

// ── Needs you: what is waiting on Carter, oldest first ─────────────────
function needsYou(jobs, proposals, invoices, briefs, events) {
  const out = [];
  const briefOf = (j) => briefs.find((b) => b.id === j.brief_id);
  const propOf = (j) => proposals.find((p) => p.job_id === j.id);
  const lastClient = (j) => events.find((e) => e.job_id === j.id && e.who === 'client');
  for (const j of jobs) {
    if (j.stage === 'closed' || j.stage === 'paid') continue;
    const b = briefOf(j); const p = propOf(j); const lc = lastClient(j);
    if (j.stage === 'new' && b && b.status !== 'answered' && !p) out.push({ j, what: 'Reply to the brief', age: daysSince(j.created_at), hot: true });
    else if (j.stage === 'new' && (!p || p.status === 'draft')) out.push({ j, what: 'Write and send the proposal', age: daysSince(j.created_at), hot: daysSince(j.created_at) >= 2 });
    if (j.stage === 'proposed' && p && p.status === 'sent' && daysSince(p.sent_at) >= 5) out.push({ j, what: 'Proposal waiting ' + daysSince(p.sent_at) + ' days: nudge them', age: daysSince(p.sent_at) });
    if (j.stage === 'drafts' && lc && lc.kind === 'accepted') out.push({ j, what: 'Proposal accepted: send the directions', age: daysSince(lc.created_at), hot: true });
    if (j.stage === 'drafts' && lc && lc.kind === 'picked') out.push({ j, what: 'Direction picked: make and send the final', age: daysSince(lc.created_at), hot: true });
    if (j.stage === 'final' && lc && lc.kind === 'changes') out.push({ j, what: 'Changes asked for: revise and resend', age: daysSince(lc.created_at), hot: true });
  }
  for (const i of invoices) {
    if (i.status === 'sent' && daysSince(i.sent_at) >= 14) {
      const j = jobs.find((x) => x.id === i.job_id);
      if (j) out.push({ j, what: `${i.label || 'Invoice'} unpaid ${daysSince(i.sent_at)} days: send a reminder`, age: daysSince(i.sent_at) });
    }
  }
  return out.sort((a, b) => (b.hot ? 1 : 0) - (a.hot ? 1 : 0) || b.age - a.age);
}

// ── The tool wheel ─────────────────────────────────────────────────────
const RING_NODES = [
  { id: 'today', label: 'Today', icon: 'assets/tool-brief.png', desc: 'What needs you, what just happened, money in and out.' },
  { id: 'jobs', label: 'Jobs', icon: 'assets/tool-work.png', desc: 'Every job from brief to paid, one column per stage.' },
  { id: 'proposals', label: 'Proposals', icon: 'assets/tool-vault.png', mirror: true, desc: 'Every proposal, where it stands, and what it is worth.' },
  { id: 'mail', label: 'Mail', icon: 'assets/tool-leads.png', desc: 'Everything sent to clients, and the templates behind it.' },
  { id: 'money', label: 'Money', icon: 'assets/tool-money.png', desc: 'Deposits and finals: due, paid, and what to chase.' },
  { id: 'clients', label: 'Clients', icon: 'assets/tool-acquire.png', desc: 'Who you work for and everything you have done for them.' },
];
function ringMetaOf(id, d) {
  if (id === 'today') return d.needs.length ? d.needs.length + ' need you' : 'All clear';
  if (id === 'jobs') return d.jobs.filter((j) => j.stage !== 'paid' && j.stage !== 'closed').length + ' open';
  if (id === 'proposals') return d.proposals.filter((p) => p.status === 'sent').length + ' out';
  if (id === 'mail') return d.events.filter((e) => e.kind === 'email').length + ' sent';
  if (id === 'money') return usd(d.invoices.filter((i) => i.status === 'sent').reduce((a, i) => a + Number(i.amount || 0), 0)) + ' due';
  if (id === 'clients') return d.clients.length + ' on the books';
  return '';
}
const N_RING = RING_NODES.length;
function ringNodeTransform(i, hover, radius) {
  let a = (i * (360 / N_RING) - 90) * Math.PI / 180;
  let rad = radius;
  if (hover !== null) {
    if (i === hover) rad = radius * 0.92;
    else {
      const half = N_RING / 2;
      const d = ((i - hover + half) % N_RING) - half;
      const w = 1 - Math.abs(d) / half;
      a += 16 * w * Math.sign(d || 1) * Math.PI / 180;
      rad = radius * (1 + 0.06 * w);
    }
  }
  return `translate(-50%,-50%) translate(${Math.cos(a) * rad}px,${Math.sin(a) * rad}px)`;
}

// The same cast-iron gas lamp as the portfolio and Scaffold heroes (motifs.jsx).
const HubGasLamp = window.CG_MOTIFS.GasLamp;
function Lamp({ side }) {
  const [out, setOut] = React.useState(false);
  return (
    <div className={'lamp ' + side + (out ? ' out' : '')} aria-hidden="true">
      <HubGasLamp height={640} out={out} onGlobeClick={() => setOut((o) => !o)} />
    </div>
  );
}

function Ring({ go, data }) {
  const [hover, setHover] = React.useState(null);
  const [wickHot, setWickHot] = React.useState(false);
  const orbitRef = React.useRef(null);
  const [radius, setRadius] = React.useState(220);
  React.useEffect(() => {
    const measure = () => { if (orbitRef.current) setRadius(orbitRef.current.getBoundingClientRect().width / 2); };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);
  return (
    <div className={'launch' + (hover !== null ? ' hovering' : '') + (wickHot ? ' wickhot' : '')}>
      <Lamp side="L" /><Lamp side="R" />
      <div className="rings">
        <span className="ring-outer" /><span className="ring-mid" /><span className="ring-inner" />
        <span className="ticks" /><span className="ticks-minor" /><span className="ticks-fine" />
      </div>
      <div className="spokes">
        {RING_NODES.map((_, i) => <span key={i} className={'spoke' + (hover === i ? ' lit' : '')} style={{ transform: `rotate(${i * (360 / N_RING) - 90}deg)` }} />)}
      </div>
      <div className="ldesc">{hover !== null ? RING_NODES[hover].desc : ''}</div>
      <div className="lwall" aria-hidden="true" />
      <div className="lembers" aria-hidden="true">
        <i style={{ left: '20%', '--dx': '-14px', animationDelay: '0s' }} />
        <i style={{ left: '38%', '--dx': '10px', animationDelay: '1.1s' }} />
        <i style={{ left: '52%', '--dx': '-8px', animationDelay: '2.3s' }} />
        <i style={{ left: '68%', '--dx': '16px', animationDelay: '3.4s' }} />
        <i style={{ left: '46%', '--dx': '4px', animationDelay: '4.6s' }} />
      </div>
      {/* The light bar at the wheel's centre: decoration (Wick is retired), brightens when you rest on it. */}
      <div className="lwick" aria-hidden="true" onMouseEnter={() => setWickHot(true)} onMouseLeave={() => setWickHot(false)}>
        <span className="core" />
      </div>
      <div className="orbit" ref={orbitRef}>
        {RING_NODES.map((n, i) => (
          <button key={n.id} className={'tnode' + (hover === i ? ' on' : '')}
            style={{ transform: ringNodeTransform(i, hover, radius) }}
            onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)}
            onFocus={() => setHover(i)} onBlur={() => setHover(null)}
            onClick={() => go(n.id)}>
            <span className="plate"><img src={n.icon} alt="" style={n.mirror ? { transform: 'scaleX(-1)' } : undefined} /></span>
            <span className="tbody">
              <span className="tlabel">{n.label}</span>
              <span className="tsub">{ringMetaOf(n.id, data)}</span>
              <span className="tdesc">{n.desc}</span>
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

function ToolSidebar({ tab, go, data }) {
  return (
    <nav className="tools on">
      {RING_NODES.map((n) => (
        <button key={n.id} aria-current={tab === n.id ? 'true' : undefined} onClick={() => go(n.id)}>
          <span className="tplate"><img src={n.icon} alt="" style={n.mirror ? { transform: 'scaleX(-1)' } : undefined} /></span>
          <span><span className="tname">{n.label}</span><span className="tmeta">{ringMetaOf(n.id, data)}</span></span>
        </button>
      ))}
      <button className="ring-back" onClick={() => go('ring')}><span>Ring</span></button>
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

function Kpi({ label, value, note, tone, onClick }) {
  return (
    <button type="button" className="dkpi" onClick={onClick}>
      <span className="dkpi-l">{label}</span>
      <span className="dkpi-v mono">{value}</span>
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
            <rect x={x} y={base - h} width={bw} height={h} fill={last ? '#f5cd6a' : '#d99a3d'} opacity={last ? 1 : .62} />
            {m.total > 0 && <text x={x + bw / 2} y={base - h - 6} textAnchor="middle" fontSize="11" fill="#ecd9b2">{m.total >= 1000 ? '$' + (m.total / 1000).toFixed(m.total % 1000 ? 1 : 0) + 'k' : '$' + Math.round(m.total)}</text>}
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
        <button className="btn" onClick={() => go('jobs')}>New job</button>
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
function NewJobForm({ onCreated }) {
  const [open, setOpen] = React.useState(false);
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

function Jobs({ data, open, reload }) {
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
        <div className="pad"><NewJobForm onCreated={(id) => { reload(); if (id) open(id); }} /></div>
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

function TriageCard({ b, reload }) {
  const t = b.triage || null;
  const [reply, setReply] = React.useState(t ? (t.sent_reply || t.draft_reply || '') : '');
  const [busy, setBusy] = React.useState('');
  const [msg, setMsg] = React.useState('');
  React.useEffect(() => { if (t) setReply(t.sent_reply || t.draft_reply || ''); }, [b.triaged_at]);
  const run = (action, extra) => {
    setBusy(action); setMsg('');
    briefAction(b.id, action, extra)
      .then(() => { setMsg(action === 'send' ? 'Sent.' : action === 'reject' ? 'Marked answered.' : 'Updated.'); reload(); })
      .catch((e) => setMsg(e.message)).finally(() => setBusy(''));
  };
  const decided = t && (t.status === 'sent' || t.status === 'rejected');
  return (
    <div style={{ marginTop: 14, padding: '12px 14px', border: '1px solid var(--line)' }}>
      {t ? (
        <React.Fragment>
          <div className="between" style={{ gap: 8, flexWrap: 'wrap' }}>
            <span className="lbl">AI summary · {t.scope}{t.suggested_price ? ' · ' + t.suggested_price : ''}</span>
            {pill(t.status === 'sent' ? 'reply sent' : t.status === 'rejected' ? 'no reply' : 'draft reply ready', t.status === 'pending' ? 'warn' : 'mute')}
          </div>
          <p style={{ margin: '8px 0' }}>{t.summary}</p>
          {t.missing && t.missing.length ? <p className="sub">Missing: {t.missing.join('; ')}</p> : null}
          {t.red_flags && t.red_flags.length ? <p className="sub" style={{ color: 'var(--warn)' }}>Flags: {t.red_flags.join('; ')}</p> : null}
          <textarea className="input" rows={5} style={{ width: '100%', marginTop: 8, resize: 'vertical' }} value={reply} onChange={(e) => setReply(e.target.value)} disabled={decided} />
          {!decided && (
            <div className="row" style={{ gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
              <button className="btn sm" disabled={!!busy} onClick={() => run('send', { reply })}>{busy === 'send' ? 'Sending…' : 'Send this reply'}</button>
              <button className="btn ghost sm" disabled={!!busy} onClick={() => run('triage')}>{busy === 'triage' ? 'Working…' : 'Redo the summary'}</button>
              <button className="btn quiet sm" disabled={!!busy} onClick={() => run('reject')}>No reply needed</button>
            </div>
          )}
        </React.Fragment>
      ) : (
        <div className="between" style={{ gap: 8 }}>
          <span className="sub">No AI summary yet.</span>
          <button className="btn ghost sm" disabled={!!busy} onClick={() => run('triage')}>{busy ? 'Working…' : 'Summarise the brief'}</button>
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

function Composer({ job, proposal, invoices, kind, onClose, onSent }) {
  const tpl = TEMPLATES[kind] || TEMPLATES.note;
  const f = fieldsFor(job, proposal, invoices);
  const [k, setK] = React.useState(kind);
  const [m, setM] = React.useState({ subject: fill(tpl.subject, f), heading: fill(tpl.heading, f), body: fill(tpl.body, f), button: true, button_label: tpl.button });
  const [busy, setBusy] = React.useState('');
  const [msg, setMsg] = React.useState('');
  const pick = (nk) => { const t = TEMPLATES[nk]; setK(nk); setM({ subject: fill(t.subject, f), heading: fill(t.heading, f), body: fill(t.body, f), button: true, button_label: t.button }); };
  const send = (test) => {
    setBusy(test ? 'test' : 'send'); setMsg('');
    jobAction(job.id, 'send', { kind: k, subject: m.subject, heading: m.heading, body: m.body, button: m.button, button_label: m.button_label, test })
      .then(() => { setMsg(test ? 'Test sent to you.' : 'Sent.'); if (!test) onSent(); })
      .catch((e) => setMsg(e.message)).finally(() => setBusy(''));
  };
  return (
    <section className="tile" style={{ outline: '1px solid var(--line)' }}>
      <div className="tilehead"><h2 className="h2">Email {job.name}</h2><button className="btn quiet sm" onClick={onClose}>Close</button></div>
      <Field label="Template">
        <select className="input" value={k} onChange={(e) => pick(e.target.value)}>
          {Object.entries(TEMPLATES).map(([id, t]) => <option key={id} value={id}>{t.label}</option>)}
        </select>
      </Field>
      <Field label="To"><input className="input" style={{ width: '100%' }} value={job.email || 'No email on this job'} disabled /></Field>
      <Field label="Subject"><input className="input" style={{ width: '100%' }} value={m.subject} onChange={(e) => setM({ ...m, subject: e.target.value })} /></Field>
      <Field label="Heading"><input className="input" style={{ width: '100%' }} value={m.heading} onChange={(e) => setM({ ...m, heading: e.target.value })} /></Field>
      <Field label="Message"><textarea className="input" rows={8} style={{ width: '100%', resize: 'vertical' }} value={m.body} onChange={(e) => setM({ ...m, body: e.target.value })} /></Field>
      <label className="sub" style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 10 }}>
        <input type="checkbox" checked={m.button} onChange={(e) => setM({ ...m, button: e.target.checked })} /> Button to their project page:
        <input className="input" style={{ flex: 1 }} value={m.button_label} disabled={!m.button} onChange={(e) => setM({ ...m, button_label: e.target.value })} />
      </label>
      <div className="row" style={{ gap: 8, flexWrap: 'wrap' }}>
        <button className="btn sm" disabled={!!busy} onClick={() => send(false)}>{busy === 'send' ? 'Sending…' : 'Send'}</button>
        <button className="btn ghost sm" disabled={!!busy} onClick={() => send(true)}>{busy === 'test' ? 'Sending…' : 'Send a test to me'}</button>
        {msg && <span className="sub">{msg}</span>}
      </div>
      {['proposal', 'drafts', 'final'].includes(k) && <p className="sub" style={{ marginTop: 8 }}>Sending moves the job to {STAGE_LABEL[{ proposal: 'proposed', drafts: 'drafts', final: 'final' }[k]]}.</p>}
    </section>
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
  const markPaid = (i) => saveInvoice({ id: i.id, status: 'paid', paid_at: new Date().toISOString() })
    .then(() => saveJobEvent({ job_id: job.id, kind: 'paid', who: 'me', body: `Marked ${i.label || 'invoice'} paid by hand (${usd(i.amount)}).` }))
    .then(() => { const left = invoices.filter((x) => x.id !== i.id && x.status !== 'paid'); return job.approved_at && !left.length ? saveJob({ id: job.id, stage: 'paid' }) : null; })
    .then(refresh);
  return (
    <div className="stack">
      <section className="tile brief">
        <div className="between" style={{ gap: 10, flexWrap: 'wrap' }}>
          <button className="btn quiet sm" onClick={back}>All jobs</button>
          <div className="row" style={{ gap: 8, flexWrap: 'wrap' }}>
            <button className="btn ghost sm" onClick={copy}>{copied ? 'Copied' : 'Copy client link'}</button>
            <a className="btn ghost sm" href={JOB_URL(job.token)} target="_blank" rel="noopener">See their page</a>
            <button className="btn sm" onClick={() => setCompose('note')}>Email client</button>
          </div>
        </div>
        <h2 className="h2" style={{ marginTop: 12 }}>{job.title}</h2>
        <p className="sub">{job.name}{job.business ? ', ' + job.business : ''}{job.email ? ' · ' + job.email : ''} · {job.lane === 'automation' ? 'Tools' : 'Design'}</p>
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
      <section className="card">
        <div className="pad" style={{ borderBottom: '1px solid var(--line)' }}><h2 className="h2">Templates</h2></div>
        <div className="pad">
          <p className="sub" style={{ marginBottom: 12 }}>Each starts the message on a job's page, where you can change anything before sending. Words in braces fill in from the job.</p>
          {Object.entries(TEMPLATES).map(([id, t]) => (
            <details key={id} style={{ borderTop: '1px solid var(--line)', padding: '10px 0' }}>
              <summary style={{ cursor: 'pointer' }}>{t.label}: <span className="sub">{t.subject}</span></summary>
              <p style={{ whiteSpace: 'pre-wrap', margin: '8px 0 0' }}>{t.body}</p>
            </details>
          ))}
        </div>
      </section>
    </div>
  );
}

function Money({ data, open, reload }) {
  const jobOf = (id) => data.jobs.find((j) => j.id === id);
  const due = data.invoices.filter((i) => i.status === 'sent');
  const markPaid = (i) => saveInvoice({ id: i.id, status: 'paid', paid_at: new Date().toISOString() }).then(reload);
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
  const [f, setF] = React.useState({ name: '', email: '', notes: '' });
  const client = data.clients.find((c) => c.id === sel);
  const create = () => { if (!f.name.trim()) return; saveClient({ name: f.name.trim(), email: f.email.trim() || null, notes: f.notes.trim() || null, since: new Date().toISOString().slice(0, 10) }).then(() => { setF({ name: '', email: '', notes: '' }); reload(); }); };
  // Jobs match a client by email, since a brief arrives before anyone is "a client".
  const jobsOf = (c) => data.jobs.filter((j) => j.client_id === c.id || (c.email && j.email && j.email.toLowerCase() === c.email.toLowerCase()));
  return (
    <div className="cols leadcols">
      <section className="card">
        <div className="pad" style={{ borderBottom: '1px solid var(--line)' }}><h2 className="h2">Clients</h2></div>
        <div className="pad formgrid">
          <input className="input" placeholder="Name or business" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} />
          <input className="input" placeholder="Email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} />
          <button className="btn sm" onClick={create}>Add client</button>
        </div>
        <div className="reclistwrap">
          {data.clients.map((c) => (
            <button key={c.id} className={'reclist' + (c.id === sel ? ' on' : '')} onClick={() => setSel(c.id)}>
              <div style={{ fontSize: 13.5, fontWeight: 500 }}>{c.name}</div><div className="sub">{c.email}</div>
            </button>
          ))}
          {!data.clients.length && <p className="sub" style={{ padding: '20px 2px' }}>No clients yet.</p>}
        </div>
      </section>
      {client ? (
        <section className="tile">
          <div className="tilehead"><h2 className="h2">{client.name}</h2></div>
          <div className="vrow"><span className="lbl">Email</span><span className="mono">{client.email || '—'}</span></div>
          {client.notes && <p className="sub" style={{ marginTop: 10 }}>{client.notes}</p>}
          <div className="minirows" style={{ marginTop: 14 }}>
            {jobsOf(client).map((j) => (
              <button key={j.id} className="minirow plain" style={{ width: '100%', textAlign: 'left', cursor: 'pointer', background: 'none', border: 0 }} onClick={() => open(j.id)}>
                <span className="mtxt">{j.title}</span>{pill(STAGE_LABEL[j.stage], stageKind(j.stage))}
              </button>
            ))}
            {!jobsOf(client).length && <p className="sub">No jobs yet.</p>}
          </div>
        </section>
      ) : <p className="sub">Select a client.</p>}
    </div>
  );
}

// ── The hub ────────────────────────────────────────────────────────────
function BusinessHub() {
  // The address holds the view (#jobs, #money, #job=<id>) so a reload or a
  // pasted link lands in the same place.
  const TABS = ['ring', 'today', 'jobs', 'proposals', 'mail', 'money', 'clients'];
  const fromHash = () => {
    const id = (location.hash.match(/job=([0-9a-f-]{36})/) || [])[1] || null;
    const t = location.hash.slice(1);
    return { tab: id ? 'jobs' : (TABS.includes(t) ? t : 'ring'), id };
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
  const go = (t) => { setTab(t); setJobId(null); history.replaceState(null, '', '#' + t); };
  const open = (id) => { setTab('jobs'); setJobId(id); history.replaceState(null, '', '#job=' + id); window.scrollTo(0, 0); };

  return (
    <React.Fragment>
      <div className="room" aria-hidden="true">
        <div className="amb"><i className="a1" /><i className="a2" /><i className="a3" /></div>
        <div className="grain" />
      </div>
      <header className="top">
        <div className="topin">
          <a className="mark" href="/backroom"><img src="assets/antler.png" alt="" /><div><b>Business Hub</b><span>The Backroom</span></div></a>
          <nav className="topnav">
            <a href="#ring" onClick={(e) => { e.preventDefault(); go('ring'); }} style={tab === 'ring' ? { color: 'var(--text)' } : undefined}>Home</a>
            <a href="/docket">Docket</a>
            <a href="/backroom">Backroom</a>
          </nav>
        </div>
      </header>
      <div className="shell">
        {data && tab !== 'ring' && <ToolSidebar tab={tab} go={go} data={data} />}
        <main id="app" className={tab === 'ring' ? 'ringmain' : undefined}>
          {error && <p className="sub" style={{ padding: '20px 2px', color: 'var(--warn)' }}>{error} If this is the first run, the workflow tables may not be set up yet.</p>}
          {!error && loading && <p className="sub" style={{ padding: '20px 2px' }}>Loading…</p>}
          {data && (
            <React.Fragment>
              {tab === 'ring' && <Ring go={go} data={data} />}
              {tab === 'today' && <Today data={data} open={open} go={go} />}
              {tab === 'jobs' && (jobId ? <JobPage jobId={jobId} data={data} reload={reloadAll} back={() => go('jobs')} /> : <Jobs data={data} open={open} reload={reloadAll} />)}
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
