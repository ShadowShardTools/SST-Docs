import { useCallback, useMemo } from "react";
import type { Category, DocItem } from "@shadow-shard-tools/docs-core";
import type { BreadcrumbSegment } from "../../render/types/BreadcrumbSegment";
import isCategory from "../../render/utilities/isCategory";
import {
  collectCategoryIds,
  findCategoryTrail,
  findDocTrail,
} from "../utilities/editorTree";
import { resolveVersionBasePath } from "../utilities/editorPaths";

interface UseEditorSelectionOptions {
  selectedItem?: DocItem | Category | null;
  selectedCategory?: Category | null;
  items: DocItem[];
  tree: Category[];
  standaloneDocs: DocItem[];
  currentProduct: string;
  currentVersion: string;
  productVersioning: boolean;
  navigateToEntry: (entry: DocItem | Category) => void;
}

export const useEditorSelection = ({
  selectedItem,
  selectedCategory,
  items,
  tree,
  standaloneDocs,
  currentProduct,
  currentVersion,
  productVersioning,
  navigateToEntry,
}: UseEditorSelectionOptions) => {
  const selected = useMemo(
    () => selectedItem ?? selectedCategory ?? null,
    [selectedCategory, selectedItem],
  );

  const availableDocIds = useMemo(() => {
    const ids = new Set<string>();
    items.forEach((doc) => ids.add(doc.id));
    standaloneDocs.forEach((doc) => ids.add(doc.id));
    return ids;
  }, [items, standaloneDocs]);

  const availableCategoryIds = useMemo(() => collectCategoryIds(tree), [tree]);

  const selectedContent = useMemo(
    () => (selected ? (selected.content ?? null) : null),
    [selected],
  );

  const resolvePathForSelection = useCallback(() => {
    const basePath = resolveVersionBasePath(
      productVersioning,
      currentProduct,
      currentVersion,
    );
    if (!basePath) return null;
    if (!selected) return null;
    if (isCategory(selected)) {
      if (!availableCategoryIds.has(selected.id)) return null;
      return `${basePath}/categories/${selected.id}.json`;
    }
    if (!availableDocIds.has(selected.id)) return null;
    return `${basePath}/items/${selected.id}.json`;
  }, [
    availableCategoryIds,
    availableDocIds,
    currentProduct,
    currentVersion,
    productVersioning,
    selected,
  ]);

  const defaultFilePath = useMemo(
    () => resolvePathForSelection(),
    [resolvePathForSelection],
  );

  const breadcrumbSegments = useMemo<BreadcrumbSegment[]>(() => {
    if (!selected) return [];

    if (isCategory(selected)) {
      const trail = findCategoryTrail(tree, selected.id) ?? [selected];
      return trail.map((category, index) => ({
        label: category.title,
        onSelect:
          index === trail.length - 1
            ? undefined
            : () => navigateToEntry(category),
      }));
    }

    const docTrail = findDocTrail(tree, selected.id);
    if (docTrail) {
      const categorySegments = docTrail.categories.map((category) => ({
        label: category.title,
        onSelect: () => navigateToEntry(category),
      }));
      return [...categorySegments, { label: docTrail.doc.title }];
    }

    const standalone = standaloneDocs.find((doc) => doc.id === selected.id);
    if (standalone) {
      return [{ label: standalone.title }];
    }

    return [{ label: selected.title }];
  }, [navigateToEntry, selected, standaloneDocs, tree]);

  return {
    selected,
    selectedContent,
    availableDocIds,
    availableCategoryIds,
    defaultFilePath,
    breadcrumbSegments,
  } as const;
};
