#!/usr/bin/env node
import fs from "fs/promises";
import path from "path";

const c = {
  cyan: (s) => `\x1b[36m${s}\x1b[0m`,
  green: (s) => `\x1b[32m${s}\x1b[0m`,
  yellow: (s) => `\x1b[33m${s}\x1b[0m`,
};
const info = (msg) => console.log(c.cyan("➜"), msg);

const dataDir = path.resolve("public", "data");
const outFile = path.resolve(
  "src", "layouts", "blocks", "generatedImports",
  "prism-languages.generated.ts",
);

// PrismJS language id map (normalizes common aliases to Prism component names)
const aliasMap = {
  // markup
  html: "markup",
  xml: "markup",
  svg: "markup",

  // js/ts
  js: "javascript",
  node: "javascript",
  ts: "typescript",
  mjs: "javascript",
  cjs: "javascript",
  jsx: "jsx",
  tsx: "tsx",

  // scripts & shells
  shell: "bash",
  sh: "bash",
  zsh: "bash",

  // data / docs
  md: "markdown",
  yml: "yaml",

  // c-family
  "c++": "cpp",
  "c#": "csharp",
  cs: "csharp",

  // misc
  py: "python",
  rb: "ruby",
  kt: "kotlin",
};

function normalizeLang(langRaw) {
  if (!langRaw || typeof langRaw !== "string") return null;
  const l = langRaw.trim().toLowerCase();
  return aliasMap[l] || l;
}

function addLang(targetSet, langRaw) {
  const norm = normalizeLang(langRaw);
  if (norm) targetSet.add(norm);
}

async function collectLangsFromItemFile(filePath, all) {
  const json = await fs.readFile(filePath, "utf8");
  const { content = [] } = JSON.parse(json);

  for (const b of content) {
    if (!b || typeof b !== "object") continue;

    // we only care about code blocks
    if ((b.type || "").toLowerCase() !== "code") continue;

    // Support NEW shape (codeData) and LEGACY shape (codeLanguage/codeSections)
    const cd = b.codeData || {};

    // single-language (new)
    addLang(all, cd.language);
    // single-language (legacy)
    addLang(all, b.codeLanguage);

    // multi-language (new)
    if (Array.isArray(cd.sections)) {
      for (const s of cd.sections) addLang(all, s?.language);
    }
    // multi-language (legacy)
    if (Array.isArray(b.codeSections)) {
      for (const s of b.codeSections) addLang(all, s?.language);
    }
  }
}

async function collectLangs() {
  const all = new Set();
  let versions = [];
  try {
    versions = await fs.readdir(dataDir);
  } catch {
    info(c.yellow(`No data dir at ${dataDir}, nothing to scan.`));
    return [];
  }

  for (const v of versions) {
    const itemsDir = path.join(dataDir, v, "items");
    try {
      const files = (await fs.readdir(itemsDir)).filter((f) => f.endsWith(".json"));
      for (const f of files) {
        await collectLangsFromItemFile(path.join(itemsDir, f), all);
      }
    } catch {
      // ignore missing versions/items folders
    }
  }

  return [...all].filter(Boolean).sort();
}

(async () => {
  info("Generating Prism language imports …");
  const langs = await collectLangs();

  const body = [
    "// ⚠️  AUTO-GENERATED — DO NOT EDIT",
    "// PrismJS components used across all content",
    "",
    ...langs.map((l) => `import 'prismjs/components/prism-${l}.js';`),
    "",
  ].join("\n");

  await fs.mkdir(path.dirname(outFile), { recursive: true });
  await fs.writeFile(outFile, body);

  console.log(c.green("✔"), `${langs.length} languages → ${path.relative(".", outFile)}`);
})();
