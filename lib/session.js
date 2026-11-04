// lib/session.js — signed Back Room session tokens, shared by
// api/login.js (Node) and middleware.js (Edge). Uses Web Crypto only, so it
// runs in both runtimes.
//
// The cookie used to hold the admin password itself. It now holds
// "<expiry ms>.<HMAC-SHA256 of the expiry>", where the HMAC key is derived
// from SESSION_SECRET if set, otherwise from ADMIN_PASSWORD. Changing the
// password (or SESSION_SECRET) signs everyone out.

export const SESSION_COOKIE = 'cg_backroom';
export const SESSION_HOURS = 8;

const enc = new TextEncoder();

function secretSource() {
  return process.env.SESSION_SECRET || (process.env.ADMIN_PASSWORD ? 'cg-backroom:' + process.env.ADMIN_PASSWORD : '');
}

async function hmacHex(message) {
  const key = await crypto.subtle.importKey('raw', enc.encode(secretSource()), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(message));
  return Array.from(new Uint8Array(sig)).map((b) => b.toString(16).padStart(2, '0')).join('');
}

// Constant-time string compare.
export function safeEqual(a, b) {
  a = String(a || ''); b = String(b || '');
  let diff = a.length ^ b.length;
  for (let i = 0; i < Math.max(a.length, b.length); i++) diff |= (a.charCodeAt(i) || 0) ^ (b.charCodeAt(i) || 0);
  return diff === 0;
}

export async function createSessionToken() {
  const expires = Date.now() + SESSION_HOURS * 3600 * 1000;
  return `${expires}.${await hmacHex(String(expires))}`;
}

export async function verifySessionToken(token) {
  if (!secretSource() || !token) return false;
  const [expires, sig] = String(token).split('.');
  if (!expires || !sig || !/^\d+$/.test(expires) || Number(expires) < Date.now()) return false;
  return safeEqual(sig, await hmacHex(expires));
}

export function readCookie(header, name) {
  const match = String(header || '').match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}
