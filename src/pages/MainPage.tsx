// At top
import { useCallback, useEffect, useState, lazy, Suspense } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useMediaQuery } from "../hooks/useMediaQuery";
import { UseDocumentationData } from "../services/UseDocumentationData";
import type { DocItem } from "../types/entities/DocItem";
import ErrorMessage from "../components/dialog/ErrorMessage";
import Header from "../layouts/Header/Header";
import Sidebar from "../layouts/Sidebar";
import Navigation from "../layouts/Navigation/Navigation";
import LoadingSpinner from "../components/dialog/LoadingSpinner";
import type { StyleTheme } from "../types/entities/StyleTheme";
import SearchModal from "../layouts/SearchModal/SearchModal";
import type { Category } from "../types/entities/Category";
import CategoryNavigatorRenderer from "../layouts/CategoryNavigatorRenderer";

const ContentRenderer = lazy(() => import("../layouts/ContentRenderer"));

const MainPage: React.FC<{ styles: StyleTheme }> = ({ styles }) => {
  const navigate = useNavigate();
  const { docId } = useParams();
  const isMobile = useMediaQuery("(max-width: 767px)");
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(true);
  const [selectedItem, setSelectedItem] = useState<DocItem | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null,
  );
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<DocItem[]>([]);

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

  // Handle first-load navigation or URL param change
  useEffect(() => {
    if (!items.length && !tree.length && !standaloneDocs.length) return;

    // If no docId in URL, select first available item
    if (!docId) {
      const firstItem = standaloneDocs[0] || items[0];
      if (firstItem) {
        setSelectedItem(firstItem);
        setSelectedCategory(null);
        navigate(`/${firstItem.id}`, { replace: true });
      }
      return;
    }

    // Look for the docId in all items (including standalone docs)
    const allItems = [...items, ...standaloneDocs];
    const foundDoc = allItems.find((i) => i.id === docId);
    if (foundDoc) {
      setSelectedItem(foundDoc);
      setSelectedCategory(null);
      return;
    }

    // If not found in items, check categories
    const findCategory = (nodes: Category[]): Category | null => {
      for (const cat of nodes) {
        if (cat.id === docId) return cat;
        const child = findCategory(cat.children ?? []);
        if (child) return child;
      }
      return null;
    };

    const foundCat = findCategory(tree);
    if (foundCat) {
      setSelectedCategory(foundCat);
      setSelectedItem(null);
      return;
    }

    // If nothing found, fallback to first available item
    const firstItem = standaloneDocs[0] || items[0];
    if (firstItem) {
      setSelectedItem(firstItem);
      setSelectedCategory(null);
      navigate(`/${firstItem.id}`, { replace: true });
    }
  }, [docId, items, tree, standaloneDocs, navigate]);

  // Global shortcut to open search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isTyping =
        ["INPUT", "TEXTAREA"].includes(document.activeElement?.tagName || "") ||
        (document.activeElement as HTMLElement)?.isContentEditable;
      if (
        !isTyping &&
        (e.code === "Slash" || (e.ctrlKey && e.code === "KeyK"))
      ) {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Search functionality - include standalone docs
  useEffect(() => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      return;
    }

    const lower = searchTerm.toLowerCase();
    const allItems = [...items, ...standaloneDocs];

    const matches = allItems.filter(
      (item) =>
        item.title.toLowerCase().includes(lower) ||
        item.content.some((block) => {
          // Check textData for text and title content
          if (block.textData?.text?.toLowerCase().includes(lower)) {
            return true;
          }

          // Check titleData for title content
          if (block.titleData?.text?.toLowerCase().includes(lower)) {
            return true;
          }

          // Check messageBoxData for message box content
          if (block.messageBoxData?.text?.toLowerCase().includes(lower)) {
            return true;
          }

          // Check list items
          if (
            block.listData?.items?.some((li) =>
              li.toLowerCase().includes(lower),
            )
          ) {
            return true;
          }

          // Check code content
          if (block.codeData?.content?.toLowerCase().includes(lower)) {
            return true;
          }

          // Check code name/filename
          if (block.codeData?.name?.toLowerCase().includes(lower)) {
            return true;
          }

          return false;
        }) ||
        // Also search in tags
        item.tags?.some((tag) => tag.toLowerCase().includes(lower)),
    );

    setSearchResults(matches);
  }, [searchTerm, items, standaloneDocs]);

  const isCategory = (entry: DocItem | Category): entry is Category => {
    return "docs" in entry || "children" in entry;
  };

  const navigateToEntry = useCallback(
    (entry: DocItem | Category) => {
      if (isCategory(entry)) {
        setSelectedCategory(entry);
        setSelectedItem(null);
      } else {
        setSelectedItem(entry);
        setSelectedCategory(null);
      }

      navigate(`/${entry.id}`, { replace: true });
    },
    [navigate],
  );

  // Handle search modal close
  const handleSearchClose = useCallback(() => {
    setIsSearchOpen(false);
    setSearchTerm("");
    setSearchResults([]);
  }, []);

  // Handle search item selection
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

    const isCategory = "docs" in selected || "children" in selected;

    return (
      <Suspense fallback={<LoadingSpinner />}>
        {/* Always render ContentRenderer for both DocItem and Category */}
        <ContentRenderer
          styles={styles}
          title={selected.title}
          content={selected.content ?? []}
          docId={selected.id}
          tree={tree}
        />

        {/* If it's a category, also render the navigator below the content */}
        {isCategory && (
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
          onSearchOpen={() => setIsSearchOpen(true)}
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

export default MainPage;
