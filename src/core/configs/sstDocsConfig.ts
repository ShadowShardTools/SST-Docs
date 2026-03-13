import { readFileSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

import appRoot from "app-root-path";

import type { ResolvedSstDocsConfig } from "../types/SstDocsConfig.js";

import {
  derivePublicDataPath,
  parseConfigContents,
  resolvePublicDataPath,
  SST_DOCS_CONFIG_FILENAME,
  SstDocsConfigError,
} from "./sstDocsConfigShared.js";

const APP_ROOT = appRoot.path;

export async function loadSstDocsConfig(
  configPath?: string,
): Promise<ResolvedSstDocsConfig> {
  const { path: finalPath, contents } = await readConfigFile(configPath);

  return parseConfigContents(contents, finalPath);
}

export function loadSstDocsConfigSync(
  configPath?: string,
): ResolvedSstDocsConfig {
  const { path: finalPath, contents } = readConfigFileSync(configPath);
  return parseConfigContents(contents, finalPath);
}

export async function loadSstDocsConfigFrom(
  configDir: string,
): Promise<ResolvedSstDocsConfig> {
  const fullPath = resolve(configDir, SST_DOCS_CONFIG_FILENAME);
  return loadSstDocsConfig(fullPath);
}

export function loadSstDocsConfigFromSync(
  configDir: string,
): ResolvedSstDocsConfig {
  const fullPath = resolve(configDir, SST_DOCS_CONFIG_FILENAME);
  return loadSstDocsConfigSync(fullPath);
}

async function readConfigFile(
  configPath?: string,
): Promise<{ path: string; contents: string }> {
  const searchPaths = getConfigSearchPaths(configPath);
  const attempted: string[] = [];

  for (const candidate of searchPaths) {
    attempted.push(candidate);
    try {
      const contents = await readFile(candidate, "utf-8");
      return { path: candidate, contents };
    } catch (error) {
      const err = error as NodeJS.ErrnoException;
      if (err.code === "ENOENT" || err.code === "EISDIR") {
        continue;
      }
      throw new SstDocsConfigError(
        `Failed to read ${SST_DOCS_CONFIG_FILENAME} at ${candidate}: ${err.message}`,
      );
    }
  }

  throw new SstDocsConfigError(
    `Unable to locate ${SST_DOCS_CONFIG_FILENAME}. Tried: ${attempted.join(
      ", ",
    )}`,
  );
}

function readConfigFileSync(configPath?: string): {
  path: string;
  contents: string;
} {
  const searchPaths = getConfigSearchPaths(configPath);
  const attempted: string[] = [];

  for (const candidate of searchPaths) {
    attempted.push(candidate);
    try {
      const contents = readFileSync(candidate, "utf-8");
      return { path: candidate, contents };
    } catch (error) {
      const err = error as NodeJS.ErrnoException;
      if (err.code === "ENOENT" || err.code === "EISDIR") {
        continue;
      }

      throw new SstDocsConfigError(
        `Failed to read ${SST_DOCS_CONFIG_FILENAME} at ${candidate}: ${err.message}`,
      );
    }
  }

  throw new SstDocsConfigError(
    `Unable to locate ${SST_DOCS_CONFIG_FILENAME}. Tried: ${attempted.join(
      ", ",
    )}`,
  );
}

function getConfigSearchPaths(configPath?: string): string[] {
  const searchPaths: string[] = [];

  if (configPath) {
    const explicit = resolve(APP_ROOT, configPath);
    searchPaths.push(explicit);
    if (!explicit.endsWith(".json")) {
      searchPaths.push(resolve(explicit, SST_DOCS_CONFIG_FILENAME));
    }
  } else {
    searchPaths.push(resolve(APP_ROOT, SST_DOCS_CONFIG_FILENAME));
  }

  return searchPaths;
}

export {
  derivePublicDataPath,
  resolvePublicDataPath,
  SST_DOCS_CONFIG_FILENAME,
  SstDocsConfigError,
};
