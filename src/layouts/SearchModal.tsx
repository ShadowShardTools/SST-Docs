import { useEffect, useState, useRef, useMemo, useCallback } from "react";
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

const highlight = (text: string, term: string) => {
  if (!term.trim()) return text;

  // Escape special regex characters
  const escapedTerm = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return text.replace(
    new RegExp(`(${escapedTerm})`, "gi"),
    '<mark class="bg-yellow-200">$1</mark>',
  );
};

const ITEM_HEIGHT = 92;

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
  const listRef = useRef<List>(null);

  // Generate snippet with context around search term
  const generateSnippet = useCallback((item: DocItem, term: string) => {
    const termLower = term.toLowerCase();

    // First try to find in title
    if (item.title.toLowerCase().includes(termLower)) {
      return item.title;
    }

    // Then search through content
    for (const content of item.content) {
      let text = '';

      if (content.textData?.text) {
        text = content.textData.text;
      } else if (content.titleData?.text) {
        text = content.titleData.text;
      } else if (content.messageBoxData?.text) {
        text = content.messageBoxData.text;
      } else if (content.codeData?.content) {
        text = content.codeData.content;
      } else if (content.listData?.items) {
        text = content.listData.items.join(' ');
      }

      if (text && text.toLowerCase().includes(termLower)) {
        const index = text.toLowerCase().indexOf(termLower);
        const start = Math.max(0, index - 50);
        const end = Math.min(text.length, index + term.length + 50);
        let snippet = text.substring(start, end);

        if (start > 0) snippet = '...' + snippet;
        if (end < text.length) snippet = snippet + '...';

        return snippet;
      }
    }

    // Fallback to tags
    if (item.tags) {
      const matchingTag = item.tags.find(tag => tag.toLowerCase().includes(termLower));
      if (matchingTag) {
        return `Tag: ${matchingTag}`;
      }
    }

    return '';
  }, []);

  // Process and filter results based on search term
  const processedResults = useMemo(() => {
    if (!searchTerm.trim()) return [];

    const term = searchTerm.toLowerCase();

    return results
      .filter(item => {
        // Search in title
        if (item.title.toLowerCase().includes(term)) return true;

        // Search in content
        const hasContentMatch = item.content.some(content => {
          if (content.textData?.text?.toLowerCase().includes(term)) return true;
          if (content.titleData?.text?.toLowerCase().includes(term)) return true;
          if (content.listData?.items?.some(item => item.toLowerCase().includes(term))) return true;
          if (content.messageBoxData?.text?.toLowerCase().includes(term)) return true;
          if (content.codeData?.content?.toLowerCase().includes(term)) return true;
          if (content.codeData?.name?.toLowerCase().includes(term)) return true;
          return false;
        });

        if (hasContentMatch) return true;

        // Search in tags
        if (item.tags?.some(tag => tag.toLowerCase().includes(term))) return true;

        return false;
      })
      .flatMap((item) => {
        const termLower = searchTerm.toLowerCase();
        const matches: {
          item: DocItem;
          snippet: string;
          blockIndex?: number;
        }[] = [];

        if (item.title.toLowerCase().includes(termLower)) {
          matches.push({ item, snippet: item.title });
        }

        item.content.forEach((block, blockIndex) => {
          let text = '';
          if (block.titleData?.text?.toLowerCase().includes(termLower)) {
            text = block.titleData.text;
          } else if (block.textData?.text?.toLowerCase().includes(termLower)) {
            text = block.textData.text;
          } else if (block.messageBoxData?.text?.toLowerCase().includes(termLower)) {
            text = block.messageBoxData.text;
          } else if (
            block.listData?.items?.some((li) =>
              li.toLowerCase().includes(termLower),
            )
          ) {
            text = block.listData.items.join(" ");
          } else if (block.codeData?.content?.toLowerCase().includes(termLower)) {
            text = block.codeData.content;
          }

          if (text) {
            const idx = text.toLowerCase().indexOf(termLower);
            const snippet = `${idx > 0 ? "..." : ""}${text.substring(
              idx - 30 > 0 ? idx - 30 : 0,
              idx + termLower.length + 30,
            )}...`;
            matches.push({ item, snippet, blockIndex });
          }
        });

        item.tags?.forEach((tag) => {
          if (tag.toLowerCase().includes(termLower)) {
            matches.push({ item, snippet: `Tag: ${tag}` });
          }
        });

        return matches;
      });
  }, [results, searchTerm, generateSnippet]);

  // Reset selected index when results change
  useEffect(() => {
    setSelectedIndex(0);
  }, [processedResults]);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isOpen) return;

      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault();
          setSelectedIndex(prev =>
            prev < processedResults.length - 1 ? prev + 1 : prev
          );
          break;
        case 'ArrowUp':
          event.preventDefault();
          setSelectedIndex(prev => prev > 0 ? prev - 1 : prev);
          break;
        case 'Enter':
          event.preventDefault();
          if (processedResults[selectedIndex]) {
            onSelect(processedResults[selectedIndex].item);
            onClose();
          }
          break;
        case 'Escape':
          event.preventDefault();
          onClose();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, processedResults, selectedIndex, onSelect, onClose]);

  // Scroll to selected item
  useEffect(() => {
    if (listRef.current && selectedIndex >= 0) {
      listRef.current.scrollToItem(selectedIndex, 'smart');
    }
  }, [selectedIndex]);

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
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search documentation..."
            className="flex-1 px-3 py-2 text-sm focus:outline-none bg-transparent"
          />
        </div>

        {/* Results */}
        <div className={`max-h-96 ${styles.searchModal.resultBackground}`}>
          {!searchTerm.trim() ? (
            <p className="text-gray-400 text-sm text-center py-6">
              Start typing to search...
            </p>
          ) : processedResults.length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-6">
              No results found
            </p>
          ) : (
            <List
              itemCount={processedResults.length}
              itemSize={ITEM_HEIGHT}
              height={Math.min(384, processedResults.length * ITEM_HEIGHT)}
              width="100%"
              ref={listRef}
            >
              {({ index, style }) => {
                const { item, snippet } = processedResults[index];
                return (
                  <div
                    key={`${item.id}-${index}`}
                    style={style}
                    onClick={() => {
                      onSelect(item);
                      onClose();
                    }}
                    className={`px-4 py-1 cursor-pointer border-b last:border-b-0 ${selectedIndex === index
                        ? styles.searchModal.selectedItem
                        : styles.searchModal.item
                      }`}
                  >
                    <div
                      className={`mb-1 ${styles.searchModal.itemHeaderText}`}
                      dangerouslySetInnerHTML={{
                        __html: highlight(item.title, searchTerm),
                      }}
                    />
                    {snippet && (
                      <p
                        className={`text-xs mb-2 line-clamp-2 ${styles.searchModal.itemFoundSectionText}`}
                        dangerouslySetInnerHTML={{
                          __html: highlight(snippet, searchTerm),
                        }}
                      />
                    )}
                    {Array.isArray(item.tags) && item.tags.length > 0 && (
                      <div className={`flex flex-wrap gap-1`}>
                        {item.tags?.map((tag, tagIndex) => (
                          <span
                            key={tagIndex}
                            className={`px-2 py-0.5 ${styles.searchModal.itemTags}`}
                            dangerouslySetInnerHTML={{
                              __html: highlight(tag, searchTerm),
                            }}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                );
              }}
            </List>
          )}
        </div>

        {/* Footer */}
        <div
          className={`border-t px-4 py-2 flex justify-between items-center ${styles.searchModal.footer} ${styles.searchModal.borders}`}
        >
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <kbd
                className={`px-1.5 py-0.5 pointer-events-none text-xs ${styles.hints.key}`}
              >
                ↑
              </kbd>
              <kbd
                className={`px-1.5 py-0.5 pointer-events-none text-xs ${styles.hints.key}`}
              >
                ↓
              </kbd>
              <span className={`text-xs ${styles.hints.text}`}>to navigate</span>
            </div>
            <div className="flex items-center gap-1">
              <kbd
                className={`px-1.5 py-0.5 pointer-events-none text-xs ${styles.hints.key}`}
              >
                Enter
              </kbd>
              <span className={`text-xs ${styles.hints.text}`}>to select</span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <kbd
              className={`px-1.5 py-0.5 pointer-events-none text-xs ${styles.hints.key}`}
            >
              Esc
            </kbd>
            <span className={`text-xs ${styles.hints.text}`}>to close</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchModal;