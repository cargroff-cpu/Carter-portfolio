// Test harness for the hero cat: serves the repo, opens the Scaffold page in
// headless Chromium with ?catdebug, and hands back the page. Needs Playwright:
//   npm i -D playwright && npx playwright install chromium
// Set CAT_TEST_MODULES=/path/to/node_modules to serve react/three from disk
// instead of the CDNs (for machines without internet).
const http = require('http'), fs = require('fs'), path = require('path');
const { chromium } = require('playwright');
const ROOT = path.resolve(__dirname, '..', '..');
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.jsx': 'text/javascript', '.css': 'text/css',
  '.json': 'application/json', '.glb': 'model/gltf-binary', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.svg': 'image/svg+xml', '.ico': 'image/x-icon' };

function serve() {
  return new Promise((res) => {
    const srv = http.createServer((req, rsp) => {
      const p = path.join(ROOT, decodeURIComponent(req.url.split('?')[0]));
      if (!p.startsWith(ROOT) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) { rsp.writeHead(404); return rsp.end(); }
      rsp.writeHead(200, { 'content-type': TYPES[path.extname(p)] || 'application/octet-stream' });
      fs.createReadStream(p).pipe(rsp);
    }).listen(0, '127.0.0.1', () => res(srv));
  });
}

async function open(opts = {}) {
  const srv = await serve(), base = `http://127.0.0.1:${srv.address().port}`;
  const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const ctx = await browser.newContext({ viewport: opts.viewport || { width: 1440, height: 900 }, deviceScaleFactor: opts.dsf || 1 });
  const NM = process.env.CAT_TEST_MODULES;
  await ctx.route(/.*/, (route) => {
    const u = route.request().url();
    if (u.startsWith(base)) return route.continue();
    if (/_vercel|supabase|googleapis|gstatic/.test(u)) return route.abort();   // not needed to test the cat
    let m;
    if (NM && (m = u.match(/unpkg\.com\/(react(?:-dom)?)@[\d.]+\/(.*)$/))) return route.fulfill({ path: path.join(NM, m[1], m[2]), contentType: 'text/javascript' });
    if (NM && (m = u.match(/cdn\.jsdelivr\.net\/npm\/three@[\d.]+\/(.*)$/))) return route.fulfill({ path: path.join(NM, 'three', m[1]), contentType: 'text/javascript' });
    return route.continue();
  });
  const page = await ctx.newPage();
  page.on('pageerror', (e) => console.log('pageerror:', e.message));
  await page.goto(`${base}/Carter%20Groff%20Design.html${opts.query || '?catdebug'}`, { waitUntil: 'load' });
  await page.waitForFunction(() => window.__cat, null, { timeout: 40000 });
  const close = async () => { await browser.close(); srv.close(); };
  return { browser, page, close };
}
module.exports = { open };
