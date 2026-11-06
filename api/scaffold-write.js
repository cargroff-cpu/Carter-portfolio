// api/scaffold-write.js — the only thing allowed to write to the Scaffold's
// tables. Originally a separate Supabase project from the public
// portfolio's; that project was deleted (moved-device cleanup, see
// DECISIONS.md) and everything now lives in the one remaining project.
// Reached only after middleware.js's cookie check has already passed. Uses
// the service-role key (server-side env var, never sent to the browser).
// Whitelisted tables only.
import { SUPABASE_URL as SCAFFOLD_SUPABASE_URL } from '../lib/server.js';
import { deactivateLink } from '../lib/stripe.js';
// Files, client actions and emails go through api/job.js; plain edits
// (a job's title, billing or notes, the proposal's lines, a client, an
// invoice, a Docket task) come through here.
const ALLOWED_TABLES = new Set([
  'docket_tasks', 'clients', 'invoices', 'jobs', 'proposals', 'job_events', 'design_briefs',
]);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) {
    res.status(500).json({ error: 'Server is not configured (missing SUPABASE_SERVICE_ROLE_KEY).' });
    return;
  }

  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch (e) {
      res.status(400).json({ error: 'Invalid JSON body.' });
      return;
    }
  }
  const { table, row, deleteId } = body || {};
  if (!table || !ALLOWED_TABLES.has(table)) {
    res.status(400).json({ error: 'Missing or invalid table.' });
    return;
  }

  if (deleteId) {
    try {
      const r = await fetch(`${SCAFFOLD_SUPABASE_URL}/rest/v1/${table}?id=eq.${encodeURIComponent(deleteId)}`, {
        method: 'DELETE',
        headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` },
      });
      if (!r.ok) {
        const detail = await r.text();
        res.status(502).json({ error: 'Supabase delete failed', detail });
        return;
      }
      res.status(200).json({ ok: true });
    } catch (e) {
      res.status(500).json({ error: 'Unexpected error deleting from Supabase.' });
    }
    return;
  }

  if (!row || typeof row !== 'object') {
    res.status(400).json({ error: 'Missing or invalid row.' });
    return;
  }

  try {
    // A row with an id updates that record; without one, inserts a new row.
    const isUpdate = !!row.id;

    // An invoice whose amount changes can't keep a Payment Link made for the
    // old amount: switch the old link off and clear it, so the client's next
    // Pay makes a fresh one for the right amount.
    if (table === 'invoices' && isUpdate && row.amount != null) {
      const cur = await fetch(`${SCAFFOLD_SUPABASE_URL}/rest/v1/invoices?id=eq.${encodeURIComponent(row.id)}&select=amount,stripe_payment_link_id`, {
        headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` },
      }).then((r) => (r.ok ? r.json() : [])).catch(() => []);
      const old = cur && cur[0];
      if (old && Number(old.amount) !== Number(row.amount) && old.stripe_payment_link_id) {
        await deactivateLink(old.stripe_payment_link_id);
        row.stripe_url = null;
        row.stripe_payment_link_id = null;
      }
    }
    const url = isUpdate
      ? `${SCAFFOLD_SUPABASE_URL}/rest/v1/${table}?id=eq.${encodeURIComponent(row.id)}`
      : `${SCAFFOLD_SUPABASE_URL}/rest/v1/${table}`;

    const r = await fetch(url, {
      method: isUpdate ? 'PATCH' : 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
        Prefer: 'return=representation',
      },
      body: JSON.stringify(row),
    });

    if (!r.ok) {
      const detail = await r.text();
      res.status(502).json({ error: 'Supabase write failed', detail });
      return;
    }

    const data = await r.json();
    res.status(200).json({ ok: true, row: Array.isArray(data) ? data[0] : data });
  } catch (e) {
    res.status(500).json({ error: 'Unexpected error writing to Supabase.' });
  }
}
