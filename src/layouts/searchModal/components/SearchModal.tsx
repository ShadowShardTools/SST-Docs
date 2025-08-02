import React from "react";
import { FixedSizeList as List } from "react-window";
import type { SearchModalProps } from "../types";
import {
  SEARCH_PLACEHOLDER,
  EMPTY_SEARCH_MESSAGE,
  NO_RESULTS_MESSAGE,
  ITEM_HEIGHT,
  MAX_RESULTS_HEIGHT,
} from "../constants";
import {
  useSearchResults,
  useKeyboardNavigation,
  useInputFocus,
} from "../hooks";
import SearchModalFooter from "./SearchModalFooter";
import SearchResultItem from "./SearchResultItem";

const SearchModal: React.FC<SearchModalProps> = ({
  styles,
  isOpen,
  onClose,
  searchTerm,
  onSearchChange,
  results,
  onSelect,
}) => {
  // Custom hooks for separation of concerns
  const processedResults = useSearchResults(results, searchTerm);
  const { selectedIndex, listRef } = useKeyboardNavigation(
    isOpen,
    processedResults,
    onSelect,
    onClose,
  );
  const inputRef = useInputFocus(isOpen);

  // Early return if modal is closed
  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/40 z-50 flex items-start justify-center pt-24 px-4"
      onClick={handleBackdropClick}
    >
      <div
        className={`w-full max-w-2xl rounded-lg shadow-lg overflow-hidden border ${styles.searchModal.borders}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Header */}
        <div
          className={`flex items-center border-b px-4 py-2 ${styles.searchModal.header} ${styles.searchModal.borders}`}
        >
          <input
            ref={inputRef}
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={SEARCH_PLACEHOLDER}
            className="flex-1 px-3 py-2 text-sm focus:outline-none bg-transparent"
          />
        </div>

        {/* Results Section */}
        <div className={`max-h-96 ${styles.searchModal.resultBackground}`}>
          {!searchTerm.trim() ? (
            <p className={`${styles.searchModal.resultEmptyInputText} py-6`}>
              {EMPTY_SEARCH_MESSAGE}
            </p>
          ) : processedResults.length === 0 ? (
            <p className={`${styles.searchModal.resultNoResultText} py-6`}>
              {NO_RESULTS_MESSAGE}
            </p>
          ) : (
            <List
              itemCount={processedResults.length}
              itemSize={ITEM_HEIGHT}
              height={Math.min(
                MAX_RESULTS_HEIGHT,
                processedResults.length * ITEM_HEIGHT,
              )}
              width="100%"
              ref={listRef}
            >
              {({ index, style }) => {
                const { item, snippet } = processedResults[index];
                return (
                  <div key={`${item.id}-${index}`} style={style}>
                    <SearchResultItem
                      item={item}
                      snippet={snippet}
                      searchTerm={searchTerm}
                      isSelected={selectedIndex === index}
                      styles={styles}
                      onSelect={onSelect}
                      onClose={onClose}
                    />
                  </div>
                );
              }}
            </List>
          )}
        </div>

        {/* Footer with keyboard shortcuts */}
        <SearchModalFooter styles={styles} />
      </div>
    </div>
  );
};

export default SearchModal;
