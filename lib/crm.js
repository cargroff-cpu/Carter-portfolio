// lib/crm.js — the Backroom's CRM helpers, shared by the API routes:
//
//   * follow-up tasks the Backroom creates and clears itself (openTask /
//     closeTasks). They land in the Docket, tied to a job, and are never
//     duplicated: each has an auto_key such as "prop:<job id>".
//   * the audit trail (auditChange): every edit to a job, client, invoice
//     or sent proposal is written to job_events.
//   * client matching by email (findClientByEmail) and merging two clients
//     into one (mergeClients).
//
// Everything here is best effort and never throws, except mergeClients which
// reports its own errors: a failed follow-up task or audit line must not be
// the thing that breaks a brief, a payment or a save.

import { sb } from './server.js';
import { describeChanges, diffRows } from './validate.js';

const enc = encodeURIComponent;
const ymd = (d) => `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`;
export const dueIn = (days) => ymd(new Date(Date.now() + days * 864e5));

// Auto-task keys. One per job (or invoice), so repeating a step reopens the
// same task instead of adding another.
export const KEYS = {
  brief: (jobId) => `brief:${jobId}`,       // reply to a new brief
  proposal: (jobId) => `prop:${jobId}`,     // nudge a proposal that has gone quiet
  drafts: (jobId) => `drafts:${jobId}`,     // nudge for a direction pick
  final: (jobId) => `final:${jobId}`,       // check in on the final
  invoice: (invId) => `inv:${invId}`,       // chase an unpaid invoice
};

export async function openTask(key, { t, q = 'q3', due, job_id = null, client_id = null }) {
  try {
    await sb('docket_tasks?on_conflict=auto_key', {
      method: 'POST', prefer: 'resolution=merge-duplicates,return=minimal',
      body: { brand: 'me', auto_key: key, q, t: String(t).slice(0, 500), due: due || null, made: ymd(new Date()), rank: -1, done: false, job_id, client_id },
    });
  } catch (e) { console.error('openTask', key, e.message); }
}
export async function closeTasks(key) {
  if (!key) return;
  try { await sb(`docket_tasks?auto_key=eq.${enc(key)}&done=eq.false`, { method: 'PATCH', body: { done: true } }); }
  catch (e) { console.error('closeTasks', key, e.message); }
}
// When a job is dropped or paid, its automatic follow-ups are moot. Tasks
// Carter wrote himself (no auto_key) are left alone.
export async function closeJobTasks(jobId) {
  try { await sb(`docket_tasks?job_id=eq.${enc(jobId)}&auto_key=not.is.null&done=eq.false`, { method: 'PATCH', body: { done: true } }); }
  catch (e) { console.error('closeJobTasks', jobId, e.message); }
}

// ── Clients ────────────────────────────────────────────────────────────
// Emails are stored lower-cased (lib/validate.js), so an exact match works.
export async function findClientByEmail(email) {
  const e = String(email || '').trim().toLowerCase();
  if (!e) return null;
  try {
    const [c] = await sb(`clients?email=eq.${enc(e)}&select=id,name,email&limit=1`);
    return c || null;
  } catch (err) { return null; }
}

// Move everything that belongs to one client onto another, fold the gaps in
// the surviving record from the old one, then remove the old one.
export async function mergeClients(fromId, intoId) {
  if (fromId === intoId) throw new Error('Pick a different client to merge into.');
  const [from] = await sb(`clients?id=eq.${enc(fromId)}&select=*`);
  const [into] = await sb(`clients?id=eq.${enc(intoId)}&select=*`);
  if (!from || !into) throw new Error('Client not found.');

  for (const t of ['jobs', 'invoices', 'job_events', 'docket_tasks']) {
    await sb(`${t}?client_id=eq.${enc(fromId)}`, { method: 'PATCH', body: { client_id: intoId } });
  }
  // Fill what the survivor lacks; keep both notes. Delete the old record
  // first so its email is free for the survivor (emails are unique).
  const patch = {};
  for (const k of ['contact', 'email', 'prefers', 'rate', 'source']) if ((into[k] == null || into[k] === '') && from[k] != null && from[k] !== '') patch[k] = from[k];
  if (from.since && (!into.since || from.since < into.since)) patch.since = from.since;
  if (from.notes) patch.notes = into.notes ? `${into.notes}\n\n(from ${from.name}) ${from.notes}` : from.notes;
  await sb(`clients?id=eq.${enc(fromId)}`, { method: 'DELETE' });
  if (Object.keys(patch).length) patch.updated_at = new Date().toISOString();
  const [merged] = Object.keys(patch).length
    ? await sb(`clients?id=eq.${enc(intoId)}`, { method: 'PATCH', prefer: 'return=representation', body: patch })
    : [into];
  await sb('job_events', { method: 'POST', body: { client_id: intoId, kind: 'note', who: 'me', body: `Merged "${from.name}"${from.email ? ` (${from.email})` : ''} into this client.` } }).catch(() => {});
  return merged;
}

// ── Audit trail ────────────────────────────────────────────────────────
// Called by api/scaffold-write.js after a successful edit. `before` is the
// row as it was, `cleaned` what was written, `after` what Supabase returned.
export async function auditChange(table, before, cleaned, after) {
  try {
    if (!before || !after) return;
    if (table === 'proposals' && before.status === 'draft') return; // drafting is not history
    const changes = diffRows(before, cleaned);
    if (!Object.keys(changes).length) return;
    const row = { kind: changes.stage ? 'stage' : 'change', who: 'me', body: `${labelOf(table, after)}: ${describeChanges(changes)}`.slice(0, 1000), meta: { table, changes } };
    if (table === 'jobs') row.job_id = after.id;
    else if (table === 'invoices' || table === 'proposals') row.job_id = after.job_id;
    else if (table === 'clients') row.client_id = after.id;
    else return;
    if (!row.job_id && !row.client_id) return;
    await sb('job_events', { method: 'POST', body: row });
    if (row.job_id) await sb(`jobs?id=eq.${row.job_id}`, { method: 'PATCH', body: { last_activity_at: new Date().toISOString() } }).catch(() => {});
  } catch (e) { console.error('auditChange', table, e.message); }
}
function labelOf(table, row) {
  if (table === 'invoices') return `Invoice${row.label ? ' "' + row.label + '"' : ''}`;
  if (table === 'proposals') return 'Proposal';
  if (table === 'clients') return 'Client';
  return 'Job';
}
