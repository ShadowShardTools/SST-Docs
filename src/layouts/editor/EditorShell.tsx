import { useMemo, useState, useEffect, useCallback } from "react";
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
import { Eye, FileCode, SquareStack } from "lucide-react";

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

export const EditorShell: React.FC<{ styles: StyleTheme }> = ({ styles }) => {
  const isMobile = useMediaQuery("(max-width: 767px)");
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(true);

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

  const [currentFilePath, setCurrentFilePath] = useState<string | null>(null);
  const [fileContent, setFileContent] = useState("");
  const [fileStatus, setFileStatus] = useState<
    "idle" | "loading" | "saving" | "error"
  >("idle");
  const [fileError, setFileError] = useState<string | null>(null);
  const [dirty, setDirty] = useState(false);
  const [backupOnSave, setBackupOnSave] = useState(false);
  const [panelMode, setPanelMode] = useState<"preview" | "json" | "blocks">(
    "preview",
  );

  const selected = selectedItem ?? selectedCategory;
  const selectedContent = selected?.content ?? [];
  const [draftContent, setDraftContent] = useState(selectedContent);

  const resolvePathForSelection = useCallback(() => {
    if (!currentVersion) return null;
    if (!selected) return null;
    if (isCategory(selected)) {
      return `${currentProduct}/${currentVersion}/categories/${selected.id}.json`;
    }
    return `${currentProduct}/${currentVersion}/items/${selected.id}.json`;
  }, [selected, currentProduct, currentVersion]);

  const defaultFilePath = useMemo(
    () => resolvePathForSelection(),
    [resolvePathForSelection],
  );

  useEffect(() => {
    setCurrentFilePath((prev) =>
      defaultFilePath && prev !== defaultFilePath
        ? defaultFilePath
        : (prev ?? defaultFilePath),
    );
  }, [defaultFilePath]);

  useEffect(() => {
    setDraftContent(selectedContent);
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
    try {
      const res = await createProduct(label, label);
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
    const version = window.prompt("New version id (e.g., v1.2)");
    if (!version) return;
    const label = window.prompt("Version label", version) ?? version;
    try {
      await createVersion(currentProduct, version, label);
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

  const copyDirectory = useCallback(
    async (sourceDir: string, targetDir: string) => {
      const { entries } = await list(sourceDir);
      for (const entry of entries) {
        const srcPath = `${sourceDir}/${entry.name}`;
        const dstPath = `${targetDir}/${entry.name}`;
        if (entry.isDirectory) {
          await copyDirectory(srcPath, dstPath);
        } else {
          const file = await read(srcPath);
          await write(dstPath, file.content, file.encoding);
        }
      }
    },
    [list, read, write],
  );

  const handleDuplicateProduct = async () => {
    if (!currentProduct) return;
    const newId = window.prompt("New product id", `${currentProduct}-copy`);
    if (!newId) return;
    const newLabel = window.prompt("New product label", newId) ?? newId;
    try {
      const res = await createProduct(newId, newLabel);
      const sourceDir = `${currentProduct}`;
      const targetDir = `${res.product}`;
      await copyDirectory(sourceDir, targetDir);
      await reload(res.product, undefined);
      setCurrentProduct(res.product);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      alert(`Failed to duplicate product: ${message}`);
    }
  };

  const handleDuplicateVersion = async () => {
    if (!currentProduct || !currentVersion) return;
    const newVersion =
      window.prompt("New version id", `${currentVersion}-copy`) ?? "";
    if (!newVersion) return;
    const newLabel = window.prompt("New version label", newVersion) ?? newVersion;
    try {
      await createVersion(currentProduct, newVersion, newLabel);
      const sourceDir = `${currentProduct}/${currentVersion}`;
      const targetDir = `${currentProduct}/${newVersion}`;
      await copyDirectory(sourceDir, targetDir);
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

  const renderJsonEditor = () => {
    return (
      <div className="space-y-3">
        {currentFilePath ? (
          fileStatus === "loading" ? (
            <div className="py-6">
              <LoadingSpinner styles={styles} message="Loading file..." />
            </div>
          ) : fileError ? (
            <ErrorMessage
              styles={styles}
              message={fileError}
              onRetry={() => setCurrentFilePath(currentFilePath)}
            />
          ) : (
            <textarea
              className={`${styles.input} w-full min-h-[320px] font-mono text-sm p-3 border rounded`}
              value={fileContent}
              onChange={(e) => {
                setFileContent(e.target.value);
                setDirty(true);
              }}
              spellCheck={false}
            />
          )
        ) : (
          <p className="text-sm text-slate-500">
            Select a file to edit from the dropdown above.
          </p>
        )}
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
        onProductChange={(p) => reload(p, undefined)}
        versions={versions}
        currentVersion={currentVersion}
        onVersionChange={(v) => reload(currentProduct, v)}
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
                  {(["preview", "blocks", "json"] as const).map((mode) => (
                    <button
                      key={mode}
                      className={`px-3 py-1.5 text-sm border rounded ${panelMode === mode
                          ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900"
                          : "bg-white dark:bg-slate-900"
                        }`}
                      onClick={() => setPanelMode(mode)}
                      type="button"
                    >
                      <span className="inline-flex items-center gap-2">
                        {mode === "preview" && <Eye className="w-4 h-4" />}
                        {mode === "blocks" && (
                          <SquareStack className="w-4 h-4" />
                        )}
                        {mode === "json" && <FileCode className="w-4 h-4" />}
                        <span className="capitalize">{mode}</span>
                      </span>
                    </button>
                  ))}
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
                </div>
              </div>

              {panelMode === "preview" && renderPreview()}
              {panelMode === "json" && renderJsonEditor()}
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
