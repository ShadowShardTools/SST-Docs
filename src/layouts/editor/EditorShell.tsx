import { useMemo, useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import type { BreadcrumbSegment } from "../render/types/BreadcrumbSegment";
import { Navigation } from "../navigation/components";
import ContentBlockRenderer from "../render/components/ContentBlockRenderer";
import DocumentHeader from "../render/components/DocumentHeader";
import { ErrorMessage, LoadingSpinner } from "../dialog/components";
import { CategoryNavigatorRenderer } from "../render/components";
import { useMediaQuery } from "../render/hooks";
import isCategory from "../render/utilities/isCategory";
import { useEditorDocNavigation } from "./hooks/useEditorDocNavigation";
import { useEditorData } from "./state/useEditorData";
import {
  read,
  write,
  remove,
  createProduct,
  deleteProduct,
  createVersion,
  deleteVersion,
  updateProduct,
  updateVersion,
  list,
} from "./api";
import BlockListEditor from "./components/BlockListEditor";
import EditorNavigation from "./components/EditorNavigation";
import EditorHeader from "./components/EditorHeader";
import type {
  Category,
  DocItem,
  StyleTheme,
} from "@shadow-shard-tools/docs-core";
import { Eye, SquareStack, Trash2, Pencil } from "lucide-react";

const findCategoryTrail = (
  nodes: Category[],
  targetId: string,
  trail: Category[] = [],
): Category[] | null => {
  for (const node of nodes) {
    const nextTrail = [...trail, node];
    if (node.id === targetId) return nextTrail;
    if (node.children) {
      const childTrail = findCategoryTrail(node.children, targetId, nextTrail);
      if (childTrail) return childTrail;
    }
  }
  return null;
};

const findCategoryNode = (nodes: Category[], targetId: string) => {
  const trail = findCategoryTrail(nodes, targetId);
  return trail ? trail[trail.length - 1] : null;
};

const findDocTrail = (
  nodes: Category[],
  docId: string,
  trail: Category[] = [],
): { categories: Category[]; doc: DocItem } | null => {
  for (const node of nodes) {
    const nextTrail = [...trail, node];
    const docMatch = node.docs?.find((doc) => doc.id === docId);
    if (docMatch) {
      return { categories: nextTrail, doc: docMatch };
    }
    if (node.children) {
      const childTrail = findDocTrail(node.children, docId, nextTrail);
      if (childTrail) return childTrail;
    }
  }
  return null;
};

const collectCategoryIds = (nodes: Category[], acc = new Set<string>()) => {
  for (const node of nodes) {
    acc.add(node.id);
    if (node.children?.length) {
      collectCategoryIds(node.children, acc);
    }
  }
  return acc;
};

const generateId = (prefix: string) => {
  const base =
    typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID().replace(/-/g, "")
      : Math.random().toString(36).slice(2, 10);
  return `${prefix}${base}`;
};

const wait = (ms: number) =>
  new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });

