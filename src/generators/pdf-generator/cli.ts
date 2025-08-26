#!/usr/bin/env node
import path from "node:path";
import fs from "node:fs/promises";
import { fileURLToPath } from "node:url";
import appRoot from "app-root-path";
import { DocumentationPDFGenerator } from "./core/DocumentationPDFGenerator"; // keep extension if ESM

const __filename = fileURLToPath(import.meta.url);

function usage(): never {
  console.log(`SST PDF Generator

Usage:
  node ${path.relative(process.cwd(), __filename)} [--fsDataPath <path>]
  node ${path.relative(process.cwd(), __filename)} <positionalPath>

Options:
  --fsDataPath <path>  Path to data root (overrides env/positional)
  --help               Show this help

Environment:
  FS_DATA_PATH         Default path if flags/positionals not provided
`);
  process.exit(0);
}

function getArgValue(flag: string): string | undefined {
  const idx = process.argv.indexOf(flag);
  return idx !== -1 &&
    process.argv[idx + 1] &&
    !process.argv[idx + 1].startsWith("-")
    ? process.argv[idx + 1]
    : undefined;
}

function normalizeDir(p: string): string {
  // unify slashes, remove trailing slashes
  return p.replace(/\\/g, "/").replace(/\/+$/, "");
}

function resolveAgainstProjectRoot(candidate: string): string {
  return path.isAbsolute(candidate)
    ? candidate
    : path.join(appRoot.path, candidate);
}

function resolveDataPath(): string {
  // Priority: --fsDataPath → positional (argv[2]) → env → fallback
  const fromFlag = getArgValue("--fsDataPath");
  const positional =
    process.argv[2] && !process.argv[2].startsWith("-")
      ? process.argv[2]
      : undefined;

  const candidate =
    fromFlag ??
    positional ??
    process.env.FS_DATA_PATH ??
    "./public/SST-Docs/data";

  // IMPORTANT: resolve RELATIVE values against the project root, not CWD
  const abs = resolveAgainstProjectRoot(candidate);
  return normalizeDir(path.resolve(abs));
}

async function ensureDirExists(dir: string): Promise<void> {
  try {
    const st = await fs.stat(dir);
    if (!st.isDirectory()) {
      throw new Error(`Path exists but is not a directory: ${dir}`);
    }
  } catch (e: any) {
    if (e?.code === "ENOENT") {
      throw new Error(`Data path does not exist: ${dir}`);
    }
    throw e;
  }
}

async function main(): Promise<void> {
  if (process.argv.includes("--help") || process.argv.includes("-h")) usage();

  const dataPath = resolveDataPath();

  await ensureDirExists(dataPath);

  const generator = new DocumentationPDFGenerator(dataPath);
  try {
    await generator.generateAllPDFs();
    process.exitCode = 0;
  } catch (err) {
    console.error("❌ PDF generation failed:", err);
    process.exitCode = 1;
  }
}

/**
 * Only run when this file is the entrypoint.
 */
const isDirectRun =
  process.argv[1] && path.resolve(process.argv[1]) === path.resolve(__filename);

if (isDirectRun) {
  (async () => {
    await main();
  })();
}

export {}; // keep as ESM
