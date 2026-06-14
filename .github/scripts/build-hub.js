#!/usr/bin/env node
/*
 * build-hub.js — regenerates the TOOLS list on the hub homepage (index.html)
 * by scanning every magnet folder for an  <!-- HUB {...} -->  metadata block.
 *
 * A folder appears on the hub when:
 *   - its name does NOT start with "_" or "."   (so _template is ignored)
 *   - it has an index.html containing a HUB block with valid JSON
 *   - that JSON does NOT have "draft": true
 *
 * The folder name becomes the URL path (e.g. fund/ -> /fund).
 * Cards are ordered by the optional "order" field, then alphabetically.
 *
 * Run locally:  node .github/scripts/build-hub.js
 * The GitHub Action runs it on every push and commits index.html if it changed.
 */
const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const INDEX = path.join(ROOT, 'index.html');
const START = '/* HUB:AUTO:START */';
const END = '/* HUB:AUTO:END */';

function readMeta(dir) {
  const file = path.join(ROOT, dir, 'index.html');
  if (!fs.existsSync(file)) return null;
  const html = fs.readFileSync(file, 'utf8');
  const m = html.match(/<!--\s*HUB\b([\s\S]*?)-->/i);
  if (!m) return null;
  const raw = m[1];
  const s = raw.indexOf('{');
  const e = raw.lastIndexOf('}');
  if (s === -1 || e === -1) return null;
  let data;
  try {
    data = JSON.parse(raw.slice(s, e + 1));
  } catch (err) {
    console.error(`Skipping ${dir}: invalid HUB JSON (${err.message})`);
    return null;
  }
  if (data.draft) return null;
  if (!data.title) {
    console.error(`Skipping ${dir}: HUB block missing "title"`);
    return null;
  }
  data.path = '/' + dir;
  return data;
}

const dirs = fs
  .readdirSync(ROOT, { withFileTypes: true })
  .filter((d) => d.isDirectory() && !d.name.startsWith('_') && !d.name.startsWith('.'))
  .map((d) => d.name);

const tools = dirs
  .map(readMeta)
  .filter(Boolean)
  .sort(
    (a, b) =>
      (a.order ?? 99) - (b.order ?? 99) || a.path.localeCompare(b.path)
  );

const esc = (v) =>
  String(v ?? '').replace(/\\/g, '\\\\').replace(/"/g, '\\"');

const entries = tools
  .map(
    (t) => `    {
      path:  "${esc(t.path)}",
      title: "${esc(t.title)}",
      blurb: "${esc(t.blurb)}",
      tag:   "${esc(t.tag)}",
      meta:  "${esc(t.meta)}"
    }`
  )
  .join(',\n');

const generated = `${START}\n  const TOOLS = [\n${entries}\n  ];\n  ${END}`;

let index = fs.readFileSync(INDEX, 'utf8');
const re = new RegExp(
  START.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') +
    '[\\s\\S]*?' +
    END.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
);
if (!re.test(index)) {
  console.error('ERROR: HUB:AUTO markers not found in index.html');
  process.exit(1);
}

const next = index.replace(re, generated);
if (next === index) {
  console.log(`Hub already up to date (${tools.length} tools).`);
} else {
  fs.writeFileSync(INDEX, next);
  console.log(
    `Hub rebuilt with ${tools.length} tools: ${tools
      .map((t) => t.path)
      .join(', ')}`
  );
}
