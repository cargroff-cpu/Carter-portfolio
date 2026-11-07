// scripts/check-crm.mjs — `npm test`. Checks the Backroom's write validation
// (lib/validate.js) and the audit diff, with no network and no database.
import assert from 'node:assert/strict';
import { validateRow, diffRows, describeChanges, WRITABLE_TABLES, DELETABLE_TABLES } from '../lib/validate.js';

const ID = '123e4567-e89b-12d3-a456-426614174000';
const ok = (t, row, opts) => { const r = validateRow(t, row, opts); assert.ok(!r.error, `${t}: ${r.error}`); return r.row; };
const bad = (t, row, opts, re) => { const r = validateRow(t, row, opts); assert.ok(r.error, `${t} should be rejected`); if (re) assert.match(r.error, re); };

// Columns only the workflow may change are refused.
bad('jobs', { id: ID, token: 'abc' }, { isUpdate: true }, /token/);
bad('jobs', { id: ID, approved_at: new Date().toISOString() }, { isUpdate: true }, /approved_at/);
bad('jobs', { id: ID, revisions_used: 0 }, { isUpdate: true }, /revisions_used/);
bad('invoices', { id: ID, stripe_url: 'https://x' }, { isUpdate: true }, /stripe_url/);
bad('invoices', { id: ID, job_id: ID }, { isUpdate: true }, /job_id/);
bad('proposals', { id: ID, status: 'accepted' }, { isUpdate: true }, /status/);

// Types and enums.
bad('invoices', { id: ID, status: 'refunded' }, { isUpdate: true }, /status/);
bad('invoices', { amount: -5 }, {}, /amount/);
bad('invoices', { amount: 'abc' }, {}, /amount/);
bad('docket_tasks', { q: 'q9', t: 'x' }, {}, /q/);
bad('docket_tasks', { q: 'q1', t: '' }, {}, /t/);
bad('docket_tasks', { q: 'q1', t: 'x', due: 'tomorrow' }, {}, /due/);
bad('clients', { name: 'A', email: 'not-an-email' }, {}, /email/);
bad('clients', { name: '   ' }, {}, /name/);
bad('jobs', { id: ID, stage: 'archived' }, { isUpdate: true }, /stage/);
bad('jobs', { title: 'x' }, {}, /name/);                           // name required on create
bad('job_events', { kind: 'email', body: 'x', job_id: ID }, {}, /kind/);  // only note/call/meeting
bad('job_events', { kind: 'note', body: 'x' }, {}, /job or a client/);
bad('job_events', { id: ID, body: 'x' }, { isUpdate: true }, /cannot be edited/);
bad('nope', { a: 1 }, {});

// Good rows, and cleaning.
assert.equal(ok('clients', { name: ' Dana ', email: ' Dana@Example.COM ' }).email, 'dana@example.com');
assert.equal(ok('clients', { name: 'Dana', email: '' }).email, null);
assert.equal(ok('clients', { id: ID, source: null }, { isUpdate: true }).source, null);
assert.equal(ok('invoices', { id: ID, status: 'paid', paid_at: '2026-11-07T10:00:00Z' }, { isUpdate: true }).status, 'paid');
assert.deepEqual(ok('docket_tasks', { id: ID, done: true }, { isUpdate: true }), { done: true });
assert.equal(ok('docket_tasks', { id: ID, due: null }, { isUpdate: true }).due, null);
assert.equal(ok('docket_tasks', { brand: 'me', q: 'q1', t: 'Do it', due: null, made: '2026-11-07', rank: -1, done: false }).rank, -1);
assert.equal(ok('job_events', { client_id: ID, kind: 'call', who: 'me', body: 'Rang about the logo' }).kind, 'call');
const prop = ok('proposals', { id: ID, job_id: ID, items: [{ label: 'A', amount: '1200.50' }, { label: 'B', amount: 300 }], total: 1, billing: 'split' }, { isUpdate: true });
assert.equal(prop.total, 1500.5, 'proposal total is recomputed from its lines');
assert.equal(prop.job_id, undefined, 'job_id cannot be moved on update');

// Audit diff.
const ch = diffRows({ stage: 'new', title: 'T', updated_at: 'a' }, { stage: 'drafts', title: 'T', updated_at: 'b' });
assert.deepEqual(Object.keys(ch), ['stage']);
assert.equal(describeChanges(ch), 'stage: new → drafts');
assert.deepEqual(diffRows({ a: null }, { a: undefined }), {});

// The Hub's follow-up tasks, client custom fields and call/meeting notes.
assert.equal(ok('crm_tasks', { title: 'Call Dana', due_on: '2026-11-12', job_id: ID, client_id: null }).title, 'Call Dana');
assert.equal(ok('crm_tasks', { id: ID, done_at: '2026-11-07T10:00:00Z', updated_at: '2026-11-07T10:00:00Z' }, { isUpdate: true }).done_at, '2026-11-07T10:00:00.000Z');
assert.equal(ok('crm_tasks', { id: ID, done_at: null }, { isUpdate: true }).done_at, null);
bad('crm_tasks', { id: ID, auto_key: 'x' }, { isUpdate: true }, /auto_key/);
bad('crm_tasks', { title: '' }, {}, /title/);
assert.deepEqual(ok('clients', { id: ID, custom: { Instagram: '@dana' } }, { isUpdate: true }).custom, { Instagram: '@dana' });
bad('clients', { id: ID, custom: 'x' }, { isUpdate: true }, /custom/);
assert.deepEqual(ok('job_events', { job_id: ID, kind: 'note', who: 'me', body: 'Rang', meta: { type: 'call' } }).meta, { type: 'call' });

assert.ok(!DELETABLE_TABLES.has('jobs') && !DELETABLE_TABLES.has('invoices') && DELETABLE_TABLES.has('clients'));
assert.ok(WRITABLE_TABLES.has('docket_tasks'));
console.log('check-crm: all good');
