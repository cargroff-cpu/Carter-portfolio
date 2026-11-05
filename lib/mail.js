// lib/mail.js — the Scaffold's branded email frame, for every email that goes
// to a client from the Backroom (Mail) and the notes that go to Carter.
//
// Pattern borrowed from a simple-template idea: you type a heading and a
// message, it goes out inside one ready-made frame (crest, warm paper, one
// button), so no one writes HTML. Email-safe on purpose: tables, inline
// styles, a hidden preheader, light only. Everything typed is escaped; the
// only markup that appears is ours (paragraphs, line breaks, links to
// http(s) URLs, and the one button), so a message cannot inject HTML.

import { esc, BRAND_FULL } from './server.js';

const ORIGIN = 'https://scaffold.cargroff.com';
// A dark, lamplit palette: warm near-black, cream type, amber for the one
// thing that matters. Every text colour is at least 7:1 on the surface it sits on.
const C = { outer: '#0f0a06', card: '#1d140c', head: '#26190f', foot: '#150e08', ink: '#ecd9b2', title: '#f8ecd0', soft: '#b9a47c', rule: '#4a3722', amber: '#d99a3d', lit: '#f5cd6a', btn: '#f5cd6a', btnInk: '#1a120b' };

export const jobUrl = (token) => `${ORIGIN}/j/${encodeURIComponent(token)}`;

const safeHref = (u) => (/^https?:\/\/[^\s"'<>]+$/i.test(u) ? u : null);

// Plain text to email HTML: blank lines split paragraphs, single newlines
// become <br>, bare http(s) URLs become links. Escapes everything else.
function paragraphs(text) {
  return String(text || '').trim().split(/\n\s*\n/).filter(Boolean).map((p) => {
    const html = esc(p).replace(/(https?:\/\/[^\s<]+)/g, (m) => {
      const href = safeHref(m.replace(/&amp;/g, '&'));
      return href ? `<a href="${esc(href)}" style="color:${C.lit};text-decoration:underline">${m}</a>` : m;
    }).replace(/\n/g, '<br>');
    return `<p style="margin:0 0 16px;font:17px/1.65 Georgia,'Times New Roman',serif;color:${C.ink}">${html}</p>`;
  }).join('');
}

// fill('Hi {name}', { name: 'Ann' }) -> 'Hi Ann'. Unknown fields stay as typed.
export function fill(text, fields) {
  return String(text || '').replace(/\{(\w+)\}/g, (m, k) => (fields && fields[k] != null && fields[k] !== '' ? String(fields[k]) : m));
}

export function renderEmail({ heading, body, button, preheader }) {
  const btn = button && safeHref(button.url)
    ? `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:10px 0 24px"><tr><td bgcolor="${C.btn}" style="background:${C.btn};background-image:linear-gradient(180deg,#f8d77f,${C.amber});border-radius:3px;border:1px solid ${C.lit}">
        <a href="${esc(button.url)}" style="display:inline-block;padding:15px 28px;font:700 16px Arial,Helvetica,sans-serif;color:${C.btnInk};text-decoration:none">${esc(button.label || 'Open')}</a>
       </td></tr></table>`
    : '';
  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="dark"><meta name="supported-color-schemes" content="dark"><title>${esc(heading || BRAND_FULL)}</title></head>
<body bgcolor="${C.outer}" style="margin:0;padding:0;background:${C.outer}">
<span style="display:none;max-height:0;overflow:hidden;opacity:0">${esc(preheader || '')}</span>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" bgcolor="${C.outer}" style="background:${C.outer}"><tr><td align="center" style="padding:30px 14px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" bgcolor="${C.card}" style="max-width:580px;background:${C.card};border:1px solid ${C.rule};border-radius:6px;overflow:hidden">
<tr><td height="5" bgcolor="${C.amber}" style="height:5px;line-height:5px;font-size:0;background:${C.amber};background-image:linear-gradient(90deg,${C.amber},${C.lit},${C.amber})">&nbsp;</td></tr>
<tr><td bgcolor="${C.head}" style="padding:22px 32px;background:${C.head};border-bottom:1px solid ${C.rule}">
  <table role="presentation" cellpadding="0" cellspacing="0"><tr>
    <td style="padding-right:14px"><img src="${ORIGIN}/assets/scaffold-icon-180.png" width="46" height="46" alt="" style="display:block;border-radius:8px;border:1px solid ${C.rule}"></td>
    <td><div style="font:500 22px/1.1 Georgia,'Times New Roman',serif;color:${C.lit}">The Scaffold</div>
        <div style="margin-top:4px;font:14px Arial,Helvetica,sans-serif;color:${C.soft}">by Carter Groff</div></td>
  </tr></table>
</td></tr>
<tr><td style="padding:32px 32px 10px">
  ${heading ? `<h1 style="margin:0 0 6px;font:500 31px/1.2 Georgia,'Times New Roman',serif;color:${C.title}">${esc(heading)}</h1>
  <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 22px"><tr><td width="56" height="3" bgcolor="${C.amber}" style="width:56px;height:3px;line-height:3px;font-size:0;background:${C.amber}">&nbsp;</td></tr></table>` : ''}
  ${paragraphs(body)}
  ${btn}
</td></tr>
<tr><td bgcolor="${C.foot}" style="padding:18px 32px 24px;background:${C.foot};border-top:1px solid ${C.rule}">
  <div style="font:14px/1.55 Arial,Helvetica,sans-serif;color:${C.soft}">Reply to this email and it reaches Carter directly.</div>
  <div style="margin-top:8px;font:italic 15px Georgia,'Times New Roman',serif;color:${C.amber}">The Scaffold, by Carter Groff</div>
</td></tr>
</table></td></tr></table></body></html>`;
  const text = [heading, '', String(body || '').trim(), button && safeHref(button.url) ? `\n${button.label || 'Open'}: ${button.url}` : '', '', `${BRAND_FULL}. Reply to this email and it reaches Carter directly.`].join('\n');
  return { html, text };
}
