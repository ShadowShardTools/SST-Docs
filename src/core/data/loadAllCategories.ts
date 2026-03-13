import type { DataDiagnostic } from "../types/DataDiagnostic.js";
import type { DataProvider } from "../types/DataProvider.js";
import type { Logger } from "../types/Logger.js";
import type { RawCategory } from "../types/RawCategory.js";
import { createLogger } from "../utilities/system/logger.js";

export interface LoadAllCategoriesResult {
  categories: Record<string, RawCategory>;
  diagnostics: DataDiagnostic[];
}

export interface LoadAllCategoriesOptions {
  logger?: Logger;
}

export async function loadAllCategories(
  provider: DataProvider,
  versionRootAbs: string,
  ids: string[],
  options?: LoadAllCategoriesOptions,
): Promise<LoadAllCategoriesResult> {
  const diagnostics: DataDiagnostic[] = [];
  const logger = options?.logger ?? createLogger("data:loadAllCategories");

  // Try batch loading first
  try {
    const allCategories = await provider.readJson<Record<string, RawCategory>>(
      `${versionRootAbs}/categories/_all.json`,
    );
    const categories: Record<string, RawCategory> = {};
    ids.forEach((id) => {
      if (allCategories[id]) {
        categories[id] = allCategories[id];
      } else {
        const message = `Category ${id} not found in batch file.`;
        diagnostics.push({
          code: "category-not-found-in-batch",
          level: "warn",
          message,
          context: { id },
        });
        logger.warn(message);
      }
    });
    return { categories, diagnostics };
  } catch (e) {
    // Ignore error and fall back to individual files
    logger.debug?.(`Batch categories load failed, falling back: ${e}`);
  }

  const results = await Promise.allSettled(
    ids.map(async (id) => {
      const p = `${versionRootAbs}/categories/${id}.json`;
      const data = await provider.readJson<RawCategory>(p);
      return { id, data };
    }),
  );

  const categories: Record<string, RawCategory> = {};
  results.forEach((res, i) => {
    if (res.status === "fulfilled") {
      categories[res.value.id] = res.value.data;
    } else {
      const message = `Failed to load category ${ids[i]}: ${(res.reason as Error).message ?? res.reason}`;
      diagnostics.push({
        code: "category-read-failed",
        level: "warn",
        message,
        context: { id: ids[i] },
      });
      logger.warn(message);
    }
  });

  return { categories, diagnostics };
}
