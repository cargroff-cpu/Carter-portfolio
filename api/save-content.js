// api/save-content.js — the only thing allowed to write to Supabase.
// Reached only after middleware.js's session check has already passed,
// so no separate password check is needed here. Uses the service-role key
// (server-side env var, never sent to the browser) to upsert the admin's
// published payload into the site_content table: row 1 is the portfolio
// (Admin.html), row 2 is the Scaffold page (?page=scaffold, from the Back
// Room's Scaffold editor). Both rows are public-read; only this writes.
import { SUPABASE_URL } from '../lib/server.js';

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

  const page = (req.query && req.query.page) || '';
  if (page && page !== 'scaffold') {
    res.status(400).json({ error: 'Unknown page.' });
    return;
  }
  const rowId = page === 'scaffold' ? 2 : 1;

  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch (e) {
      res.status(400).json({ error: 'Invalid JSON body.' });
      return;
    }
  }
  if (!body || typeof body !== 'object') {
    res.status(400).json({ error: 'Missing JSON body.' });
    return;
  }

  try {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/site_content`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
        Prefer: 'resolution=merge-duplicates,return=minimal',
      },
      body: JSON.stringify({ id: rowId, data: body, updated_at: new Date().toISOString() }),
    });

    if (!r.ok) {
      const detail = await r.text();
      res.status(502).json({ error: 'Supabase write failed', detail });
      return;
    }

    res.status(200).json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: 'Unexpected error writing to Supabase.' });
  }
}
