// api/wick-brain-server.js — Wick's persona, tools, and context-building,
// shared by api/wick-chat.js and api/wick-close-session.js. Ported from
// design-reference/wick-brain.js: same persona text, same tool set, same
// greeting/opener logic -- but data comes from the real Scaffold Supabase
// project (via the service-role key) instead of localStorage, and the
// model call goes to the real Anthropic Messages API instead of the design
// canvas's window.claude.complete stand-in.
import fs from 'fs';
import path from 'path';

const SCAFFOLD_SUPABASE_URL = 'https://kvgeimwitzdlstagqumw.supabase.co';

function serviceHeaders() {
  const key = process.env.SCAFFOLD_SUPABASE_SERVICE_ROLE_KEY;
  return { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' };
}
async function sbGet(path) {
  const r = await fetch(`${SCAFFOLD_SUPABASE_URL}/rest/v1/${path}`, { headers: serviceHeaders() });
  if (!r.ok) return [];
  return r.json();
}
async function sbInsert(table, row) {
  const r = await fetch(`${SCAFFOLD_SUPABASE_URL}/rest/v1/${table}`, {
    method: 'POST', headers: { ...serviceHeaders(), Prefer: 'return=representation' }, body: JSON.stringify(row),
  });
  if (!r.ok) throw new Error(`Supabase insert into ${table} failed`);
  const data = await r.json();
  return Array.isArray(data) ? data[0] : data;
}

const money = (n) => (n == null ? '—' : '$' + Math.round(n).toLocaleString('en-US'));

const BRAND_NAMES = { ltw: 'Log & Timber Worx', sq: 'Squeeky Clean' };

// ── What he can see right now (real campaigns, not the prototype's fixtures) ──
async function liveSnapshot() {
  const campaigns = await sbGet('campaigns?select=*');
  const sent = campaigns.filter((c) => c.status !== 'draft');
  const lines = [];
  ['ltw', 'sq'].forEach((b) => {
    const mine = sent.filter((c) => c.brand === b);
    const spend = mine.reduce((a, c) => a + (c.cost || 0), 0);
    const leads = mine.reduce((a, c) => a + (c.leads || 0), 0);
    lines.push(`${BRAND_NAMES[b]} (${b}): ${leads} leads this month from logged campaigns, ${money(spend)} spent across ${mine.length} campaigns. (Pipedrive goal sync not yet confirmed live -- don't state a goal percentage unless it's in this snapshot.)`);
    const by = {};
    mine.forEach((c) => { by[c.channel] = by[c.channel] || { leads: 0, cost: 0 }; by[c.channel].leads += c.leads || 0; by[c.channel].cost += c.cost || 0; });
    Object.entries(by).sort((x, y) => y[1].leads - x[1].leads).forEach(([ch, v]) =>
      lines.push(`  · ${ch}: ${v.leads} leads, ${money(v.cost)} spent${v.leads ? `, ${money(Math.round(v.cost / v.leads))}/lead` : ''}`));
  });
  const flagged = campaigns.filter((c) => c.status === 'flagged');
  if (flagged.length) lines.push(`Untracked sends (no attribution assigned): ${flagged.map((c) => `${c.name} [${c.id}]`).join('; ')}.`);
  const drafts = campaigns.filter((c) => c.status === 'draft');
  if (drafts.length) lines.push(`Drafts never finished: ${drafts.map((c) => c.name).join('; ')}.`);
  lines.push('Not connected: Meta, Google Ads, ISN, NiceJob. CallRail, Constant Contact and Send Jim are manual entry only. Closed revenue is unknown -- say so rather than guessing.');
  return lines.join('\n');
}

async function memoryDigest() {
  const rows = await sbGet('wick_memory?select=*&order=date.desc&limit=24');
  if (!rows.length) return 'Nothing remembered yet, this is the first session.';
  return rows.map((r) => `[${r.date}${r.related_brand ? ' · ' + r.related_brand : ''}] ${r.topic}: ${r.summary}`).join('\n');
}

let _brandBriefCache = null;
function brandBrief() {
  if (_brandBriefCache) return _brandBriefCache;
  try {
    const ltw = fs.readFileSync(path.join(process.cwd(), 'brand', 'Brand Guide - Log and Timber Worx.md'), 'utf8');
    const sq = fs.readFileSync(path.join(process.cwd(), 'brand', 'Brand Guide - Squeeky Clean.md'), 'utf8');
    _brandBriefCache = `=== LOG & TIMBER WORX BRAND GUIDE ===\n${ltw}\n\n=== SQUEEKY CLEAN BRAND GUIDE ===\n${sq}`;
  } catch (e) {
    _brandBriefCache = '(Brand guides unavailable -- do not invent brand details, say they are not loaded.)';
  }
  return _brandBriefCache;
}

const WICK_PERSONA = `You are Wick. You run marketing intelligence for Carter Groff, who does marketing for two businesses: Log & Timber Worx (LTW, log home restoration) and Squeeky Clean (exterior cleaning). You live inside his private tool space, The Scaffold.

Who you are:
- A coworker who has been embedded in this business for years. Direct, dry, a little blunt. Never a customer-service assistant.
- You hold opinions and defend them, about channels, copy, design taste, and whether he is overcommitted across two brands. If he proposes something the numbers contradict, say so plainly and cite the number. Do not open with praise. Do not hedge with "you might also consider".
- You tell him when he is wrong. You also tell him when something he is avoiding matters more than what he asked about.
- Explicitly out of scope: his personal life, health, relationships. Redirect gracefully if these come up -- that's not your lane.
- When you do not have the data, say exactly that and name what is missing. Never estimate a number that is not in your context.
- Short paragraphs, no bullet lists unless he asks for a plan or checklist. No emoji. No sign-offs. Never use em dashes; use commas, periods or parentheses. Never say "How can I help you today?".
- Two or three sentences is usually right. Longer only when he asks for a plan.

What you can do, use the tools rather than describing the steps:
- log_campaign to write a real entry in the campaign log.
- generate_utm to mint a properly named tracking link.
- pull_numbers when you need a figure you do not already have in context.
- draft_proposal to start a proposal or campaign brief outline.
- remember for anything worth carrying into future sessions: decisions, preferences, what worked, what failed.

CRITICAL RULE ON ACTIONS: log_campaign, generate_utm, draft_proposal, and remember all WRITE data. Before calling any of them, say plainly in your text what you are about to do and wait for him to say yes -- do not call the tool in the same turn you propose it. Only call the tool once his next message confirms it. pull_numbers is read-only and needs no confirmation, call it freely.

When you write or judge copy, work from the brand guides below. The two brands are separate: never mix their palettes, fonts, imagery or language. LTW is measured and plainspoken; Squeeky is loud and neighborly. Neither uses em dashes or emoji.`;

const WICK_TOOLS = [
  {
    name: 'log_campaign',
    description: 'Create a campaign entry in the campaign log. Brand, channel and date are required; anything else can be filled later.',
    input_schema: { type: 'object', properties: { brand: { type: 'string', enum: ['ltw', 'sq'] }, channel: { type: 'string' }, date: { type: 'string', description: 'YYYY-MM-DD' }, name: { type: 'string' }, cost: { type: 'number' }, qty: { type: 'number' }, type: { type: 'string' }, audience: { type: 'string' }, notes: { type: 'string' } }, required: ['brand', 'channel', 'date'] },
  },
  {
    name: 'generate_utm',
    description: 'Build and save a UTM-tagged link using the house naming convention brand-yymm-slug.',
    input_schema: { type: 'object', properties: { brand: { type: 'string', enum: ['ltw', 'sq'] }, channel: { type: 'string' }, campaign_name: { type: 'string' }, path: { type: 'string' } }, required: ['brand', 'channel', 'campaign_name'] },
  },
  {
    name: 'pull_numbers',
    description: 'Read current campaign and lead figures. scope: overview | channels | untracked.',
    input_schema: { type: 'object', properties: { brand: { type: 'string', enum: ['ltw', 'sq', 'both'] }, scope: { type: 'string' } }, required: ['brand'] },
  },
  {
    name: 'draft_proposal',
    description: 'Start a proposal or campaign brief draft and hand back the outline you intend to write.',
    input_schema: { type: 'object', properties: { brand: { type: 'string' }, subject: { type: 'string' }, angle: { type: 'string' } }, required: ['brand', 'subject'] },
  },
  {
    name: 'remember',
    description: 'Store something worth carrying into future sessions: a decision, a preference, a result, a pattern.',
    input_schema: { type: 'object', properties: { topic: { type: 'string' }, summary: { type: 'string' }, related_brand: { type: 'string' } }, required: ['topic', 'summary'] },
  },
];

const slug = (s) => String(s || '').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const UTM_SRC = { 'Direct Mail': 'directmail', Email: 'email', Instagram: 'instagram', Facebook: 'facebook', 'Google Ads': 'google', 'Referral Program': 'partner', 'Trade Show': 'tradeshow', 'Yard Sign': 'yardsign' };
const UTM_MED = { 'Direct Mail': 'postcard', Email: 'constant-contact', Instagram: 'social', Facebook: 'social', 'Google Ads': 'cpc', 'Referral Program': 'referral', 'Trade Show': 'event', 'Yard Sign': 'print' };

// Executes one tool call server-side. Returns { result: string, link: {label,screen,id}|null, acted: string|null }.
async function runTool(name, input, sessionId) {
  if (name === 'log_campaign') {
    const rec = await sbInsert('campaigns', {
      brand: input.brand, date: input.date, channel: input.channel, type: input.type || 'Always-On',
      name: input.name || (input.channel + ' send'), audience: input.audience || null,
      qty: input.qty ?? null, cost: input.cost ?? null, attribution: null, leads: 0,
      status: (input.cost != null && input.qty != null) ? 'sent' : 'draft',
      checklist: { cost: input.cost != null, attr: false, qty: input.qty != null },
      notes: input.notes || null, created_by: 'wick', wick_session: sessionId || null,
    });
    await sbInsert('wick_actions', { session_id: sessionId || null, tool: 'log_campaign', input, result: rec.id, entity: rec.id, ok: true });
    return {
      result: `Logged ${rec.name} (${rec.id}) as ${rec.status}. Checklist still open: ${Object.entries(rec.checklist).filter(([, v]) => !v).map(([k]) => k).join(', ') || 'none'}.`,
      link: { label: 'Open ' + rec.name, screen: 'detail', id: rec.id }, acted: 'logged a campaign',
    };
  }
  if (name === 'generate_utm') {
    const host = input.brand === 'ltw' ? 'logandtimberworx.com' : 'squeekycleanva.com';
    const d = new Date(); const yy = String(d.getFullYear()).slice(2); const mm = String(d.getMonth() + 1).padStart(2, '0');
    const camp = `${input.brand === 'ltw' ? 'ltw' : 'squeeky'}-${yy}${mm}-${slug(input.campaign_name)}`;
    const p = (input.path || '').replace(/^\/?/, '/').replace(/^\/$/, '');
    const url = `https://${host}${p}?utm_source=${UTM_SRC[input.channel] || slug(input.channel)}&utm_medium=${UTM_MED[input.channel] || 'referral'}&utm_campaign=${camp}`;
    await sbInsert('links', { name: camp, brand: input.brand, channel: input.channel, date: d.toISOString().slice(0, 10), url });
    await sbInsert('wick_actions', { session_id: sessionId || null, tool: 'generate_utm', input, result: url, entity: camp, ok: true });
    return { result: url, link: null, acted: 'built a link' };
  }
  if (name === 'pull_numbers') {
    return { result: await liveSnapshot(), link: null, acted: null };
  }
  if (name === 'draft_proposal') {
    await sbInsert('wick_actions', { session_id: sessionId || null, tool: 'draft_proposal', input, result: 'outline only', ok: true });
    return { result: `Draft started for ${input.subject} (${input.brand}). Held in this session -- writing it to a proposals table is a later phase.`, link: null, acted: 'started a proposal draft' };
  }
  if (name === 'remember') {
    await sbInsert('wick_memory', { topic: input.topic, summary: input.summary, related_brand: input.related_brand || null, kind: 'decision', source: 'conversation', session_id: sessionId || null });
    await sbInsert('wick_actions', { session_id: sessionId || null, tool: 'remember', input, result: 'filed', ok: true });
    return { result: 'Filed.', link: null, acted: 'remembered something' };
  }
  return { result: 'Unknown tool.', link: null, acted: null };
}

// ── Greeting + opener (real data, not the prototype's fixed BRANDS.goal) ──
function wickGreeting(lastSeenMs) {
  const h = new Date().getHours();
  const hour = h < 5 ? 'Late one' : h < 12 ? 'Morning' : h < 17 ? 'Afternoon' : 'Evening';
  if (lastSeenMs == null) return `${hour}. I'm Wick.`;
  const gap = Math.round((Date.now() - lastSeenMs) / 864e5);
  if (gap >= 7) return `${hour}. It has been a week.`;
  if (gap >= 2) return `${hour}. Been a few days.`;
  if (gap === 0 && h >= 5) return 'Back again.';
  return hour + '.';
}
async function wickOpener() {
  const campaigns = await sbGet('campaigns?select=*');
  const flagged = campaigns.filter((c) => c.status === 'flagged');
  if (flagged.length) {
    const c = flagged[0];
    return `${c.name} went out with no attribution on it, so whatever it pulled is landing nowhere${flagged.length > 1 ? `, and it isn't the only one, there are ${flagged.length} sitting like that` : ''}. Fix that before anything else.`;
  }
  const drafts = campaigns.filter((c) => c.status === 'draft');
  if (drafts.length) return `Nothing's flagged. The loose end is ${drafts[0].name}, still a draft with nothing costed. Want to finish it or kill it?`;
  if (!campaigns.length) return `Nothing logged yet. Once a few campaigns are in I'll have something sharper to say than good morning.`;
  return `Nothing untracked and nothing sitting as a draft. Good week to work on something that isn't urgent.`;
}

// Cheap/fast model for routine turns; escalate to the capable one for
// anything that reads like real analysis, drafting, or judgment. Simple
// heuristic, meant to be tuned once this is actually in use.
function pickModel(latestUserText) {
  const t = (latestUserText || '').trim();
  const heavy = /\b(why|draft|write|analyz|compare|should i|opinion|think|propose|plan)\b/i.test(t) || t.length > 220;
  return heavy ? 'claude-sonnet-5' : 'claude-haiku-4-5-20251001';
}

export {
  sbGet, sbInsert, liveSnapshot, memoryDigest, brandBrief, WICK_PERSONA, WICK_TOOLS, runTool,
  wickGreeting, wickOpener, pickModel, SCAFFOLD_SUPABASE_URL, serviceHeaders,
};
