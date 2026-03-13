import { spawn } from "node:child_process";
import path from "node:path";

const repoRoot = process.cwd();
const ghPagesBin = path.resolve(
  repoRoot,
  "node_modules",
  "gh-pages",
  "bin",
  "gh-pages.js",
);

const cacheDir = path.resolve(repoRoot, ".cache", "gh-pages");
const args = [ghPagesBin, "-d", "dist", ...process.argv.slice(2)];

const child = spawn(process.execPath, args, {
  cwd: repoRoot,
  stdio: "inherit",
  env: {
    ...process.env,
    CACHE_DIR: cacheDir,
  },
});

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }
  process.exit(code ?? 1);
});

child.on("error", (error) => {
  console.error(error);
  process.exit(1);
});
