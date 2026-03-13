import path from "node:path";

import type { DataDiagnostic } from "../types/DataDiagnostic.js";
import { normalizeSystemPath } from "../utilities/string/normalizeSystemPath.js";
import { createLogger } from "../utilities/system/logger.js";

import { FsDataProvider } from "./fsDataProvider.js";
import type {
  LoadVersionDataFromProviderOptions,
  LoadVersionDataFromProviderResult,
} from "./loadVersionData.js";
import { loadVersionData, selectProductAndVersion } from "./loadVersionData.js";

export async function loadVersionDataFromFs(
  baseDir: string,
  options?: LoadVersionDataFromProviderOptions,
): Promise<LoadVersionDataFromProviderResult> {
  const logger = options?.logger ?? createLogger("data:loadVersionDataFromFs");
  const provider = new FsDataProvider();
  const diagnostics: DataDiagnostic[] = [];
  const root = normalizeSystemPath(path.resolve(baseDir));

  const {
    product,
    products,
    versionsRoot,
    versions,
    selectedVersion,
    diagnostics: selectionDiagnostics,
  } = await selectProductAndVersion(
    provider,
    root,
    options,
    logger,
    (base, child) => normalizeSystemPath(path.resolve(base, child)),
  );

  const versionRoot = normalizeSystemPath(
    path.resolve(versionsRoot, selectedVersion),
  );
  const {
    items,
    tree,
    standaloneDocs,
    diagnostics: loadDiagnostics,
  } = await loadVersionData(provider, versionRoot, { logger });

  diagnostics.push(...selectionDiagnostics, ...loadDiagnostics);

  return {
    version: selectedVersion,
    versions,
    product,
    products,
    items,
    tree,
    standaloneDocs,
    diagnostics,
  };
}
