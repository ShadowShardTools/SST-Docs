#!/usr/bin/env node
import path from "node:path";
import { fileURLToPath } from "node:url";
import { DocsPdfBuildOrchestrator } from "./core/DocsPdfBuildOrchestrator";

const __filename = fileURLToPath(import.meta.url);

function usage(): never {
  const me = path.relative(process.cwd(), __filename);
  console.log(
    `SST Docs PDF\n\nUsage:\n node ${me} --fsDataPath <path> [--strict]\n node ${me} <positionalPath>\n\nOptions:\n --fsDataPath <path> Root data folder (defaults to ./public/SST-Docs/data)\n --strict Fail-fast on first error\n -h, --help Show help\n`,
  );
  process.exit(1);
}

async function main() {
  const argv = process.argv.slice(2);
  if (argv.includes("-h") || argv.includes("--help")) usage();

  const i = argv.indexOf("--fsDataPath");
  const positional = argv.find((a) => !a.startsWith("--"));
  const fsDataPath = i !== -1 && argv[i + 1] ? argv[i + 1] : positional;

  const orchestrator = new DocsPdfBuildOrchestrator(fsDataPath);
  await orchestrator.generateAll();
}

const isDirectRun =
  process.argv[1] && path.resolve(process.argv[1]) === path.resolve(__filename);
if (isDirectRun) {
  (async () => {
    await main();
  })();
}

export {};
