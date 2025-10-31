#!/usr/bin/env node
import { argv, exit } from "node:process";
import { resolve } from "node:path";
import { readFile } from "node:fs/promises";
import fg from "fast-glob";
import { pathExists } from "./utils/paths";
import { createLogger } from "./utils/logger";

interface Options {
  outDir: string;
  allowScripts: boolean;
  failOnMissing: boolean;
}

const logger = createLogger("html-generator:validate");

function parseArgs(): Options {
  const args = argv.slice(2);
  const options: Options = {
    outDir: "dist-static",
    allowScripts: false,
    failOnMissing: true,
  };

  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i];
    if (arg === "--out" || arg === "--out-dir") {
      options.outDir = args[++i] ?? options.outDir;
    } else if (arg.startsWith("--out=")) {
      options.outDir = arg.split("=", 2)[1];
    } else if (arg === "--allow-scripts") {
      options.allowScripts = true;
    } else if (arg === "--no-fail-on-missing") {
      options.failOnMissing = false;
    } else if (arg === "--help" || arg === "-h") {
      // eslint-disable-next-line no-console
      console.log(`Validate generated HTML output.

Usage:
  pnpm validate:html [options]

Options:
  --out <dir>            Directory containing generated HTML (default: dist-static)
  --allow-scripts        Allow <script> tags (disabled by default)
  --no-fail-on-missing   Do not fail if the output directory is missing
  --help                 Show this message
`);
      exit(0);
    }
  }

  return options;
}

async function run() {
  const options = parseArgs();
  const outDir = resolve(process.cwd(), options.outDir);

  if (!(await pathExists(outDir))) {
    const message = `Output directory '${options.outDir}' not found.`;
    if (options.failOnMissing) {
      logger.error(message);
      exit(1);
    } else {
      logger.warn(message);
      exit(0);
    }
  }

  const pattern = `${outDir.replace(/\\/g, "/")}/**/*.html`;
  const files = await fg(pattern);

  if (files.length === 0) {
    logger.warn("No HTML files found to validate.");
    exit(0);
  }

  const violations: string[] = [];

  for (const file of files) {
    const contents = await readFile(file, "utf8");
    if (!options.allowScripts && /<script\b/i.test(contents)) {
      violations.push(`${file}: contains <script> tag`);
    }
  }

  if (violations.length > 0) {
    logger.error(
      `Validation failed. Found ${violations.length} violation${violations.length === 1 ? "" : "s"}.`,
    );
    violations.forEach((v) => logger.error(` - ${v}`));
    exit(1);
  }

  logger.info(
    `Validated ${files.length} HTML file${files.length === 1 ? "" : "s"} successfully.`,
  );
}

run().catch((err) => {
  logger.error(
    err instanceof Error
      ? (err.stack ?? err.message)
      : `Unknown error: ${String(err)}`,
  );
  exit(1);
});
