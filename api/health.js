// api/health.js — daily keep-alive (vercel.json cron). Runs one tiny query so
// the free Supabase project never pauses from inactivity, which is what
// silently broke the brief form before. Also handy as a manual status check.
const SUPABASE_URL = 'https://rodxrkzwpsgeeatmbwku.supabase.co';
const ANON_KEY = 'sb_publishable_fWE-gd3uSKDe0BpUK5WSxQ_f3Uzgd0x';

export default async function handler(req, res) {
  try {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/site_content?select=id&limit=1`, { headers: { apikey: ANON_KEY } });
    res.setHeader('Cache-Control', 'no-store');
    res.status(r.ok ? 200 : 503).json({ ok: r.ok, database: r.ok ? 'up' : `status ${r.status}`, at: new Date().toISOString() });
  } catch (e) {
    res.status(503).json({ ok: false, database: 'unreachable' });
  }
}
