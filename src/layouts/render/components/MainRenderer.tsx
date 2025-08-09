import { useCallback, useState, lazy, Suspense } from "react";
import Header from "../../header/components/Header";
import Sidebar from "../../navigation/components/Sidebar";
import Navigation from "../../navigation/components/Navigation";
import CategoryNavigatorRenderer from "./CategoryNavigatorRenderer";
import SearchModal from "../../searchModal/components/SearchModal";
import useMediaQuery from "../hooks/useMediaQuery";
import { UseDocumentationData } from "../services/useDocumentationData";
import type { StyleTheme } from "../../../application/types/StyleTheme";
import useDocNavigation from "../hooks/useDocNavigation";
import useSearchLogic from "../hooks/useSearchLogic";
import type { DocItem, Category } from "../types";
import isCategory from "../utilities/isCategory";
import useSearchOpener from "../hooks/useSearchOpener";
import ErrorMessage from "../../dialog/components/ErrorMessage";
import LoadingSpinner from "../../dialog/components/LoadingSpinner";

const ContentRenderer = lazy(() => import("./ContentRendererBase"));

const MainRenderer: React.FC<{ styles: StyleTheme }> = ({ styles }) => {
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
  } = UseDocumentationData();

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

    const selected = selectedItem ?? selectedCategory;
    if (!selected) {
      return (
        <div className="text-gray-500 text-center mt-16">
          Select a document or category from the sidebar
        </div>
      );
    }

    const isSelectedCategory = isCategory(selected);

    return (
      <Suspense fallback={<LoadingSpinner />}>
        <ContentRenderer
          styles={styles}
          title={selected.title}
          content={selected.content ?? []}
          docId={selected.id}
          tree={tree}
        />
        {isSelectedCategory && (
          <div className="mt-8">
            <CategoryNavigatorRenderer
              category={selected as Category}
              styles={styles}
              onSelect={navigateToEntry}
            />
          </div>
        )}
      </Suspense>
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
          className={`flex-1 p-2 md:p-6 overflow-x-auto ${styles.sections.contentBackground} transition-colors`}
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
