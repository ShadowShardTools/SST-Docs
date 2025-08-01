#!/usr/bin/env node
/* -------------------------------------------------------------------------- */
/*  Auto-generates src/generated/blockImports.generated.ts                    */
/* -------------------------------------------------------------------------- */
import fs   from 'fs/promises';
import path from 'path';
import glob from 'fast-glob';

/* ---------- tiny colour logger ----------------------------------------- */
const c = {
  cyan:   (s) => `\x1b[36m${s}\x1b[0m`,
  green:  (s) => `\x1b[32m${s}\x1b[0m`,
  yellow: (s) => `\x1b[33m${s}\x1b[0m`,
};
const info = (m) => console.log(c.cyan('➜'), m);
const warn = (m) => console.warn(c.yellow('⚠'), m);

/* ---------- paths ------------------------------------------------------- */
const root          = path.resolve('.');
const renderRoot    = path.join(root, 'src', 'components', 'render');
const generatedRoot = path.join(root, 'src', 'generated');
const outFile       = path.join(generatedRoot, 'blockImports.generated.ts');

/* ---------- helpers ----------------------------------------------------- */
const toPosix = (p) => p.split(path.sep).join(path.posix.sep);
const relImport = (from, to) => {
  let rel = path.relative(path.dirname(from), to);
  if (!rel.startsWith('.')) rel = './' + rel;
  return toPosix(rel);
};

function toComponentPath(type) {
  if (/^title-h[123]$/.test(type)) {
    const suffix = type.split('-')[1].toUpperCase();
    return `Title${suffix}Block`;
  }

  return (
    type
      .split(/[-_]/)
      .map((w) => w[0].toUpperCase() + w.slice(1))
      .join('') + 'Block'
  );
}

/* ---------- collect all unique block types ----------------------------- */
async function collectTypes() {
  const pattern = 'public/data/**/items/*.json';       // relative glob
  const files   = await glob(pattern, { cwd: root });

  if (!files.length) warn('No item JSON files found under public/data');

  const set = new Set();
  await Promise.all(
    files.map(async (f) => {
      try {
        const { content = [] } = JSON.parse(await fs.readFile(path.join(root, f), 'utf8'));
        content.forEach((b) => b?.type && set.add(b.type));
      } catch { /* ignore malformed */ }
    }),
  );
  return [...set].sort();
}

/* ---------- main -------------------------------------------------------- */
(async () => {
  info('Generating blockImports …');
  const types = await collectTypes();

  const lines = [
    '// ⚠️  AUTO-GENERATED — DO NOT EDIT',
    "import { lazy } from 'react';",
    '',
    'export const blockImports = {',
    ...types.map((t) => {
      const compPath = toComponentPath(t);
      const absComp  = path.join(renderRoot, compPath);
      const importP  = relImport(outFile, absComp);
      return `  '${t}': lazy(() => import('${importP}')),`;
    }),
    `  'unknown': lazy(() => import('${relImport(outFile, path.join(renderRoot, 'UnknownBlock'))}')),`,
    '} as const;',
    '',
    'export type BlockType = keyof typeof blockImports;',
    '',
  ];

  await fs.mkdir(generatedRoot, { recursive: true });
  await fs.writeFile(outFile, lines.join('\n'));

  console.log(
    c.green('✔'),
    `${types.length} block type${types.length !== 1 ? 's' : ''} → ${path.relative(root, outFile)}`,
  );
})();