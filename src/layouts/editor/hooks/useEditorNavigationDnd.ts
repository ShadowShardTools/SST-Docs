import { useCallback, useMemo, useReducer } from "react";
import type { DragEvent } from "react";
import type { Category, DocItem } from "@shadow-shard-tools/docs-core";

export type DragItem =
  | { type: "category"; id: string; parentId: string | null }
  | { type: "doc"; id: string; parentId: string | null };

type DragState = {
  item: DragItem | null;
  overKey: string | null;
};

type DragAction =
  | { type: "start"; item: DragItem }
  | { type: "over"; key: string | null }
  | { type: "end" };

export const dragReducer = (
  state: DragState,
  action: DragAction,
): DragState => {
  switch (action.type) {
    case "start":
      return { item: action.item, overKey: null };
    case "over":
      return state.overKey === action.key
        ? state
        : { ...state, overKey: action.key };
    case "end":
      return { item: null, overKey: null };
    default:
      return state;
  }
};

const buildParentMaps = (tree: Category[], standalone: DocItem[]) => {
  const categoryParent = new Map<string, string | null>();
  const docParent = new Map<string, string | null>();
  const childrenOrder = new Map<string | null, string[]>();

  const walk = (node: Category, parent: string | null) => {
    categoryParent.set(node.id, parent);
    childrenOrder.set(node.id, node.children?.map((c) => c.id) ?? []);
    node.docs?.forEach((doc) => docParent.set(doc.id, node.id));
    node.children?.forEach((child) => walk(child, node.id));
  };

  tree.forEach((node) => walk(node, null));
  childrenOrder.set(
    null,
    tree.map((n) => n.id),
  );
  standalone.forEach((doc) => docParent.set(doc.id, null));
  return { categoryParent, docParent, childrenOrder };
};

interface UseEditorNavigationDndOptions {
  tree: Category[];
  standaloneDocs: DocItem[];
  basePath: string;
  currentProduct: string;
  currentVersion: string;
  productVersioning: boolean;
  onReload: (product?: string, version?: string) => Promise<boolean>;
  readJson: (path: string) => Promise<any>;
  writeJson: (path: string, data: unknown) => Promise<void>;
}

