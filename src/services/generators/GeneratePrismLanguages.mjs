#!/usr/bin/env node
/* -------------------------------------------------------------------------- */
/*  Collects used PrismJS languages → src/generated/prism-languages.generated */
/* -------------------------------------------------------------------------- */
import fs from 'fs/promises';
import path from 'path';

const c = {
  cyan: (s) => `\x1b[36m${s}\x1b[0m`,
  green: (s) => `\x1b[32m${s}\x1b[0m`,
  yellow: (s) => `\x1b[33m${s}\x1b[0m`,
};
const info = (msg) => console.log(c.cyan('➜'), msg);

const dataDir   = path.resolve('public', 'data');
const outFile   = path.resolve('src', 'generated', 'prism-languages.generated.ts');

async function collectLangs() {
  const all = new Set();
  const versions = await fs.readdir(dataDir);
  for (const v of versions) {
    const itemsDir = path.join(dataDir, v, 'items');
    try {
      const files = (await fs.readdir(itemsDir)).filter(f => f.endsWith('.json'));
      for (const f of files) {
        const { content = [] } = JSON.parse(
          await fs.readFile(path.join(itemsDir, f), 'utf8')
        );
        content.forEach(b => b?.type === 'code' && b.scriptLanguage && all.add(b.scriptLanguage));
      }
    } catch { /* skip */ }
  }
  return [...all].sort();
}

(async () => {
  info('Generating Prism language imports …');
  const langs = await collectLangs();
  const body  = [
    '// ⚠️  AUTO-GENERATED — DO NOT EDIT',
    '// PrismJS components used across all content\n',
    ...langs.map(l => `import 'prismjs/components/prism-${l}.js';`),
    '',
  ].join('\n');

  await fs.mkdir(path.dirname(outFile), { recursive: true });
  await fs.writeFile(outFile, body);
  console.log(c.green('✔'), `${langs.length} languages → ${path.relative('.', outFile)}`);
})();