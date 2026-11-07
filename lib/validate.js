// lib/validate.js — what the Backroom's browser is allowed to write.
//
// api/scaffold-write.js used to pass any posted column straight to Supabase,
// so a bug (or a stray request with the session cookie) could set an
// invoice to paid without switching off its Stripe link, change a job's
// private token, or rewrite a proposal the client had already accepted.
// Now each table lists the columns the browser may touch and their types.
// Everything else (tokens, Stripe ids, approval times, revision counts,
// proposal status) is changed only by the workflow in api/job.js.
//
// validateRow(table, row, { isUpdate }) -> { row } with cleaned values, or
// { error } with a message fit to show Carter.

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const DATE = /^\d{4}-\d{2}-\d{2}$/;
const EMAIL = /^[^\s@*,()]+@[^\s@*,()]+\.[^\s@*,()]+$/;

export const isUuid = (v) => typeof v === 'string' && UUID.test(v);

// Field types. Each returns { v } (cleaned, maybe null) or { err }.
const T = {
  uuid: () => (v) => (v === null ? { v } : isUuid(v) ? { v } : { err: 'must be an id' }),
  str: (max = 500, { min = 0, lower = false } = {}) => (v) => {
    if (v === null) return min ? { err: 'is required' } : { v };
    if (typeof v !== 'string') return { err: 'must be text' };
    let s = v.trim();
    if (lower) s = s.toLowerCase();
    if (s.length < min) return { err: 'is required' };
    if (s.length > max) return { err: `is too long (max ${max})` };
    return { v: s === '' ? null : s };
  },
  email: () => (v) => {
    if (v === null) return { v };
    if (typeof v !== 'string') return { err: 'must be text' };
    const s = v.trim().toLowerCase();
    if (!s) return { v: null };
    if (s.length > 254 || !EMAIL.test(s)) return { err: 'is not a valid email address' };
    return { v: s };
  },
  oneOf: (list) => (v) => (list.includes(v) ? { v } : { err: `must be one of ${list.join(', ')}` }),
  num: ({ min = 0, max = 1e8 } = {}) => (v) => {
    if (v === null) return { v };
    const n = typeof v === 'string' && v.trim() !== '' ? Number(v) : v;
    if (typeof n !== 'number' || !isFinite(n)) return { err: 'must be a number' };
    if (n < min || n > max) return { err: `must be between ${min} and ${max}` };
    return { v: Math.round(n * 100) / 100 };
  },
  int: ({ min = 0, max = 1e6 } = {}) => (v) => (Number.isInteger(v) && v >= min && v <= max ? { v } : { err: `must be a whole number from ${min} to ${max}` }),
  bool: () => (v) => (typeof v === 'boolean' ? { v } : { err: 'must be true or false' }),
  date: () => (v) => (v === null ? { v } : typeof v === 'string' && DATE.test(v) && !isNaN(Date.parse(v)) ? { v } : { err: 'must be a date (YYYY-MM-DD)' }),
  ts: () => (v) => (v === null ? { v } : typeof v === 'string' && !isNaN(Date.parse(v)) ? { v: new Date(v).toISOString() } : { err: 'must be a date and time' }),
  items: () => (v) => {
    if (!Array.isArray(v) || v.length > 50) return { err: 'must be a list of up to 50 lines' };
    const out = [];
    for (const it of v) {
      if (!it || typeof it !== 'object') return { err: 'has a bad line' };
      const label = typeof it.label === 'string' ? it.label.trim().slice(0, 300) : '';
      const a = T.num({ min: 0, max: 1e7 })(it.amount === '' || it.amount == null ? 0 : it.amount);
      if (a.err) return { err: `has a line price that ${a.err}` };
      out.push({ label, amount: a.v });
    }
    return { v: out };
  },
};

