// api/login.js — checks the submitted password against ADMIN_PASSWORD and,
// if correct, sets a signed, expiring Back Room session cookie (see
// lib/session.js). The cookie no longer contains the password. Failed
// attempts are slowed down to blunt password guessing.
import { createSessionToken, safeEqual, SESSION_COOKIE, SESSION_HOURS } from '../lib/session.js';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const password = process.env.ADMIN_PASSWORD;
  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch (e) { body = {}; }
  }
  const provided = body && body.password;

  if (!password || !provided || !safeEqual(provided, password)) {
    await sleep(900);
    res.status(401).json({ error: 'Incorrect password' });
    return;
  }

  const token = await createSessionToken();
  res.setHeader('Set-Cookie', [
    `${SESSION_COOKIE}=${encodeURIComponent(token)}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=${SESSION_HOURS * 3600}`,
    // Clear the old password-bearing cookie from before this change.
    'cg_admin_s=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0',
  ]);
  res.status(200).json({ ok: true });
}
