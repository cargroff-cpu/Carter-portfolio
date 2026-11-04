// scripts/build-design.mjs — precompiles design.jsx to design.js for the
// public page (The Scaffold.html), so visitors' browsers don't download and
// run Babel. The private Back Room pages still compile in the browser.
//
// Run after any edit to design.jsx:
//   npm install --no-save @babel/standalone@7.29.0
//   node scripts/build-design.mjs
import { readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const Babel = require('@babel/standalone');

const src = readFileSync(new URL('../design.jsx', import.meta.url), 'utf8');
const { code } = Babel.transform(src, { presets: [['react', { runtime: 'classic' }]], comments: false, compact: false });
writeFileSync(
  new URL('../design.js', import.meta.url),
  '// GENERATED from design.jsx by scripts/build-design.mjs. Edit design.jsx, then rebuild.\n' + code + '\n',
);
console.log('design.js written');
