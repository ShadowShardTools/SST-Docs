import { useCallback } from "react";
import { resolveVersionBasePath } from "../utilities/editorPaths";

interface UseEditorNavigationActionsOptions {
  productVersioning: boolean;
  currentProduct: string;
  currentVersion: string;
  existingIds: Set<string>;
  readJson: (path: string) => Promise<any>;
  writeJson: (path: string, data: unknown) => Promise<void>;
  onReload: (product?: string, version?: string) => Promise<boolean>;
}

export const useEditorNavigationActions = ({
  productVersioning,
  currentProduct,
  currentVersion,
  existingIds,
  readJson,
  writeJson,
  onReload,
}: UseEditorNavigationActionsOptions) => {
  const basePath = resolveVersionBasePath(
    productVersioning,
    currentProduct,
    currentVersion,
  );

  const reloadCurrent = useCallback(
    async () =>
      onReload(productVersioning ? currentProduct : undefined, currentVersion),
    [currentProduct, currentVersion, onReload, productVersioning],
  );

  const generateUniqueId = useCallback(
    (prefix: string) => {
      let candidate = "";
      do {
        const rand =
          typeof crypto !== "undefined" && crypto.randomUUID
            ? crypto.randomUUID()
            : Math.random().toString(36).slice(2, 10);
        candidate = `${prefix}-${rand}`;
      } while (existingIds.has(candidate));
      return candidate;
    },
    [existingIds],
  );

  const createCategory = useCallback(
    async (parentId: string | null = null) => {
      const title = window.prompt("Category title");
      if (!title) return;
      if (!basePath) return;
      const id = generateUniqueId("cat");

      const indexPath = `${basePath}/index.json`;
      const catPath = `${basePath}/categories/${id}.json`;
      try {
        const index = await readJson(indexPath);
        const newCategory = {
          id,
          title,
          description: "",
          docs: [],
          children: [],
        };
        await writeJson(catPath, newCategory);

        const categories = Array.isArray(index.categories)
          ? [...index.categories]
          : [];
        if (!categories.includes(id)) categories.push(id);
        index.categories = categories;

        if (parentId) {
          const parentPath = `${basePath}/categories/${parentId}.json`;
          const parent = await readJson(parentPath);
          const children = Array.isArray(parent.children)
            ? parent.children
            : [];
          if (!children.includes(id)) children.push(id);
          parent.children = children;
          await writeJson(parentPath, parent);
        }

        await writeJson(indexPath, index);
        await reloadCurrent();
      } catch (err) {
        alert(
          `Failed to create category: ${
            err instanceof Error ? err.message : String(err)
          }`,
        );
      }
    },
    [basePath, generateUniqueId, readJson, reloadCurrent, writeJson],
  );

  const createDoc = useCallback(
    async (parentId: string | null) => {
      const title = window.prompt("Document title");
      if (!title) return;
      if (!basePath) return;
      const id = generateUniqueId("doc");

      const indexPath = `${basePath}/index.json`;
      const docPath = `${basePath}/items/${id}.json`;
      try {
        const index = await readJson(indexPath);
        const newDoc = {
          id,
          title,
          content: [],
        };
        await writeJson(docPath, newDoc);
        const items = Array.isArray(index.items) ? index.items : [];
        if (!items.includes(id)) items.push(id);
        index.items = items;
        if (parentId) {
          const catPath = `${basePath}/categories/${parentId}.json`;
          const category = await readJson(catPath);
          const docs = Array.isArray(category.docs) ? category.docs : [];
          if (!docs.includes(id)) docs.push(id);
          category.docs = docs;
          await writeJson(catPath, category);
        }
        await writeJson(indexPath, index);
        await reloadCurrent();
      } catch (err) {
        alert(
          `Failed to create document: ${
            err instanceof Error ? err.message : String(err)
          }`,
        );
      }
    },
    [basePath, generateUniqueId, readJson, reloadCurrent, writeJson],
  );

  return {
    createCategory,
    createDoc,
  } as const;
};
