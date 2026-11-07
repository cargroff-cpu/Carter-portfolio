// api/scaffold-write.js — the only thing allowed to write the Backroom's
// tables from the browser. Reached only after middleware.js's cookie check
// has passed. Uses the service-role key (server-side env var, never sent to
// the browser).
//
// Every write is checked against lib/validate.js first: only the columns the
// Backroom's screens edit are accepted, with their types. Tokens, Stripe ids,
// approval times, revision counts and a proposal's status are changed only by
// the workflow in api/job.js. Then:
//   * edits to jobs, clients, invoices and sent proposals are written to the
//     job's (or client's) history, so "who changed what" is never lost;
//   * a paid invoice is locked, and "paid" on a job's invoice must go through
//     the Mark paid action (which switches off its Stripe link);
//   * an accepted proposal is locked;
//   * closing a job stamps closed_at and clears its automatic follow-ups;
//   * { mergeClients: { from, into } } folds one client into another.
// Files, client actions and emails go through api/job.js.
import { sb } from '../lib/server.js';
import { deactivateLink } from '../lib/stripe.js';
import { validateRow, isUuid, WRITABLE_TABLES, DELETABLE_TABLES } from '../lib/validate.js';
import { auditChange, mergeClients, closeJobTasks } from '../lib/crm.js';

const enc = encodeURIComponent;
const fail = (res, code, error) => res.status(code).json({ error });

export default async function handler(req, res) {
  if (req.method !== 'POST') return fail(res, 405, 'Method not allowed');
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) return fail(res, 500, 'Server is not configured (missing SUPABASE_SERVICE_ROLE_KEY).');

  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch (e) { return fail(res, 400, 'Invalid JSON body.'); }
  }
  body = body && typeof body === 'object' ? body : {};
  const { table, row, deleteId, mergeClients: merge } = body;

  try {
    if (merge) {
      if (!isUuid(merge.from) || !isUuid(merge.into)) return fail(res, 400, 'Pick two clients to merge.');
      return res.status(200).json({ ok: true, row: await mergeClients(merge.from, merge.into) });
    }

    if (!table || !WRITABLE_TABLES.has(table)) return fail(res, 400, 'Missing or invalid table.');

    if (deleteId) {
      if (!DELETABLE_TABLES.has(table)) return fail(res, 403, `Rows cannot be deleted from ${table}.`);
      if (!isUuid(deleteId)) return fail(res, 400, 'Invalid id.');
      await sb(`${table}?id=eq.${enc(deleteId)}`, { method: 'DELETE' });
      return res.status(200).json({ ok: true });
    }

    if (!row || typeof row !== 'object') return fail(res, 400, 'Missing or invalid row.');
    // A row with an id updates that record; without one, inserts a new row.
    const isUpdate = !!row.id;
    if (isUpdate && !isUuid(row.id)) return fail(res, 400, 'Invalid id.');

    const checked = validateRow(table, row, { isUpdate });
    if (checked.error) return fail(res, 400, checked.error);
    const cleaned = checked.row;

    let before = null;
    if (isUpdate) {
      [before] = await sb(`${table}?id=eq.${enc(row.id)}&select=*`);
      if (!before) return fail(res, 404, 'That record is gone. Reload and try again.');

      if (table === 'invoices') {
        if (before.status === 'paid' && (cleaned.amount != null || (cleaned.status && cleaned.status !== 'paid'))) return fail(res, 409, 'A paid invoice cannot be changed.');
        if (cleaned.status === 'paid' && before.status !== 'paid' && before.job_id) return fail(res, 409, 'Use Mark paid on the job, so its Stripe payment link is switched off.');
        // An invoice whose amount changes can't keep a Payment Link made for
        // the old amount: switch the old link off and clear it, so the
        // client's next Pay makes a fresh one for the right amount.
        if (cleaned.amount != null && Number(before.amount) !== Number(cleaned.amount) && before.stripe_payment_link_id) {
          await deactivateLink(before.stripe_payment_link_id);
          cleaned.stripe_url = null;
          cleaned.stripe_payment_link_id = null;
        }
      }
      if (table === 'proposals' && before.status === 'accepted') return fail(res, 409, 'An accepted proposal is locked.');
      if (table === 'jobs' && cleaned.stage) {
        if (cleaned.stage === 'closed' && before.stage !== 'closed') cleaned.closed_at = new Date().toISOString();
        else if (cleaned.stage !== 'closed' && before.stage === 'closed') { cleaned.closed_at = null; cleaned.close_reason = null; }
      }
      if (table === 'clients' || table === 'jobs' || table === 'invoices' || table === 'proposals') cleaned.updated_at = new Date().toISOString();
    }

    const url = isUpdate ? `${table}?id=eq.${enc(row.id)}` : table;
    const data = await sb(url, { method: isUpdate ? 'PATCH' : 'POST', prefer: 'return=representation', body: cleaned });
    const after = Array.isArray(data) ? data[0] : data;

    if (isUpdate) await auditChange(table, before, cleaned, after);
    if (table === 'jobs' && after && (after.stage === 'closed' || after.stage === 'paid') && (!before || before.stage !== after.stage)) await closeJobTasks(after.id);

    return res.status(200).json({ ok: true, row: after });
  } catch (e) {
    const msg = String(e.message || '');
    if (/23505|duplicate key/i.test(msg)) {
      if (table === 'clients') return fail(res, 409, 'Another client already has that email. Merge them instead.');
      if (table === 'proposals') return fail(res, 409, 'This job already has a proposal.');
      return fail(res, 409, 'That already exists.');
    }
    console.error('scaffold-write', table, msg);
    return fail(res, 502, 'Supabase write failed. Nothing was saved.');
  }
}
