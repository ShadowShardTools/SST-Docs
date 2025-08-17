#!/usr/bin/env node
/* -------------------------------------------------------------------------- */
/*  Scans <fsDataPath>/<version>/items/*.json → writes prism-languages.*      */
/*  Sources fsDataPath from ENV → config/paths.json → fallback                */
/* -------------------------------------------------------------------------- */
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

/* ---------- tiny colour logger ------------------------------------------- */
const c = {
  cyan: (s) => `\x1b[36m${s}\x1b[0m`,
  green: (s) => `\x1b[32m${s}\x1b[0m`,
  yellow: (s) => `\x1b[33m${s}\x1b[0m`,
  red: (s) => `\x1b[31m${s}\x1b[0m`,
};
const info = (m) => console.log(c.cyan("➜"), m);
const warn = (m) => console.warn(c.yellow("⚠"), m);
const fail = (m) => console.error(c.red("✖"), m);

/* ---------- locate project root & config --------------------------------- */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, "..", "..", ".."); // adjust if you move the file

function toAbs(raw) {
  const cleaned = String(raw).replace(/\\/g, "/").replace(/\/+$/, "");
  return path.isAbsolute(cleaned)
    ? cleaned
    : path.resolve(root, cleaned.replace(/^\.\//, ""));
}

async function resolveFsDataPath() {
  if (process.env.FS_DATA_PATH) {
    info(`Using FS_DATA_PATH from environment`);
    return toAbs(process.env.FS_DATA_PATH);
  }
  const jsonPath = path.join(root, "configs", "paths.json");
  try {
    const txt = await fs.readFile(jsonPath, "utf8");
    const j = JSON.parse(txt);
    if (typeof j.fsDataPath === "string" && j.fsDataPath.trim()) {
      info(`Using fsDataPath from ${path.relative(root, jsonPath)}`);
      return toAbs(j.fsDataPath);
    }
  } catch {
    /* ignore */
  }
}

/* ---------- output file --------------------------------------------------- */
const outFile = path.resolve(
  root,
  "src",
  "layouts",
  "blocks",
  "generatedImports",
  "prism-languages.generated.ts",
);

/* ---------- PrismJS alias map -------------------------------------------- */
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

    // only code blocks
    if ((b.type || "").toLowerCase() !== "code") continue;

    // NEW shape (codeData) and LEGACY shape (codeLanguage/codeSections)
    const cd = b.codeData || {};

    // single-language (new + legacy)
    addLang(all, cd.language);
    addLang(all, b.codeLanguage);

    // multi-language (new + legacy)
    if (Array.isArray(cd.sections)) {
      for (const s of cd.sections) addLang(all, s?.language);
    }
    if (Array.isArray(b.codeSections)) {
      for (const s of b.codeSections) addLang(all, s?.language);
    }
  }
}

async function collectLangs(dataDirAbs) {
  const all = new Set();
  let versions = [];
  try {
    versions = await fs.readdir(dataDirAbs);
  } catch {
    warn(`No data dir at ${dataDirAbs}, nothing to scan.`);
    return [];
  }

  for (const v of versions) {
    const itemsDir = path.join(dataDirAbs, v, "items");
    try {
      const files = (await fs.readdir(itemsDir)).filter((f) =>
        f.endsWith(".json"),
      );
      for (const f of files) {
        await collectLangsFromItemFile(path.join(itemsDir, f), all);
      }
    } catch {
      // ignore missing versions/items folders
    }
  }

  return [...all].filter(Boolean).sort();
}

/* ---------- main ---------------------------------------------------------- */
(async () => {
  info("Generating Prism language imports …");

  const dataDirAbs = await resolveFsDataPath();

  // validate base dir
  try {
    const s = await fs.stat(dataDirAbs);
    if (!s.isDirectory()) throw new Error("Not a directory");
  } catch {
    fail(`Invalid fsDataPath: ${dataDirAbs}`);
    process.exit(1);
  }

  const langs = await collectLangs(dataDirAbs);

  const body = [
    "// ⚠️  AUTO-GENERATED — DO NOT EDIT",
    "// PrismJS components used across all content",
    "",
    ...langs.map((l) => `import 'prismjs/components/prism-${l}.js';`),
    "",
  ].join("\n");

  await fs.mkdir(path.dirname(outFile), { recursive: true });
  await fs.writeFile(outFile, body);

  console.log(
    c.green("✔"),
    `${langs.length} language${langs.length === 1 ? "" : "s"} → ${path.relative(
      root,
      outFile,
    )}`,
  );
})();
