// src/shared/docsData.ts
import type { Version } from "../layouts/render/types";
import type { Category, DocItem } from "../layouts/render/types";
import type { RawCategory, IndexJson, DataProvider } from "./types";

/** Build the tree + collect used doc ids (shared logic). */
export function buildTree(
  rawMap: Record<string, RawCategory>,
  allDocs: DocItem[],
): { tree: Category[]; usedDocIds: Set<string> } {
  const docLookup = new Map(allDocs.map((d) => [d.id, d] as const));
  const used = new Set<string>();

  const convert = (raw: RawCategory): Category => {
    let docs: DocItem[] | undefined = undefined;
    if (raw.docs && Array.isArray(raw.docs) && raw.docs.length > 0) {
      const validDocs = raw.docs
        .map((id) => {
          if (!id || typeof id !== "string") {
            console.warn(`Invalid doc id in category ${raw.id}:`, id);
            return null;
          }
          const doc = docLookup.get(id);
          if (doc) {
            used.add(id);
            return doc;
          } else {
            console.warn(
              `Doc id ${id} referenced in category ${raw.id} not found.`,
            );
            return null;
          }
        })
        .filter((doc): doc is DocItem => doc !== null);

      docs = validDocs.length > 0 ? validDocs : undefined;
    }

    let children: Category[] | undefined = undefined;
    if (
      raw.children &&
      Array.isArray(raw.children) &&
      raw.children.length > 0
    ) {
      const validChildren = raw.children
        .map((cid) => {
          if (!cid || typeof cid !== "string") {
            console.warn(`Invalid child category id in ${raw.id}:`, cid);
            return null;
          }
          const childRaw = rawMap[cid];
          if (!childRaw) {
            console.warn(
              `Child category ${cid} referenced in ${raw.id} not found.`,
            );
            return null;
          }
          return convert(childRaw);
        })
        .filter((child): child is Category => child !== null);

      children = validChildren.length > 0 ? validChildren : undefined;
    }

    return {
      id: raw.id,
      title: raw.title,
      description: raw.description,
      content: raw.content ?? [],
      docs,
      children,
    };
  };

  const childCategoryIds = new Set<string>();
  Object.values(rawMap).forEach((category) => {
    if (category?.children && Array.isArray(category.children)) {
      category.children.forEach((childId) => {
        if (childId && typeof childId === "string") {
          childCategoryIds.add(childId);
        }
      });
    }
  });

  const tree = Object.values(rawMap)
    .filter(
      (category) =>
        category &&
        typeof category.id === "string" &&
        category.id.length > 0 &&
        !childCategoryIds.has(category.id),
    )
    .map(convert);

  return { tree, usedDocIds: used };
}

/** Load versions.json at the *data root* (e.g., `${DATA_ROOT}/versions.json`). */
export async function loadVersions(
  provider: DataProvider,
  dataRootAbs: string,
): Promise<Version[]> {
  return provider.readJson<Version[]>(`${dataRootAbs}/versions.json`);
}

/** Load all categories (absolute root for a version is `${DATA_ROOT}/${version}`) */
export async function loadAllCategories(
  provider: DataProvider,
  versionRootAbs: string,
  ids: string[],
): Promise<Record<string, RawCategory>> {
  const results = await Promise.allSettled(
    ids.map(async (id) => {
      const p = `${versionRootAbs}/categories/${id}.json`;
      const data = await provider.readJson<RawCategory>(p);
      return { id, data };
    }),
  );

  const map: Record<string, RawCategory> = {};
  results.forEach((res, i) => {
    if (res.status === "fulfilled") {
      map[res.value.id] = res.value.data;
    } else {
      console.warn(`Failed to load category ${ids[i]}:`, res.reason);
    }
  });
  return map;
}

/** Load all items */
export async function loadAllItems(
  provider: DataProvider,
  versionRootAbs: string,
  ids: string[],
): Promise<DocItem[]> {
  const results = await Promise.allSettled(
    ids.map((id) =>
      provider.readJson<DocItem>(`${versionRootAbs}/items/${id}.json`),
    ),
  );

  const list: DocItem[] = [];
  results.forEach((res, i) => {
    if (res.status === "fulfilled") list.push(res.value);
    else console.warn(`Failed to load item ${ids[i]}:`, res.reason);
  });
  return list;
}

/** Load version data: index.json -> categories/items -> tree + standalone docs */
export async function loadVersionData(
  provider: DataProvider,
  versionRootAbs: string,
): Promise<{ items: DocItem[]; tree: Category[]; standaloneDocs: DocItem[] }> {
  const index = await provider.readJson<IndexJson>(
    `${versionRootAbs}/index.json`,
  );

  const [rawCats, items] = await Promise.all([
    loadAllCategories(provider, versionRootAbs, index.categories),
    loadAllItems(provider, versionRootAbs, index.items),
  ]);

  const { tree, usedDocIds } = buildTree(rawCats, items);
  const standaloneDocs = items.filter((d) => !usedDocIds.has(d.id));
  return { items, tree, standaloneDocs };
}
