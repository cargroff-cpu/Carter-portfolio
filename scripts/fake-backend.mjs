// scripts/fake-backend.mjs — an in-memory stand-in for everything the API
// routes talk to (Supabase's REST and storage, Resend, Stripe), so the whole
// workflow can run with no network and no keys. Used by scripts/check-flow.mjs
// (`npm test`) and scripts/dev-server.mjs (`npm run dev`).
//
// install() replaces global fetch and returns { db, emails, call }:
//   db      the tables, as plain arrays
//   emails  every email "sent", in order
//   call    run an API handler: call(handler, { method, body, query, headers })
import { randomUUID, randomBytes } from 'node:crypto';

const DEFAULTS = {
  jobs: () => ({ token: randomBytes(18).toString('hex'), brief_id: null, client_id: null, email: null, business: null, lane: 'design', stage: 'new', billing: 'split', revisions_included: 2, revisions_used: 0, picked_file_id: null, approved_at: null, notes: null, close_reason: null, closed_at: null, last_activity_at: new Date().toISOString(), updated_at: new Date().toISOString() }),
  proposals: () => ({ summary: null, items: [], timeline: null, terms: null, total: 0, billing: 'split', status: 'draft', sent_at: null, accepted_at: null, updated_at: new Date().toISOString() }),
  invoices: () => ({ client_id: null, job_id: null, label: null, status: 'draft', stripe_payment_link_id: null, stripe_url: null, stripe_payment_intent_id: null, due_date: null, sent_at: null, paid_at: null, updated_at: new Date().toISOString() }),
  design_briefs: () => ({ status: 'new', answered_at: null, triage: null, triaged_at: null, job_id: null }),
  design_brief_attachments: () => ({ bucket: 'brief-uploads' }),
  job_events: () => ({ job_id: null, client_id: null, who: 'system', body: null, meta: null }),
  job_files: () => ({ round: 1, label: null, url: null, storage_path: null, filename: null, content_type: null }),
  crm_tasks: () => ({ job_id: null, client_id: null, due_on: null, done_at: null, auto_key: null, updated_at: new Date().toISOString() }),
  clients: () => ({ contact: null, email: null, since: null, prefers: null, rate: null, notes: null, source: null, custom: {}, updated_at: new Date().toISOString() }),
  brief_events: () => ({ ok: true, reference: null, detail: null, ip: null }),
  docket_tasks: () => ({ brand: 'me', due: null, rank: 0, done: false }),
  site_content: () => ({}),
};

const get = (row, col) => {
  const m = /^(\w+)->>(\w+)$/.exec(col);
  if (m) return row[m[1]] == null ? null : row[m[1]][m[2]] == null ? null : String(row[m[1]][m[2]]);
  return row[col];
};
const list = (v) => v.replace(/^\(|\)$/g, '').split(',').filter(Boolean);
function test(row, col, expr) {
  const v = get(row, col);
  if (expr === 'is.null') return v == null;
  if (expr === 'not.is.null') return v != null;
  const not = expr.startsWith('not.');
  const e = not ? expr.slice(4) : expr;
  const [op, ...rest] = e.split('.');
  const arg = rest.join('.');
  const r = op === 'eq' ? String(v) === arg && v != null
    : op === 'neq' ? String(v) !== arg
    : op === 'in' ? list(arg).includes(String(v))
    : op === 'gte' ? v != null && String(v) >= arg
    : op === 'lte' ? v != null && String(v) <= arg
    : op === 'gt' ? v != null && String(v) > arg
    : op === 'lt' ? v != null && String(v) < arg
    : (() => { throw new Error('fake backend: unknown filter ' + expr); })();
  return not ? !r : r;
}

