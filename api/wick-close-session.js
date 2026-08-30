// api/wick-close-session.js — distills a finished conversation into at most
// four wick_memory rows (decisions, preferences, results, disagreements),
// rather than keeping the raw transcript. Called when the thread closes
// (the "File notes & clear" button, or pagehide if the conversation had
// more than a couple of real turns).
import { sbInsert } from './wick-brain-server.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  let body = req.body;
  if (typeof body === 'string') { try { body = JSON.parse(body); } catch (e) { body = {}; } }
  const history = Array.isArray(body && body.history) ? body.history : [];
  const userTurns = history.filter((m) => m.role === 'user').length;

  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) { res.status(200).json({ ok: true, filed: 0, note: 'Supabase not configured.' }); return; }

  // Always log the session itself, even if it's too short to summarize --
  // "what did we talk about in July" needs a row to exist at all.
  let session;
  try {
    session = await sbInsert('wick_sessions', { ended_at: new Date().toISOString(), turns: history.length });
  } catch (e) {
    res.status(502).json({ error: 'Could not log the session.' });
    return;
  }

  if (userTurns < 2) { res.status(200).json({ ok: true, filed: 0, sessionId: session.id }); return; }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) { res.status(200).json({ ok: true, filed: 0, sessionId: session.id, note: 'Model not configured, session logged but not summarized.' }); return; }

  try {
    const transcript = history.map((m) => `${m.role === 'user' ? 'Carter' : 'Wick'}: ${m.text}`).join('\n\n');
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001', max_tokens: 500,
        system: 'Distil this working conversation into at most four memory rows. Reply with JSON only, no prose: [{"topic":"short label","summary":"one sentence worth remembering months from now","related_brand":"ltw|sq|null"}]. Keep decisions, preferences, results and disagreements. Drop pleasantries and anything already obvious from the data.',
        messages: [{ role: 'user', content: transcript }],
      }),
    });
    if (!r.ok) { res.status(200).json({ ok: true, filed: 0, sessionId: session.id, note: 'Summarizer call failed.' }); return; }
    const data = await r.json();
    const text = (data.content || []).filter((b) => b.type === 'text').map((b) => b.text).join('');
    let rows = [];
    try { rows = JSON.parse(text.slice(text.indexOf('['), text.lastIndexOf(']') + 1)) || []; } catch (e) { rows = []; }

    let filed = 0;
    for (const row of rows.slice(0, 4)) {
      if (!row.topic || !row.summary) continue;
      await sbInsert('wick_memory', {
        topic: row.topic, summary: row.summary,
        related_brand: row.related_brand === 'null' ? null : (row.related_brand || null),
        kind: 'decision', source: 'conversation', session_id: session.id,
      });
      filed++;
    }
    res.status(200).json({ ok: true, filed, sessionId: session.id });
  } catch (e) {
    res.status(200).json({ ok: true, filed: 0, sessionId: session.id, note: 'Summarizer errored.' });
  }
}
