import { useEffect, useState, useRef, useMemo } from "react";
import { FixedSizeList as List } from "react-window";
import type { DocItem } from "../types/entities/DocItem";
import type { StyleTheme } from "../types/entities/StyleTheme";

interface SearchModalProps {
  styles: StyleTheme;
  isOpen: boolean;
  onClose: () => void;
  searchTerm: string;
  onSearchChange: (val: string) => void;
  results: DocItem[];
  onSelect: (item: DocItem) => void;
}

const highlight = (text: string, term: string) =>
  text.replace(
    new RegExp(`(${term})`, "ig"),
    '<mark class="bg-yellow-200">$1</mark>',
  );

const ITEM_HEIGHT = 72;

const SearchModal: React.FC<SearchModalProps> = ({
  styles,
  isOpen,
  onClose,
  searchTerm,
  onSearchChange,
  results,
  onSelect,
}) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<any>(null);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!isOpen) return;

      switch (e.key) {
        case "Escape":
          e.preventDefault();
          onClose();
          break;
        case "ArrowDown":
          e.preventDefault();
          setSelectedIndex((prev) => Math.min(prev + 1, results.length - 1));
          break;
        case "ArrowUp":
          e.preventDefault();
          setSelectedIndex((prev) => Math.max(prev - 1, 0));
          break;
        case "Enter":
          e.preventDefault();
          if (results[selectedIndex]) {
            onSelect(results[selectedIndex]);
            onClose();
          }
          break;
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, selectedIndex, results, onClose, onSelect]);

  useEffect(() => {
    listRef.current?.scrollToItem?.(selectedIndex, "smart");
  }, [selectedIndex]);

  // Memoized processed results
  const processedResults = useMemo(() => {
    const lower = searchTerm.toLowerCase();

    return results.map((item) => {
      const matchBlock = item.content.find((block) => {
        const type = block.type ?? "";

        if (type === "text" || type === "message-box" || type === "title") {
          return (
            block.textData?.text?.toLowerCase().includes(lower) ||
            block.titleData?.text?.toLowerCase().includes(lower)
          );
        }

        if (type === "list") {
          return block.listData?.items?.some((li) =>
            li.toLowerCase().includes(lower),
          );
        }

        if (type === "code") {
          return block.codeData?.content?.toLowerCase().includes(lower);
        }

        return false;
      });

      let snippet: string | undefined;
      if (matchBlock) {
        const type = matchBlock.type ?? "";
        if (type === "list") {
          snippet = matchBlock.listData?.items?.find((li) =>
            li.toLowerCase().includes(lower),
          );
        } else if (
          type === "text" ||
          type === "message-box" ||
          type.startsWith("title")
        ) {
          snippet = matchBlock.textData?.text;
        } else if (type === "code") {
          snippet = matchBlock.codeData?.content;
        }
      }

      return { ...item, snippet };
    });
  }, [results, searchTerm]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/40 z-50 flex items-start justify-center pt-24 px-4"
      onClick={onClose}
    >
      <div
        className={`w-full max-w-2xl rounded-lg shadow-lg overflow-hidden border ${styles.searchModal.borders}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search input */}
        <div
          className={`flex items-center border-b px-4 py-2 ${styles.searchModal.header} ${styles.searchModal.borders}`}
        >
          <input
            ref={inputRef}
            type="text"
            value={searchTerm}
            onChange={(e) => {
              onSearchChange(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Search documentation..."
            className="flex-1 px-3 py-2 text-sm focus:outline-none"
          />
        </div>

        {/* Results */}
        <div className={`max-h-96 ${styles.searchModal.resultBackground}`}>
          {searchTerm ? (
            processedResults.length === 0 ? (
              <p className="text-gray-500 text-sm text-center py-6">
                No results found
              </p>
            ) : (
              <List
                height={384}
                itemCount={processedResults.length}
                itemSize={ITEM_HEIGHT}
                width="100%"
                ref={listRef}
              >
                {({ index, style }) => {
                  const item = processedResults[index];
                  return (
                    <div
                      key={item.id}
                      onClick={() => {
                        onSelect(item);
                        onClose();
                      }}
                      style={style}
                      className={`px-4 py-3 cursor-pointer ${
                        selectedIndex === index
                          ? styles.searchModal.selectedItem
                          : styles.searchModal.item
                      }`}
                    >
                      <div
                        className={`${styles.searchModal.itemHeaderText}`}
                        dangerouslySetInnerHTML={{
                          __html: highlight(item.title, searchTerm),
                        }}
                      />
                      {item.snippet && (
                        <p
                          className={`${styles.searchModal.itemFoundSectionText}`}
                          dangerouslySetInnerHTML={{
                            __html: highlight(item.snippet, searchTerm),
                          }}
                        />
                      )}
                      {item.tags?.length && (
                        <div className={`${styles.searchModal.itemTags}`}>
                          {item.tags.join(", ")}
                        </div>
                      )}
                    </div>
                  );
                }}
              </List>
            )
          ) : (
            <p className="text-gray-400 text-sm text-center py-6">
              Start typing to search...
            </p>
          )}
        </div>

        {/* Footer */}
        <div
          className={`border-t px-4 py-2 flex justify-between items-center ${styles.searchModal.footer} ${styles.searchModal.borders}`}
        >
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <kbd
                className={`px-1.5 py-0.5 pointer-events-none ${styles.hints.key}`}
              >
                ↑
              </kbd>
              <kbd
                className={`px-1.5 py-0.5 pointer-events-none ${styles.hints.key}`}
              >
                ↓
              </kbd>
              <span className={`${styles.hints.text}`}>to navigate</span>
            </div>
            <div className="flex items-center gap-1">
              <kbd
                className={`px-1.5 py-0.5 pointer-events-none ${styles.hints.key}`}
              >
                Enter
              </kbd>
              <span className={`${styles.hints.text}`}>to select</span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <kbd
              className={`px-1.5 py-0.5 pointer-events-none ${styles.hints.key}`}
            >
              Esc
            </kbd>
            <span className={`${styles.hints.text}`}>to close</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchModal;
