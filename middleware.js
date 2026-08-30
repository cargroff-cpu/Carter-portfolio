// middleware.js — gates the admin route and its assets behind a session
// cookie (set by api/login.js after a correct password), redirecting
// anyone without one to the themed login.html page instead of the plain
// native browser Basic Auth prompt.
export const config = {
  matcher: [
    '/Admin.html',
    '/scaffold',
    '/admin.jsx',
    '/admin-ui.jsx',
    '/admin-sections.jsx',
    '/api/save-content',
    '/command-center-data.jsx',
    '/wick-dock.js',
    '/api/scaffold-write',
    '/docket',
    '/The Docket.html',
    '/docket.jsx',
    '/Scaffold Hub.html',
    '/scaffold-hub.jsx',
    '/api/pipedrive-goals',
    '/wick',
    '/Wick.html',
    '/wick.jsx',
    '/api/wick-chat',
    '/api/wick-memory',
    '/api/content-generate',
    '/business',
    '/Business Hub.html',
    '/business-hub.jsx',
    '/api/create-invoice-link',
  ],
};

function getCookie(request, name) {
  const header = request.headers.get('cookie') || '';
  const match = header.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

export default function middleware(request) {
  const password = process.env.ADMIN_PASSWORD;
  // Renamed from cg_admin so anyone with an old long-lived cookie (set
  // before session-only cookies were introduced) is forced to log in again.
  const cookie = getCookie(request, 'cg_admin_s');

  if (password && cookie === password) return;

  const url = new URL(request.url);

  // API routes get a plain 401 — there's no page to redirect an API call to.
  if (url.pathname.startsWith('/api/')) {
    return new Response(JSON.stringify({ error: 'Not authenticated' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const loginUrl = new URL('/login.html', request.url);
  loginUrl.searchParams.set('next', url.pathname);
  return Response.redirect(loginUrl, 302);
}
