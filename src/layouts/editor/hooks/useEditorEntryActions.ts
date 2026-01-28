import { useCallback } from "react";
import type { Category, DocItem } from "@shadow-shard-tools/docs-core";
import isCategory from "../../render/utilities/isCategory";
import { findDocTrail } from "../utilities/editorTree";
import { resolveVersionBasePath } from "../utilities/editorPaths";
import { readJson, writeJson } from "./entryActions/io";
import {
  duplicateCategoryEntry,
  duplicateDocEntry,
} from "./entryActions/duplication";
import {
  removeCategoryFromParent,
  removeDocFromParent,
} from "./entryActions/removal";
import type {
  NavigateFn,
  ReadFn,
  ReloadFn,
  RemoveFn,
  WriteFn,
} from "./entryActions/types";

const parseTagsInput = (input: string) =>
  input
    .split(/[,\n;]/g)
    .map((tag) => tag.trim())
    .filter(Boolean);

interface UseEditorEntryActionsOptions {
  selected: DocItem | Category | null;
  tree: Category[];
  items: DocItem[];
  standaloneDocs: DocItem[];
  productVersioning: boolean;
  currentProduct: string;
  currentVersion: string;
  read: ReadFn;
  write: WriteFn;
  remove: RemoveFn;
  reload: ReloadFn;
  navigate: NavigateFn;
}

export const useEditorEntryActions = ({
  selected,
  tree,
  items,
  standaloneDocs,
  productVersioning,
  currentProduct,
  currentVersion,
  read,
  write,
  remove,
  reload,
  navigate,
}: UseEditorEntryActionsOptions) => {
  const readJsonData = useCallback(
    async (path: string) => readJson(read, path),
    [read],
  );
  const writeJsonData = useCallback(
    async (path: string, data: unknown) => writeJson(write, path, data),
    [write],
  );

  const resolveBasePath = useCallback(() => {
    return resolveVersionBasePath(
      productVersioning,
      currentProduct,
      currentVersion,
    );
  }, [currentProduct, currentVersion, productVersioning]);

  const removeDoc = useCallback(
    async (docId: string, parentId: string | null) => {
      const basePath = resolveBasePath();
      if (!basePath) return;
      await removeDocFromParent({
        docId,
        parentId,
        basePath,
        readJson: readJsonData,
        writeJson: writeJsonData,
        remove,
      });
    },
    [readJsonData, remove, resolveBasePath, writeJsonData],
  );

  const removeCategory = useCallback(
    async (categoryId: string) => {
      const basePath = resolveBasePath();
      if (!basePath) return;
      await removeCategoryFromParent({
        categoryId,
        basePath,
        tree,
        readJson: readJsonData,
        writeJson: writeJsonData,
        remove,
      });
    },
    [readJsonData, remove, resolveBasePath, tree, writeJsonData],
  );

  const handleDeleteSelected = useCallback(async () => {
    if (!selected) return;
    if (!resolveBasePath()) return;
    const name = selected.title || selected.id;
    const confirmed = window.confirm(`Delete "${name}"?`);
    if (!confirmed) return;
    try {
      if (isCategory(selected)) {
        await removeCategory(selected.id);
      } else {
        const trail = findDocTrail(tree, selected.id);
        const parentId =
          trail && trail.categories.length > 0
            ? trail.categories[trail.categories.length - 1].id
            : null;
        await removeDoc(selected.id, parentId);
      }
      await reload(
        productVersioning ? currentProduct : undefined,
        currentVersion,
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      alert(`Failed to delete item: ${message}`);
    }
  }, [
    currentProduct,
    currentVersion,
    productVersioning,
    reload,
    removeCategory,
    removeDoc,
    resolveBasePath,
    selected,
    tree,
  ]);

  const handleEditSelectedMeta = useCallback(async () => {
    if (!selected) return;
    const basePath = resolveBasePath();
    if (!basePath) return;
    const isCat = isCategory(selected);
    const titlePrompt = window.prompt(
      `New ${isCat ? "category" : "document"} title`,
      selected.title ?? "",
    );
    if (titlePrompt === null) return;
    const descPrompt = window.prompt(
      "New description (optional)",
      (selected as any).description ?? "",
    );
    const tagsPrompt = window.prompt(
      "Tags (comma, semicolon, or newline separated)",
      Array.isArray((selected as any).tags)
        ? (selected as any).tags.join(", ")
        : "",
    );
    const path = isCat
      ? `${basePath}/categories/${selected.id}.json`
      : `${basePath}/items/${selected.id}.json`;
    try {
      const json = await readJsonData(path);
      json.title = titlePrompt;
      if (descPrompt !== null) {
        json.description = descPrompt;
      }
      if (tagsPrompt !== null) {
        const tags = parseTagsInput(tagsPrompt);
        if (tags.length) {
          json.tags = tags;
        } else if ("tags" in json) {
          delete json.tags;
        }
      }
      await writeJsonData(path, json);
      await reload(
        productVersioning ? currentProduct : undefined,
        currentVersion,
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      alert(`Failed to update info: ${message}`);
    }
  }, [
    currentProduct,
    currentVersion,
    productVersioning,
    readJsonData,
    reload,
    resolveBasePath,
    selected,
    writeJsonData,
  ]);

  const handleDuplicateSelected = useCallback(async () => {
    if (!selected) return;
    const basePath = resolveBasePath();
    if (!basePath) return;
    let nextSelectionId: string | null = null;

    try {
      if (isCategory(selected)) {
        nextSelectionId = await duplicateCategoryEntry({
          selected,
          tree,
          basePath,
          readJson: readJsonData,
          writeJson: writeJsonData,
        });
      } else {
        nextSelectionId = await duplicateDocEntry({
          selected,
          tree,
          items,
          standaloneDocs,
          basePath,
          readJson: readJsonData,
          writeJson: writeJsonData,
        });
      }

      await reload(
        productVersioning ? currentProduct : undefined,
        currentVersion,
      );
      if (nextSelectionId) {
        navigate(`/editor/${nextSelectionId}`, { replace: true });
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      alert(`Failed to duplicate item: ${message}`);
    }
  }, [
    currentProduct,
    currentVersion,
    items,
    navigate,
    productVersioning,
    readJsonData,
    reload,
    resolveBasePath,
    selected,
    standaloneDocs,
    tree,
    writeJsonData,
  ]);

  return {
    handleDeleteSelected,
    handleEditSelectedMeta,
    handleDuplicateSelected,
  } as const;
};
