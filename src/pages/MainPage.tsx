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
import SearchModal from "../layouts/SearchModal";

const ContentRenderer = lazy(() => import("../layouts/ContentRenderer"));

const MainPage: React.FC<{ styles: StyleTheme }> = ({ styles }) => {
  const navigate = useNavigate();
  const { docId } = useParams();
  const isMobile = useMediaQuery("(max-width: 767px)");
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(true);
  const [selectedItem, setSelectedItem] = useState<DocItem | null>(null);
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
    if (!items.length) return;
    const found = docId ? items.find((i) => i.id === docId) : items[0];
    if (found) {
      setSelectedItem(found);
      if (!docId) navigate(`/${found.id}`, { replace: true });
    }
  }, [docId, items, navigate]);

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

  useEffect(() => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      return;
    }

    const lower = searchTerm.toLowerCase();

    const matches = items.filter(
      (item) =>
        item.title.toLowerCase().includes(lower) ||
        item.content.some((block) => {
          if (
            ["description", "quote"].includes(block.type ?? "") ||
            block.type?.startsWith("title")
          ) {
            return block.textData?.text?.toLowerCase().includes(lower);
          }
          if (block.type === "list") {
            return block.listData?.items?.some((li) =>
              li.toLowerCase().includes(lower),
            );
          }
          if (block.type === "code") {
            return block.codeData?.content?.toLowerCase().includes(lower);
          }
          return false;
        }),
    );

    setSearchResults(matches);
  }, [searchTerm, items]);

  const navigateToItem = useCallback(
    (item: DocItem, anchor?: string) => {
      navigate(`/${item.id}${anchor ? `#${anchor}` : ""}`);
      setSelectedItem(item);
      setIsMobileNavOpen(false);
    },
    [navigate],
  );

  if (error.versions) {
    return (
      <ErrorMessage
        message={error.versions}
        onRetry={() => location.reload()}
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
          onSelect={navigateToItem}
          selectedItem={selectedItem}
        />
      );
    }

    if (loading.content) return <LoadingSpinner />;
    if (error.content) return <ErrorMessage message={error.content} />;
    if (!selectedItem)
      return (
        <div className="text-gray-500 text-center mt-16">
          Select a document from the sidebar
        </div>
      );

    return (
      <Suspense fallback={<LoadingSpinner />}>
        <ContentRenderer
          styles={styles}
          title={selectedItem.title}
          content={selectedItem.content}
          docId={selectedItem.id}
          tree={tree}
        />
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
              onSelect={navigateToItem}
              selectedItem={selectedItem}
              isSearchOpen={isSearchOpen}
            />
          </Suspense>
        )}
        <div
          className={`flex-1 p-2 md:p-6 ${styles.sections.contentBackground} transition-colors`}
        >
          {renderContent()}
        </div>
      </main>
      <SearchModal
        styles={styles}
        isOpen={isSearchOpen}
        onClose={() => {
          setIsSearchOpen(false);
          setSearchTerm("");
        }}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        results={searchResults}
        onSelect={(item) => navigateToItem(item)}
      />
    </div>
  );
};

export default MainPage;
