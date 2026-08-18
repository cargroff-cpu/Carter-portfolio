// api/content-generate.js — Content Builder's generation endpoint. Same
// engine Wick uses (real Anthropic call, server-side, brand guides read
// straight off disk) so a piece built here and a piece Wick drafts follow
// identical rules. The design prototype's window.claude.complete ran this
// same prompt shape directly in the browser (design-reference/mcc-builder.js)
// -- this is the real replacement, same graceful-degrade shape as
// api/wick-chat.js when ANTHROPIC_API_KEY isn't set yet.
import { brandBrief } from './wick-brain-server.js';

const BRAND_NAMES = { ltw: 'Log & Timber Worx', sq: 'Squeeky Clean' };

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  let body = req.body;
  if (typeof body === 'string') { try { body = JSON.parse(body); } catch (e) { body = {}; } }
  const { brand, kind, module: mod, brief, refine, previous } = body || {};
  if (!brand || !BRAND_NAMES[brand] || !kind || !brief) {
    res.status(400).json({ error: 'Missing brand, kind, or brief.' });
    return;
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    res.status(200).json({
      configured: false,
      message: "I'm not connected to the model yet, so I can't write this one. Add ANTHROPIC_API_KEY and try again.",
    });
    return;
  }

  const system = `You write ${BRAND_NAMES[brand]} marketing collateral, working strictly from the brand guides below. Never borrow the other brand's colors, fonts, voice, or imagery -- both guides are included so you know exactly where that line is. You are writing for ${BRAND_NAMES[brand]} only.

${brandBrief()}

Headlines render as uppercase display type in the real templates, so write them as short clipped sentences that read well in caps. Pick one word copied exactly from the headline to highlight.
Never use em dashes. No emoji, no urgency theater.
Reply with JSON only, no prose before or after the object: {"title":"short internal label for this piece","eyebrow":"short kicker line","subject":"the headline","hi":"one word copied exactly from subject, to highlight","preheader":"one short supporting line","greeting":"a greeting line, or null if this brand doesn't use one","body":["paragraph","paragraph"],"cta":"primary call to action","cta2":"secondary call to action, or null"}`;

  const userLines = [];
  if (refine && previous) userLines.push(`Revise this piece: ${JSON.stringify(previous)}\n\nApply this note:`);
  userLines.push(brief);
  if (mod) userLines.push(`Build it around the "${mod}" module.`);
  userLines.push(`Format: ${kind}.`);

  try {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({
        model: 'claude-sonnet-5',
        max_tokens: 900,
        system,
        messages: [{ role: 'user', content: userLines.join('\n\n') }],
      }),
    });
    if (!r.ok) {
      const detail = await r.text();
      res.status(502).json({ error: 'Claude call failed', detail });
      return;
    }
    const data = await r.json();
    const text = (data.content || []).filter((b) => b.type === 'text').map((b) => b.text).join('');
    const jsonStart = text.indexOf('{');
    const jsonEnd = text.lastIndexOf('}');
    if (jsonStart === -1 || jsonEnd === -1) {
      res.status(502).json({ error: 'Model reply was not in the expected format.' });
      return;
    }
    const piece = JSON.parse(text.slice(jsonStart, jsonEnd + 1));
    res.status(200).json({ configured: true, piece: { ...piece, brand, kind } });
  } catch (e) {
    res.status(500).json({ error: 'Unexpected error talking to Claude.' });
  }
}
