// business-hub.jsx — The Business Hub, door 02 of The Scaffold. Full CRUD
// against the freelance-schema.sql tables (clients, leads + lead_messages,
// projects + project_deliverables, invoices, notes) plus a read view over
// design_briefs (the public /design page's submissions). Scoped to the
// handoff's §6 schema, not the larger freelance-views.js prototype feature
// set — see DECISIONS.md.
const {
  fetchClients, saveClient,
  fetchLeads, saveLead, fetchLeadMessages, saveLeadMessage,
  fetchProjects, saveProject, fetchProjectDeliverables, saveProjectDeliverable, deleteProjectDeliverable,
  fetchInvoices, saveInvoice,
  fetchNotes, saveNote, deleteNote,
  fetchDesignBriefs, saveDesignBrief,
} = window.CC;

const SERVICES = ['Social graphics', 'Business card or print', 'Flyer or one-pager',
  'Document or report', 'Presentation or deck', 'Brand basics', 'Video', 'Something else'];

const usd = (n) => (n == null ? '—' : '$' + Math.round(n).toLocaleString('en-US'));
const fdate = (s) => { if (!s) return '—'; const [y, m, d] = String(s).slice(0, 10).split('-'); return new Date(+y, +m - 1, +d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }); };
const daysBetween = (a, b) => Math.round((b - a) / 864e5);
const statusKind = (s) => ({ Paid: 'ok', paid: 'ok', Converted: 'ok', Overdue: 'bad', overdue: 'bad', Dead: 'bad', New: 'warn', new: 'warn', 'Awaiting Response': 'warn', Draft: 'mute', draft: 'mute', Sent: 'mute', sent: 'mute', Replied: 'mute', answered: 'mute' }[s] || 'mute');
const pill = (txt, kind) => <span className={'pill ' + (kind || 'mute')}>{txt}</span>;

const TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'clients', label: 'Clients' },
  { id: 'leads', label: 'Leads' },
  { id: 'projects', label: 'Projects' },
  { id: 'invoices', label: 'Invoices' },
  { id: 'notes', label: 'Notes' },
  { id: 'design', label: 'Design' },
];

// Six brass plates around the ring, evenly spaced (the source's per-node
// `a`/`fa` angles are vestigial — Business Hub.dc.html's own wireOrbit()
// computes even spacing at runtime and ignores them). "Acquire" (proposals/
// referrals) isn't in this build's scope, so Clients takes that slot —
// see DECISIONS.md.
const RING_NODES = [
  { id: 'overview', label: 'Brief', icon: 'assets/tool-brief.png', desc: 'The daily read — what is moving and what needs you.' },
  { id: 'leads', label: 'Leads', icon: 'assets/tool-leads.png', desc: 'Every inquiry, where it stands, what to do next.' },
  { id: 'projects', label: 'Work', icon: 'assets/tool-work.png', desc: 'Projects in motion, deliverables ticked off.' },
  { id: 'invoices', label: 'Money', icon: 'assets/tool-money.png', desc: 'Invoices out, paid, and what still needs chasing.' },
  { id: 'clients', label: 'Clients', icon: 'assets/tool-acquire.png', desc: 'Who you work for, rates, and how they like to be reached.' },
  { id: 'design', label: 'Design', icon: 'assets/tool-vault.png', mirror: true, desc: 'The back end for cargroff.com/design — briefs in.' },
];

function ringMetaOf(id, { leads, projects, invoices, clients }) {
  if (id === 'leads') return leads.filter((l) => l.status !== 'Converted' && l.status !== 'Dead').length + ' open';
  if (id === 'projects') return projects.filter((p) => p.status !== 'Delivered').length + ' active';
  if (id === 'invoices') return usd(invoices.filter((i) => i.status === 'sent' || i.status === 'overdue').reduce((a, i) => a + Number(i.amount || 0), 0)) + ' out';
  if (id === 'clients') return clients.length + ' on the books';
  if (id === 'design') return 'The site';
  return 'Today';
}

// Geometry ported from Business Hub.dc.html's wireOrbit()/layout(): the
// hovered node steps in to 0.92r, its neighbours fan out up to 16deg and
// 1.06r weighted by ring distance, everything else dims. Simplified from
// the source's two-pass measured-band version (no DOM measurement of label
// overflow) since our fixed 120px node width doesn't need it — the radius
// comes straight from the orbit container's own rendered size.
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

