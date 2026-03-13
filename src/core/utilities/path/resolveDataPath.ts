import path from "node:path";

import { normalizeSystemPath } from "../string/normalizeSystemPath.js";

import { resolveAgainstProjectRoot } from "./resolveAgainstProjectRoot.js";

export function resolveDataPath(input?: string): string {
  const argv = process.argv.slice(2);
  const i = argv.indexOf("--fsDataPath");
  const fromCli = i !== -1 && argv[i + 1] ? argv[i + 1] : undefined;
  const fromEnv = process.env.FS_DATA_PATH;
  const candidate = input ?? fromCli ?? fromEnv ?? "./public/SST-Docs/data";
  const abs = resolveAgainstProjectRoot(String(candidate));
  return normalizeSystemPath(path.resolve(abs));
}
