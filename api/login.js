// api/login.js — checks the submitted password against ADMIN_PASSWORD and,
// if correct, sets an HttpOnly cookie holding a signed, expiring session
// token (lib/session.js). The cookie never contains the password itself.
// middleware.js verifies the token on every Back Room page and API request.
//
// Rate limited: 5 failed attempts per IP per 15 minutes (best effort, per
// serverless instance — see lib/rate-limit.js).
import { createSessionToken, safeEqual, sessionSecret, SESSION_COOKIE, SESSION_TTL_MS } from '../lib/session.js';
import { clientIp, hit, reset } from '../lib/rate-limit.js';

const LIMIT = { limit: 5, windowMs: 15 * 60 * 1000 };

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const ip = clientIp(req);
  // Count the attempt up front; a success clears the count below.
  if (!hit('login', ip, LIMIT)) {
    res.setHeader('Retry-After', '900');
    res.status(429).json({ error: 'Too many attempts. Try again in 15 minutes.' });
    return;
  }

  const password = process.env.ADMIN_PASSWORD;
  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch (e) { body = {}; }
  }
  const provided = body && typeof body.password === 'string' ? body.password : '';

  if (!password || !sessionSecret() || !safeEqual(provided, password)) {
    // Flat delay so a wrong guess costs the guesser time.
    await new Promise((r) => setTimeout(r, 400));
    res.status(401).json({ error: 'Incorrect password' });
    return;
  }

  reset('login', ip);
  const token = await createSessionToken();
  // 8-hour Max-Age matches the token's own signed expiry; Admin.html's
  // pagehide beacon (api/logout.js) still clears it sooner.
  res.setHeader(
    'Set-Cookie',
    `${SESSION_COOKIE}=${encodeURIComponent(token)}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=${Math.floor(SESSION_TTL_MS / 1000)}`
  );
  res.status(200).json({ ok: true });
}
