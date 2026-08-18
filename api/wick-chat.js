// api/wick-chat.js — Wick's conversation endpoint. Builds his system prompt
// (persona + both brand guides + a live Supabase snapshot + his memory
// digest), then runs the real Anthropic tool-use loop server-side (the
// design prototype's window.claude.complete was a design-canvas stand-in,
// not a real API -- this is the actual replacement).
import { liveSnapshot, memoryDigest, brandBrief, WICK_PERSONA, WICK_TOOLS, runTool, pickModel } from './wick-brain-server.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    res.status(200).json({
      reply: "I'm not connected to the model yet, so I can't think out loud here, but the data's loaded and the room works. Add ANTHROPIC_API_KEY and I'll answer properly.",
      links: [], did: '',
    });
    return;
  }

  let body = req.body;
  if (typeof body === 'string') { try { body = JSON.parse(body); } catch (e) { body = {}; } }
  const history = Array.isArray(body && body.history) ? body.history : [];
  const sessionId = body && body.sessionId ? body.sessionId : null;
  if (!history.length) { res.status(400).json({ error: 'Missing history.' }); return; }

  try {
    const [snapshot, memory, brands] = await Promise.all([liveSnapshot(), memoryDigest(), Promise.resolve(brandBrief())]);
    const system = `${WICK_PERSONA}

BRAND GUIDES:
${brands}

CURRENT DATA (read-only, as of ${new Date().toDateString()}):
${snapshot}

WHAT YOU REMEMBER FROM PAST SESSIONS:
${memory}`;

    const latest = [...history].reverse().find((m) => m.role === 'user');
    const model = pickModel(latest ? latest.text : '');

    let messages = history.map((m) => ({ role: m.role, content: m.text }));
    const links = [];
    let did = '';

    for (let iter = 0; iter < 5; iter++) {
      const r = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
        body: JSON.stringify({ model, max_tokens: 900, system, tools: WICK_TOOLS, messages }),
      });
      if (!r.ok) {
        const detail = await r.text();
        res.status(502).json({ error: 'Claude call failed', detail });
        return;
      }
      const data = await r.json();
      const toolUses = (data.content || []).filter((b) => b.type === 'tool_use');

      if (!toolUses.length || data.stop_reason !== 'tool_use') {
        const text = (data.content || []).filter((b) => b.type === 'text').map((b) => b.text).join('\n\n');
        res.status(200).json({ reply: text || "I don't have anything to say to that.", links, did });
        return;
      }

      messages.push({ role: 'assistant', content: data.content });
      const toolResults = [];
      for (const tu of toolUses) {
        try {
          const out = await runTool(tu.name, tu.input, sessionId);
          if (out.link) links.push(out.link);
          if (out.acted) did = did ? did + ' · ' + out.acted : ('Acted: ' + out.acted);
          toolResults.push({ type: 'tool_result', tool_use_id: tu.id, content: out.result });
        } catch (e) {
          toolResults.push({ type: 'tool_result', tool_use_id: tu.id, content: 'That action failed server-side.', is_error: true });
        }
      }
      messages.push({ role: 'user', content: toolResults });
    }

    res.status(200).json({ reply: "That took more steps than I'm willing to chain without checking in. What do you want next?", links, did });
  } catch (e) {
    res.status(500).json({ error: 'Unexpected error talking to Claude.' });
  }
}
