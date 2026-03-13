import type { ResolvedSstDocsConfig } from "../types/SstDocsConfig.js";

import {
  derivePublicDataPath,
  resolvePublicDataPath,
  SST_DOCS_CONFIG_FILENAME,
  SstDocsConfigError,
} from "./sstDocsConfigShared.js";

function unsupported(method: string): never {
  throw new SstDocsConfigError(
    `${method} is only available in a Node.js environment where the file system can be read.`,
  );
}

export async function loadSstDocsConfig(
  _configPath?: string,
): Promise<ResolvedSstDocsConfig> {
  return unsupported("loadSstDocsConfig");
}

export function loadSstDocsConfigSync(
  _configPath?: string,
): ResolvedSstDocsConfig {
  return unsupported("loadSstDocsConfigSync");
}

export async function loadSstDocsConfigFrom(
  _configDir: string,
): Promise<ResolvedSstDocsConfig> {
  return unsupported("loadSstDocsConfigFrom");
}

export function loadSstDocsConfigFromSync(
  _configDir: string,
): ResolvedSstDocsConfig {
  return unsupported("loadSstDocsConfigFromSync");
}

export {
  derivePublicDataPath,
  resolvePublicDataPath,
  SST_DOCS_CONFIG_FILENAME,
  SstDocsConfigError,
};