export function install({ seed = {} } = {}) {
  const db = Object.fromEntries(Object.keys(DEFAULTS).map((t) => [t, []]));
  for (const [t, rows] of Object.entries(seed)) db[t].push(...rows);
  const emails = [];
  const json = (body, status = 200) => new Response(body == null ? '' : JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

  function rest(method, path, body, headers) {
    const [table, qs = ''] = path.split('?');
    if (!db[table]) return json({ message: `relation "${table}" does not exist` }, 404);
    const params = [...new URLSearchParams(qs)];
    const filters = params.filter(([k]) => !['select', 'order', 'limit', 'on_conflict'].includes(k));
    const match = (row) => filters.every(([k, v]) => test(row, k, v));
    const prefer = headers.Prefer || headers.prefer || '';
    if (method === 'GET') {
      let rows = db[table].filter(match);
      const order = (params.find(([k]) => k === 'order') || [])[1];
      if (order) for (const part of order.split(',').reverse()) {
        const [col, dir] = part.split('.');
        rows = [...rows].sort((a, b) => (a[col] == null ? 1 : b[col] == null ? -1 : String(a[col]).localeCompare(String(b[col]))) * (dir === 'desc' ? -1 : 1));
      }
      const limit = (params.find(([k]) => k === 'limit') || [])[1];
      return json(limit ? rows.slice(0, Number(limit)) : rows);
    }
    if (method === 'POST') {
      const conflict = (params.find(([k]) => k === 'on_conflict') || [])[1];
      const out = [];
      for (const row of Array.isArray(body) ? body : [body]) {
        const old = conflict && row[conflict] != null ? db[table].find((r) => r[conflict] === row[conflict]) : null;
        if (old) { Object.assign(old, row); out.push(old); continue; }
        if (table === 'clients' && row.email && db.clients.some((c) => c.email === row.email)) return json({ code: '23505', message: 'duplicate key value violates unique constraint "clients_email_key"' }, 409);
        if (table === 'proposals' && db.proposals.some((p) => p.job_id === row.job_id)) return json({ code: '23505', message: 'duplicate key' }, 409);
        const made = { id: randomUUID(), created_at: new Date().toISOString(), ...DEFAULTS[table](), ...row };
        db[table].push(made); out.push(made);
      }
      return prefer.includes('return=representation') ? json(out, 201) : json(null, 201);
    }
    if (method === 'PATCH') {
      const rows = db[table].filter(match);
      rows.forEach((r) => Object.assign(r, body));
      return prefer.includes('return=representation') ? json(rows) : json(null);
    }
    if (method === 'DELETE') {
      db[table] = db[table].filter((r) => !match(r));
      return json(null);
    }
    return json({ message: 'method' }, 405);
  }

  globalThis.fetch = async (url, opts = {}) => {
    const u = String(url);
    const method = opts.method || 'GET';
    const headers = opts.headers || {};
    const body = typeof opts.body === 'string' && opts.body ? (() => { try { return JSON.parse(opts.body); } catch (e) { return opts.body; } })() : opts.body;
    await new Promise((r) => setTimeout(r, 1)); // keeps created_at values in order
    if (u.includes('/rest/v1/')) return rest(method, decodeURIComponent(u.split('/rest/v1/')[1]).replace(/\+/g, ' '), body, headers);
    if (u.includes('/storage/v1/object/upload/sign/')) return json({ url: '/object/upload/sign/fake?token=x' });
    if (u.includes('/storage/v1/object/sign/')) return json({ signedURL: '/object/sign/fake?token=x' });
    if (u.includes('/storage/v1/object/info/')) return json({ id: 'x' });
    if (u.includes('/storage/v1/')) return json({ Key: 'x' });
    if (u.startsWith('https://api.resend.com/')) { emails.push({ from: body.from, to: body.to[0], subject: body.subject, text: body.text, html: body.html }); return json({ id: randomUUID() }); }
    if (u.startsWith('https://api.stripe.com/v1/prices')) return json({ id: 'price_fake' });
    if (u.startsWith('https://api.stripe.com/v1/payment_links')) return json({ id: 'plink_fake_' + randomBytes(3).toString('hex'), url: 'https://buy.stripe.com/test_fake' });
    throw new Error('fake backend: unexpected fetch ' + u);
  };

  // Run a handler the way Vercel would: (req, res) with res.status().json().
  async function call(handler, { method = 'POST', body, query = {}, headers = {} } = {}) {
    const out = { status: 200, body: null, headers: {} };
    const res = {
      status(c) { out.status = c; return res; },
      json(b) { out.body = b; return res; },
      send(b) { try { out.body = JSON.parse(b); } catch (e) { out.body = b; } return res; },
      setHeader(k, v) { out.headers[k] = v; },
    };
    await handler({ method, body, query, headers: { 'x-forwarded-for': '10.0.0.' + Math.floor(Math.random() * 250), ...headers } }, res);
    return out;
  }
  return { db, emails, call };
}
