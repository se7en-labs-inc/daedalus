#!/usr/bin/env node
/*
 * Count and classify every addon-knobs call site.
 *
 * A knob is a function call evaluated inside a render body on every render. An
 * arg is a static declaration outside it that arrives as a prop. Converting one
 * to the other is mechanical when the call sits at the top of a story body and
 * is not when it sits inside a callback, a mapped list or JSX, because the value
 * then has to be hoisted to the story's args and threaded down.
 *
 * So the number that matters is not how many knobs there are, it is where each
 * one sits. Five placements, in rising order of what a conversion costs:
 *
 *   binding    const x = boolean('x', true)   inside a story body. Becomes an
 *              arg and a destructure. Mechanical.
 *   jsx        <Thing flag={boolean(...)} />  Becomes an arg and a prop read.
 *              Mechanical, but the story signature changes.
 *   argument   f(boolean(...)) or { k: boolean(...) } inside a story body.
 *              Becomes an arg; whether the surrounding expression still reads
 *              the same has to be checked by eye.
 *   callback   inside a function nested in the story body, including a .map().
 *              The value has to be hoisted to the story signature and threaded
 *              down, which changes the surrounding code.
 *   module     outside any story body, at file scope or in a shared helper.
 *              There is no story signature to hoist to, so the call site moves
 *              before it converts.
 *
 * Reports per file, per type and per placement, and exits non-zero while any
 * call site remains, so it can be run as a check at the end.
 *
 * Usage:
 *   node knob-census.js [--by-type] [--by-file] [--by-placement] [--list] [root ...]
 */
const fs = require('fs');
const path = require('path');
const ts = require(require.resolve('typescript', { paths: [process.cwd()] }));

const SKIP_DIRS = new Set(['node_modules', 'dist', '.git']);
const SOURCE_FILE = /\.tsx?$/;
const DEFAULT_ROOTS = ['storybook', 'source'];

function findFiles(dir, out) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!SKIP_DIRS.has(entry.name)) findFiles(p, out);
    } else if (SOURCE_FILE.test(entry.name)) {
      out.push(p);
    }
  }
  return out;
}

// The names addon-knobs exports as controls, plus the decorator.
const KNOB_NAMES = new Set([
  'text', 'boolean', 'number', 'color', 'object', 'select', 'selectV2',
  'radios', 'array', 'date', 'button', 'files', 'optionsKnob', 'knob',
]);

function analyse(file) {
  const src = fs.readFileSync(file, 'utf8');
  if (!src.includes('@storybook/addon-knobs')) return null;
  const sf = ts.createSourceFile(file, src, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);

  // Only names actually imported from addon-knobs count, so a local `select`
  // or a lodash `object` is not miscounted.
  const imported = new Map(); // local name -> knob name
  let usesWithKnobs = false;
  for (const st of sf.statements) {
    if (!ts.isImportDeclaration(st) || !ts.isStringLiteral(st.moduleSpecifier)) continue;
    if (st.moduleSpecifier.text !== '@storybook/addon-knobs') continue;
    const b = st.importClause && st.importClause.namedBindings;
    if (b && ts.isNamedImports(b)) {
      for (const el of b.elements) {
        const original = (el.propertyName || el.name).text;
        if (original === 'withKnobs') usesWithKnobs = true;
        if (KNOB_NAMES.has(original)) imported.set(el.name.text, original);
      }
    }
  }

  // Where a call sits, walking out from it to the nearest enclosing function.
  function placement(call) {
    let node = call.parent;
    let sawFunction = 0;
    let firstInteresting = null;
    while (node) {
      if (
        ts.isArrowFunction(node) ||
        ts.isFunctionExpression(node) ||
        ts.isFunctionDeclaration(node) ||
        ts.isMethodDeclaration(node)
      ) {
        sawFunction += 1;
        if (sawFunction > 1) return 'callback';
      }
      if (!firstInteresting) {
        if (ts.isJsxExpression(node)) firstInteresting = 'jsx';
        else if (ts.isVariableDeclaration(node)) firstInteresting = 'binding';
        else if (ts.isCallExpression(node) || ts.isPropertyAssignment(node)) {
          firstInteresting = 'argument';
        }
      }
      node = node.parent;
    }
    if (sawFunction === 0) return 'module';
    return firstInteresting || 'argument';
  }

  const sites = [];
  const visit = (n) => {
    if (ts.isCallExpression(n) && ts.isIdentifier(n.expression) && imported.has(n.expression.text)) {
      sites.push({
        file,
        type: imported.get(n.expression.text),
        line: sf.getLineAndCharacterOfPosition(n.getStart()).line + 1,
        placement: placement(n),
      });
    }
    ts.forEachChild(n, visit);
  };
  visit(sf);
  return { file, sites, usesWithKnobs, importsAnyKnob: imported.size > 0 };
}

const argv = process.argv.slice(2);
const flags = new Set(argv.filter((a) => a.startsWith('--')));
const roots = argv.filter((a) => !a.startsWith('--'));
const files = (roots.length ? roots : DEFAULT_ROOTS)
  .filter((r) => fs.existsSync(r))
  .flatMap((r) => findFiles(r, []))
  .sort();

const results = files.map(analyse).filter(Boolean);
const sites = results.flatMap((r) => r.sites);
// The three numbers a tranche reports against. A rename changes the story
// signature and the reference; a hoist crosses a function boundary; a
// relocation has no story body to move into and the call site moves first.
const RENAME = new Set(['binding', 'jsx', 'argument']);
const costly = sites.filter((s) => !RENAME.has(s.placement));

const PLACEMENTS = ['binding', 'jsx', 'argument', 'callback', 'module'];

if (flags.has('--by-type')) {
  const byType = {};
  for (const s of sites) {
    byType[s.type] = byType[s.type] || { total: 0, costly: 0 };
    byType[s.type].total += 1;
    if (!RENAME.has(s.placement)) byType[s.type].costly += 1;
  }
  console.log('type          total  costly');
  for (const [t, c] of Object.entries(byType).sort((a, b) => b[1].total - a[1].total)) {
    console.log(`${t.padEnd(14)}${String(c.total).padStart(5)}${String(c.costly).padStart(8)}`);
  }
  console.log('');
}

if (flags.has('--by-placement')) {
  console.log('placement    count');
  for (const p of PLACEMENTS) {
    console.log(`${p.padEnd(13)}${String(sites.filter((s) => s.placement === p).length).padStart(5)}`);
  }
  console.log('');
}

if (flags.has('--by-file')) {
  console.log('total  costly  file');
  for (const r of results.slice().sort((a, b) => b.sites.length - a.sites.length)) {
    const n = r.sites.filter((s) => !RENAME.has(s.placement)).length;
    console.log(`${String(r.sites.length).padStart(5)}${String(n).padStart(8)}  ${r.file}`);
  }
  console.log('');
}

if (flags.has('--list')) {
  for (const s of sites) {
    console.log(`${s.file}:${s.line}  ${s.type.padEnd(12)} ${s.placement}`);
  }
  console.log('');
}

console.log(`files importing from addon-knobs:  ${results.length}`);
console.log(`  of those, importing withKnobs:   ${results.filter((r) => r.usesWithKnobs).length}`);
const count = (p) => sites.filter((s) => s.placement === p).length;
console.log(`knob call sites:                   ${sites.length}`);
console.log(`  renames:                         ${sites.length - costly.length}`);
console.log(`  hoists (callback):               ${count('callback')}`);
console.log(`  relocations (module scope):      ${count('module')}`);

process.exit(sites.length ? 1 : 0);