export const useEditorNavigationDnd = ({
  tree,
  standaloneDocs,
  basePath,
  currentProduct,
  currentVersion,
  productVersioning,
  onReload,
  readJson,
  writeJson,
}: UseEditorNavigationDndOptions) => {
  const { categoryParent, docParent, childrenOrder } = useMemo(
    () => buildParentMaps(tree, standaloneDocs),
    [tree, standaloneDocs],
  );
  const [state, dispatch] = useReducer(dragReducer, {
    item: null,
    overKey: null,
  });

  const setDragOverKey = useCallback((key: string | null) => {
    dispatch({ type: "over", key });
  }, []);

  const startDragCategory = useCallback(
    (id: string, parentId: string | null) => {
      dispatch({ type: "start", item: { type: "category", id, parentId } });
    },
    [],
  );

  const startDragDoc = useCallback((id: string, parentId: string | null) => {
    dispatch({ type: "start", item: { type: "doc", id, parentId } });
  }, []);

  const endDrag = useCallback(() => {
    dispatch({ type: "end" });
  }, []);

  const moveCategory = useCallback(
    async (
      categoryId: string,
      targetParent: string | null,
      targetIndex: number,
    ) => {
      if (!basePath) return;
      // prevent moving into its own subtree
      let cursor = targetParent;
      while (cursor) {
        if (cursor === categoryId) return;
        cursor = categoryParent.get(cursor) ?? null;
      }
      const indexPath = `${basePath}/index.json`;
      try {
        const index = await readJson(indexPath);
        const removeFromParent = async (parentId: string | null) => {
          if (parentId) {
            const parentPath = `${basePath}/categories/${parentId}.json`;
            const parent = await readJson(parentPath);
            parent.children = (parent.children ?? []).filter(
              (c: string) => c !== categoryId,
            );
            await writeJson(parentPath, parent);
          }
        };
        const addToParent = async (parentId: string | null) => {
          if (!parentId) {
            const cats = Array.isArray(index.categories)
              ? [...index.categories]
              : [];
            const nextCats = cats.filter((c) => c !== categoryId);
            nextCats.splice(targetIndex, 0, categoryId);
            index.categories = nextCats;
          } else {
            const parentPath = `${basePath}/categories/${parentId}.json`;
            const parent = await readJson(parentPath);
            const children = Array.isArray(parent.children)
              ? [...parent.children]
              : [];
            children.splice(targetIndex, 0, categoryId);
            parent.children = children;
            await writeJson(parentPath, parent);
          }
        };

        await removeFromParent(categoryParent.get(categoryId) ?? null);
        await addToParent(targetParent);
        await writeJson(indexPath, index);
        await onReload(
          productVersioning ? currentProduct : undefined,
          currentVersion,
        );
      } catch (err) {
        alert(
          `Failed to move category: ${err instanceof Error ? err.message : String(err)}`,
        );
      }
    },
    [
      basePath,
      categoryParent,
      currentProduct,
      currentVersion,
      onReload,
      productVersioning,
      readJson,
      writeJson,
    ],
  );

  const moveDoc = useCallback(
    async (
      docId: string,
      sourceCat: string | null,
      targetCat: string | null,
      targetIndex: number,
    ) => {
      if (!basePath) return;
      try {
        const indexPath = `${basePath}/index.json`;
        const index = await readJson(indexPath);

        if (sourceCat) {
          const sourcePath = `${basePath}/categories/${sourceCat}.json`;
          const source = await readJson(sourcePath);
          source.docs = (source.docs ?? []).filter((d: string) => d !== docId);
          await writeJson(sourcePath, source);
        }

        if (targetCat) {
          const targetPath = `${basePath}/categories/${targetCat}.json`;
          const target = await readJson(targetPath);
          const docs = Array.isArray(target.docs) ? [...target.docs] : [];
          docs.splice(targetIndex, 0, docId);
          target.docs = docs;
          await writeJson(targetPath, target);
        } else {
          // reorder standalone docs by updating index.items order
          const items = Array.isArray(index.items) ? [...index.items] : [];
          const filtered = items.filter((d: string) => d !== docId);
          filtered.splice(targetIndex, 0, docId);
          index.items = filtered;
          await writeJson(indexPath, index);
        }

        await onReload(
          productVersioning ? currentProduct : undefined,
          currentVersion,
        );
      } catch (err) {
        alert(
          `Failed to move document: ${err instanceof Error ? err.message : String(err)}`,
        );
      }
    },
    [
      basePath,
      currentProduct,
      currentVersion,
      onReload,
      productVersioning,
      readJson,
      writeJson,
    ],
  );

  const handleRootDrop = useCallback(
    async (event: DragEvent) => {
      event.preventDefault();
      event.stopPropagation();
      if (!state.item) {
        endDrag();
        return;
      }
      if (state.item.type !== "category") {
        endDrag();
        return;
      }
      await moveCategory(state.item.id, null, tree.length);
      endDrag();
    },
    [endDrag, moveCategory, state.item, tree.length],
  );

  const handleCategoryDrop = useCallback(
    (node: Category) => async (event: DragEvent) => {
      event.preventDefault();
      event.stopPropagation();
      if (!state.item) return;
      if (state.item.type === "category") {
        const targetParent = categoryParent.get(node.id) ?? null;
        const siblings = childrenOrder.get(targetParent) ?? [];
        const targetIndex = siblings.indexOf(node.id);
        await moveCategory(state.item.id, targetParent, targetIndex);
      } else if (state.item.type === "doc") {
        const targetIndex = node.docs?.length ?? 0;
        await moveDoc(state.item.id, state.item.parentId, node.id, targetIndex);
      }
      endDrag();
    },
    [categoryParent, childrenOrder, endDrag, moveCategory, moveDoc, state.item],
  );

  const handleDropDoc = useCallback(
    (targetCat: string | null, targetIdx: number) =>
      async (event: DragEvent) => {
        event.preventDefault();
        event.stopPropagation();
        if (!state.item) {
          endDrag();
          return;
        }
        if (state.item.type !== "doc") {
          endDrag();
          return;
        }
        await moveDoc(state.item.id, state.item.parentId, targetCat, targetIdx);
        endDrag();
      },
    [endDrag, moveDoc, state.item],
  );

  const handleDropIntoCategory = useCallback(
    (node: Category) => async (event: DragEvent) => {
      event.preventDefault();
      event.stopPropagation();
      if (!state.item) {
        endDrag();
        return;
      }
      if (state.item.type === "doc") {
        await moveDoc(
          state.item.id,
          state.item.parentId,
          node.id,
          node.docs?.length ?? 0,
        );
      } else {
        await moveCategory(state.item.id, node.id, node.children?.length ?? 0);
      }
      endDrag();
    },
    [endDrag, moveCategory, moveDoc, state.item],
  );

  const handleStandaloneDrop = useCallback(
    (targetIdx: number) => async (event: DragEvent) => {
      event.preventDefault();
      event.stopPropagation();
      if (!state.item) {
        endDrag();
        return;
      }
      if (state.item.type !== "doc") {
        endDrag();
        return;
      }
      await moveDoc(state.item.id, state.item.parentId, null, targetIdx);
      endDrag();
    },
    [endDrag, moveDoc, state.item],
  );

  return {
    dragItem: state.item,
    dragOverKey: state.overKey,
    setDragOverKey,
    startDragCategory,
    startDragDoc,
    handleRootDrop,
    handleCategoryDrop,
    handleDropDoc,
    handleDropIntoCategory,
    handleStandaloneDrop,
    categoryParent,
    docParent,
  };
};
