// scripts/build-design.mjs — precompiles design.jsx to design.js once, so the
// public /design page ships no in-browser Babel (~3 MB that visitors' phones
// used to download and run before anything appeared). Run after editing
// design.jsx:
//   npm install        (first time only)
//   npm run build:design
// Commit design.js alongside design.jsx. The Backroom pages still compile
// in the browser; only the public page needs to be fast.
import { readFileSync, writeFileSync } from 'node:fs';
import Babel from '@babel/standalone';

// The hero's lamp post is the portfolio's own GasLamp, copied from motifs.jsx
// at build time so the two pages always share one drawing.
const motifs = readFileSync(new URL('../motifs.jsx', import.meta.url), 'utf8');
const lampStart = motifs.indexOf('function GasLamp(');
const lampEnd = motifs.indexOf('\n}\n', lampStart);
if (lampStart < 0 || lampEnd < 0) throw new Error('GasLamp not found in motifs.jsx');
const lamp = motifs.slice(lampStart, lampEnd + 3);
const src = '// GasLamp: copied from motifs.jsx by scripts/build-design.mjs\n' + lamp + '\n'
  + readFileSync(new URL('../design.jsx', import.meta.url), 'utf8');
const { code } = Babel.transform(src, { presets: [['react', { runtime: 'classic' }]], comments: false, compact: false });
const header = '// design.js — GENERATED from design.jsx by scripts/build-design.mjs. Do not edit; edit design.jsx and run `npm run build:design`.\n';
writeFileSync(new URL('../design.js', import.meta.url), header + code + '\n');
console.log('design.js written');

// The Backroom's Scaffold editor starts from the page's own defaults, so
// read them out of design.jsx here (one source) and write them to
// scaffold-defaults.js, which the editor loads.
const dj = readFileSync(new URL('../design.jsx', import.meta.url), 'utf8');
const literal = (name) => {
  const start = dj.indexOf('const ' + name + ' = ');
  if (start < 0) throw new Error(name + ' not found in design.jsx');
  const open = dj.indexOf(name === 'SITE' ? '{' : '[', start);
  let depth = 0, i = open, q = null;
  for (; i < dj.length; i++) {
    const c = dj[i];
    if (q) { if (c === '\\') { i++; continue; } if (c === q) q = null; continue; }
    if (c === "'" || c === '"' || c === '`') { q = c; continue; }
    if (c === '{' || c === '[') depth++;
    if (c === '}' || c === ']') { depth--; if (depth === 0) break; }
  }
  return new Function('return ' + dj.slice(open, i + 1))();
};
const site = literal('SITE');
const defaults = {
  headline: site.headline, deck: site.deck, showPrices: site.showPrices,
  whyHead: site.whyHead, whyIntro: site.whyIntro, rules: site.rules,
  design: literal('DESIGN_SERVICES').map(({ title, sub = '', need, from = '', turn = '' }) => ({ title, sub, need, from, turn })),
  tools: literal('TOOL_SERVICES').map(({ title, need }) => ({ title, need })),
  how: literal('HOW_STEPS').map(([title, text]) => ({ title, text })),
  faq: literal('FAQ').map(([q, a]) => ({ q, a })),
  testimonials: [],
  designNeeds: literal('DESIGN_CHIPS'),
  toolNeeds: [...literal('TOOL_SERVICES').map((t) => t.need), 'Something else'],
};
writeFileSync(new URL('../scaffold-defaults.js', import.meta.url),
  '// scaffold-defaults.js — GENERATED from design.jsx by scripts/build-design.mjs. Do not edit.\n'
  + 'window.SCAFFOLD_DEFAULTS = ' + JSON.stringify(defaults, null, 2) + ';\n');
console.log('scaffold-defaults.js written');