function Ring({ go, leads, projects, invoices, clients }) {
  const [hover, setHover] = React.useState(null);
  const [wickHot, setWickHot] = React.useState(false);
  const orbitRef = React.useRef(null);
  const [radius, setRadius] = React.useState(220);
  const data = { leads, projects, invoices, clients };

  React.useEffect(() => {
    const measure = () => { if (orbitRef.current) setRadius(orbitRef.current.getBoundingClientRect().width / 2); };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  const warm = () => setWickHot(true);
  const cool = () => setWickHot(false);

  return (
    <div className={'launch' + (hover !== null ? ' hovering' : '') + (wickHot ? ' wickhot' : '')}>
      <img className="lamp L" src="assets/lamppost.png" alt="" aria-hidden="true" />
      <img className="lamp R" src="assets/lamppost.png" alt="" aria-hidden="true" />
      <div className="rings">
        <span className="ring-outer" /><span className="ring-mid" /><span className="ring-inner" />
        <span className="ticks" /><span className="ticks-minor" /><span className="ticks-fine" />
      </div>
      <div className="spokes">
        {RING_NODES.map((_, i) => (
          <span key={i} className={'spoke' + (hover === i ? ' lit' : '')} style={{ transform: `rotate(${i * (360 / N_RING) - 90}deg)` }} />
        ))}
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
      <a className="lwick" href="/wick" title="Talk to Wick" aria-label="Talk to Wick"
        onMouseEnter={warm} onMouseLeave={cool} onFocus={warm} onBlur={cool}>
        <span className="core" />
      </a>
      <div className="orbit" ref={orbitRef}>
        {RING_NODES.map((n, i) => (
          <button key={n.id} className={'tnode' + (hover === i ? ' on' : '')}
            style={{ transform: ringNodeTransform(i, hover, radius) }}
            onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)}
            onFocus={() => setHover(i)} onBlur={() => setHover(null)}
            onClick={() => go(n.id)}>
            <span className="plate"><img src={n.icon} alt="" style={n.mirror ? { transform: 'scaleX(-1)' } : undefined} /></span>
            <span className="tlabel">{n.label}</span>
            <span className="tsub">{ringMetaOf(n.id, data)}</span>
            <span className="tdesc">{n.desc}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// The persistent icon rail shown once inside a tool — same brass plates as
// the ring, standing in a column, so the icon you clicked stays with you.
function ToolSidebar({ tab, go, leads, projects, invoices, clients }) {
  const data = { leads, projects, invoices, clients };
  return (
    <nav className="tools on">
      {RING_NODES.map((n) => (
        <button key={n.id} aria-current={tab === n.id ? 'true' : undefined} onClick={() => go(n.id)}>
          <span className="tplate"><img src={n.icon} alt="" style={n.mirror ? { transform: 'scaleX(-1)' } : undefined} /></span>
          <span><span className="tname">{n.label}</span><span className="tmeta">{ringMetaOf(n.id, data)}</span></span>
        </button>
      ))}
      <button className="ring-back" onClick={() => go('ring')}><span>← Ring</span></button>
    </nav>
  );
}

function useCollection(fetcher) {
  const [rows, setRows] = React.useState(null);
  const [error, setError] = React.useState(null);
  const reload = React.useCallback(() => {
    fetcher().then(setRows).catch((e) => setError(e.message || 'Could not load.'));
  }, [fetcher]);
  React.useEffect(reload, [reload]);
  return [rows, setRows, reload, error];
}

// ── Overview ─────────────────────────────────────────────────────────
function Overview({ clients, leads, projects, invoices, notes, go }) {
  const openLeads = leads.filter((l) => l.status !== 'Converted' && l.status !== 'Dead');
  const overdue = invoices.filter((i) => effectiveStatus(i) === 'overdue');
  const outstanding = invoices.filter((i) => i.status === 'sent' || i.status === 'overdue').reduce((a, i) => a + Number(i.amount || 0), 0);
  const today = new Date();
  const active = projects.filter((p) => p.status !== 'Delivered');
  const dueSoon = active.map((p) => ({ ...p, inDays: p.due ? daysBetween(today, new Date(p.due)) : null }))
    .filter((p) => p.inDays != null).sort((a, b) => a.inDays - b.inDays).slice(0, 6);

  return (
    <div className="stack">
      <section className="tile brief">
        <div className="tilehead"><h2 className="h2">Overview</h2><span className="lbl">{clients.length} clients · {active.length} active projects</span></div>
        <p className="briefline">
          {openLeads.length ? <React.Fragment><b>{openLeads.length}</b> open lead{openLeads.length === 1 ? '' : 's'}. </React.Fragment> : null}
          {overdue.length ? <React.Fragment><b>{overdue.length}</b> invoice{overdue.length === 1 ? '' : 's'} overdue, {usd(overdue.reduce((a, i) => a + Number(i.amount || 0), 0))}. </React.Fragment> : null}
          {!openLeads.length && !overdue.length ? 'Nothing urgent right now.' : null}
        </p>
        <div className="briefacts">
          <button className="btn sm" onClick={() => go('leads')}>Open leads</button>
          <button className="btn ghost sm" onClick={() => go('invoices')}>Chase overdue</button>
        </div>
      </section>
      <div className="hgrid">
        <div className="tile">
          <div className="tilehead"><h2 className="h2">Outstanding</h2></div>
          <div className="bigline"><span className="big mono">{usd(outstanding)}</span></div>
        </div>
        <div className="tile">
          <div className="tilehead"><h2 className="h2">Due next</h2><span className="lbl">Active projects</span></div>
          <div className="minirows">
            {dueSoon.length ? dueSoon.map((p) => (
              <div className="minirow plain" key={p.id}>
                <span className="mtxt">{p.name}</span>
                <span className={'mono mval' + (p.inDays <= 3 ? ' hot' : '')}>{p.inDays <= 0 ? 'today' : 'in ' + p.inDays + 'd'}</span>
              </div>
            )) : <p className="sub">Nothing on the calendar.</p>}
          </div>
        </div>
        <div className="tile">
          <div className="tilehead"><h2 className="h2">Recent notes</h2></div>
          <div className="minirows">
            {notes.slice(0, 5).map((n) => (
              <div className="minirow plain" key={n.id}><span className="mtxt">{n.body.slice(0, 90)}</span></div>
            ))}
            {!notes.length && <p className="sub">Nothing captured yet.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Clients ──────────────────────────────────────────────────────────
function NewClientForm({ onCreated }) {
  const [open, setOpen] = React.useState(false);
  const [f, setF] = React.useState({ name: '', contact: '', email: '', rate: '', prefers: '', notes: '' });
  const set = (k) => (e) => setF((s) => ({ ...s, [k]: e.target.value }));

  const create = () => {
    if (!f.name.trim()) return;
    saveClient({
      name: f.name.trim(), contact: f.contact.trim() || null, email: f.email.trim() || null,
      rate: f.rate ? Number(f.rate) : null, prefers: f.prefers.trim() || null, notes: f.notes.trim() || null,
      since: new Date().toISOString().slice(0, 10),
    }).then(() => { setF({ name: '', contact: '', email: '', rate: '', prefers: '', notes: '' }); setOpen(false); onCreated(); }).catch(() => {});
  };

  if (!open) return <button className="btn sm" onClick={() => setOpen(true)}>New client</button>;
  return (
    <div className="formgrid">
      <input className="input" placeholder="Client or business name" value={f.name} onChange={set('name')} />
      <input className="input" placeholder="Contact name" value={f.contact} onChange={set('contact')} />
      <input className="input" placeholder="Email" value={f.email} onChange={set('email')} />
      <input className="input" placeholder="Rate, per hour" inputMode="numeric" value={f.rate} onChange={set('rate')} />
      <input className="input" placeholder="Prefers (how they like to be reached)" value={f.prefers} onChange={set('prefers')} />
      <input className="input" placeholder="Notes" value={f.notes} onChange={set('notes')} />
      <div className="row" style={{ gap: 10, gridColumn: '1/-1' }}>
        <button className="btn sm" onClick={create}>Save client</button>
        <button className="btn ghost sm" onClick={() => setOpen(false)}>Cancel</button>
      </div>
    </div>
  );
}

function ClientDetail({ client, projects, invoices }) {
  const clientProjects = projects.filter((p) => p.client_id === client.id);
  const clientInvoices = invoices.filter((i) => i.client_id === client.id);
  return (
    <section className="tile">
      <div className="tilehead"><h2 className="h2">{client.name}</h2></div>
      <div className="vrow"><span className="lbl">Contact</span><span className="mono">{client.contact || '—'}</span></div>
      <div className="vrow"><span className="lbl">Email</span><span className="mono">{client.email || '—'}</span></div>
      <div className="vrow"><span className="lbl">Rate</span><span className="mono">{client.rate != null ? usd(client.rate) + '/h' : '—'}</span></div>
      <div className="vrow"><span className="lbl">Since</span><span className="mono">{fdate(client.since)}</span></div>
      {client.prefers && <p className="sub" style={{ marginTop: 12 }}>{client.prefers}</p>}
      {client.notes && <p className="sub" style={{ marginTop: 8 }}>{client.notes}</p>}
      <div className="minirows" style={{ marginTop: 16 }}>
        {clientProjects.map((p) => (
          <div className="minirow plain" key={p.id}><span className="mtxt">{p.name}</span>{pill(p.status, p.status === 'Delivered' ? 'ok' : 'warn')}</div>
        ))}
        {!clientProjects.length && <p className="sub">No projects yet.</p>}
      </div>
      <div className="vrow" style={{ marginTop: 8 }}>
        <span className="lbl">Invoiced total</span>
        <span className="mono">{usd(clientInvoices.reduce((a, i) => a + Number(i.amount || 0), 0))}</span>
      </div>
    </section>
  );
}

function Clients({ clients, projects, invoices, reload }) {
  const [sel, setSel] = React.useState(null);
  const client = clients.find((c) => c.id === sel);
  return (
    <div className="cols leadcols">
      <section className="card">
        <div className="pad between" style={{ borderBottom: '1px solid var(--line)' }}><h2 className="h2">Clients</h2></div>
        <div className="pad"><NewClientForm onCreated={reload} /></div>
        <div className="reclistwrap">
          {clients.map((c) => (
            <button key={c.id} className={'reclist' + (c.id === sel ? ' on' : '')} onClick={() => setSel(c.id)}>
              <div className="between"><span style={{ fontSize: 13.5, fontWeight: 500 }}>{c.name}</span>{c.rate != null && <span className="sub mono">{usd(c.rate)}/h</span>}</div>
              <div className="row" style={{ gap: 12, marginTop: 5 }}><span className="sub">{c.contact}</span></div>
            </button>
          ))}
          {!clients.length && <p className="sub" style={{ padding: '20px 2px' }}>No clients yet.</p>}
        </div>
      </section>
      {client ? <ClientDetail client={client} projects={projects} invoices={invoices} /> : <p className="sub">Select a client.</p>}
    </div>
  );
}

// ── Leads ────────────────────────────────────────────────────────────
function NewLeadForm({ onCreated }) {
  const [open, setOpen] = React.useState(false);
  const [f, setF] = React.useState({ name: '', contact: '', email: '', source: '', ask: '', value: '' });
  const set = (k) => (e) => setF((s) => ({ ...s, [k]: e.target.value }));

  const create = () => {
    if (!f.name.trim()) return;
    saveLead({
      name: f.name.trim(), contact: f.contact.trim() || null, email: f.email.trim() || null,
      source: f.source.trim() || null, ask: f.ask.trim() || null, value: f.value ? Number(f.value) : null, status: 'New',
    }).then(() => { setF({ name: '', contact: '', email: '', source: '', ask: '', value: '' }); setOpen(false); onCreated(); }).catch(() => {});
  };

  if (!open) return <button className="btn sm" onClick={() => setOpen(true)}>New lead</button>;
  return (
    <div className="formgrid">
      <input className="input" placeholder="Who's asking" value={f.name} onChange={set('name')} />
      <input className="input" placeholder="Contact name" value={f.contact} onChange={set('contact')} />
      <input className="input" placeholder="Email" value={f.email} onChange={set('email')} />
      <input className="input" placeholder="Source (referral, website, etc.)" value={f.source} onChange={set('source')} />
      <input className="input" placeholder="What they're asking for" value={f.ask} onChange={set('ask')} />
      <input className="input" placeholder="Estimated value" inputMode="numeric" value={f.value} onChange={set('value')} />
      <div className="row" style={{ gap: 10, gridColumn: '1/-1' }}>
        <button className="btn sm" onClick={create}>Save lead</button>
        <button className="btn ghost sm" onClick={() => setOpen(false)}>Cancel</button>
      </div>
    </div>
  );
}

function LeadDetail({ lead, clients, projects, onSaved }) {
  const [messages, setMessages] = React.useState([]);
  const [reply, setReply] = React.useState('');
  const [busy, setBusy] = React.useState(false);

  React.useEffect(() => {
    fetchLeadMessages(lead.id).then(setMessages).catch(() => setMessages([]));
  }, [lead.id]);

  const setStatus = (status) => {
    saveLead({ id: lead.id, status, last_activity_at: new Date().toISOString() }).then(onSaved).catch(() => {});
  };

  const send = () => {
    const body = reply.trim();
    if (!body) return;
    setBusy(true);
    saveLeadMessage({ lead_id: lead.id, from: 'me', body, sent_at: new Date().toISOString() })
      .then((res) => {
        setMessages((m) => [...m, res.row]);
        setReply('');
        return saveLead({ id: lead.id, status: lead.status === 'New' ? 'Replied' : lead.status, last_activity_at: new Date().toISOString() });
      })
      .then(onSaved)
      .catch(() => {})
      .finally(() => setBusy(false));
  };

  const convert = () => {
    const existing = clients.find((c) => c.name === lead.name);
    const clientPromise = existing
      ? Promise.resolve(existing)
      : saveClient({ name: lead.name, contact: lead.contact || null, email: lead.email || null, since: new Date().toISOString().slice(0, 10) })
          .then((res) => res.row);
    clientPromise
      .then((client) => saveProject({
        client_id: client.id, name: lead.name + ' — ' + (lead.ask || 'project'), kind: null,
        status: 'Scheduled', fee: lead.value || null, scope: lead.ask || '',
      }))
      .then((res) => saveLead({ id: lead.id, status: 'Converted', converted_project_id: res.row.id, last_activity_at: new Date().toISOString() }))
      .then(onSaved).catch(() => {});
  };

  return (
    <section className="card">
      <div className="pad" style={{ borderBottom: '1px solid var(--line)' }}>
        <div className="between"><h2 className="h2">{lead.name}</h2>{pill(lead.status, statusKind(lead.status))}</div>
        <div className="row" style={{ gap: 14, marginTop: 8, flexWrap: 'wrap' }}>
          <span className="sub">{lead.contact}</span><span className="sub mono">{lead.email}</span><span className="sub">{lead.source}</span>
          {lead.value != null && <span className="sub mono">{usd(lead.value)}</span>}
        </div>
        <div className="row" style={{ gap: 10, marginTop: 14, flexWrap: 'wrap' }}>
          {lead.status !== 'Converted' && <button className="btn sm" onClick={convert}>Convert to project</button>}
          {lead.status !== 'Dead' && lead.status !== 'Converted' && <button className="btn quiet sm" onClick={() => setStatus('Dead')}>Mark dead</button>}
        </div>
      </div>
      <div className="thread">
        {messages.map((m) => (
          <div className={'msg ' + (m.from === 'me' ? 'me' : 'them')} key={m.id}>
            <div className="msghead"><span className="lbl">{m.from === 'me' ? 'You' : lead.contact || lead.name}</span><span className="lbl">{fdate(m.sent_at)}</span></div>
            <p>{m.body}</p>
          </div>
        ))}
        {!messages.length && <p className="sub">No messages logged yet.</p>}
      </div>
      <div className="pad replybox">
        <div className="lbl">Reply</div>
        <textarea className="input" rows={3} style={{ marginTop: 9, resize: 'vertical', minHeight: 84 }}
          placeholder="Write it the way you talk…" value={reply} onChange={(e) => setReply(e.target.value)} />
        <div className="row" style={{ gap: 10, marginTop: 11 }}>
          <button className="btn sm" disabled={busy || !reply.trim()} onClick={send}>Log reply</button>
        </div>
      </div>
    </section>
  );
}

function Leads({ leads, clients, projects, reload }) {
  const [sel, setSel] = React.useState(null);
  const lead = leads.find((l) => l.id === sel) || leads[0];
  if (!lead) {
    return (
      <section className="card">
        <div className="pad between" style={{ borderBottom: '1px solid var(--line)' }}><h2 className="h2">Lead inbox</h2></div>
        <div className="pad">
          <NewLeadForm onCreated={reload} />
          <p className="sub" style={{ marginTop: 16 }}>No leads yet. New leads from the /design brief form land here automatically too.</p>
        </div>
      </section>
    );
  }
  return (
    <div className="cols leadcols">
      <section className="card">
        <div className="pad between" style={{ borderBottom: '1px solid var(--line)' }}><h2 className="h2">Lead inbox</h2></div>
        <div className="pad"><NewLeadForm onCreated={reload} /></div>
        <div className="reclistwrap">
          {leads.map((l) => (
            <button key={l.id} className={'reclist' + (l.id === lead.id ? ' on' : '')} onClick={() => setSel(l.id)}>
              <div className="between"><span style={{ fontSize: 13.5, fontWeight: 500 }}>{l.name}</span>{pill(l.status, statusKind(l.status))}</div>
              <div className="row" style={{ gap: 12, marginTop: 5 }}><span className="sub">{l.ask}</span></div>
              <div className="row" style={{ gap: 12, marginTop: 4 }}>{l.value != null && <span className="sub mono">{usd(l.value)}</span>}<span className="sub">{l.source}</span></div>
            </button>
          ))}
        </div>
      </section>
      <LeadDetail key={lead.id} lead={lead} clients={clients} projects={projects} onSaved={reload} />
    </div>
  );
}

// ── Projects ─────────────────────────────────────────────────────────
function ProjectDetail({ project, clients, onSaved }) {
  const [deliverables, setDeliverables] = React.useState([]);
  const [newLabel, setNewLabel] = React.useState('');
  const client = clients.find((c) => c.id === project.client_id);

  const loadDeliverables = React.useCallback(() => {
    fetchProjectDeliverables(project.id).then(setDeliverables).catch(() => setDeliverables([]));
  }, [project.id]);
  React.useEffect(loadDeliverables, [loadDeliverables]);

  const pct = deliverables.length ? Math.round(deliverables.filter((d) => d.done).length / deliverables.length * 100) : 0;

  const toggle = (d) => {
    saveProjectDeliverable({ id: d.id, done: !d.done }).then(loadDeliverables).catch(() => {});
  };
  const addDeliverable = (e) => {
    if (e.key !== 'Enter') return;
    const label = newLabel.trim();
    if (!label) return;
    saveProjectDeliverable({ project_id: project.id, label, sort_order: deliverables.length })
      .then(() => { setNewLabel(''); loadDeliverables(); }).catch(() => {});
  };
  const removeDeliverable = (id) => { deleteProjectDeliverable(id).then(loadDeliverables).catch(() => {}); };
  const setStatus = (status) => { saveProject({ id: project.id, status }).then(onSaved).catch(() => {}); };

  return (
    <div className="stack">
      <section className="tile">
        <div className="tilehead"><h2 className="h2">{project.name}</h2>{pill(project.status, project.status === 'Delivered' ? 'ok' : 'warn')}</div>
        <div className="row" style={{ gap: 14, flexWrap: 'wrap' }}>
          <span className="sub">{client ? client.name : 'No client set'}</span>
          {project.kind && <span className="sub">{project.kind}</span>}
          {project.fee != null && <span className="sub mono">{usd(project.fee)}</span>}
          {project.due && <span className="sub mono">due {fdate(project.due)}</span>}
        </div>
        {project.scope && <p className="sub" style={{ marginTop: 8 }}>{project.scope}</p>}
        <div className="row" style={{ gap: 8, marginTop: 14, flexWrap: 'wrap' }}>
          {['Scheduled', 'In edit', 'Awaiting feedback', 'Delivered'].map((s) => (
            <button key={s} className={'btn sm' + (project.status === s ? '' : ' ghost')} onClick={() => setStatus(s)}>{s}</button>
          ))}
        </div>
      </section>
      <section className="tile">
        <div className="tilehead"><h2 className="h2">Deliverables</h2><span className="lbl">{pct}%</span></div>
        <div className="bar" style={{ marginBottom: 14 }}><i style={{ width: pct + '%' }} /></div>
        <div className="checks">
          {deliverables.map((d) => (
            <div className={'chk ' + (d.done ? 'on' : 'off')} key={d.id} style={{ cursor: 'pointer' }}>
              <span className="box" onClick={() => toggle(d)}>{d.done ? '✓' : ''}</span>
              <span onClick={() => toggle(d)} style={{ flex: 1 }}>{d.label}</span>
              <button className="btn quiet sm" onClick={() => removeDeliverable(d.id)}>Remove</button>
            </div>
          ))}
        </div>
        <input className="input" style={{ marginTop: 12 }} placeholder="Add a deliverable, press Enter"
          value={newLabel} onChange={(e) => setNewLabel(e.target.value)} onKeyDown={addDeliverable} />
      </section>
    </div>
  );
}

function NewProjectForm({ clients, onCreated }) {
  const [open, setOpen] = React.useState(false);
  const [f, setF] = React.useState({ clientId: '', name: '', kind: '', fee: '', due: '', scope: '' });
  const set = (k) => (e) => setF((s) => ({ ...s, [k]: e.target.value }));

  const create = () => {
    if (!f.name.trim()) return;
    saveProject({
      client_id: f.clientId || null, name: f.name.trim(), kind: f.kind.trim() || null,
      status: 'Scheduled', fee: f.fee ? Number(f.fee) : null, due: f.due || null, scope: f.scope.trim() || null,
    }).then(() => { setF({ clientId: '', name: '', kind: '', fee: '', due: '', scope: '' }); setOpen(false); onCreated(); }).catch(() => {});
  };

  if (!open) return <button className="btn sm" onClick={() => setOpen(true)}>New project</button>;
  return (
    <div className="formgrid">
      <input className="input" placeholder="Project name" value={f.name} onChange={set('name')} />
      <select className="select" value={f.clientId} onChange={set('clientId')}>
        <option value="">Client…</option>
        {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
      </select>
      <input className="input" placeholder="Kind (Video, Design, Photo…)" value={f.kind} onChange={set('kind')} />
      <input className="input" placeholder="Fee" inputMode="numeric" value={f.fee} onChange={set('fee')} />
      <input className="input" type="date" placeholder="Due" value={f.due} onChange={set('due')} />
      <input className="input" placeholder="Scope" value={f.scope} onChange={set('scope')} />
      <div className="row" style={{ gap: 10, gridColumn: '1/-1' }}>
        <button className="btn sm" onClick={create}>Save project</button>
        <button className="btn ghost sm" onClick={() => setOpen(false)}>Cancel</button>
      </div>
    </div>
  );
}

function Projects({ projects, clients, reload }) {
  const [sel, setSel] = React.useState(null);
  const project = projects.find((p) => p.id === sel) || projects[0];
  if (!project) {
    return (
      <div className="stack">
        <NewProjectForm clients={clients} onCreated={reload} />
        <p className="sub">No projects yet. Add one here, or convert a lead from the Leads tab.</p>
      </div>
    );
  }
  return (
    <div className="stack">
      <div className="row" style={{ justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div className="projrail">
          {projects.map((p) => (
            <button key={p.id} className={'projchip' + (p.id === project.id ? ' on' : '')} onClick={() => setSel(p.id)}>
              <span className="pname">{p.name}</span><span className="lbl">{p.status}</span>
            </button>
          ))}
        </div>
        <NewProjectForm clients={clients} onCreated={reload} />
      </div>
      <ProjectDetail key={project.id} project={project} clients={clients} onSaved={reload} />
    </div>
  );
}

// ── Invoices ─────────────────────────────────────────────────────────
function NewInvoiceForm({ clients, projects, onCreated }) {
  const [clientId, setClientId] = React.useState('');
  const [projectId, setProjectId] = React.useState('');
  const [amount, setAmount] = React.useState('');
  const [dueDate, setDueDate] = React.useState('');

  const create = () => {
    if (!clientId || !amount) return;
    saveInvoice({ client_id: clientId, project_id: projectId || null, amount: Number(amount), due_date: dueDate || null, status: 'draft' })
      .then(() => { setClientId(''); setProjectId(''); setAmount(''); setDueDate(''); onCreated(); }).catch(() => {});
  };

  return (
    <div className="formgrid" style={{ marginTop: 4 }}>
      <select className="select" value={clientId} onChange={(e) => setClientId(e.target.value)}>
        <option value="">Client…</option>
        {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
      </select>
      <select className="select" value={projectId} onChange={(e) => setProjectId(e.target.value)}>
        <option value="">Project (optional)…</option>
        {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
      </select>
      <input className="input" placeholder="Amount" inputMode="numeric" value={amount} onChange={(e) => setAmount(e.target.value)} />
      <input className="input" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
      <button className="btn sm" style={{ gridColumn: '1/-1' }} onClick={create}>Create draft invoice</button>
    </div>
  );
}

// Overdue is derived, not stored: a 'sent' invoice past its due date reads
// as overdue in the UI without a cron job to flip a status column.
const effectiveStatus = (i) => (i.status === 'sent' && i.due_date && new Date(i.due_date) < new Date() ? 'overdue' : i.status);

function Invoices({ invoices, clients, projects, reload }) {
  const [linking, setLinking] = React.useState(null);
  const clientOf = (id) => clients.find((c) => c.id === id);
  const projectOf = (id) => projects.find((p) => p.id === id);
  const outstanding = invoices.filter((i) => i.status === 'sent' || i.status === 'overdue').reduce((a, i) => a + Number(i.amount || 0), 0);
  const paid = invoices.filter((i) => i.status === 'paid').reduce((a, i) => a + Number(i.amount || 0), 0);

  const sendInvoice = (inv) => {
    setLinking(inv.id);
    fetch('/api/create-invoice-link', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ invoiceId: inv.id }),
    }).then((r) => r.json()).then((data) => {
      if (data.error) { alert(data.error); return; }
      reload();
    }).catch(() => alert('Could not create the payment link.')).finally(() => setLinking(null));
  };

  // Manual fallback so invoices are usable before STRIPE_SECRET_KEY is set —
  // see DECISIONS.md. Once Stripe is wired, "Send via Stripe" is the normal
  // path and the webhook marks paid automatically; these stay as an escape
  // hatch for cash, check, or anything paid outside Stripe.
  const markSent = (inv) => { saveInvoice({ id: inv.id, status: 'sent', sent_at: new Date().toISOString() }).then(reload).catch(() => {}); };
  const markPaid = (inv) => { saveInvoice({ id: inv.id, status: 'paid', paid_at: new Date().toISOString() }).then(reload).catch(() => {}); };

  return (
    <div className="stack">
      <div className="kpis">
        <div className="kpi"><div className="lbl">Outstanding</div><div className="mono kpin">{usd(outstanding)}</div></div>
        <div className="kpi"><div className="lbl">Paid</div><div className="mono kpin">{usd(paid)}</div></div>
        <div className="kpi"><div className="lbl">Total invoices</div><div className="mono kpin">{invoices.length}</div></div>
      </div>
      <section className="card">
        <div className="pad between" style={{ borderBottom: '1px solid var(--line)' }}><h2 className="h2">New invoice</h2></div>
        <div className="pad"><NewInvoiceForm clients={clients} projects={projects} onCreated={reload} /></div>
      </section>
      <section className="card">
        <div className="pad between" style={{ borderBottom: '1px solid var(--line)' }}><h2 className="h2">Invoices</h2></div>
        <div className="scroll-x">
          <table>
            <thead><tr><th>Client</th><th>Project</th><th>Amount</th><th>Due</th><th>Status</th><th></th></tr></thead>
            <tbody>
              {invoices.map((i) => (
                <tr key={i.id}>
                  <td style={{ color: 'var(--text)' }}>{clientOf(i.client_id) ? clientOf(i.client_id).name : '—'}</td>
                  <td>{projectOf(i.project_id) ? projectOf(i.project_id).name : '—'}</td>
                  <td className="mono" style={{ color: 'var(--text)' }}>{usd(i.amount)}</td>
                  <td className="mono">{fdate(i.due_date)}</td>
                  <td>{pill(effectiveStatus(i), statusKind(effectiveStatus(i)))}</td>
                  <td>
                    <div className="row" style={{ gap: 8 }}>
                      {i.status === 'draft' && (
                        <React.Fragment>
                          <button className="btn ghost sm" disabled={linking === i.id} onClick={() => sendInvoice(i)}>
                            {linking === i.id ? 'Creating…' : 'Send via Stripe'}
                          </button>
                          <button className="btn quiet sm" onClick={() => markSent(i)}>Mark sent</button>
                        </React.Fragment>
                      )}
                      {(i.status === 'sent' || effectiveStatus(i) === 'overdue') && (
                        <button className="btn quiet sm" onClick={() => markPaid(i)}>Mark paid</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

// ── Notes ────────────────────────────────────────────────────────────
function Notes({ notes, clients, projects, reload }) {
  const [body, setBody] = React.useState('');
  const [clientId, setClientId] = React.useState('');
  const clientOf = (id) => clients.find((c) => c.id === id);

  const add = () => {
    const b = body.trim();
    if (!b) return;
    saveNote({ body: b, client_id: clientId || null }).then(() => { setBody(''); setClientId(''); reload(); }).catch(() => {});
  };
  const remove = (id) => { deleteNote(id).then(reload).catch(() => {}); };

  return (
    <div className="stack">
      <section className="card">
        <div className="pad">
          <textarea className="input" rows={3} style={{ resize: 'vertical', minHeight: 84 }}
            placeholder="Capture a thought…" value={body} onChange={(e) => setBody(e.target.value)} />
          <div className="row" style={{ gap: 10, marginTop: 11, flexWrap: 'wrap' }}>
            <select className="select" style={{ width: 220 }} value={clientId} onChange={(e) => setClientId(e.target.value)}>
              <option value="">No client…</option>
              {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <button className="btn sm" onClick={add}>Save note</button>
          </div>
        </div>
      </section>
      <section className="card">
        {notes.map((n) => (
          <div className="note" key={n.id}>
            <div className="between">
              <span className="lbl">{clientOf(n.client_id) ? clientOf(n.client_id).name : 'Unfiled'} · {fdate(n.created_at)}</span>
              <button className="btn quiet sm" onClick={() => remove(n.id)}>Delete</button>
            </div>
            <p>{n.body}</p>
          </div>
        ))}
        {!notes.length && <p className="sub" style={{ padding: '20px 2px' }}>Nothing captured yet.</p>}
      </section>
    </div>
  );
}

// ── Design-briefs inbox ─────────────────────────────────────────────
function Design({ briefs, reload }) {
  const open = briefs.filter((b) => b.status !== 'answered');
  const tally = SERVICES.map((s) => ({ name: s, n: briefs.filter((b) => Array.isArray(b.need) && b.need.includes(s)).length }))
    .filter((r) => r.n > 0).sort((a, b) => b.n - a.n);

  const markAnswered = (b) => {
    saveDesignBrief({ id: b.id, status: 'answered', answered_at: new Date().toISOString() }).then(reload).catch(() => {});
  };

  return (
    <div className="stack">
      <section className="tile brief">
        <div className="tilehead"><h2 className="h2">Cargroff Design</h2><span className="lbl">cargroff.com/design</span></div>
        <p className="briefline">
          {briefs.length ? <React.Fragment><b>{open.length} brief{open.length === 1 ? '' : 's'}</b> waiting on a reply, out of {briefs.length} received.</React.Fragment>
            : 'Live and wired — no briefs submitted yet.'}
        </p>
      </section>
      <div className="cols workcols">
        <section className="card">
          <div className="pad between" style={{ borderBottom: '1px solid var(--line)' }}>
            <h2 className="h2">Brief inbox</h2>{pill(briefs.length ? 'live' : 'not connected', briefs.length ? 'ok' : 'warn')}
          </div>
          {briefs.length ? (
            <div className="feed">
              {briefs.map((b) => (
                <div className="feedrow" key={b.id}>
                  <span className="lbl fkind">{b.status === 'answered' ? 'answered' : 'new'}</span>
                  <span className="ftxt">
                    {b.name}{b.business ? ' · ' + b.business : ''}{b.about ? ' — ' + b.about.slice(0, 90) : ''}
                    <br /><span className="sub mono">{b.email}</span>{Array.isArray(b.need) && b.need.length ? <span className="sub"> · {b.need.join(', ')}</span> : null}
                    {b.budget ? <span className="sub"> · {b.budget}</span> : null}
                  </span>
                  <span className="lbl fwhen">
                    {fdate(b.created_at)}
                    {b.status !== 'answered' && <button className="btn quiet sm" style={{ display: 'block', marginTop: 6 }} onClick={() => markAnswered(b)}>Mark answered</button>}
                  </span>
                </div>
              ))}
            </div>
          ) : <p className="sub" style={{ padding: '20px 2px' }}>No briefs yet.</p>}
        </section>
        <section className="tile">
          <div className="tilehead"><h2 className="h2">What gets asked for</h2></div>
          {tally.length ? (
            <div className="minirows">
              {tally.map((r) => (
                <div className="minirow" key={r.name}>
                  <span className="mtxt">{r.name}</span><span className="mono mval">{r.n}</span>
                  <div className="bar" style={{ height: 3, gridColumn: '1/-1' }}><i style={{ width: Math.round(r.n / tally[0].n * 100) + '%' }} /></div>
                </div>
              ))}
            </div>
          ) : <p className="sub">Once briefs arrive, the services they check are counted here.</p>}
        </section>
      </div>
    </div>
  );
}

// ── Shell ────────────────────────────────────────────────────────────
function BusinessHub() {
  const [tab, setTab] = React.useState('ring');
  const [clients, setClients, reloadClients] = useCollection(fetchClients);
  const [leads, setLeads, reloadLeads] = useCollection(fetchLeads);
  const [projects, setProjects, reloadProjects] = useCollection(fetchProjects);
  const [invoices, setInvoices, reloadInvoices] = useCollection(fetchInvoices);
  const [notes, setNotes, reloadNotes] = useCollection(fetchNotes);
  const [briefs, setBriefs, reloadBriefs] = useCollection(fetchDesignBriefs);

  const loading = [clients, leads, projects, invoices, notes, briefs].some((r) => r === null);

  return (
    <React.Fragment>
      <header className="top">
        <div className="topin">
          <a className="mark" href="/scaffold">
            <img src="assets/antler.png" alt="" />
            <div><b>Business Hub</b><span>The Scaffold</span></div>
          </a>
          <nav className="topnav">
            <a href="#ring" aria-current={tab === 'ring' ? 'page' : undefined}
              style={tab === 'ring' ? { color: 'var(--text)' } : undefined}
              onClick={(e) => { e.preventDefault(); setTab('ring'); }}>Home</a>
            <a href="#notes" aria-current={tab === 'notes' ? 'page' : undefined}
              style={tab === 'notes' ? { color: 'var(--text)' } : undefined}
              onClick={(e) => { e.preventDefault(); setTab('notes'); }}>Notes</a>
            <a href="/docket">Docket</a>
            <a href="/scaffold">Hub</a>
          </nav>
        </div>
      </header>
      <div className="shell">
        {!loading && tab !== 'ring' && (
          <ToolSidebar tab={tab} go={setTab} leads={leads} projects={projects} invoices={invoices} clients={clients} />
        )}
        <main id="app">
          {loading ? <p className="sub" style={{ padding: '20px 2px' }}>Loading…</p> : (
            <React.Fragment>
              {tab === 'ring' && <Ring go={setTab} leads={leads} projects={projects} invoices={invoices} clients={clients} />}
              {tab === 'overview' && <Overview clients={clients} leads={leads} projects={projects} invoices={invoices} notes={notes} go={setTab} />}
              {tab === 'clients' && <Clients clients={clients} projects={projects} invoices={invoices} reload={reloadClients} />}
              {tab === 'leads' && <Leads leads={leads} clients={clients} projects={projects} reload={() => { reloadLeads(); reloadProjects(); reloadClients(); }} />}
              {tab === 'projects' && <Projects projects={projects} clients={clients} reload={reloadProjects} />}
              {tab === 'invoices' && <Invoices invoices={invoices} clients={clients} projects={projects} reload={reloadInvoices} />}
              {tab === 'notes' && <Notes notes={notes} clients={clients} projects={projects} reload={reloadNotes} />}
              {tab === 'design' && <Design briefs={briefs} reload={reloadBriefs} />}
            </React.Fragment>
          )}
        </main>
      </div>
      <wick-assistant screen="business"></wick-assistant>
    </React.Fragment>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<BusinessHub />);
