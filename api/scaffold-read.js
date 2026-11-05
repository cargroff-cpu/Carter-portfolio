// api/scaffold-read.js — the Backroom's read path. Before this, the Business
// Hub and the Docket read their tables straight from the browser with the
// public anon key, which meant those tables needed a "public read" RLS
// policy — so anyone holding the (committed) anon key could read every lead,
// client, invoice and brief. Those policies are dropped in
// supabase/migrations/20261104_lockdown.sql; reads now come through here,
// with the service-role key, behind middleware.js's session check.
//
// Usage: GET /api/scaffold-read?q=<PostgREST path>, e.g.
//   /api/scaffold-read?q=leads%3Fselect%3D*%26order%3Dlast_activity_at.desc
// (the client encodes q). Whitelisted tables, GET only.
import { SUPABASE_URL, sbHeaders } from '../lib/server.js';

const ALLOWED_TABLES = new Set([
  'docket_tasks', 'clients', 'invoices',
  'jobs', 'proposals', 'job_files', 'job_events',
  'design_briefs', 'design_brief_attachments', 'brief_events',
]);

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    res.status(500).json({ error: 'Server is not configured (missing SUPABASE_SERVICE_ROLE_KEY).' });
    return;
  }

  const q = typeof req.query.q === 'string' ? req.query.q : '';
  const cut = q.indexOf('?');
  const table = cut === -1 ? q : q.slice(0, cut);
  const query = cut === -1 ? '' : q.slice(cut + 1);
  if (!ALLOWED_TABLES.has(table)) {
    res.status(400).json({ error: 'Missing or invalid table.' });
    return;
  }

  try {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/${table}${query ? '?' + query : ''}`, { headers: sbHeaders() });
    const text = await r.text();
    if (!r.ok) {
      res.status(502).json({ error: 'Supabase read failed', detail: text });
      return;
    }
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 'no-store');
    res.status(200).send(text);
  } catch (e) {
    res.status(500).json({ error: 'Unexpected error reading from Supabase.' });
  }
}
