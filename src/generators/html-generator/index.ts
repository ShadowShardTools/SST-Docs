#!/usr/bin/env node
import { argv, exit } from "node:process";
import { resolve } from "node:path";
import { mkdir } from "node:fs/promises";
import { performance } from "node:perf_hooks";
import { loadVersions } from "../../services/docsData";
import { createLogger } from "./utils/logger";
import {
  normaliseBasePath,
  resolveDataRoot,
  resolveOutputRoot,
} from "./utils/paths";
import type { GeneratorConfig, RunOptions } from "./types";
import { FileSystemProvider } from "./data/FileSystemProvider";
import { buildVersionRenderPlan } from "./render/buildPlan";
import { renderVersion } from "./render/renderVersion";
import { lightTheme } from "../../configs/themes/lightTheme";

const logger = createLogger("html-generator");

async function parseArgs(): Promise<RunOptions> {
  const args = argv.slice(2);
  const options: RunOptions = {
    outDir: undefined,
    dataRoot: undefined,
    basePath: undefined,
    versions: [],
    quiet: false,
    separateBuild: undefined,
  };

  for (let i = 0; i < args.length; i += 1) {
    const raw = args[i];
    if (!raw.startsWith("--")) {
      logger.warn(`Ignoring unknown positional argument: ${raw}`);
      continue;
    }

    const [flag, value] = raw.split("=", 2);
    switch (flag) {
      case "--out":
      case "--out-dir":
        options.outDir = value ?? args[++i];
        break;
      case "--data":
      case "--data-root":
        options.dataRoot = value ?? args[++i];
        break;
      case "--base":
      case "--base-path":
        options.basePath = value ?? args[++i];
        break;
      case "--version":
        options.versions.push(value ?? args[++i]);
        break;
      case "--quiet":
        options.quiet = true;
        break;
      case "--separate-build":
        if (
          value === undefined &&
          args[i + 1] &&
          !args[i + 1].startsWith("--")
        ) {
          options.separateBuild = ["true", "1", "yes"].includes(
            (args[++i] ?? "").toLowerCase(),
          );
        } else if (value !== undefined) {
          options.separateBuild = ["true", "1", "yes"].includes(
            value.toLowerCase(),
          );
        } else {
          options.separateBuild = true;
        }
        break;
      case "--no-separate-build":
      case "--inline-output":
        options.separateBuild = false;
        break;
      case "--help":
      case "-h":
        // eslint-disable-next-line no-console
        console.log(`Static HTML generator

Usage:
  pnpm generate:html [options]

Options:
  --out <dir>          Output directory (defaults to dist-static)
  --data <dir>         Docs data root (defaults to public/SST-Docs/data)
  --base <path>        Base path for generated links (default: /)
  --version <id>       Restrict generation to this version (repeat for multiples)
  --quiet              Reduce log verbosity
  --separate-build     Keep static output in a standalone directory (default)
  --no-separate-build  Write static output alongside docs data (uses static-styles assets)
  --help               Show this message
`);
        exit(0);
        break;
      default:
        logger.warn(`Unknown flag ${flag} (ignoring)`);
    }
  }

  return options;
}

function buildConfig(options: RunOptions): GeneratorConfig {
  const cwd = process.cwd();
  const dataRoot = resolveDataRoot(options.dataRoot, cwd);
  const envSeparate = process.env.SEPARATE_BUILD_FOR_HTML_GENERATOR;
  const envSeparateCamel = process.env.separateBuildForHtmlGenerator;
  const envSeparateValue = envSeparate ?? envSeparateCamel ?? undefined;
  const resolvedSeparate =
    options.separateBuild !== undefined
      ? options.separateBuild
      : envSeparateValue !== undefined
        ? ["true", "1", "yes"].includes(envSeparateValue.toLowerCase())
        : true;
  const separateBuild = resolvedSeparate;
  const outDir = separateBuild
    ? resolveOutputRoot(options.outDir, cwd)
    : dataRoot;
  if (!separateBuild && options.outDir && options.outDir !== "") {
    logger.warn(
      "Ignoring --out option because separateBuildForHtmlGenerator is disabled.",
    );
  }
  const basePath = normaliseBasePath(options.basePath);
  const staticAssetsDir = separateBuild
    ? resolve(outDir, "static-styles")
    : resolve(dataRoot, "static-styles");

  return {
    cwd,
    outDir,
    dataRoot,
    basePath,
    versions: options.versions,
    quiet: options.quiet,
    theme: lightTheme,
    separateBuildForHtmlGenerator: separateBuild,
    staticAssetsDir,
  };
}

async function ensureOutDir(path: string) {
  await mkdir(path, { recursive: true });
}

async function main() {
  const options = await parseArgs();
  const config = buildConfig(options);
  const startTime = performance.now();

  if (!config.quiet) {
    logger.info("Starting static HTML generation");
    logger.info(`Data root: ${config.dataRoot}`);
    logger.info(`Output dir: ${config.outDir}`);
    logger.info(`Base path: ${config.basePath}`);
  }

  await ensureOutDir(config.outDir);

  const dataProvider = new FileSystemProvider();
  const versions = await loadVersions(dataProvider, config.dataRoot);

  const targetVersions =
    config.versions.length > 0
      ? versions.filter((v) => config.versions.includes(v.version))
      : versions;

  if (targetVersions.length === 0) {
    logger.error(
      config.versions.length
        ? `No versions matched the filters: ${config.versions.join(", ")}`
        : "No documentation versions found.",
    );
    exit(1);
  }

  const plan = await buildVersionRenderPlan({
    config,
    versions: targetVersions,
    provider: dataProvider,
  });

  if (plan.entries.length === 0) {
    logger.error("Render plan produced no entries.");
    exit(1);
  }

  for (const entry of plan.entries) {
    if (!config.quiet) {
      logger.info(
        `Generating static output for ${entry.version.label ?? entry.version.version}`,
      );
    }
    await renderVersion(entry, config, logger);
  }

  const endTime = performance.now();

  if (!config.quiet) {
    logger.info(
      `Static HTML generation scaffolding completed in ${(
        (endTime - startTime) /
        1000
      ).toFixed(2)}s`,
    );
  }
}

main().catch((err) => {
  logger.error("HTML generation failed.");
  logger.error(err instanceof Error ? (err.stack ?? err.message) : String(err));
  exit(1);
});
