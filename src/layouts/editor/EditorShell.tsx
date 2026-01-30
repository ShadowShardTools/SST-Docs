import { useMemo, useState, useCallback, useEffect } from "react";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { Navigation } from "../navigation/components";
import ContentBlockRenderer from "../render/components/ContentBlockRenderer";
import DocumentHeader from "../render/components/DocumentHeader";
import { ErrorMessage, LoadingSpinner } from "../dialog/components";
import { CategoryNavigatorRenderer } from "../render/components";
import { useMediaQuery } from "../render/hooks";
import isCategory from "../render/utilities/isCategory";
import { useEditorDocNavigation } from "./hooks/useEditorDocNavigation";
import { useEditorEntryActions } from "./hooks/useEditorEntryActions";
import { useEditorFileState } from "./hooks/useEditorFileState";
import { useEditorSelection } from "./hooks/useEditorSelection";
import { useEditorVersionActions } from "./hooks/useEditorVersionActions";
import { useEditorData } from "./state/useEditorData";
import { resolveVersionBasePath } from "./utilities/editorPaths";
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
import EditorToolbar from "./components/EditorToolbar";
import type { Category, StyleTheme } from "@shadow-shard-tools/docs-core";

export const EditorShell: React.FC<{ styles: StyleTheme }> = ({ styles }) => {
  const isMobile = useMediaQuery("(max-width: 767px)");
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const urlProduct = searchParams.get("product") ?? undefined;
  const urlVersion = searchParams.get("version") ?? undefined;
  const initialSelection = useMemo(
    () => ({ product: urlProduct, version: urlVersion }),
    [urlProduct, urlVersion],
  );
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
  } = useEditorData({ initialSelection });

  const navigateWithSearch = useCallback(
    (to: string, options?: { replace?: boolean }) =>
      navigate({ pathname: to, search: location.search }, options),
    [location.search, navigate],
  );

  const { selectedItem, selectedCategory, navigateToEntry } =
    useEditorDocNavigation(items, tree, standaloneDocs);

  const [panelMode, setPanelMode] = useState<"preview" | "blocks">("preview");

  const { selected, selectedContent, defaultFilePath, breadcrumbSegments } =
    useEditorSelection({
      selectedItem,
      selectedCategory,
      items,
      tree,
      standaloneDocs,
      currentProduct,
      currentVersion,
      productVersioning,
      navigateToEntry,
    });

  const {
    currentFilePath,
    setCurrentFilePath,
    fileStatus,
    dirty,
    setDirty,
    backupOnSave,
    setBackupOnSave,
    draftContent,
    setDraftContent,
    handleSave,
    showSavedIndicator,
    savedIndicatorTick,
  } = useEditorFileState({
    defaultFilePath,
    selectedContent,
    productVersioning,
    currentProduct,
    currentVersion,
    read,
    write,
    reload,
  });

  const {
    handleSelectProduct,
    handleSelectVersion,
    handleCreateProduct,
    handleDeleteProduct,
    handleEditProduct,
    handleCreateVersion,
    handleDeleteVersion,
    handleEditVersion,
    handleDuplicateProduct,
    handleDuplicateVersion,
  } = useEditorVersionActions({
    productVersioning,
    currentProduct,
    currentVersion,
    products,
    versions,
    reload,
    setCurrentProduct,
    setCurrentVersion,
    setCurrentFilePath,
    navigate: navigateWithSearch,
    read,
    write,
    remove,
    list,
    createProduct,
    deleteProduct,
    createVersion,
    deleteVersion,
    updateProduct,
    updateVersion,
  });

  const {
    handleDeleteSelected,
    handleEditSelectedMeta,
    handleDuplicateSelected,
  } = useEditorEntryActions({
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
    navigate: navigateWithSearch,
  });

  useEffect(() => {
    if (!currentVersion && !(productVersioning && currentProduct)) return;
    const nextParams = new URLSearchParams(searchParams);
    if (productVersioning) {
      if (currentProduct) {
        nextParams.set("product", currentProduct);
      } else {
        nextParams.delete("product");
      }
    } else {
      nextParams.delete("product");
    }
    if (currentVersion) {
      nextParams.set("version", currentVersion);
    } else {
      nextParams.delete("version");
    }
    if (nextParams.toString() !== searchParams.toString()) {
      setSearchParams(nextParams, { replace: true });
    }
  }, [
    currentProduct,
    currentVersion,
    productVersioning,
    searchParams,
    setSearchParams,
  ]);

  const renderPreview = () => {
    if (status === "loading") {
      return <LoadingSpinner styles={styles} message="Loading content..." />;
    }
    if (status === "error" && error) {
      return (
        <ErrorMessage
          styles={styles}
          message={error}
          onRetry={() =>
            reload(
              productVersioning ? currentProduct : undefined,
              currentVersion,
            )
          }
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
    const versionBasePath = resolveVersionBasePath(
      productVersioning,
      currentProduct,
      currentVersion,
    );
    return (
      <BlockListEditor
        content={draftContent}
        onChange={(updated) => {
          setDraftContent(updated);
          setDirty(true);
        }}
        styles={styles}
        versionBasePath={versionBasePath}
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
            productVersioning={productVersioning}
            onReload={reload}
          />
        )}

        <div
          className={`flex-1 min-w-0 ${styles.sections.contentBackground} transition-colors`}
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
            <section className="space-y-2 pb-24">
              <EditorToolbar
                styles={styles}
                panelMode={panelMode}
                onPanelModeChange={(mode) => setPanelMode(mode)}
                backupOnSave={backupOnSave}
                onToggleBackup={() => setBackupOnSave((prev) => !prev)}
                onSave={handleSave}
                canSave={dirty && !!currentFilePath}
                fileStatus={fileStatus}
                showSavedIndicator={showSavedIndicator}
                savedIndicatorTick={savedIndicatorTick}
                selected={selected}
                onEditSelectedMeta={handleEditSelectedMeta}
                onDuplicateSelected={handleDuplicateSelected}
                onDeleteSelected={handleDeleteSelected}
              />

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
