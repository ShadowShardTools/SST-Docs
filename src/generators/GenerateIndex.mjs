#!/usr/bin/env node
/* -------------------------------------------------------------------------- */
/*  Scans <fsDataPath>/<version>/** → writes index.json per version           */
/*  New format (recursive categories, no subcategories folder):               */
/*    { "categories": ["ui","guides"], "items": ["intro","setup", ...] }      */
/* -------------------------------------------------------------------------- */
import 'dotenv/config';

import { readdir, readFile, writeFile, stat } from "node:fs/promises";
import path from "node:path";

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

/* ---------- resolve project root & fsDataPath ---------------------------- */
function toAbs(raw) {
  const cleaned = String(raw).replace(/\\/g, "/").replace(/\/+$/, "");
  return path.isAbsolute(cleaned)
    ? cleaned
    : path.resolve(cleaned.replace(/^\.\//, ""));
}

async function resolveFsDataPath() {
  const fromImportMeta = (typeof import.meta !== "undefined" && import.meta.env && import.meta.env.FS_DATA_PATH) || undefined;
  const fromProcess = process.env.FS_DATA_PATH;
  const envVal = fromImportMeta ?? fromProcess;
  if (envVal) {
    console.log("➜ Using FS_DATA_PATH from environment");
    return toAbs(envVal);
  }
}

/* ---------- helpers ------------------------------------------------------- */
async function listJsonIds(dir) {
  try {
    const files = await readdir(dir);
    return files
      .filter((f) => f.endsWith(".json") && f !== "index.json")
      .map((f) => path.basename(f, ".json"));
  } catch {
    return [];
  }
}

async function generateIndex(versionDir) {
  const categoriesDir = path.join(versionDir, "categories");
  const itemsDir = path.join(versionDir, "items");

  const categories = await listJsonIds(categoriesDir);
  const itemIds = await listJsonIds(itemsDir);

  const validItemIds = [];
  for (const name of itemIds) {
    try {
      const json = await readFile(path.join(itemsDir, `${name}.json`), "utf8");
      const { id } = JSON.parse(json);
      if (typeof id === "string" && id.trim()) {
        validItemIds.push(id);
      } else {
        warn(`Missing or invalid "id" in ${path.join(itemsDir, `${name}.json`)}`);
      }
    } catch {
      warn(`Bad JSON: ${name}.json in ${path.basename(versionDir)}`);
    }
  }

  const index = { categories, items: validItemIds };
  await writeFile(
    path.join(versionDir, "index.json"),
    JSON.stringify(index, null, 2),
  );
  console.log(c.green("✔"), `${path.basename(versionDir)}/index.json`);
}

/* ---------- main ---------------------------------------------------------- */
(async () => {
  const dataDir = await resolveFsDataPath();

  // validate dataDir
  try {
    const s = await stat(dataDir);
    if (!s.isDirectory()) throw new Error("Not a directory");
  } catch {
    fail(`Invalid fsDataPath: ${dataDir}`);
    process.exit(1);
  }

  info(`Generating version indexes from ${dataDir} …`);

  const entries = await readdir(dataDir, { withFileTypes: true });
  const versions = entries.filter((e) => e.isDirectory()).map((e) => e.name);

  if (!versions.length) {
    warn("No version directories found.");
  }

  for (const v of versions) {
    const dir = path.join(dataDir, v);
    await generateIndex(dir);
  }

  console.log(c.green("🏁  All index.json files generated."));
})();
