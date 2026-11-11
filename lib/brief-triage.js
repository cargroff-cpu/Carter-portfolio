// lib/brief-triage.js — triage for incoming briefs, done by a script.
//
// Reads a brief and prepares a ready-to-approve package: a short summary, a
// rough scope, what is missing, red flags, the starting price from the site,
// and a draft reply. It PREPARES; it never sends. Carter approves, edits or
// rejects every one in the Business Hub (api/brief-reply.js does the send).
//
// No AI and no outside call (2026-11-11): plain rules, so it costs nothing,
// runs in a millisecond, always answers, and gives the same answer for the
// same brief. The rules are the ones the AI used to be told to follow:
//   scope    small / medium / large, from what was asked for and what exists
//   missing  the details that most often cause extra rounds
//   flags    a rush date, a budget under the starting price, a vague ask
// The draft reply asks for exactly what is missing, or says a proposal is on
// its way. Change the wording in ASK and draftReply below.
import { sb } from './server.js';

// Starting prices, as shown on the public page (design.jsx DESIGN_SERVICES).
// Only ever shown to Carter as "starts from"; the draft reply never quotes.
const FROM = { 'Social graphics': 75, 'Business card or print': 150, 'Flyer or one-pager': 150, 'Document or report': 400, 'Presentation or deck': 400, 'Brand basics': 400 };
const QUOTED = ['Website', 'Video', 'Something else'];       // priced per job
// The most each budget range allows.
const BUDGET_TOP = { 'Under $150': 150, '$150–$500': 500, '$500–$1,500': 1500, '$1,500–$5,000': 5000, '$5,000+': Infinity };
const usd = (n) => '$' + Number(n).toLocaleString('en-US');
const first = (n) => String(n || '').trim().split(/\s+/)[0] || 'there';
const has = (v) => typeof v === 'string' && v.trim().length > 0;

// What each missing detail is called in the Hub, and how the reply asks for it.
const ASK = {
  what: ['what exactly to make', 'What exactly would you like made? One or two examples are plenty.'],
  detail: ['more about the job', 'A little more about the job: who it is for and what it has to do.'],
  copy: ['the exact wording', 'The exact wording that has to appear, pasted as you want it.'],
  where: ['where it will run', 'Where it will run (Instagram, print, a website), so I get the sizes right.'],
  assets: ['brand assets', 'Your logo, colors and fonts, or tell me if those need making too.'],
  when: ['a deadline', 'When you need it by, or tell me the date can move.'],
  budget: ['a budget range', 'A rough budget, so I size the proposal to it.'],
  slow: ['what is slow today', 'The step that eats the most time today.'],
  tools: ['the tools they use', 'The tools you use now (email, spreadsheets, booking or payment software).'],
  who: ['who does it now', 'Who does this work today, and roughly how often.'],
};

// Whole business days from today to a YYYY-MM-DD date (-1 if it has passed).
function businessDaysUntil(ymd, now = new Date()) {
  const end = new Date(ymd + 'T12:00:00Z');
  const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 12));
  if (isNaN(end)) return null;
  if (end < d) return -1;
  let n = 0;
  while (d < end) { d.setUTCDate(d.getUTCDate() + 1); const w = d.getUTCDay(); if (w !== 0 && w !== 6) n++; }
  return n;
}

