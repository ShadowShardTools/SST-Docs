// At top
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  lazy,
  Suspense,
} from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useMediaQuery } from "../hooks/useMediaQuery";
import { UseDocumentationData } from "../services/UseDocumentationData";
import type { DocItem } from "../types/entities/DocItem";
import ErrorMessage from "../components/dialog/ErrorMessage";
import { useThemeStyles } from "../hooks/useThemeStyles";

const Header = lazy(() => import("../layouts/Header/Header"));
const Sidebar = lazy(() => import("../layouts/Sidebar"));
const Navigation = lazy(() => import("../layouts/Navigation"));
const ContentRenderer = lazy(() => import("../layouts/ContentRenderer"));
const SearchModal = lazy(() => import("../layouts/SearchModal"));

const MainPage: React.FC = () => {
  const navigate = useNavigate();
  const { docId } = useParams();
  const isMobile = useMediaQuery("(max-width: 767px)");
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(true);
  const [selectedItem, setSelectedItem] = useState<DocItem | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
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

  const styles = useThemeStyles();

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

  const navigateToItem = useCallback(
    (item: DocItem, anchor?: string) => {
      navigate(`/${item.id}${anchor ? `#${anchor}` : ""}`);
      setSelectedItem(item);
      setIsMobileNavOpen(false);
    },
    [navigate],
  );

  const filteredItems = useMemo(() => {
    const query = searchTerm.toLowerCase();
    return !query
      ? []
      : items.filter((item) => {
          const titleMatch = item.title.toLowerCase().includes(query);
          const blockMatch = item.content?.some((block) => {
            const content = block.content?.toLowerCase?.();
            if (
              ["description", "quote"].includes(block.type) ||
              block.type.startsWith("title")
            )
              return content?.includes(query);
            if (block.type === "list")
              return block.listItems?.some((i) =>
                i.toLowerCase().includes(query),
              );
            if (block.type === "code") return content?.includes(query);
            return false;
          });
          return titleMatch || blockMatch;
        });
  }, [items, searchTerm]);

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

    if (loading.content)
      return <p className="text-gray-500">Loading content...</p>;
    if (error.content) return <ErrorMessage message={error.content} />;
    if (!selectedItem)
      return (
        <div className="text-gray-500 text-center mt-16">
          Select a document from the sidebar
        </div>
      );

    return (
      <Suspense fallback={<p className="text-gray-400">Loading content…</p>}>
        <ContentRenderer
          styles={styles}
          title={selectedItem.title}
          content={selectedItem.content}
        />
      </Suspense>
    );
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Suspense fallback={<div className="h-16 bg-gray-100" />}>
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
          <Suspense fallback={<div className="w-64 bg-gray-50 border-r" />}>
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
          className={`flex-1 p-2 md:p-6 ${styles.sectionStyles.contentBackground} transition-colors`}
        >
          {renderContent()}
        </div>
      </main>

      <Suspense fallback={null}>
        <SearchModal
          styles={styles}
          isOpen={isSearchOpen}
          onClose={() => setIsSearchOpen(false)}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          results={filteredItems}
          onSelect={navigateToItem}
        />
      </Suspense>
    </div>
  );
};

export default MainPage;
