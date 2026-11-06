// lib/mail.js — the Scaffold's branded email frame, for every email that goes
// to a client from the Backroom (Mail), the brief confirmations, and the notes
// that go to Carter.
//
// You type a heading and a message; it goes out inside one ready-made frame
// (lamplit header, a five-step "where your project is" track, one button), so no
// one writes HTML. Email-safe on purpose: tables, inline styles, bgcolor
// fallbacks, a hidden preheader, dark only. Everything typed is escaped; the
// only markup that appears is ours (paragraphs, line breaks, links to http(s)
// URLs, the panels and the buttons), so a message cannot inject HTML.
//
// Optional extras make an email richer without changing how it is typed:
//   stage   0-4 → lights the track (Brief, Proposal, Directions, Final, Paid)
//   eyebrow small line above the heading
//   panels  [{ type: 'facts'|'steps'|'amount'|'pips'|'waiting'|'ref'|'stats', … }]
//   button / button2  { label, url }
//   tone    'client' (amber, lamps) or 'internal' (enamel green, no lamps)
//   letter  true → compact header, no track (a plain personal note)

import { esc, BRAND_FULL } from './server.js';

const ORIGIN = 'https://scaffold.cargroff.com';
// A dark, lamplit palette: warm near-black, cream type, amber for the one
// thing that matters. Text colours are all at least 4.5:1 on their surface.
const C = { outer: '#0f0a06', card: '#1d140c', head: '#1a120b', panel: '#241810', foot: '#150e08', ink: '#ecd9b2', title: '#f8ecd0', soft: '#b9a47c', rule: '#4a3722', amber: '#d99a3d', lit: '#f5cd6a', btnInk: '#1a120b', mute: '#9a8462', brass: '#c2a46a', brassLit: '#e0c88f', green: '#2f5640', greenDeep: '#12261b', greenLit: '#8fc4a0', greenSoft: '#a9c7b2' };
const SERIF = "'Cormorant Garamond',Georgia,'Times New Roman',serif";
const BODY = "Spectral,Georgia,'Times New Roman',serif";
const SANS = "Karla,Arial,Helvetica,sans-serif";

export const STEPS = ['Brief', 'Proposal', 'Directions', 'Final', 'Paid'];
export const jobUrl = (token) => `${ORIGIN}/j/${encodeURIComponent(token)}`;