// Returns { ok: true, triage }. Synchronous: there is nothing to wait for.
export function triageBrief(b, { now = new Date() } = {}) {
  const auto = b.lane === 'automation';
  const need = Array.isArray(b.need) ? b.need : [];
  const about = String(b.about || '');
  const text = `${about} ${b.notes || ''}`.toLowerCase();

  // Missing ------------------------------------------------------------
  const miss = [];
  if (!need.length && about.trim().length < 60) miss.push('what');
  else if (about.trim().length < 25) miss.push('detail');   // a bare phrase, not a sentence
  if (auto) {
    if (!has(b.auto_slow)) miss.push('slow');
    if (!has(b.auto_tools)) miss.push('tools');
    if (!has(b.auto_who)) miss.push('who');
  } else {
    // A website, brand work or a video is not something you paste copy or a size for.
    const loose = need.length > 0 && need.every((n) => ['Website', 'Brand basics', 'Video'].includes(n));
    if (!loose && !has(b.copy)) miss.push('copy');
    if (!loose && !has(b.where)) miss.push('where');
    if (!b.assets || b.assets === 'No') miss.push('assets');
  }
  if (!b.when_date && !b.flexible) miss.push('when');
  if (!b.budget || b.budget === 'Not sure yet') miss.push('budget');

  // Scope --------------------------------------------------------------
  const pages = Number((text.match(/\b(\d{2,})\s*pages?\b/) || [])[1] || 0);
  const many = /\b(series|set of|multiple|several|campaign)\b/.test(text) || /\b([4-9]|\d{2,}|five|six|seven|eight|nine|ten)[\s-]*(posts?|pieces?|graphics?|slides?|pages?)\b/.test(text);
  let scope = 'small';
  if (need.length >= 2 || many || (!auto && (b.assets === 'Some' || !has(b.copy)))) scope = 'medium';
  if (auto || need.length >= 3 || need.includes('Website') || (need.includes('Brand basics') && b.assets === 'No') || pages > 10) scope = 'large';

  // Price --------------------------------------------------------------
  const floor = need.filter((n) => FROM[n]).reduce((s, n) => s + FROM[n], 0);
  const quoted = need.some((n) => QUOTED.includes(n));
  const suggested_price = floor ? `starts from ${usd(floor)}${quoted ? ', plus the quoted items' : ''}` : null;

  // Red flags ----------------------------------------------------------
  const flags = [];
  const days = b.when_date ? businessDaysUntil(b.when_date, now) : null;
  if (days != null && days < 0) flags.push('The date they gave has already passed');
  else if (days != null && days < 3) flags.push(`Rush: needed in ${days} business day${days === 1 ? '' : 's'}`);
  else if (days != null && scope === 'large' && days < 10) flags.push(`Tight for a large job: ${days} business days`);
  const top = BUDGET_TOP[b.budget];
  if (top != null && floor > top) flags.push(`Budget (${b.budget}) is under the starting price (${usd(floor)})`);
  if (top != null && top <= 500 && (auto || need.includes('Website'))) flags.push(`Budget (${b.budget}) is low for ${auto ? 'a custom tool' : 'a website'}`);
  if (need.length === 1 && need[0] === 'Something else') flags.push('Outside the usual list: read it closely');
  if (need.includes('Video')) flags.push('Video is quoted individually');
  if ((about.match(/https?:\/\//g) || []).length > 3) flags.push('Several links in the description: check it is a real inquiry');
  if (about.length > 3000) flags.push('A very long brief: the ask may need narrowing');

  // Summary ------------------------------------------------------------
  const what = need.length ? need.join(', ').toLowerCase() : auto ? 'a tool' : 'design work';
  const facts = [
    b.when_date ? `needed by ${b.when_date}` : b.flexible ? 'date flexible' : 'no date given',
    b.budget && b.budget !== 'Not sure yet' ? `budget ${b.budget}` : 'no budget given',
    b.attachment_count ? `${b.attachment_count} file${b.attachment_count === 1 ? '' : 's'} attached` : null,
    b.bat ? "found Bat's mouse (5% off)" : null,
  ].filter(Boolean).join(', ');
  const gist = about.replace(/\s+/g, ' ').trim();
  const cut = gist.length > 220 ? gist.slice(0, 217) + '…' : gist;
  const summary = `${b.name}${b.business ? ' at ' + b.business : ''} wants ${what}: ${cut}${/[.!?…]$/.test(cut) ? '' : '.'} ${facts.charAt(0).toUpperCase() + facts.slice(1)}.`.slice(0, 600);

  return { ok: true, triage: {
    summary, lane: auto ? 'Automation' : 'Design', scope,
    missing: miss.map((k) => ASK[k][0]), red_flags: flags, suggested_price,
    draft_reply: draftReply(b, { what, miss, days }),
    model: 'rules', status: 'pending',
  } };
}

// The reply, as Carter: warm, plain, short. Asks for exactly what is missing,
// otherwise says the proposal is coming. Never names a price.
function draftReply(b, { what, miss, days }) {
  const out = [`Hi ${first(b.name)},`];
  // A budget or a date alone is not worth a round trip: ask only when
  // something that changes the work is missing too.
  const ask = miss.some((k) => k !== 'budget' && k !== 'when') ? miss : [];
  out.push(`Thanks for the brief${b.business ? ' for ' + b.business : ''}. I've read it through: ${what}${b.when_date ? `, needed by ${b.when_date}` : ''}.`);
  if (days != null && days >= 0 && days < 3) out.push("That date is close. I'll tell you straight in the proposal whether I can hit it.");
  if (ask.length) {
    out.push(`To price it properly I need ${ask.length === 1 ? 'one more thing' : 'a few more things'}:\n${ask.map((k) => '- ' + ASK[k][1]).join('\n')}`);
    out.push('Reply here with those and your proposal follows, with a price and a delivery date.');
  } else {
    out.push('I have what I need. Your proposal is next, with a price and a delivery date, usually within one business day. It will be on your project page.');
  }
  if (b.bat) out.push("And yes, Bat's favour stands: 5% comes off the final price.");
  out.push('Carter');
  return out.join('\n\n').slice(0, 2000);
}

// Triage + save onto the brief row. Never throws.
export async function triageAndSave(brief, opts) {
  let result;
  try { result = triageBrief(brief, opts); } catch (e) { return { ok: false, error: 'Triage failed: ' + e.message }; }
  try {
    await sb(`design_briefs?id=eq.${encodeURIComponent(brief.id)}`, {
      method: 'PATCH', body: { triage: result.triage, triaged_at: new Date().toISOString() },
    });
  } catch (e) {
    return { ok: false, error: 'Triage ran but could not be saved: ' + e.message };
  }
  return result;
}
