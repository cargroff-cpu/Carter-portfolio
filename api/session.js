// api/session.js — merges what used to be api/login.js and api/logout.js
// into one Serverless Function (Vercel's Hobby plan caps a deployment at 12
// functions; separate files for these two tiny, closely-related handlers
// pushed the count over). vercel.json rewrites /api/login and /api/logout
// to /api/session?action=login|logout, so every existing caller (login.html's
// fetch('/api/login'), the sendBeacon('/api/logout') calls sprinkled across
// Admin.html/Scaffold Hub.html/Business Hub.html/The Docket.html/Wick.html)
// keeps working unchanged — only the routing layer knows this moved.
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const action = req.query && req.query.action;

  if (action === 'logout') {
    res.setHeader(
      'Set-Cookie',
      'cg_admin_s=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0'
    );
    res.status(200).json({ ok: true });
    return;
  }

  if (action === 'login') {
    const password = process.env.ADMIN_PASSWORD;
    let body = req.body;
    if (typeof body === 'string') {
      try { body = JSON.parse(body); } catch (e) { body = {}; }
    }
    const provided = body && body.password;

    if (!password || provided !== password) {
      res.status(401).json({ error: 'Incorrect password' });
      return;
    }

    // Session-only cookie (no Max-Age) — cleared when the browser fully closes,
    // so the password prompt appears again on every new visit rather than
    // silently signing back in. Named cg_admin_s (not the old cg_admin) so any
    // previously-issued 30-day cookie is ignored rather than still working.
    // The cookie value is the password itself — HttpOnly so page scripts never
    // see it, Secure so it only travels over HTTPS.
    res.setHeader(
      'Set-Cookie',
      `cg_admin_s=${encodeURIComponent(password)}; HttpOnly; Secure; SameSite=Lax; Path=/`
    );
    res.status(200).json({ ok: true });
    return;
  }

  res.status(400).json({ error: 'Missing or unknown action.' });
}
