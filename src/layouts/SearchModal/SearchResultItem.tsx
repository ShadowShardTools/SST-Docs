import React from "react";
import { highlightSearchTerm } from "./utilities/highlight";
import type { SearchResultItemProps } from "./types";

const SearchResultItem: React.FC<SearchResultItemProps> = ({
  item,
  snippet,
  searchTerm,
  isSelected,
  styles,
  onSelect,
  onClose,
}) => {
  const handleClick = () => {
    onSelect(item);
    onClose();
  };

  return (
    <div
      onClick={handleClick}
      className={`h-full px-4 py-1 cursor-pointer ${
        isSelected ? styles.searchModal.selectedItem : styles.searchModal.item
      }`}
    >
      {/* Item Title */}
      <div
        className={`mb-1 ${styles.searchModal.itemHeaderText}`}
        dangerouslySetInnerHTML={{
          __html: highlightSearchTerm(item.title, searchTerm),
        }}
      />

      {/* Snippet Preview */}
      {snippet && (
        <p
          className={`text-xs mb-2 line-clamp-2 ${styles.searchModal.itemFoundSectionText}`}
          dangerouslySetInnerHTML={{
            __html: highlightSearchTerm(snippet, searchTerm),
          }}
        />
      )}

      {/* Tags */}
      {Array.isArray(item.tags) && item.tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {item.tags.map((tag, tagIndex) => (
            <span
              key={tagIndex}
              className={`px-2 py-0.5 ${styles.searchModal.itemTags}`}
              dangerouslySetInnerHTML={{
                __html: highlightSearchTerm(tag, searchTerm),
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchResultItem;
