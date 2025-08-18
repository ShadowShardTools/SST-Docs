import type { Version } from "../types/Version";
import type { Category } from "../types/Category";
import type { Content } from "../types/Content";
import type { DocItem } from "../types/DocItem";

interface IndexJson {
  categories: string[];
  items: string[];
}

interface RawCategory {
  id: string;
  title: string;
  description?: string;
  content?: Content[];
  docs?: string[];
  children?: string[];
}

export class documentationLoader {
  private static baseUrl: string | null = null;

  private static getBaseUrl(): string {
    if (!this.baseUrl) {
      this.baseUrl = import.meta.env.BASE_URL.replace(/\/$/, "");
    }
    return this.baseUrl;
  }

  private static getDataPath(): string {
    const cfg = import.meta.env.VITE_PUBLIC_DATA_PATH as string | undefined;
    return `${this.getBaseUrl()}${cfg?.replace(/\/$/, "")}`;
  }

  private static async fetchJson<T>(path: string): Promise<T> {
    const response = await fetch(path);
    if (!response.ok) {
      throw new Error(
        `Failed to fetch ${path}: ${response.status} ${response.statusText}`,
      );
    }
    return response.json();
  }

  static async loadVersions(): Promise<Version[]> {
    return this.fetchJson<Version[]>(`${this.getDataPath()}/versions.json`);
  }

  static async loadVersionData(version: string): Promise<{
    items: DocItem[];
    tree: Category[];
    standaloneDocs: DocItem[];
  }> {
    const basePath = `${this.getDataPath()}/${version}`;

    /* ----------------------------- index.json ---------------------------- */
    const index = await this.fetchJson<IndexJson>(`${basePath}/index.json`);

    /* ---------------------- load items & categories ---------------------- */
    const [rawCats, items] = await Promise.all([
      this.loadAllCategories(basePath, index.categories),
      this.loadAllItems(basePath, index.items),
    ]);

    /* ------------------------- build category tree ----------------------- */
    const { tree, usedDocIds } = this.buildTree(rawCats, items);

    /* ------------------------- standalone docs --------------------------- */
    const standaloneDocs = items.filter((d) => !usedDocIds.has(d.id));

    return { items, tree, standaloneDocs };
  }

  private static async loadAllCategories(
    basePath: string,
    ids: string[],
  ): Promise<Record<string, RawCategory>> {
    const results = await Promise.allSettled(
      ids.map((id) =>
        this.fetchJson<RawCategory>(`${basePath}/categories/${id}.json`).then(
          (data) => ({ id, data }),
        ),
      ),
    );

    const map: Record<string, RawCategory> = {};
    results.forEach((res, idx) => {
      if (res.status === "fulfilled") {
        map[res.value.id] = res.value.data;
      } else {
        console.warn(`Failed to load category ${ids[idx]}:`, res.reason);
      }
    });
    return map;
  }

  private static async loadAllItems(
    basePath: string,
    ids: string[],
  ): Promise<DocItem[]> {
    const results = await Promise.allSettled(
      ids.map((id) => this.fetchJson<DocItem>(`${basePath}/items/${id}.json`)),
    );

    const list: DocItem[] = [];
    results.forEach((res, idx) => {
      if (res.status === "fulfilled") {
        list.push(res.value);
      } else {
        console.warn(`Failed to load item ${ids[idx]}:`, res.reason);
      }
    });
    return list;
  }

  private static buildTree(
    rawMap: Record<string, RawCategory>,
    allDocs: DocItem[],
  ): { tree: Category[]; usedDocIds: Set<string> } {
    const docLookup = new Map(allDocs.map((d) => [d.id, d] as const));
    const used = new Set<string>();

    const convert = (raw: RawCategory): Category => {
      // Handle docs array with proper null/undefined checks
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

      // Handle children array with proper null/undefined checks
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

    // Find root categories (categories not referenced as children by any other category)
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
      .filter((category) => {
        // Only include valid categories that are not children of other categories
        return (
          category &&
          typeof category.id === "string" &&
          category.id.length > 0 &&
          !childCategoryIds.has(category.id)
        );
      })
      .map(convert);

    return { tree, usedDocIds: used };
  }
}
