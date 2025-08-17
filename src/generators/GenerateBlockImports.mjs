#!/usr/bin/env node
/* -------------------------------------------------------------------------- */
/*  Auto-generates src/layouts/blocks/generatedImports/blockImports.generated.ts
/*  Pure ESM JS (no TS import). Resolves fsDataPath from ENV/JSON/TS text.     */
/* -------------------------------------------------------------------------- */
import fs from "node:fs/promises";
import path from "node:path";
import glob from "fast-glob";
import { fileURLToPath } from "node:url";

/* ---------- tiny colour logger ------------------------------------------- */
const c = {
  cyan: (s) => `\x1b[36m${s}\x1b[0m`,
  green: (s) => `\x1b[32m${s}\x1b[0m`,
  yellow: (s) => `\x1b[33m${s}\x1b[0m`,
};
const info = (m) => console.log(c.cyan("➜"), m);
const warn = (m) => console.warn(c.yellow("⚠"), m);

/* ---------- paths --------------------------------------------------------- */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, "..", "..", ".."); // project root (adjust if you move this file)
const renderRoot = path.join(root, "src", "layouts", "blocks", "components");
const generatedRoot = path.join(
  root,
  "src",
  "layouts",
  "blocks",
  "generatedImports",
);
const outFile = path.join(generatedRoot, "blockImports.generated.ts");

/* ---------- resolve fsDataPath without importing TS ---------------------- */
async function resolveFsDataPath() {
  if (process.env.FS_DATA_PATH) {
    info(`Using FS_DATA_PATH from environment: ${process.env.FS_DATA_PATH}`);
    return toAbs(process.env.FS_DATA_PATH);
  }
  
  const jsonCandidate = path.join(root, "configs", "paths.json");
  try {
    const txt = await fs.readFile(jsonCandidate, "utf8");
    const j = JSON.parse(txt);
    if (typeof j.fsDataPath === "string" && j.fsDataPath.trim()) {
      info(`Using fsDataPath from ${path.relative(root, jsonCandidate)}`);
      return toAbs(j.fsDataPath);
    }
  } catch {
    /* ignore */
  }
}

function toAbs(raw) {
  const cleaned = raw.replace(/\\/g, "/").replace(/\/+$/, "");
  return path.isAbsolute(cleaned)
    ? cleaned
    : path.resolve(root, cleaned.replace(/^\.\//, ""));
}

/* ---------- helpers ------------------------------------------------------- */
const toPosix = (p) => p.split(path.sep).join(path.posix.sep);
const relImport = (from, to) => {
  let rel = path.relative(path.dirname(from), to);
  if (!rel.startsWith(".")) rel = "./" + rel;
  return toPosix(rel);
};

function toComponentPath(type) {
  if (/^title-h[123]$/.test(type)) {
    const suffix = type.split("-")[1].toUpperCase();
    return `Title${suffix}Block`;
  }
  return (
    type
      .split(/[-_]/)
      .map((w) => w[0].toUpperCase() + w.slice(1))
      .join("") + "Block"
  );
}

/* ---------- collect all unique block types ------------------------------- */
async function collectTypes(dataRootAbs) {
  const pattern = toPosix(path.join(dataRootAbs, "**/items/*.json"));
  info(`Scanning items from ${dataRootAbs}`);
  const files = await glob(pattern, { absolute: true, onlyFiles: true });

  if (!files.length) {
    warn(
      `No item JSON files found under ${dataRootAbs}. Checked pattern: ${pattern}`,
    );
  }

  const set = new Set();
  await Promise.all(
    files.map(async (absPath) => {
      try {
        const raw = await fs.readFile(absPath, "utf8");
        const parsed = JSON.parse(raw);
        const content = Array.isArray(parsed?.content) ? parsed.content : [];
        for (const b of content) {
          if (b && typeof b.type === "string" && b.type.trim()) {
            set.add(b.type);
          }
        }
      } catch {
        /* ignore malformed */
      }
    }),
  );
  return [...set].sort();
}

/* ---------- main ---------------------------------------------------------- */
(async () => {
  info("Generating blockImports …");

  const dataRootAbs = await resolveFsDataPath();
  const types = await collectTypes(dataRootAbs);

  const lines = [
    "// ⚠️  AUTO-GENERATED — DO NOT EDIT",
    "import { lazy } from 'react';",
    "",
    "export const blockImports = {",
    ...types.map((t) => {
      const compPath = toComponentPath(t);
      const absComp = path.join(renderRoot, compPath);
      const importP = relImport(outFile, absComp);
      return `  '${t}': lazy(() => import('${importP}')),`;
    }),
    `  'unknown': lazy(() => import('${relImport(
      outFile,
      path.join(renderRoot, "UnknownBlock"),
    )}')),`,
    "} as const;",
    "",
    "export type BlockType = keyof typeof blockImports;",
    "",
  ];

  await fs.mkdir(generatedRoot, { recursive: true });
  await fs.writeFile(outFile, lines.join("\n"));

  console.log(
    c.green("✔"),
    `${types.length} block type${types.length !== 1 ? "s" : ""} → ${path.relative(
      root,
      outFile,
    )}`,
  );
})();
