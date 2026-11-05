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
const C = { paper: '#f6efe2', card: '#fffaf1', ink: '#2a1c11', soft: '#6b5638', rule: '#e4d6bb', amber: '#b9772b', btn: '#2a1c11', btnInk: '#f6efe2' };

export const jobUrl = (token) => `${ORIGIN}/j/${encodeURIComponent(token)}`;

const safeHref = (u) => (/^https?:\/\/[^\s"'<>]+$/i.test(u) ? u : null);

// Plain text to email HTML: blank lines split paragraphs, single newlines
// become <br>, bare http(s) URLs become links. Escapes everything else.
function paragraphs(text) {
  return String(text || '').trim().split(/\n\s*\n/).filter(Boolean).map((p) => {
    const html = esc(p).replace(/(https?:\/\/[^\s<]+)/g, (m) => {
      const href = safeHref(m.replace(/&amp;/g, '&'));
      return href ? `<a href="${esc(href)}" style="color:${C.amber}">${m}</a>` : m;
    }).replace(/\n/g, '<br>');
    return `<p style="margin:0 0 16px;font:16px/1.6 Georgia,serif;color:${C.ink}">${html}</p>`;
  }).join('');
}

// fill('Hi {name}', { name: 'Ann' }) -> 'Hi Ann'. Unknown fields stay as typed.
export function fill(text, fields) {
  return String(text || '').replace(/\{(\w+)\}/g, (m, k) => (fields && fields[k] != null && fields[k] !== '' ? String(fields[k]) : m));
}

export function renderEmail({ heading, body, button, preheader }) {
  const btn = button && safeHref(button.url)
    ? `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:8px 0 20px"><tr><td style="background:${C.btn};border-radius:3px">
        <a href="${esc(button.url)}" style="display:inline-block;padding:13px 22px;font:600 15px Arial,sans-serif;color:${C.btnInk};text-decoration:none">${esc(button.label || 'Open')}</a>
       </td></tr></table>`
    : '';
  const html = `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(heading || BRAND_FULL)}</title></head>
<body style="margin:0;padding:0;background:${C.paper}">
<span style="display:none;max-height:0;overflow:hidden;opacity:0">${esc(preheader || '')}</span>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${C.paper}"><tr><td align="center" style="padding:28px 14px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:${C.card};border:1px solid ${C.rule};border-radius:4px">
<tr><td style="padding:26px 30px 10px;border-bottom:1px solid ${C.rule}">
  <img src="${ORIGIN}/assets/scaffold-icon-180.png" width="40" height="40" alt="" style="display:block;border-radius:6px">
  <div style="margin-top:12px;font:13px Arial,sans-serif;color:${C.soft}">${esc(BRAND_FULL)}</div>
</td></tr>
<tr><td style="padding:24px 30px 8px">
  ${heading ? `<h1 style="margin:0 0 16px;font:500 26px/1.2 Georgia,serif;color:${C.ink}">${esc(heading)}</h1>` : ''}
  ${paragraphs(body)}
  ${btn}
</td></tr>
<tr><td style="padding:14px 30px 22px;border-top:1px solid ${C.rule};font:13px/1.5 Arial,sans-serif;color:${C.soft}">
  Reply to this email and it reaches Carter directly.
</td></tr>
</table></td></tr></table></body></html>`;
  const text = [heading, '', String(body || '').trim(), button && safeHref(button.url) ? `\n${button.label || 'Open'}: ${button.url}` : '', '', `${BRAND_FULL}. Reply to this email and it reaches Carter directly.`].join('\n');
  return { html, text };
}
