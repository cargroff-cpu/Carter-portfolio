// scripts/dev-server.mjs — `npm run dev`. The whole site on localhost with
// the real API handlers and an in-memory backend (scripts/fake-backend.mjs)
// seeded with a few jobs at different stages. Nothing leaves the machine: no
// Supabase, no email, no Stripe. For trying the Backroom and the client page
// without touching live data. Emails "sent" are printed to the terminal.
//   http://localhost:8787/business      the Business Hub (no sign-in here)
//   http://localhost:8787/design        the public page and its brief form
import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

process.env.SUPABASE_SERVICE_ROLE_KEY ||= 'dev';
process.env.RESEND_API_KEY ||= 'dev';
process.env.RESEND_FROM ||= 'The Scaffold <studio@example.com>';
process.env.NOTIFY_EMAIL ||= 'carter@example.com';
process.env.ADMIN_PASSWORD ||= 'dev';
process.env.STRIPE_SECRET_KEY ||= 'sk_dev';

const root = fileURLToPath(new URL('..', import.meta.url));
const { install } = await import('./fake-backend.mjs');
const { db, emails, call } = install();
const { createSessionToken, SESSION_COOKIE } = await import('../lib/session.js');
const cookie = `${SESSION_COOKIE}=${await createSessionToken()}`;
const api = {};
for (const name of ['design-brief', 'job', 'brief-reply', 'scaffold-read', 'scaffold-write']) api[name] = (await import(`../api/${name}.js`)).default;

// Seed: one job at each point where the ball changes hands.
const ago = (days) => new Date(Date.now() - days * 864e5).toISOString();
async function seed() {
  const mk = async (b, daysAgo) => {
    await call(api['design-brief'], { body: b });
    const j = db.jobs[db.jobs.length - 1];
    j.created_at = j.updated_at = j.last_activity_at = ago(daysAgo); db.design_briefs[db.design_briefs.length - 1].created_at = ago(daysAgo);
    return j;
  };
  const admin = (j, action, extra) => call(api.job, { body: { job_id: j.id, action, ...extra }, headers: { cookie } });
  const client = (j, action, extra) => call(api.job, { body: { t: j.token, action, ...extra } });
  const propose = async (j, amount, sentDaysAgo) => {
    await call(api['scaffold-write'], { body: { table: 'proposals', row: { job_id: j.id, summary: 'As briefed.', items: [{ label: j.title, amount }], billing: 'split' } }, headers: { cookie } });
    await admin(j, 'send', { kind: 'proposal', subject: 'Your proposal: ' + j.title, heading: "Here's the plan.", body: 'Hi,\n\nHere it is.' });
    db.proposals.find((p) => p.job_id === j.id).sent_at = ago(sentDaysAgo);
  };
  await mk({ lane: 'design', name: 'Lee Park', email: 'lee@example.com', business: 'Ridge Bakery', need: ['Flyer or one-pager'], about: 'A spring menu flyer.', budget: '$150–$500', when: '2026-12-01' }, 0);
  const j2 = await mk({ lane: 'automation', name: 'Sam Okafor', email: 'sam@example.com', business: 'Okafor Electric', need: ['Quotes and invoices'], about: 'Quotes take me all evening.', auto_slow: 'Typing quotes', budget: '$1,500–$5,000', bat: true }, 9);
  await propose(j2, 2400, 7);
  const j3 = await mk({ lane: 'design', name: 'Dana Reyes', email: 'dana@example.com', business: 'Reyes Plumbing', need: ['Social graphics'], about: 'Five posts for spring.', budget: '$500–$1,500' }, 12);
  await propose(j3, 1200, 10); await client(j3, 'accept', {});
  db.invoices[db.invoices.length - 1].status = 'paid'; db.invoices[db.invoices.length - 1].paid_at = ago(2);
  const j4 = await mk({ lane: 'design', name: 'Ana Ruiz', email: 'ana@example.com', business: 'Ruiz Yoga', need: ['Brand basics'], about: 'A logo tidy-up.', budget: '$500–$1,500' }, 20);
  await propose(j4, 800, 18); await client(j4, 'accept', {});
  db.invoices[db.invoices.length - 1].status = 'paid'; db.invoices[db.invoices.length - 1].paid_at = ago(15);
  const a = await admin(j4, 'add-file', { kind: 'draft', label: 'Direction A', url: 'https://example.com/a' });
  await admin(j4, 'send', { kind: 'drafts', subject: 'Directions', body: 'Have a look.' });
  await client(j4, 'pick', { file_id: a.body.row.id });
  await admin(j4, 'add-file', { kind: 'final', label: 'Final logo', url: 'https://example.com/final' });
  await admin(j4, 'send', { kind: 'final', subject: 'Final', body: 'Ready.' });
  await client(j4, 'changes', { comment: 'A touch more green, please.' });
  emails.length = 0;
}
await seed();
let printed = 0;
setInterval(() => { for (; printed < emails.length; printed++) console.log(`✉  to ${emails[printed].to}: ${emails[printed].subject}`); }, 500);

const PAGES = { '/': '/Carter Portfolio.html', '/design': '/Carter Groff Design.html', '/backroom': '/Scaffold Hub.html', '/business': '/Business Hub.html', '/docket': '/The Docket.html', '/backroom/scaffold': '/Scaffold Admin.html' };
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.jsx': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.ico': 'image/x-icon', '.woff2': 'font/woff2', '.webmanifest': 'application/manifest+json', '.glb': 'model/gltf-binary' };

http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost');
  try {
    if (url.pathname.startsWith('/api/')) {
      const handler = api[url.pathname.slice(5)];
      if (!handler) { res.writeHead(404).end('{}'); return; }
      const chunks = []; for await (const c of req) chunks.push(c);
      const raw = Buffer.concat(chunks).toString('utf8');
      const out = await call(handler, { method: req.method, body: raw ? JSON.parse(raw) : undefined, query: Object.fromEntries(url.searchParams), headers: { ...req.headers, cookie } });
      res.writeHead(out.status, { 'Content-Type': 'application/json', ...out.headers }).end(typeof out.body === 'string' ? out.body : JSON.stringify(out.body));
      return;
    }
    let path = decodeURIComponent(url.pathname);
    if (path.startsWith('/j/')) path = '/Job.html';
    path = PAGES[path] || path;
    const file = join(root, normalize(path));
    if (!file.startsWith(root)) { res.writeHead(403).end(); return; }
    res.writeHead(200, { 'Content-Type': TYPES[extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-store' }).end(await readFile(file));
  } catch (e) {
    res.writeHead(e.code === 'ENOENT' ? 404 : 500).end(String(e.message));
  }
}).listen(8787, () => console.log('Backroom dev server: http://localhost:8787/business  (in-memory data; nothing is sent)\nClient pages:\n' + db.jobs.map((j) => `  ${j.title}: http://localhost:8787/j/${j.token}`).join('\n')));
