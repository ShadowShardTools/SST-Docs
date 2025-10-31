import { useCallback, useMemo, useState, Suspense } from "react";
import type { StyleTheme } from "../../../application/types/StyleTheme";
import type { DocItem, Category } from "../types";
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
import { SearchModal } from "../../searchModal/components";
import ContentBlockRenderer from "./ContentBlockRenderer";
import type { BreadcrumbSegment } from "../types/BreadcrumbSegment";
import DocumentHeader from "./DocumentHeader";

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

  const {
    versions,
    currentVersion,
    setCurrentVersion,
    items,
    tree,
    standaloneDocs,
    loading,
    error,
  } = useDocumentationData();

  const { selectedItem, selectedCategory, navigateToEntry } = useDocNavigation(
    items,
    tree,
    standaloneDocs,
  );

  const { searchTerm, setSearchTerm, searchResults, resetSearch } =
    useSearchLogic(items, standaloneDocs);

  const handleSearchOpen = useCallback(() => setIsSearchOpen(true), []);
  const handleSearchClose = useCallback(() => {
    setIsSearchOpen(false);
    resetSearch();
  }, [resetSearch]);

  useSearchOpener(handleSearchOpen);

  const handleSearchSelect = useCallback(
    (item: DocItem) => {
      navigateToEntry(item);
      handleSearchClose();
    },
    [navigateToEntry, handleSearchClose],
  );

  if (error.versions) {
    return (
      <ErrorMessage
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

  const currentPath =
    (typeof location !== "undefined" &&
      (location.hash.split("#")[1] || location.pathname.slice(1))) ||
    "";

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

    if (loading.content) return <LoadingSpinner />;
    if (error.content) return <ErrorMessage message={error.content} />;

    if (!selected) {
      return (
        <div className="text-gray-500 text-center mt-16">
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
      <Suspense fallback={<LoadingSpinner />}>
        <Header
          styles={styles}
          versions={versions}
          currentVersion={currentVersion}
          onVersionChange={setCurrentVersion}
          loading={loading.versions}
          onSearchOpen={handleSearchOpen}
          isMobileNavOpen={isMobileNavOpen}
          onMobileNavToggle={() => setIsMobileNavOpen((prev) => !prev)}
        />
      </Suspense>

      <main className="flex flex-1">
        {!isMobile && (
          <Suspense fallback={<LoadingSpinner />}>
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
          className={`flex-1 overflow-x-auto ${styles.sections.contentBackground} transition-colors`}
        >
          {renderContent()}
        </div>
      </main>

      <SearchModal
        styles={styles}
        isOpen={isSearchOpen}
        onClose={handleSearchClose}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        results={searchResults}
        onSelect={handleSearchSelect}
      />
    </div>
  );
};

export default MainRenderer;
