// lib/logout.js (served at /api/logout via a vercel.json rewrite; Hobby plan caps deployments at 12 functions) — clears the Back Room session cookie. Called via
// navigator.sendBeacon on pagehide (see Admin.html) so leaving or
// refreshing the admin page logs it out immediately.
import { SESSION_COOKIE } from './session.js';

export default async function logoutHandler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  res.setHeader('Set-Cookie', [
    `${SESSION_COOKIE}=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0`,
    'cg_admin_s=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0',
  ]);
  res.status(200).json({ ok: true });
}
