// api/scaffold-write.js — the only thing allowed to write to the Scaffold's
// Supabase project (separate project from the public portfolio's — real
// business data, not public content). Reached only after middleware.js's
// cookie check has already passed. Uses the service-role key (server-side
// env var, never sent to the browser). Whitelisted tables only.
const SCAFFOLD_SUPABASE_URL = 'https://kvgeimwitzdlstagqumw.supabase.co';
const ALLOWED_TABLES = new Set(['campaigns', 'links', 'wick_memory', 'wick_sessions', 'wick_messages', 'wick_actions', 'docket_tasks', 'generated_content']);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const serviceKey = process.env.SCAFFOLD_SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) {
    res.status(500).json({ error: 'Server is not configured (missing SCAFFOLD_SUPABASE_SERVICE_ROLE_KEY).' });
    return;
  }

  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch (e) {
      res.status(400).json({ error: 'Invalid JSON body.' });
      return;
    }
  }
  const { table, row } = body || {};
  if (!table || !ALLOWED_TABLES.has(table) || !row || typeof row !== 'object') {
    res.status(400).json({ error: 'Missing or invalid table/row.' });
    return;
  }

  try {
    // A row with an id updates that record; without one, inserts a new row.
    const isUpdate = !!row.id;
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
