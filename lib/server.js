// lib/server.js — small shared helpers for the API routes: Supabase REST
// calls with the service-role key, Resend email, and the public brand name.
// Keeps the brief, reply and health routes from each re-implementing them.

import { sendViaGmail } from './gmail.js';

export const SUPABASE_URL = 'https://rodxrkzwpsgeeatmbwku.supabase.co';

// The one public name (decided 2026-11-04): The Scaffold, by Carter Groff.
// Used in email senders and subject lines so every touchpoint matches the
// /design page. The private admin tools are "The Backroom".
export const BRAND = 'The Scaffold';
export const BRAND_FULL = 'The Scaffold, by Carter Groff';

// Where new-brief notifications and failure alerts go.
export const NOTIFY_EMAIL = process.env.NOTIFY_EMAIL || 'car.groff@gmail.com';

// Sender. Until a domain is verified in Resend, only Resend's test sender
// works — and Resend only delivers test-sender mail to the account owner,
// so client-facing email (confirmations, replies) is skipped until
// RESEND_FROM is set to an address on a verified domain, e.g.
//   RESEND_FROM="The Scaffold <studio@cargroff.com>"
//
// Or, simpler: send through Carter's own Gmail. Set GMAIL_USER and
// GMAIL_APP_PASSWORD (a Google app password) and every email goes out from
// that account, shows in its Sent folder, and replies land in its inbox. That
// takes the place of Resend and needs no verified domain.
export const GMAIL_USER = process.env.GMAIL_USER || null;
export const GMAIL_READY = !!(GMAIL_USER && process.env.GMAIL_APP_PASSWORD);
export const FROM_VERIFIED = GMAIL_READY ? `${BRAND} <${GMAIL_USER}>` : (process.env.RESEND_FROM || null);
export const FROM_INTERNAL = FROM_VERIFIED || `${BRAND} <onboarding@resend.dev>`;
export const MAIL_VIA = GMAIL_READY ? 'gmail' : (FROM_VERIFIED ? 'resend' : 'test');

export function sbHeaders(extra = {}) {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  return { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json', ...extra };
}

// PostgREST call. Returns parsed JSON (or null for empty bodies); throws with
// the response text on a non-2xx.
export async function sb(path, { method = 'GET', body, prefer } = {}) {
  const r = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    method,
    headers: sbHeaders(prefer ? { Prefer: prefer } : {}),
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const text = await r.text();
  if (!r.ok) throw new Error(`Supabase ${method} ${path.split('?')[0]} ${r.status}: ${text.slice(0, 300)}`);
  return text ? JSON.parse(text) : null;
}

export async function sendEmail({ from = FROM_INTERNAL, to, replyTo, subject, text, html }) {
  if (GMAIL_READY) {
    return sendViaGmail({ from: FROM_VERIFIED, to, replyTo: replyTo || GMAIL_USER, subject, text, html }, { user: GMAIL_USER, pass: process.env.GMAIL_APP_PASSWORD });
  }
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error('RESEND_API_KEY is not set');
  const r = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
    body: JSON.stringify({ from, to: Array.isArray(to) ? to : [to], reply_to: replyTo, subject, text, html }),
  });
  if (!r.ok) throw new Error(`Resend ${r.status}: ${(await r.text()).slice(0, 300)}`);
  return r.json();
}

export const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

export function parseBody(req) {
  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch (e) { return null; }
  }
  return body && typeof body === 'object' ? body : {};
}

// Best-effort event log (brief_events). Never throws: logging must not be
// the thing that breaks a brief.
export async function logEvent(event) {
  try {
    await sb('brief_events', { method: 'POST', body: event });
  } catch (e) {
    console.error('brief_events log failed', e.message, event);
  }
}
