import { resolve } from "node:path";
import { loadVersionData } from "../../../services/docsData";
import type { Version, Category, DocItem } from "../../../layouts/render/types";
import type { GeneratorConfig } from "../types";
import type { DataProvider } from "../../../services/types";
import { createLogger } from "../utils/logger";

export interface VersionRenderEntry {
  version: Version;
  versionRoot: string;
  items: DocItem[];
  tree: Category[];
  standaloneDocs: DocItem[];
}

export interface RenderPlan {
  entries: VersionRenderEntry[];
}

export async function buildVersionRenderPlan(params: {
  config: GeneratorConfig;
  versions: Version[];
  provider: DataProvider;
}): Promise<RenderPlan> {
  const { config, versions, provider } = params;
  const plan: RenderPlan = { entries: [] };
  const logger = createLogger("html-generator:plan");

  for (const version of versions) {
    const root = resolve(config.dataRoot, version.version);
    const { items, tree, standaloneDocs } = await loadVersionData(
      provider,
      root,
    );
    logger.debug(
      `Prepared version ${version.version}: ${tree.length} categories, ${items.length} docs, ${standaloneDocs.length} standalone`,
    );
    plan.entries.push({
      version,
      versionRoot: root,
      items,
      tree,
      standaloneDocs,
    });
  }

  return plan;
}
