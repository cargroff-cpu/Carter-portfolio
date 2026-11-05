// scripts/build-design.mjs — precompiles design.jsx to design.js once, so the
// public /design page ships no in-browser Babel (~3 MB that visitors' phones
// used to download and run before anything appeared). Run after editing
// design.jsx:
//   npm install        (first time only)
//   npm run build:design
// Commit design.js alongside design.jsx. The Back Room pages still compile
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
