import path from "node:path";
import appRoot from "app-root-path";

export function normalizeDir(p: string): string {
  return p.replace(/\\/g, "/").replace(/\/+$/, "");
}

export function resolveAgainstProjectRoot(candidate: string): string {
  return path.isAbsolute(candidate)
    ? candidate
    : path.join(appRoot.path, candidate);
}

export function resolveDataPath(input?: string): string {
  const argv = process.argv.slice(2);
  const i = argv.indexOf("--fsDataPath");
  const fromCli = i !== -1 && argv[i + 1] ? argv[i + 1] : undefined;
  const fromEnv = process.env.FS_DATA_PATH;
  const candidate = input ?? fromCli ?? fromEnv ?? "./public/SST-Docs/data";
  const abs = resolveAgainstProjectRoot(String(candidate));
  return normalizeDir(path.resolve(abs));
}