export const EditorShell: React.FC<{ styles: StyleTheme }> = ({ styles }) => {
  const isMobile = useMediaQuery("(max-width: 767px)");
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(true);
  const navigate = useNavigate();
  const {
    productVersioning,
    products,
    versions,
    currentProduct,
    currentVersion,
    items,
    tree,
    standaloneDocs,
    status,
    error,
    reload,
    lastPing,
    setCurrentProduct,
    setCurrentVersion,
  } = useEditorData();

  const { selectedItem, selectedCategory, navigateToEntry } =
    useEditorDocNavigation(items, tree, standaloneDocs);

  const readJson = useCallback(
    async (path: string) => {
      const res = await read(path);
      if (res.encoding !== "utf8") {
        throw new Error(`Unsupported encoding: ${res.encoding}`);
      }
      return JSON.parse(res.content);
    },
    [read],
  );

  const waitForJson = useCallback(
    async (path: string, attempts = 20, delay = 150) => {
      for (let i = 0; i < attempts; i += 1) {
        try {
          await readJson(path);
          return true;
        } catch {
          await wait(delay);
        }
      }
      return false;
    },
    [readJson],
  );

  const waitForProductReady = useCallback(
    async (productId: string, versionId?: string) => {
      const versionsPath = `${productId}/versions.json`;
      const versionsReady = await waitForJson(versionsPath);
      if (!versionsReady) return false;

      let versionsData: Array<{ version: string }> = [];
      try {
        versionsData = await readJson(versionsPath);
      } catch {
        // ignore
      }
      const targetVersion = versionId ?? versionsData[0]?.version ?? undefined;
      if (!targetVersion) return true;
      return await waitForJson(`${productId}/${targetVersion}/index.json`);
    },
    [readJson, waitForJson],
  );

  const handleSelectProduct = useCallback(
    (product: string) => {
      setCurrentFilePath(null);
      navigate(`/editor`, { replace: true });
      void reload(product, undefined);
    },
    [navigate, reload],
  );

  const handleSelectVersion = useCallback(
    (version: string) => {
      const product = currentProduct;
      if (!product) return;
      setCurrentFilePath(null);
      navigate(`/editor`, { replace: true });
      void reload(product, version);
    },
    [navigate, currentProduct, reload],
  );

  const [currentFilePath, setCurrentFilePath] = useState<string | null>(null);
  const [fileContent, setFileContent] = useState("");
  const [fileStatus, setFileStatus] = useState<
    "idle" | "loading" | "saving" | "error"
  >("idle");
  const [, setFileError] = useState<string | null>(null);
  const [dirty, setDirty] = useState(false);
  const [backupOnSave, setBackupOnSave] = useState(false);
  const [panelMode, setPanelMode] = useState<"preview" | "blocks">("preview");

  const selected = selectedItem ?? selectedCategory;
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
  const [draftContent, setDraftContent] = useState(selectedContent ?? []);

  const resolvePathForSelection = useCallback(() => {
    if (!currentVersion) return null;
    if (!selected) return null;
    if (isCategory(selected)) {
      if (!availableCategoryIds.has(selected.id)) return null;
      return `${currentProduct}/${currentVersion}/categories/${selected.id}.json`;
    }
    if (!availableDocIds.has(selected.id)) return null;
    return `${currentProduct}/${currentVersion}/items/${selected.id}.json`;
  }, [
    selected,
    currentProduct,
    currentVersion,
    availableDocIds,
    availableCategoryIds,
  ]);

  const defaultFilePath = useMemo(
    () => resolvePathForSelection(),
    [resolvePathForSelection],
  );

  useEffect(() => {
    setCurrentFilePath((prev) => {
      if (!defaultFilePath) return null;
      if (prev !== defaultFilePath) return defaultFilePath;
      return prev ?? defaultFilePath;
    });
  }, [defaultFilePath]);

  useEffect(() => {
    if (selectedContent) {
      setDraftContent(selectedContent);
    } else {
      setDraftContent([]);
    }
  }, [selectedContent]);

  useEffect(() => {
    const loadFile = async () => {
      if (!currentFilePath) return;
      setFileStatus("loading");
      setFileError(null);
      setDirty(false);
      try {
        const res = await read(currentFilePath);
        if (res.encoding !== "utf8") {
          throw new Error(`Unsupported encoding: ${res.encoding}`);
        }
        setFileContent(res.content);
        setFileStatus("idle");
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to read file";
        setFileError(message);
        setFileStatus("error");
      }
    };
    void loadFile();
  }, [currentFilePath]);

  const handleSave = async () => {
    if (!currentFilePath) return;
    setFileStatus("saving");
    setFileError(null);
    try {
      const maybeParsed = safeParseJson(fileContent);
      if (!maybeParsed) {
        setFileStatus("error");
        setFileError("Invalid JSON. Fix the JSON before saving.");
        return;
      }
      const merged =
        maybeParsed && Array.isArray(maybeParsed.content)
          ? { ...maybeParsed, content: draftContent ?? maybeParsed.content }
          : maybeParsed;
      const payload =
        merged && Array.isArray(draftContent)
          ? { ...merged, content: draftContent }
          : fileContent;

      if (backupOnSave) {
        await write(`${currentFilePath}.bak`, fileContent, "utf8");
      }

      if (typeof payload === "string") {
        await write(currentFilePath, payload, "utf8");
      } else {
        await write(currentFilePath, JSON.stringify(payload, null, 2), "utf8");
      }
      setDirty(false);
      setFileStatus("idle");
      await reload(currentProduct, currentVersion);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to save file";
      setFileError(message);
      setFileStatus("error");
    }
  };

  const handleCreateProduct = async () => {
    const label = window.prompt("Product label");
    if (!label) return;
    const generateId = () => {
      const existing = new Set(products.map((p) => p.product));
      let candidate = "";
      do {
        const rand =
          typeof crypto !== "undefined" && crypto.randomUUID
            ? crypto.randomUUID()
            : Math.random().toString(36).slice(2, 10);
        candidate = `product-${rand}`;
      } while (existing.has(candidate));
      return candidate;
    };
    try {
      const productId = generateId();
      const res = await createProduct(productId, label);
      await waitForProductReady(res.product);
      await reload(res.product, undefined);
      setCurrentProduct(res.product);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      alert(`Failed to create product: ${message}`);
    }
  };

  const handleDeleteProduct = async () => {
    if (!currentProduct) return;
    const confirmed = window.confirm(
      `Delete product "${currentProduct}" and all its versions?`,
    );
    if (!confirmed) return;
    try {
      await deleteProduct(currentProduct);
      await reload(undefined, undefined);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      alert(`Failed to delete product: ${message}`);
    }
  };

  const handleCreateVersion = async () => {
    if (!currentProduct) {
      alert("Select a product first.");
      return;
    }
    const label =
      window.prompt("Version label", "New Version") ?? "New Version";
    const generateId = () => {
      const existing = new Set(versions.map((v) => v.version));
      let candidate = "";
      do {
        const rand =
          typeof crypto !== "undefined" && crypto.randomUUID
            ? crypto.randomUUID()
            : Math.random().toString(36).slice(2, 8);
        candidate = `v-${rand}`;
      } while (existing.has(candidate));
      return candidate;
    };
    const version = generateId();
    try {
      await createVersion(currentProduct, version, label);
      await waitForProductReady(currentProduct, version);
      await reload(currentProduct, version);
      setCurrentVersion(version);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      alert(`Failed to create version: ${message}`);
    }
  };

  const handleDeleteVersion = async () => {
    if (!currentProduct || !currentVersion) return;
    const confirmed = window.confirm(
      `Delete version "${currentVersion}" from "${currentProduct}"?`,
    );
    if (!confirmed) return;
    try {
      await deleteVersion(currentProduct, currentVersion);
      await reload(currentProduct, undefined);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      alert(`Failed to delete version: ${message}`);
    }
  };

  const handleEditProduct = async () => {
    if (!currentProduct) return;
    const label = window.prompt("New product label");
    if (!label) return;
    try {
      const res = await updateProduct(currentProduct, label);
      await reload(res.product, currentVersion);
      setCurrentProduct(res.product);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      alert(`Failed to update product: ${message}`);
    }
  };

  const handleEditVersion = async () => {
    if (!currentProduct || !currentVersion) return;
    const label = window.prompt("New version label");
    if (!label) return;
    try {
      const res = await updateVersion(currentProduct, currentVersion, label);
      await reload(currentProduct, res.version);
      setCurrentVersion(res.version);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      alert(`Failed to update version: ${message}`);
    }
  };

  const removeDocFromParent = async (
    docId: string,
    parentId: string | null,
  ) => {
    const indexPath = `${currentProduct}/${currentVersion}/index.json`;
    const index = JSON.parse((await read(indexPath)).content);
    index.items = Array.isArray(index.items)
      ? index.items.filter((id: string) => id !== docId)
      : [];
    await write(indexPath, JSON.stringify(index, null, 2), "utf8");

    if (parentId) {
      const catPath = `${currentProduct}/${currentVersion}/categories/${parentId}.json`;
      const cat = JSON.parse((await read(catPath)).content);
      cat.docs = Array.isArray(cat.docs)
        ? cat.docs.filter((id: string) => id !== docId)
        : [];
      await write(catPath, JSON.stringify(cat, null, 2), "utf8");
    }

    await remove(`${currentProduct}/${currentVersion}/items/${docId}.json`).catch(
      () => {},
    );
  };

  const removeCategoryFromParent = async (categoryId: string) => {
    const indexPath = `${currentProduct}/${currentVersion}/index.json`;
    const index = JSON.parse((await read(indexPath)).content);
    const parentTrail = findCategoryTrail(tree, categoryId);
    const parentId =
      parentTrail && parentTrail.length > 1
        ? parentTrail[parentTrail.length - 2].id
        : null;

    const targetNode = findCategoryNode(tree, categoryId);
    const categoryIds = new Set<string>();
    const docIds = new Set<string>();

    const collect = (node: Category) => {
      categoryIds.add(node.id);
      node.docs?.forEach((doc) =>
        docIds.add(typeof doc === "string" ? doc : doc.id),
      );
      node.children?.forEach(collect);
    };

    if (targetNode) {
      collect(targetNode);
    } else {
      categoryIds.add(categoryId);
    }

    index.categories = Array.isArray(index.categories)
      ? index.categories.filter((id: string) => !categoryIds.has(id))
      : [];
    index.items = Array.isArray(index.items)
      ? index.items.filter((id: string) => !docIds.has(id))
      : [];
    await write(indexPath, JSON.stringify(index, null, 2), "utf8");

    if (parentId) {
      const parentPath = `${currentProduct}/${currentVersion}/categories/${parentId}.json`;
      const parent = JSON.parse((await read(parentPath)).content);
      parent.children = Array.isArray(parent.children)
        ? parent.children.filter((id: string) => !categoryIds.has(id))
        : [];
      await write(parentPath, JSON.stringify(parent, null, 2), "utf8");
    }

    await Promise.all(
      [...docIds].map((id) =>
        remove(`${currentProduct}/${currentVersion}/items/${id}.json`).catch(
          () => {},
        ),
      ),
    );
    await Promise.all(
      [...categoryIds].map((id) =>
        remove(`${currentProduct}/${currentVersion}/categories/${id}.json`).catch(
          () => {},
        ),
      ),
    );
  };

  const handleDeleteSelected = async () => {
    if (!selected) return;
    if (!currentProduct || !currentVersion) return;
    const name = selected.title || selected.id;
    const confirmed = window.confirm(`Delete "${name}"?`);
    if (!confirmed) return;
    try {
      if (isCategory(selected)) {
        await removeCategoryFromParent(selected.id);
      } else {
        const trail = findDocTrail(tree, selected.id);
        const parentId =
          trail && trail.categories.length > 0
            ? trail.categories[trail.categories.length - 1].id
            : null;
        await removeDocFromParent(selected.id, parentId);
      }
      await reload(currentProduct, currentVersion);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      alert(`Failed to delete item: ${message}`);
    }
  };

  const handleEditSelectedMeta = async () => {
    if (!selected || !currentProduct || !currentVersion) return;
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
    const path = isCat
      ? `${currentProduct}/${currentVersion}/categories/${selected.id}.json`
      : `${currentProduct}/${currentVersion}/items/${selected.id}.json`;
    try {
      const file = await read(path);
      const json = JSON.parse(file.content);
      json.title = titlePrompt;
      if (descPrompt !== null) {
        json.description = descPrompt;
      }
      await write(path, JSON.stringify(json, null, 2), "utf8");
      await reload(currentProduct, currentVersion);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      alert(`Failed to update info: ${message}`);
    }
  };

  const copyDirectory = useCallback(
    async (sourceDir: string, targetDir: string) => {
      const { entries } = await list(sourceDir);
      for (const entry of entries) {
        const srcPath = `${sourceDir}/${entry.name}`;
        const dstPath = `${targetDir}/${entry.name}`;
        if (entry.isDirectory) {
          // ensure target directory exists by placing a placeholder file
          await write(`${dstPath}/.keep`, "", "utf8").catch(() => {});
          await copyDirectory(srcPath, dstPath);
        } else {
          const file = await read(srcPath);
          await write(dstPath, file.content, file.encoding);
        }
      }
    },
    [list, read, write],
  );

  const remapVersionContent = useCallback(
    async (productId: string, versionId: string) => {
      const base = `${productId}/${versionId}`;
      let indexJson: any = null;
      try {
        const indexFile = await read(`${base}/index.json`);
        indexJson = JSON.parse(indexFile.content);
      } catch {
        return;
      }

      const categoryDir = `${base}/categories`;
      const itemDir = `${base}/items`;
      let categoryFiles: { name: string; data: any }[] = [];
      let itemFiles: { name: string; data: any }[] = [];

      try {
        const { entries } = await list(categoryDir);
        for (const entry of entries.filter((e) => !e.isDirectory)) {
          const file = await read(`${categoryDir}/${entry.name}`);
          const data = JSON.parse(file.content);
          categoryFiles.push({ name: entry.name, data });
        }
      } catch {
        // no categories folder
      }

      try {
        const { entries } = await list(itemDir);
        for (const entry of entries.filter((e) => !e.isDirectory)) {
          const file = await read(`${itemDir}/${entry.name}`);
          const data = JSON.parse(file.content);
          itemFiles.push({ name: entry.name, data });
        }
      } catch {
        // no items folder
      }

      const catIdMap = new Map<string, string>();
      const itemIdMap = new Map<string, string>();

      categoryFiles.forEach(({ data }) => {
        const oldId = data.id ?? "";
        const newId = generateId("cat-");
        catIdMap.set(oldId, newId);
      });

      itemFiles.forEach(({ data }) => {
        const oldId = data.id ?? "";
        const newId = generateId("item-");
        itemIdMap.set(oldId, newId);
      });

      // rewrite index
      if (indexJson) {
        if (Array.isArray(indexJson.categories)) {
          indexJson.categories = indexJson.categories
            .map((id: string) => catIdMap.get(id) ?? id)
            .filter(Boolean);
        }
        if (Array.isArray(indexJson.items)) {
          indexJson.items = indexJson.items
            .map((id: string) => itemIdMap.get(id) ?? id)
            .filter(Boolean);
        }
        await write(
          `${base}/index.json`,
          JSON.stringify(indexJson, null, 2),
          "utf8",
        );
      }

      // rewrite categories
      for (const { data } of categoryFiles) {
        const oldId = data.id ?? "";
        const newId = catIdMap.get(oldId) ?? oldId;
        const rewritten = {
          ...data,
          id: newId,
          docs: Array.isArray(data.docs)
            ? data.docs
                .map((id: string) => itemIdMap.get(id) ?? id)
                .filter(Boolean)
            : data.docs,
          children: Array.isArray(data.children)
            ? data.children
                .map((id: string) => catIdMap.get(id) ?? id)
                .filter(Boolean)
            : data.children,
        };
        await write(
          `${categoryDir}/${newId}.json`,
          JSON.stringify(rewritten, null, 2),
          "utf8",
        );
      }

      // rewrite items
      for (const { data } of itemFiles) {
        const oldId = data.id ?? "";
        const newId = itemIdMap.get(oldId) ?? oldId;
        const rewritten = { ...data, id: newId };
        await write(
          `${itemDir}/${newId}.json`,
          JSON.stringify(rewritten, null, 2),
          "utf8",
        );
      }
    },
    [list, read, write],
  );

  const duplicateProductContent = useCallback(
    async (sourceProduct: string, targetProduct: string) => {
      let versionsData: Array<{ version: string; label?: string }> = [];
      try {
        const versionsFile = await read(`${sourceProduct}/versions.json`);
        versionsData = JSON.parse(versionsFile.content);
      } catch {
        return;
      }

      const rewrittenVersions: Array<{ version: string; label?: string }> = [];

      for (const v of versionsData) {
        const newVersion = generateId("v-");
        rewrittenVersions.push({ ...v, version: newVersion });
        await copyDirectory(
          `${sourceProduct}/${v.version}`,
          `${targetProduct}/${newVersion}`,
        );
        await remapVersionContent(targetProduct, newVersion);
      }

      await write(
        `${targetProduct}/versions.json`,
        JSON.stringify(rewrittenVersions, null, 2),
        "utf8",
      );
    },
    [copyDirectory, remapVersionContent, read, write],
  );

  const handleDuplicateProduct = async () => {
    if (!currentProduct) return;
    const existingIds = new Set(products.map((p) => p.product));
    const existingLabels = new Set(products.map((p) => p.label ?? p.product));
    const baseLabel =
      products.find((p) => p.product === currentProduct)?.label ??
      currentProduct;

    const generateRandomProductId = () => {
      let candidate = "";
      do {
        const rand =
          typeof crypto !== "undefined" && crypto.randomUUID
            ? crypto.randomUUID()
            : Math.random().toString(36).slice(2, 10);
        candidate = `product-${rand}`;
      } while (existingIds.has(candidate));
      return candidate;
    };

    const nextIncrement = (base: string, set: Set<string>) => {
      let i = 1;
      let candidate = `${base} (${i})`;
      while (set.has(candidate)) {
        i += 1;
        candidate = `${base} (${i})`;
      }
      return candidate;
    };
    const newId = generateRandomProductId();
    const newLabel = nextIncrement(baseLabel, existingLabels);
    try {
      const res = await createProduct(newId, newLabel);
      // Clear any default versions created with the new product before copying content over.
      try {
        const versionsFile = await read(`${res.product}/versions.json`);
        const existing = JSON.parse(versionsFile.content);
        if (Array.isArray(existing)) {
          for (const v of existing) {
            if (v?.version) {
              await deleteVersion(res.product, v.version).catch(() => {});
            }
          }
        }
        await write(`${res.product}/versions.json`, "[]", "utf8").catch(
          () => {},
        );
      } catch {
        // ignore cleanup errors
      }

      const sourceDir = `${currentProduct}`;
      const targetDir = `${res.product}`;
      await duplicateProductContent(sourceDir, targetDir);
      await waitForProductReady(res.product);
      await reload(res.product, undefined);
      setCurrentProduct(res.product);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      alert(`Failed to duplicate product: ${message}`);
    }
  };

  const handleDuplicateVersion = async () => {
    if (!currentProduct || !currentVersion) return;
    const existingIds = new Set(versions.map((v) => v.version));
    const existingLabels = new Set(versions.map((v) => v.label ?? v.version));
    const currentLabel =
      versions.find((v) => v.version === currentVersion)?.label ??
      currentVersion;
    const nextIncrement = (base: string, set: Set<string>) => {
      let i = 1;
      let candidate = `${base} (${i})`;
      while (set.has(candidate)) {
        i += 1;
        candidate = `${base} (${i})`;
      }
      return candidate;
    };
    const newLabel = nextIncrement(currentLabel, existingLabels);
    const generateUniqueVersionId = () => {
      let candidate = "";
      do {
        candidate = generateId("v-");
      } while (existingIds.has(candidate));
      return candidate;
    };
    const newVersion = generateUniqueVersionId();
    try {
      await createVersion(currentProduct, newVersion, newLabel);
      const sourceDir = `${currentProduct}/${currentVersion}`;
      const targetDir = `${currentProduct}/${newVersion}`;
      await copyDirectory(sourceDir, targetDir);
      await waitForProductReady(currentProduct, newVersion);
      await reload(currentProduct, newVersion);
      setCurrentVersion(newVersion);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      alert(`Failed to duplicate version: ${message}`);
    }
  };

  const safeParseJson = (raw: string) => {
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  };

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
  }, [selected, tree, navigateToEntry, standaloneDocs]);

  const renderPreview = () => {
    if (status === "loading") {
      return <LoadingSpinner styles={styles} message="Loading content..." />;
    }
    if (status === "error" && error) {
      return (
        <ErrorMessage
          styles={styles}
          message={error}
          onRetry={() => reload(currentProduct, currentVersion)}
        />
      );
    }
    if (!selected) {
      return (
        <div className="text-center py-12">
          <p className={styles.text.general}>
            Select a document or category from the left to preview it.
          </p>
        </div>
      );
    }

    const isSelectedCategory = isCategory(selected);

    return (
      <div className="space-y-4">
        <DocumentHeader
          styles={styles}
          title={selected.title}
          breadcrumbSegments={breadcrumbSegments}
          isSelectedCategory={isSelectedCategory}
        />
        <div className="px-2 md:px-4">
          <ContentBlockRenderer
            styles={styles}
            content={draftContent}
            currentPath="editor"
          />
          {isSelectedCategory && (
            <div className="mt-6">
              <CategoryNavigatorRenderer
                category={selected as Category}
                styles={styles}
                onSelect={navigateToEntry}
              />
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderBlockEditor = () => {
    if (!selected || !draftContent) {
      return (
        <p className="text-sm text-slate-500">
          Select a document or category to edit its blocks.
        </p>
      );
    }
    return (
      <BlockListEditor
        content={draftContent}
        onChange={(updated) => {
          setDraftContent(updated);
          setDirty(true);
        }}
        styles={styles}
      />
    );
  };

  return (
    <div className="flex flex-col min-h-screen">
      <EditorHeader
        styles={styles}
        productVersioning={productVersioning}
        products={products}
        currentProduct={currentProduct}
        onProductChange={handleSelectProduct}
        versions={versions}
        currentVersion={currentVersion}
        onVersionChange={handleSelectVersion}
        loading={status === "loading"}
        isMobileNavOpen={isMobileNavOpen}
        onMobileNavToggle={() => setIsMobileNavOpen((prev) => !prev)}
        onCreateProduct={handleCreateProduct}
        onDeleteProduct={handleDeleteProduct}
        onDuplicateProduct={handleDuplicateProduct}
        onCreateVersion={handleCreateVersion}
        onDeleteVersion={handleDeleteVersion}
        onEditProduct={handleEditProduct}
        onEditVersion={handleEditVersion}
        onDuplicateVersion={handleDuplicateVersion}
      />

      <div className="bg-amber-50 text-amber-800 border-b border-amber-200 px-4 py-2 text-xs">
        Dev-only editor • Data root: {lastPing?.dataRoot ?? "unknown"}
      </div>

      <main className="flex flex-1">
        {!isMobile && (
          <EditorNavigation
            styles={styles}
            tree={tree}
            standaloneDocs={standaloneDocs}
            onSelect={navigateToEntry}
            selectedItem={selectedItem ?? selectedCategory}
            currentProduct={currentProduct}
            currentVersion={currentVersion}
            onReload={reload}
          />
        )}

        <div
          className={`flex-1 ${styles.sections.contentBackground} transition-colors`}
        >
          {isMobile && isMobileNavOpen ? (
            <Navigation
              styles={styles}
              tree={tree}
              standaloneDocs={standaloneDocs}
              onSelect={navigateToEntry}
              selectedItem={selectedItem ?? selectedCategory}
              isSearchOpen={false}
            />
          ) : (
            <section className="space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs uppercase tracking-wide text-slate-500">
                    Mode
                  </span>
                  <button
                    className={`px-3 py-1.5 text-sm border rounded ${
                      panelMode === "preview"
                        ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900"
                        : "bg-white dark:bg-slate-900"
                    }`}
                    onClick={() => setPanelMode("preview")}
                    type="button"
                  >
                    <span className="inline-flex items-center gap-2">
                      <Eye className="w-4 h-4" />
                      <span className="capitalize">Preview</span>
                    </span>
                  </button>
                  <button
                    className={`px-3 py-1.5 text-sm border rounded ${
                      panelMode === "blocks"
                        ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900"
                        : "bg-white dark:bg-slate-900"
                    }`}
                    onClick={() => setPanelMode("blocks")}
                    type="button"
                  >
                    <span className="inline-flex items-center gap-2">
                      <SquareStack className="w-4 h-4" />
                      <span className="capitalize">Blocks</span>
                    </span>
                  </button>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <label className="inline-flex items-center gap-2 text-xs">
                    <input
                      type="checkbox"
                      checked={backupOnSave}
                      onChange={(e) => setBackupOnSave(e.target.checked)}
                    />
                    <span>Backup on save</span>
                  </label>
                  <button
                    className={`${styles.buttons.common} px-3 py-2 text-sm`}
                    onClick={handleSave}
                    disabled={
                      !dirty || !currentFilePath || fileStatus === "saving"
                    }
                  >
                    {fileStatus === "saving" ? "Saving..." : "Save"}
                  </button>
                  {selected && (
                    <button
                      className={`${styles.buttons.small}`}
                      onClick={handleEditSelectedMeta}
                      type="button"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                  )}
                  {selected && (
                    <button
                      className={`${styles.buttons.small} text-red-600`}
                      onClick={handleDeleteSelected}
                      type="button"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {panelMode === "preview" && renderPreview()}
              {panelMode === "blocks" && renderBlockEditor()}

              {dirty && currentFilePath && (
                <p className="text-xs text-amber-600 mt-2">
                  Unsaved changes in {currentFilePath}
                </p>
              )}
            </section>
          )}
        </div>
      </main>
    </div>
  );
};
