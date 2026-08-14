// middleware.js — HTTP Basic Auth gate for the admin route and its assets.
// Runs on Vercel's Edge Runtime, in front of every matched request, so an
// unauthenticated visitor never even receives the admin HTML/JS. The public
// portfolio (Carter Portfolio.html and its own scripts) is untouched — it's
// not in the matcher below.
export const config = {
  matcher: [
    '/Admin.html',
    '/admin',
    '/admin.jsx',
    '/admin-ui.jsx',
    '/admin-sections.jsx',
    '/api/save-content',
  ],
};

export default function middleware(request) {
  const password = process.env.ADMIN_PASSWORD;
  const auth = request.headers.get('authorization') || '';

  if (password && auth.startsWith('Basic ')) {
    try {
      // Basic Auth encodes "username:password" — the username is ignored
      // entirely; only the password after the first colon is checked.
      const decoded = atob(auth.slice(6));
      const sep = decoded.indexOf(':');
      const providedPassword = sep >= 0 ? decoded.slice(sep + 1) : decoded;
      if (providedPassword === password) return;
    } catch (e) { /* malformed header — fall through to 401 */ }
  }

  return new Response('Authentication required.', {
    status: 401,
    headers: { 'WWW-Authenticate': 'Basic realm="Carter Groff Admin"' },
  });
}
