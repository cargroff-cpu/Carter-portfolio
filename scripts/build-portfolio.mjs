// scripts/build-portfolio.mjs — precompiles the public portfolio (themes,
// data, motifs, portfolio, app) into one portfolio.js, so www.cargroff.com
// ships no in-browser Babel and runs React's production build, as the
// Scaffold page does. Run after editing any of those files:
//   npm install        (first time only)
//   npm run build:portfolio
// Commit portfolio.js alongside the sources. Admin.html still compiles the
// .jsx files in the browser, so the sources stay the single truth.
import { readFileSync, writeFileSync } from 'node:fs';
import Babel from '@babel/standalone';

const FILES = ['themes.jsx', 'data.jsx', 'motifs.jsx', 'portfolio.jsx', 'app.jsx'];
const parts = FILES.map((f) => {
  const src = readFileSync(new URL('../' + f, import.meta.url), 'utf8');
  const { code } = Babel.transform(src, { presets: [['react', { runtime: 'classic' }]], comments: false, compact: false, filename: f });
  // Each file gets its own scope: the files talk through window (CG_DATA,
  // CG_THEME, CG_MOTIFS, CG_Portfolio), and portfolio.jsx re-declares the
  // motif names it pulls from window.CG_MOTIFS.
  return '// ── ' + f + '\n(function () {\n' + code + '\n})();';
});
const header = '// portfolio.js — GENERATED from ' + FILES.join(', ') + ' by scripts/build-portfolio.mjs. Do not edit; edit the sources and run `npm run build:portfolio`.\n';
writeFileSync(new URL('../portfolio.js', import.meta.url), header + parts.join('\n') + '\n');
console.log('portfolio.js written');