// create: fields required when inserting a new row.
const SCHEMA = {
  docket_tasks: {
    create: ['q', 't'],
    fields: {
      brand: T.oneOf(['me']), q: T.oneOf(['q1', 'q2', 'q3', 'q4']), t: T.str(500, { min: 1 }),
      due: T.date(), made: T.date(), rank: T.int({ min: -1000000, max: 1000000 }), done: T.bool(),
      job_id: T.uuid(), client_id: T.uuid(),
    },
  },
  clients: {
    create: ['name'],
    fields: {
      name: T.str(200, { min: 1 }), contact: T.str(200), email: T.email(), since: T.date(),
      prefers: T.str(500), rate: T.num({ min: 0, max: 1e6 }), notes: T.str(10000),
      source: T.oneOf(['brief', 'referral', 'repeat', 'social', 'search', 'event', 'other']),
    },
    nullable: ['source'],
  },
  invoices: {
    create: ['amount'],
    fields: {
      client_id: T.uuid(), amount: T.num({ min: 0.01, max: 1e7 }), status: T.oneOf(['draft', 'sent', 'paid', 'overdue']),
      due_date: T.date(), sent_at: T.ts(), paid_at: T.ts(), label: T.str(120),
    },
  },
  jobs: {
    create: ['title', 'name'],
    fields: {
      title: T.str(200, { min: 1 }), name: T.str(200, { min: 1 }), email: T.email(), business: T.str(200),
      lane: T.oneOf(['design', 'automation']), stage: T.oneOf(['new', 'proposed', 'drafts', 'final', 'paid', 'closed']),
      billing: T.oneOf(['split', 'end']), revisions_included: T.int({ min: 0, max: 20 }), notes: T.str(10000),
      client_id: T.uuid(), close_reason: T.str(300),
    },
  },
  proposals: {
    create: ['job_id'],
    createOnly: ['job_id'],
    fields: {
      job_id: T.uuid(), summary: T.str(4000), items: T.items(), timeline: T.str(1000), terms: T.str(2000),
      billing: T.oneOf(['split', 'end']), updated_at: T.ts(), total: T.num({ min: 0, max: 1e8 }),
    },
  },
  job_events: {
    insertOnly: true,
    create: ['kind', 'body'],
    fields: {
      job_id: T.uuid(), client_id: T.uuid(), kind: T.oneOf(['note', 'call', 'meeting']),
      who: T.oneOf(['me']), body: T.str(8000, { min: 1 }),
    },
  },
  design_briefs: {
    fields: { status: T.oneOf(['new', 'answered']), answered_at: T.ts() },
  },
};

export const WRITABLE_TABLES = new Set(Object.keys(SCHEMA));
// Tables a row may be deleted from. Never jobs, proposals or invoices: those
// carry the money trail; close a job instead.
export const DELETABLE_TABLES = new Set(['clients', 'docket_tasks']);

export function validateRow(table, row, { isUpdate = false } = {}) {
  const spec = SCHEMA[table];
  if (!spec) return { error: 'Missing or invalid table.' };
  if (!row || typeof row !== 'object' || Array.isArray(row)) return { error: 'Missing or invalid row.' };
  if (isUpdate && spec.insertOnly) return { error: `${table} rows cannot be edited.` };
  const out = {};
  for (const [k, raw] of Object.entries(row)) {
    if (k === 'id') continue;
    const type = spec.fields[k];
    if (!type) return { error: `"${k}" cannot be written to ${table}.` };
    if (isUpdate && spec.createOnly && spec.createOnly.includes(k)) continue;
    if (raw === undefined) continue;
    // null is how the UI clears an optional field; each type decides whether
    // it allows that (required text, enums and numbers do not).
    if (raw === null && (spec.nullable || []).includes(k)) { out[k] = null; continue; }
    const r = type(raw);
    if (r.err) return { error: `${k} ${r.err}.` };
    out[k] = r.v;
  }
  if (!isUpdate) {
    for (const k of spec.create || []) if (out[k] === undefined || out[k] === null) return { error: `${k} is required.` };
    if (table === 'job_events' && !out.job_id && !out.client_id) return { error: 'An activity needs a job or a client.' };
  }
  if (table === 'proposals' && out.items) out.total = Math.round(out.items.reduce((s, i) => s + i.amount, 0) * 100) / 100;
  return { row: out };
}

// A short, readable "old → new" for the audit line.
const show = (v) => (v == null || v === '' ? '(empty)' : typeof v === 'object' ? JSON.stringify(v).slice(0, 80) : String(v).slice(0, 80));
const SKIP_AUDIT = new Set(['updated_at', 'rank', 'made', 'closed_at', 'stripe_url', 'stripe_payment_link_id']);

export function diffRows(before, after) {
  const changes = {};
  for (const [k, v] of Object.entries(after)) {
    if (SKIP_AUDIT.has(k)) continue;
    const a = before ? before[k] : undefined;
    if (JSON.stringify(a ?? null) !== JSON.stringify(v ?? null)) changes[k] = [a ?? null, v ?? null];
  }
  return changes;
}
export function describeChanges(changes) {
  return Object.entries(changes).map(([k, [a, b]]) => `${k.replace(/_/g, ' ')}: ${k === 'notes' || k === 'summary' ? 'edited' : `${show(a)} → ${show(b)}`}`).join('; ');
}
