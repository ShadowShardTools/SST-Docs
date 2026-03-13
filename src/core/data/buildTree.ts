import type { Category } from "../types/Category.js";
import type { DataDiagnostic } from "../types/DataDiagnostic.js";
import type { DocItem } from "../types/DocItem.js";
import type { Logger } from "../types/Logger.js";
import type { RawCategory } from "../types/RawCategory.js";
import { createLogger } from "../utilities/system/logger.js";

export interface BuildTreeOptions {
  logger?: Logger;
}

export interface BuildTreeResult {
  tree: Category[];
  usedDocIds: Set<string>;
  diagnostics: DataDiagnostic[];
}

const nodeCache = new WeakMap<RawCategory, Category>();

function convertCategory(
  raw: RawCategory,
  rawMap: Record<string, RawCategory>,
  docLookup: Map<string, DocItem>,
  usedDocIds: Set<string>,
  included: Set<string>,
  visiting: Set<string>,
  diagnostics: DataDiagnostic[],
  logger: Logger,
): Category | null {
  if (visiting.has(raw.id)) {
    const message = `Detected circular category reference at ${raw.id}.`;
    diagnostics.push({
      code: "circular-category",
      level: "warn",
      message,
      context: { categoryId: raw.id },
    });
    logger.warn(message);
    return null;
  }

  const cached = nodeCache.get(raw);
  if (cached) {
    // We can reuse the node if its children didn't change (by reference check)
    // In our case, the Category object holds references to children.
    // If we trust RawCategory objects are immutable/replaced on change, this works.
    included.add(raw.id);
    return cached;
  }

  visiting.add(raw.id);

  let docs: DocItem[] | undefined;
  const docIds: unknown[] = Array.isArray(raw.docs) ? raw.docs : [];

  if (docIds.length > 0) {
    const validDocs = docIds
      .map((rawId): DocItem | null => {
        if (typeof rawId !== "string" || rawId.length === 0) {
          const message = `Invalid doc id in category ${raw.id}.`;
          diagnostics.push({
            code: "invalid-doc-ref",
            level: "warn",
            message,
            context: { categoryId: raw.id, docId: rawId },
          });
          logger.warn(message);
          return null;
        }
        const doc = docLookup.get(rawId);
        if (!doc) {
          const message = `Doc id ${rawId} referenced in category ${raw.id} not found.`;
          diagnostics.push({
            code: "missing-doc-ref",
            level: "warn",
            message,
            context: { categoryId: raw.id, docId: rawId },
          });
          logger.warn(message);
          return null;
        }

        usedDocIds.add(rawId);
        return doc;
      })
      .filter((doc): doc is DocItem => doc !== null);

    if (validDocs.length > 0) {
      docs = validDocs;
    }
  }

  let children: Category[] | undefined;
  const childIds: unknown[] = Array.isArray(raw.children) ? raw.children : [];

  if (childIds.length > 0) {
    const validChildren = childIds
      .map((rawChildId): Category | null => {
        if (typeof rawChildId !== "string" || rawChildId.length === 0) {
          const message = `Invalid child category id in ${raw.id}.`;
          diagnostics.push({
            code: "invalid-child-ref",
            level: "warn",
            message,
            context: { categoryId: raw.id, childId: rawChildId },
          });
          logger.warn(message);
          return null;
        }
        const childRaw = rawMap[rawChildId];
        if (!childRaw) {
          const message = `Child category ${rawChildId} referenced in ${raw.id} not found.`;
          diagnostics.push({
            code: "missing-child-ref",
            level: "warn",
            message,
            context: { categoryId: raw.id, childId: rawChildId },
          });
          logger.warn(message);
          return null;
        }
        return convertCategory(
          childRaw,
          rawMap,
          docLookup,
          usedDocIds,
          included,
          visiting,
          diagnostics,
          logger,
        );
      })
      .filter((child): child is Category => child !== null);

    if (validChildren.length > 0) {
      children = validChildren;
    }
  }

  visiting.delete(raw.id);
  included.add(raw.id);

  const result: Category = {
    id: raw.id,
    title: raw.title,
    description: raw.description,
    content: raw.content ?? [],
    docs,
    children,
  };

  // Cache the result for this specific RawCategory version
  nodeCache.set(raw, result);

  return result;
}

const buildTreeCache = new WeakMap<
  Record<string, RawCategory>,
  { docs: DocItem[]; result: BuildTreeResult }
>();

export function buildTree(
  rawMap: Record<string, RawCategory>,
  allDocs: DocItem[],
  options?: BuildTreeOptions,
): BuildTreeResult {
  const cached = buildTreeCache.get(rawMap);
  if (cached && cached.docs === allDocs) {
    return cached.result;
  }

  const docLookup = new Map(allDocs.map((d) => [d.id, d] as const));
  const usedDocIds = new Set<string>();
  const includedIds = new Set<string>();
  const diagnostics: DataDiagnostic[] = [];
  const logger = options?.logger ?? createLogger("data:buildTree");

  const childCategoryIds = new Set<string>();
  Object.values(rawMap).forEach((category) => {
    if (Array.isArray(category?.children)) {
      category.children.forEach((childId) => {
        if (typeof childId === "string" && childId.length > 0) {
          childCategoryIds.add(childId);
        }
      });
    }
  });

  let rootCandidates = Object.values(rawMap).filter(
    (category) =>
      category &&
      typeof category.id === "string" &&
      category.id.length > 0 &&
      !childCategoryIds.has(category.id),
  );

  if (rootCandidates.length === 0) {
    rootCandidates = Object.values(rawMap).filter(
      (category) =>
        category && typeof category.id === "string" && category.id.length > 0,
    );
  }

  const tree = rootCandidates
    .map((rootCategory) => {
      if (includedIds.has(rootCategory.id)) return null;
      return convertCategory(
        rootCategory,
        rawMap,
        docLookup,
        usedDocIds,
        includedIds,
        new Set(),
        diagnostics,
        logger,
      );
    })
    .filter((category): category is Category => category !== null);

  const result = { tree, usedDocIds, diagnostics };
  buildTreeCache.set(rawMap, { docs: allDocs, result });

  return result;
}
