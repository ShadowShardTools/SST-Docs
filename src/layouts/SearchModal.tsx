import { useEffect, useState, useRef } from "react";
import type { DocItem } from "../types/entities/DocItem";
import type { StyleTheme } from "../config/siteConfig";

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

  /* --------------------------- focus management -------------------------- */
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setSelectedIndex(0);
    }
  }, [isOpen]);

  /* ------------------------ keyboard navigation -------------------------- */
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

  /* Ensure selected index never exceeds results length */
  useEffect(() => {
    setSelectedIndex((idx) => Math.min(idx, Math.max(0, results.length - 1)));
  }, [results.length]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/40 z-50 flex items-start justify-center pt-24 px-4"
      onClick={onClose}
    >
      <div
        className={`w-full max-w-2xl rounded-lg shadow-lg overflow-hidden border ${styles.componentsStyles.searchModalBorders}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* search input */}
        <div
          className={`flex items-center border-b px-4 py-2 ${styles.componentsStyles.searchModalHeader} ${styles.componentsStyles.searchModalBorders}`}
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

        {/* results */}
        <div
          className={`max-h-96 overflow-y-auto ${styles.componentsStyles.searchModalResultBackground}`}
        >
          {searchTerm ? (
            results.length === 0 ? (
              <p className="text-gray-500 text-sm text-center py-6">
                No results found
              </p>
            ) : (
              <ul>
                {results.map((item, i) => {
                  const lower = searchTerm.toLowerCase();
                  const matchBlock = item.content.find((block) => {
                    if (
                      ["description", "quote"].includes(block.type) ||
                      block.type.startsWith("title")
                    )
                      return block.content.toLowerCase().includes(lower);
                    if (block.type === "list")
                      return block.listItems?.some((li) =>
                        li.toLowerCase().includes(lower),
                      );
                    if (block.type === "code")
                      return block.content.toLowerCase().includes(lower);
                    return false;
                  });

                  const snippet =
                    matchBlock?.type === "list"
                      ? matchBlock.listItems?.find((li) =>
                          li.toLowerCase().includes(lower),
                        )
                      : matchBlock?.content;

                  return (
                    <li
                      key={item.id}
                      onClick={() => {
                        onSelect(item);
                        onClose();
                      }}
                      className={`px-4 py-3 cursor-pointer ${selectedIndex === i ? styles.componentsStyles.searchModalSelectedItem : styles.componentsStyles.searchModalItem}`}
                    >
                      {/* title */}
                      <div
                        className={`${styles.textStyles.searchModalItemHeaderText}`}
                        dangerouslySetInnerHTML={{
                          __html: highlight(item.title, searchTerm),
                        }}
                      />
                      {/* snippet */}
                      {snippet && (
                        <p
                          className={`${styles.textStyles.searchModalItemFoundSectionText}`}
                          dangerouslySetInnerHTML={{
                            __html: highlight(snippet, searchTerm),
                          }}
                        />
                      )}
                      {/* tags */}
                      {item.tags?.length && (
                        <div
                          className={`${styles.textStyles.searchModalItemTags}`}
                        >
                          {item.tags.join(", ")}
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            )
          ) : (
            <p className="text-gray-400 text-sm text-center py-6">
              Start typing to search...
            </p>
          )}
        </div>

        {/* footer */}
        <div
          className={`border-t px-4 py-2 flex justify-between items-center ${styles.componentsStyles.searchModalFooter} ${styles.componentsStyles.searchModalBorders}`}
        >
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <kbd className={`${styles.componentsStyles.keyHints}`}>↑</kbd>
              <kbd className={`${styles.componentsStyles.keyHints}`}>↓</kbd>
              <span className={`${styles.textStyles.hints}`}>to navigate</span>
            </div>
            <div className="flex items-center gap-1">
              <kbd className={`${styles.componentsStyles.keyHints}`}>Enter</kbd>
              <span className={`${styles.textStyles.hints}`}>to select</span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <kbd className={`${styles.componentsStyles.keyHints}`}>Esc</kbd>
            <span className={`${styles.textStyles.hints}`}>to close</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchModal;