const safeHref = (u) => (/^https?:\/\/[^\s"'<>]+$/i.test(u) ? u : null);

// Plain text to email HTML: blank lines split paragraphs, single newlines
// become <br>, bare http(s) URLs become links. Escapes everything else. A last
// paragraph that is only "Carter" is dropped: the frame signs for him.
function paragraphs(text) {
  const parts = String(text || '').trim().split(/\n\s*\n/).filter(Boolean);
  if (parts.length > 1 && /^carter\.?$/i.test(parts[parts.length - 1].trim())) parts.pop();
  return parts.map((p) => {
    const html = esc(p).replace(/(https?:\/\/[^\s<]+)/g, (m) => {
      const href = safeHref(m.replace(/&amp;/g, '&'));
      return href ? `<a href="${esc(href)}" style="color:${C.lit};text-decoration:underline">${m}</a>` : m;
    }).replace(/\n/g, '<br>');
    return `<p style="margin:0 0 16px;font:300 17px/1.7 ${BODY};color:${C.ink}">${html}</p>`;
  }).join('');
}

// fill('Hi {name}', { name: 'Ann' }) -> 'Hi Ann'. Unknown fields stay as typed.
export function fill(text, fields) {
  return String(text || '').replace(/\{(\w+)\}/g, (m, k) => (fields && fields[k] != null && fields[k] !== '' ? String(fields[k]) : m));
}

const label = (t, color) => `<div style="font:600 11px/1.3 ${SANS};letter-spacing:.18em;text-transform:uppercase;color:${color || C.soft}">${esc(t)}</div>`;

function buttonHtml(b, primary, tone) {
  if (!b || !safeHref(b.url)) return '';
  const fillc = tone === 'internal' ? C.green : '#f5cd6a';
  const style = primary
    ? (tone === 'internal'
      ? `background:${C.green};border:1px solid ${C.greenLit};color:${C.title}`
      : `background:${fillc};background-image:linear-gradient(180deg,#f8d77f,${C.amber});border:1px solid ${C.lit};color:${C.btnInk}`)
    : `border:1px solid ${C.brass};color:${C.brassLit}`;
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="display:inline-table;margin:0 10px 12px 0"><tr><td bgcolor="${primary ? fillc : C.card}" style="border-radius:3px;${style}">
        <a href="${esc(b.url)}" style="display:inline-block;padding:15px 26px;font:700 16px ${SANS};color:${primary ? (tone === 'internal' ? C.title : C.btnInk) : C.brassLit};text-decoration:none">${esc(b.label || 'Open')}${primary && tone !== 'internal' ? ' &rarr;' : ''}</a>
       </td></tr></table>`;
}

// Where-your-project-is track: five dots joined by a line, done steps in amber,
// the current one lit. One table row of five cells, each a three-cell mini row.
function track(stage) {
  const cell = (name, i) => {
    const done = i < stage, cur = i === stage;
    const dot = cur ? C.lit : done ? C.amber : C.head;
    const dotBorder = cur ? '#f8dc8e' : done ? C.amber : '#5a4a36';
    const lineL = i === 0 ? 'transparent' : (i <= stage ? C.amber : C.rule);
    const lineR = i === 4 ? 'transparent' : (i < stage ? C.amber : C.rule);
    const lbl = cur ? C.lit : done ? '#c9b48a' : C.mute;
    return `<td width="20%" align="center" style="padding:0"><table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
      <td width="50%" height="12" style="height:12px;font-size:0;line-height:0"><div style="height:1px;line-height:1px;font-size:0;background:${lineL}">&nbsp;</div></td>
      <td width="15" align="center" style="width:15px;padding:0;font-size:0;line-height:0"><div style="width:11px;height:11px;margin:0 auto;font-size:0;line-height:0;background:${dot};border:1px solid ${dotBorder};border-radius:7px">&nbsp;</div></td>
      <td width="50%" height="12" style="height:12px;font-size:0;line-height:0"><div style="height:1px;line-height:1px;font-size:0;background:${lineR}">&nbsp;</div></td>
    </tr></table><div style="margin-top:9px;font:600 9px/1 ${SANS};letter-spacing:.07em;text-transform:uppercase;color:${lbl}">${name}</div></td>`;
  };
  return `<tr><td bgcolor="${C.head}" style="padding:20px 14px 18px;background:${C.head};border-bottom:1px solid ${C.rule}" role="img" aria-label="Where your project is: step ${stage + 1} of 5, ${STEPS[stage]}">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>${STEPS.map(cell).join('')}</tr></table></td></tr>`;
}

function panelHtml(p) {
  const box = (inner, extra) => `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" bgcolor="${C.panel}" style="margin:0 0 22px;background:${C.panel};border:1px solid ${extra || C.rule};border-radius:4px"><tr><td style="padding:0">${inner}</td></tr></table>`;
  if (p.type === 'facts') {
    const rows = (p.rows || []).map((r, i) => `<tr><td style="padding:13px 20px;${i ? `border-top:1px dashed ${C.rule};` : ''}">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
        <td valign="baseline">${label(r.k)}</td>
        <td align="right" valign="baseline" style="${r.big ? `font:600 30px/1.1 ${SERIF};color:${C.lit}` : `font:400 16px/1.4 ${BODY};color:${C.title}`}">${esc(r.v)}</td>
      </tr></table></td></tr>`).join('');
    return box(`<table role="presentation" width="100%" cellpadding="0" cellspacing="0">${p.title ? `<tr><td style="padding:14px 20px 4px">${label(p.title)}</td></tr>` : ''}${rows}</table>`);
  }
  if (p.type === 'steps') {
    const rows = (p.items || []).map((it, i) => `<tr><td width="30" valign="top" style="padding:12px 0 12px 20px"><table role="presentation" cellpadding="0" cellspacing="0"><tr><td width="28" height="28" align="center" style="width:28px;height:28px;border:1px solid ${C.amber};border-radius:15px;font:600 17px/26px ${SERIF};color:${C.lit}">${i + 1}</td></tr></table></td>
      <td style="padding:12px 20px 12px 14px;${i ? '' : ''}font:400 16px/1.5 ${BODY};color:${C.title}">${esc(it.t || it)}${it.s ? `<div style="font:400 14px/1.5 ${SANS};color:${C.soft}">${esc(it.s)}</div>` : ''}</td></tr>`).join('');
    return box(`<table role="presentation" width="100%" cellpadding="0" cellspacing="0">${p.title ? `<tr><td colspan="2" style="padding:14px 20px 0">${label(p.title)}</td></tr>` : ''}${rows}</table>`);
  }
  if (p.type === 'amount') {
    const meta = (p.meta || []).map((m) => `<td width="50%" valign="top" style="padding:0 6px">${label(m.k)}<div style="margin-top:4px;font:400 15px/1.4 ${BODY};color:${C.title}">${esc(m.v)}</div></td>`).join('');
    return box(`<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:24px 20px 18px">${label(p.label || 'Amount due')}
      <div style="margin-top:8px;font:600 62px/1 ${SERIF};color:${C.lit}">${esc(p.value)}</div>
      ${p.sub ? `<div style="margin-top:8px;font:italic 400 16px/1.4 ${BODY};color:${C.ink}">${esc(p.sub)}</div>` : ''}</td></tr>
      ${meta ? `<tr><td style="padding:0 14px 20px"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-top:1px dashed #5a4a36"><tr>${meta.replace(/<td /g, '<td style="padding-top:16px" ')}</tr></table></td></tr>` : ''}</table>`);
  }
  if (p.type === 'pips') {
    const pips = Array.from({ length: p.total || 0 }, (_, i) => `<td style="padding-right:8px"><table role="presentation" cellpadding="0" cellspacing="0"><tr><td width="22" height="22" bgcolor="${i < p.on ? C.lit : C.panel}" style="width:22px;height:22px;font-size:0;line-height:0;border:1px solid ${i < p.on ? '#f8dc8e' : '#5a4a36'};border-radius:12px;background:${i < p.on ? C.lit : C.panel}">&nbsp;</td></tr></table></td>`).join('');
    return box(`<table role="presentation" cellpadding="0" cellspacing="0"><tr><td style="padding:18px 20px">${label(p.label || 'Rounds of changes left')}
      <table role="presentation" cellpadding="0" cellspacing="0" style="margin-top:12px"><tr>${pips}<td style="padding-left:6px;font:400 16px/1.4 ${BODY};color:${C.title}">${esc(p.text || '')}</td></tr></table></td></tr></table>`);
  }
  if (p.type === 'waiting') {
    return box(`<table role="presentation" cellpadding="0" cellspacing="0"><tr><td width="14" style="padding:18px 0 18px 20px"><table role="presentation" cellpadding="0" cellspacing="0"><tr><td width="14" height="14" bgcolor="${C.lit}" style="width:14px;height:14px;font-size:0;line-height:0;border-radius:8px;background:${C.lit}">&nbsp;</td></tr></table></td>
      <td style="padding:18px 20px 18px 16px">${label('Waiting on you')}<div style="margin-top:5px;font:400 19px/1.35 ${BODY};color:${C.title}">${esc(p.value)}</div></td></tr></table>`);
  }
  if (p.type === 'ref') {
    return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" bgcolor="${C.panel}" style="margin:0 0 22px;background:${C.panel};border:1px solid ${C.brass};border-radius:4px"><tr><td style="padding:16px 20px">${label('Your reference')}</td><td align="right" style="padding:16px 20px;font:600 28px/1 ${SERIF};letter-spacing:.06em;color:${C.lit}">${esc(p.value)}</td></tr></table>`;
  }
  if (p.type === 'stats') {
    const cells = (p.items || []).map((s) => `<td width="${Math.floor(100 / (p.items.length || 1))}%" valign="top" style="padding:0 5px 0 0"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" bgcolor="${C.panel}" style="background:${C.panel};border:1px solid ${C.rule};border-radius:4px"><tr><td style="padding:14px 14px">${label(s.k)}<div style="margin-top:8px;font:600 26px/1 ${SERIF};color:${s.ok ? C.greenLit : C.title}">${esc(s.v)}</div></td></tr></table></td>`).join('');
    return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 18px"><tr>${cells}</tr></table>`;
  }
  return '';
}

export function renderEmail({ heading, body, button, button2, preheader, stage, eyebrow, panels, tone, letter, note, signoff }) {
  const internal = tone === 'internal';
  const hasStage = Number.isInteger(stage) && stage >= 0 && stage <= 4 && !letter && !internal;
  const accent = internal ? C.greenLit : C.amber;
  const lampL = `${ORIGIN}/assets/email/lamp-L.png`, lampR = `${ORIGIN}/assets/email/lamp-R.png`;

  const header = internal
    ? `<tr><td height="5" bgcolor="${C.green}" style="height:5px;line-height:5px;font-size:0;background:${C.green}">&nbsp;</td></tr>
<tr><td bgcolor="${C.greenDeep}" style="padding:14px 28px;background:${C.greenDeep};border-bottom:1px solid ${C.green}">
  <table role="presentation" cellpadding="0" cellspacing="0"><tr>
    <td style="padding-right:12px"><img src="${ORIGIN}/assets/scaffold-icon-180.png" width="32" height="32" alt="" style="display:block;border-radius:7px;border:1px solid ${C.green}"></td>
    <td style="font:700 11px/1 ${SANS};letter-spacing:.28em;text-transform:uppercase;color:#cfe3d4">Backroom</td></tr></table></td></tr>`
    : letter
      ? `<tr><td bgcolor="${C.head}" style="padding:18px 32px;background:${C.head};border-bottom:1px solid ${C.rule}">
  <table role="presentation" cellpadding="0" cellspacing="0"><tr>
    <td style="padding-right:12px"><img src="${ORIGIN}/assets/scaffold-icon-180.png" width="40" height="40" alt="" style="display:block;border-radius:8px;border:1px solid ${C.rule}"></td>
    <td><div style="font:700 11px/1 ${SANS};letter-spacing:.32em;text-transform:uppercase;color:${C.brassLit}">The Scaffold</div>
        <div style="margin-top:5px;font:italic 500 15px/1 ${SERIF};color:${C.soft}">by Carter Groff</div></td></tr></table></td></tr>`
      : `<tr><td height="5" bgcolor="${C.amber}" style="height:5px;line-height:5px;font-size:0;background:${C.amber};background-image:linear-gradient(90deg,${C.amber},${C.lit},${C.amber})">&nbsp;</td></tr>
<tr><td bgcolor="${C.head}" align="center" style="padding:24px 20px 22px;background:${C.head};background-image:radial-gradient(ellipse at 50% 0%,rgba(245,205,106,.22),rgba(245,205,106,0) 70%);border-bottom:1px solid ${C.rule}">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
    <td width="22%" align="left" valign="bottom"><img src="${lampL}" width="18" height="135" alt="" style="display:block;margin-left:14px"></td>
    <td align="center">
      <img src="${ORIGIN}/assets/scaffold-icon-180.png" width="52" height="52" alt="The Scaffold" style="display:block;margin:0 auto;border-radius:10px;border:1px solid ${C.rule}">
      <div style="margin-top:14px;font:700 12px/1 ${SANS};letter-spacing:.34em;text-transform:uppercase;color:${C.brassLit}">The Scaffold</div>
      <div style="margin-top:6px;font:italic 500 17px/1 ${SERIF};color:${C.soft}">by Carter Groff</div></td>
    <td width="22%" align="right" valign="bottom"><img src="${lampR}" width="18" height="135" alt="" style="display:block;margin-right:14px"></td>
  </tr></table></td></tr>`;

  const sig = internal ? '' : `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:26px 0 0;border-top:1px solid ${C.rule}"><tr>
    <td style="padding:20px 0 24px;font:italic 500 32px/1 ${SERIF};color:${C.lit}">${esc(signoff || 'Carter')}</td>
    <td align="right" style="padding:20px 0 24px;font:400 13px/1.4 ${SANS};color:${C.soft}">Carter Groff<br>The Scaffold</td></tr></table>`;

  const btns = `${buttonHtml(button, true, tone)}${buttonHtml(button2, false, tone)}`;
  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="dark"><meta name="supported-color-schemes" content="dark"><title>${esc(heading || BRAND_FULL)}</title>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;1,500&family=Spectral:ital,wght@0,300;0,400;1,400&family=Karla:wght@400;600;700&display=swap" rel="stylesheet"></head>
<body bgcolor="${C.outer}" style="margin:0;padding:0;background:${C.outer}">
<span style="display:none;max-height:0;overflow:hidden;opacity:0">${esc(preheader || '')}</span>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" bgcolor="${C.outer}" style="background:${C.outer}"><tr><td align="center" style="padding:30px 14px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" bgcolor="${C.card}" style="max-width:600px;background:${C.card};border:1px solid ${internal ? C.green : C.rule};border-radius:6px;overflow:hidden">
${header}
${hasStage ? track(stage) : ''}
<tr><td style="padding:${letter ? '36px 40px 10px' : '34px 40px 10px'}">
  ${eyebrow ? `<div style="font:700 12px/1 ${SANS};letter-spacing:.24em;text-transform:uppercase;color:${accent}">${esc(eyebrow)}</div>` : ''}
  ${heading ? `<h1 style="margin:${eyebrow ? '14px' : '0'} 0 18px;font:italic 500 44px/1.06 ${SERIF};color:${C.title}">${esc(heading)}</h1>` : ''}
  ${paragraphs(body)}
  ${(panels || []).map(panelHtml).join('')}
  ${btns ? `<div style="margin:6px 0 0">${btns}</div>` : ''}
  ${note ? `<p style="margin:2px 0 0;font:400 14px/1.5 ${SANS};color:${C.soft}">${esc(note)}</p>` : ''}
  ${sig}
</td></tr>
<tr><td bgcolor="${C.foot}" align="center" style="padding:18px 32px 24px;background:${C.foot};border-top:1px solid ${C.rule}">
  <div style="font:400 13px/1.55 ${SANS};color:${C.soft}">${internal ? 'Internal note from the Scaffold. Only Carter gets these.' : 'Reply to this email and it reaches Carter directly.'}</div>
  ${internal ? '' : `<div style="margin-top:8px;font:italic 500 16px/1 ${SERIF};color:${C.amber}">The Scaffold, by Carter Groff</div>`}
</td></tr>
</table></td></tr></table></body></html>`;

  const flat = (p) => (p.rows || []).map((r) => `${r.k}: ${r.v}`).concat((p.items || []).map((s, i) => (p.type === 'steps' ? `${i + 1}. ${s.t || s}` : `${s.k}: ${s.v}`)), p.type === 'amount' ? [`${p.label || 'Amount due'}: ${p.value}${p.sub ? ` (${p.sub})` : ''}`] : [], p.type === 'ref' ? [`Your reference: ${p.value}`] : [], p.type === 'waiting' ? [`Waiting on you: ${p.value}`] : [], p.type === 'pips' ? [`${p.label || 'Rounds left'}: ${p.text || ''}`] : []).join('\n');
  const text = [
    eyebrow, heading, '', String(body || '').trim(),
    ...(panels || []).map((p) => `\n${flat(p)}`),
    [button, button2].filter((b) => b && safeHref(b.url)).map((b) => `\n${b.label || 'Open'}: ${b.url}`).join(''),
    '', internal ? `${BRAND_FULL}. Internal note.` : `${BRAND_FULL}. Reply to this email and it reaches Carter directly.`,
  ].filter((x) => x != null).join('\n');
  return { html, text };
}
