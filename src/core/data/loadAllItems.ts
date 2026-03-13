import type { DataDiagnostic } from "../types/DataDiagnostic.js";
import type { DataProvider } from "../types/DataProvider.js";
import type { DocItem } from "../types/DocItem.js";
import type { Logger } from "../types/Logger.js";
import { createLogger } from "../utilities/system/logger.js";

export interface LoadAllItemsResult {
  items: DocItem[];
  diagnostics: DataDiagnostic[];
}

export interface LoadAllItemsOptions {
  logger?: Logger;
}

export async function loadAllItems(
  provider: DataProvider,
  versionRootAbs: string,
  ids: string[],
  options?: LoadAllItemsOptions,
): Promise<LoadAllItemsResult> {
  const diagnostics: DataDiagnostic[] = [];
  const logger = options?.logger ?? createLogger("data:loadAllItems");

  // Try batch loading first
  try {
    const allItems = await provider.readJson<
      DocItem[] | Record<string, DocItem>
    >(`${versionRootAbs}/items/_all.json`);
    const items: DocItem[] = [];
    const itemMap = Array.isArray(allItems)
      ? new Map(allItems.map((it) => [it.id, it]))
      : new Map(Object.entries(allItems));

    ids.forEach((id) => {
      const item = itemMap.get(id);
      if (item) {
        items.push(item);
      } else {
        const message = `Item ${id} not found in batch file.`;
        diagnostics.push({
          code: "item-not-found-in-batch",
          level: "warn",
          message,
          context: { id },
        });
        logger.warn(message);
      }
    });
    return { items, diagnostics };
  } catch (e) {
    // Ignore error and fall back to individual files
    logger.debug?.(`Batch items load failed, falling back: ${e}`);
  }

  const results = await Promise.allSettled(
    ids.map((id) =>
      provider.readJson<DocItem>(`${versionRootAbs}/items/${id}.json`),
    ),
  );

  const items: DocItem[] = [];
  results.forEach((res, i) => {
    if (res.status === "fulfilled") {
      items.push(res.value);
    } else {
      const message = `Failed to load item ${ids[i]}: ${(res.reason as Error).message ?? res.reason}`;
      diagnostics.push({
        code: "item-read-failed",
        level: "warn",
        message,
        context: { id: ids[i] },
      });
      logger.warn(message);
    }
  });
  return { items, diagnostics };
}
