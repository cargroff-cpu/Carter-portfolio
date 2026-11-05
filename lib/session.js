// lib/session.js — signed admin session tokens. Shared by middleware.js
// (Edge runtime) and api/login.js (Node), so it only uses Web Crypto, which
// both runtimes have.
//
// Token format: "<expiry ms>.<random nonce>.<HMAC-SHA256 signature>", all
// base64url. The cookie no longer carries the password: a leaked cookie
// expires on its own and never reveals ADMIN_PASSWORD.
//
// Secret: SESSION_SECRET (a long random string, set in Vercel). Until that
// is set, falls back to ADMIN_PASSWORD as the HMAC key so the Backroom keeps
// working — still never stored in the cookie, but rotating the password then
// also signs everyone out. Set SESSION_SECRET.

export const SESSION_COOKIE = 'cg_admin_s';
export const SESSION_TTL_MS = 8 * 60 * 60 * 1000; // 8 hours

const enc = new TextEncoder();

function b64url(bytes) {
  let s = '';
  for (const b of new Uint8Array(bytes)) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export function sessionSecret() {
  return process.env.SESSION_SECRET || process.env.ADMIN_PASSWORD || '';
}

async function hmac(secret, data) {
  const key = await crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  return b64url(await crypto.subtle.sign('HMAC', key, enc.encode(data)));
}

// Constant-time string compare (lengths are allowed to leak).
export function safeEqual(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string' || a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export async function createSessionToken(secret = sessionSecret()) {
  const exp = Date.now() + SESSION_TTL_MS;
  const nonce = b64url(crypto.getRandomValues(new Uint8Array(18)));
  const payload = `${exp}.${nonce}`;
  return `${payload}.${await hmac(secret, payload)}`;
}

export async function verifySessionToken(token, secret = sessionSecret()) {
  if (!secret || typeof token !== 'string') return false;
  const parts = token.split('.');
  if (parts.length !== 3) return false;
  const [exp, nonce, sig] = parts;
  if (!/^\d+$/.test(exp) || Number(exp) < Date.now()) return false;
  return safeEqual(sig, await hmac(secret, `${exp}.${nonce}`));
}
