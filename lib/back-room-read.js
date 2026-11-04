// lib/back-room-read.js (served at /api/back-room-read via a vercel.json rewrite; Hobby plan caps deployments at 12 functions) — the only way The Back Room reads its private tables.
// Reached only after middleware.js's session check. Proxies a GET to
// Supabase's REST API with the service-role key, so the browser never needs
// (and the anon key no longer has) read access to client, lead, invoice or
// brief data. Whitelisted tables only, read-only.
const SUPABASE_URL = 'https://rodxrkzwpsgeeatmbwku.supabase.co';
const ALLOWED_TABLES = new Set([
  'campaigns', 'links', 'docket_tasks', 'generated_content',
  'clients', 'leads', 'lead_messages', 'projects', 'project_deliverables', 'invoices', 'notes',
  'design_briefs', 'design_brief_attachments',
]);

export default async function readHandler(req, res) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) {
    res.status(500).json({ error: 'Server is not configured (missing SUPABASE_SERVICE_ROLE_KEY).' });
    return;
  }

  const path = typeof req.query.path === 'string' ? req.query.path : '';
  const table = path.split('?')[0];
  if (!ALLOWED_TABLES.has(table) || path.includes('..') || path.includes('/')) {
    res.status(400).json({ error: 'Missing or invalid table.' });
    return;
  }

  try {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
      headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` },
    });
    const text = await r.text();
    res.status(r.status).setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 'no-store');
    res.send(text);
  } catch (e) {
    res.status(502).json({ error: 'Could not reach the database.' });
  }
}
