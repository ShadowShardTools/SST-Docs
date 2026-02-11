import { useCallback, useMemo, useState, Suspense, useEffect } from "react";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { useDocumentationData } from "../../../services";
import {
  useDocNavigation,
  useMediaQuery,
  useSearchLogic,
  useSearchOpener,
  useHashScroll,
} from "../hooks";
import { ErrorMessage, LoadingSpinner } from "../../dialog/components";
import { Navigation, Sidebar } from "../../navigation/components";
import { isCategory } from "../utilities";
import { CategoryNavigatorRenderer } from ".";
import { Header } from "../../header/components";
import ContentBlockRenderer from "./ContentBlockRenderer";
import type { BreadcrumbSegment } from "../types/BreadcrumbSegment";
import DocumentHeader from "./DocumentHeader";
import type {
  Category,
  DocItem,
  StyleTheme,
} from "@shadow-shard-tools/docs-core";
import { SearchModal } from "../../searchModal/components";

type DocBreadcrumbTrail = {
  categories: Category[];
  doc: DocItem;
} | null;

const findCategoryTrail = (
  nodes: Category[],
  targetId: string,
  trail: Category[] = [],
): Category[] | null => {
  for (const node of nodes) {
    const nextTrail = [...trail, node];
    if (node.id === targetId) {
      return nextTrail;
    }
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
): DocBreadcrumbTrail => {
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

export const MainRenderer: React.FC<{ styles: StyleTheme }> = ({ styles }) => {
  const isMobile = useMediaQuery("(max-width: 767px)");
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(true);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
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
    currentProduct,
    setCurrentProduct,
    versions,
    currentVersion,
    setCurrentVersion,
    items,
    tree,
    standaloneDocs,
    loading,
    error,
  } = useDocumentationData({ initialSelection });

  const { selectedItem, selectedCategory, navigateToEntry } = useDocNavigation(
    items,
    tree,
    standaloneDocs,
  );
  const handleSelectProduct = useCallback(
    (product: string) => {
      if (!productVersioning) return;
      if (product === currentProduct) return;
      setCurrentProduct(product);
      setCurrentVersion("");
      navigate({ pathname: "/", search: location.search }, { replace: true });
    },
    [
      navigate,
      setCurrentProduct,
      setCurrentVersion,
      productVersioning,
      currentProduct,
      location.search,
    ],
  );

  const handleSelectVersion = useCallback(
    (version: string) => {
      if (!currentProduct) return;
      if (version === currentVersion) return;
      setCurrentVersion(version);
      navigate({ pathname: "/", search: location.search }, { replace: true });
    },
    [
      setCurrentVersion,
      currentProduct,
      currentVersion,
      navigate,
      location.search,
    ],
  );

  const {
    searchTerm,
    searchResults,
    resetSearch,
    setSearchTerm,
    debouncedSearchTerm,
  } = useSearchLogic(items, standaloneDocs, tree);

  const handleSearchOpen = useCallback(() => setIsSearchOpen(true), []);
  const handleSearchClose = useCallback(() => {
    setIsSearchOpen(false);
    resetSearch();
  }, [resetSearch]);

  useSearchOpener(handleSearchOpen);

  const handleSearchSelect = useCallback(
    (item: DocItem | Category) => {
      navigateToEntry(item);
      handleSearchClose();
    },
    [navigateToEntry, handleSearchClose],
  );

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

  if (error.versions) {
    return (
      <ErrorMessage
        styles={styles}
        message={error.versions}
        onRetry={() => window.location.reload()}
      />
    );
  }

  // === Inlined ContentRendererBase logic ===
  const selected = selectedItem ?? selectedCategory;
  const selectedContent = selected?.content ?? [];

  // keep hook call order stable; pass current content (empty array if none)
  useHashScroll(selectedContent);

  const currentPath = `${location.pathname}${location.search}`;

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

  const renderContent = () => {
    if (isMobile && isMobileNavOpen) {
      return (
        <Navigation
          styles={styles}
          tree={tree}
          standaloneDocs={standaloneDocs}
          onSelect={navigateToEntry}
          selectedItem={selectedItem ?? selectedCategory}
          isSearchOpen={isSearchOpen}
        />
      );
    }

    if (loading.content) return <LoadingSpinner styles={styles} />;
    if (error.content)
      return <ErrorMessage styles={styles} message={error.content} />;

    if (!selected) {
      return (
        <div className={`text-center mt-16 ${styles.category.empty}`}>
          Select a document or category from the sidebar
        </div>
      );
    }

    const isSelectedCategory = isCategory(selected);

    return (
      <>
        <DocumentHeader
          styles={styles}
          title={selected.title}
          breadcrumbSegments={breadcrumbSegments}
          isSelectedCategory={isSelectedCategory}
        />
        <div className="px-2 md:px-6">
          <ContentBlockRenderer
            styles={styles}
            content={selectedContent}
            currentPath={currentPath}
          />
          {isSelectedCategory && (
            <CategoryNavigatorRenderer
              category={selected as Category}
              styles={styles}
              onSelect={navigateToEntry}
            />
          )}
        </div>
      </>
    );
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Suspense fallback={<LoadingSpinner styles={styles} />}>
        <Header
          styles={styles}
          productVersioning={productVersioning}
          products={products}
          currentProduct={currentProduct}
          onProductChange={handleSelectProduct}
          versions={versions}
          currentVersion={currentVersion}
          onVersionChange={handleSelectVersion}
          loading={loading.versions}
          onSearchOpen={handleSearchOpen}
          isMobileNavOpen={isMobileNavOpen}
          onMobileNavToggle={() => setIsMobileNavOpen((prev) => !prev)}
        />
      </Suspense>

      <main className="flex flex-1">
        {!isMobile && (
          <Suspense fallback={<LoadingSpinner styles={styles} />}>
            <Sidebar
              styles={styles}
              tree={tree}
              standaloneDocs={standaloneDocs}
              onSelect={navigateToEntry}
              selectedItem={selectedItem ?? selectedCategory}
              isSearchOpen={isSearchOpen}
            />
          </Suspense>
        )}
        <div
          className={`flex-1 min-w-0 overflow-x-auto ${styles.sections.contentBackground} transition-colors`}
        >
          {renderContent()}
        </div>
      </main>

      <SearchModal
        styles={styles}
        isOpen={isSearchOpen}
        onClose={handleSearchClose}
        searchTerm={searchTerm}
        appliedSearchTerm={debouncedSearchTerm}
        onSearchChange={setSearchTerm}
        results={searchResults}
        onSelect={handleSearchSelect}
      />
    </div>
  );
};

export default MainRenderer;
