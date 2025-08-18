#!/usr/bin/env node
import path from "node:path";
import { fileURLToPath } from "node:url";
import { DocumentationPDFGenerator } from "./DocumentationPDFGenerator.js"; // keep extension if ESM

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
  return path.isAbsolute(candidate) ? candidate : path.resolve(candidate);
}

async function main(): Promise<void> {
  if (process.argv.includes("--help") || process.argv.includes("-h")) usage();

  const dataPath = resolveDataPath();
  console.log("📁 Data path:", dataPath);

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
 * Works for `node path/to/cli.js` and `node --import ...` in Node 20/22 ESM.
 */
const isDirectRun =
  // when invoked directly, Node sets argv[1] to the resolved path of this script
  process.argv[1] && path.resolve(process.argv[1]) === path.resolve(__filename);

if (isDirectRun) {
  // no top-level await errors on older Node: wrap in an IIFE
  (async () => {
    await main();
  })();
}

export {}; // keep as ESM
