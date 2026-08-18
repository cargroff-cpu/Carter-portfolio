// api/wick-memory.js — read-only list of what Wick has filed away. wick_memory
// has RLS enabled with no policies, so the anon key (used for campaigns/
// links/docket_tasks) gets zero access to it on purpose -- his memory of
// business decisions goes through the service-role key only, same as writes.
import { sbGet } from './wick-brain-server.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
  try {
    const rows = await sbGet('wick_memory?select=*&order=date.desc');
    res.status(200).json({ rows });
  } catch (e) {
    res.status(502).json({ error: 'Could not load memory.', rows: [] });
  }
}
