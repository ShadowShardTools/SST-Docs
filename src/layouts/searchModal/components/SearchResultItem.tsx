import React from "react";
import { FileText, Folder } from "lucide-react";
import { highlightSearchTerm } from "../utilities";
import type {
  Category,
  DocItem,
  StyleTheme,
} from "@shadow-shard-tools/docs-core";

const isCategory = (item: DocItem | Category): item is Category =>
  "docs" in item || "children" in item;

const typeIcon = (item: DocItem | Category) =>
  isCategory(item) ? (
    <Folder className="w-4 h-4" aria-hidden />
  ) : (
    <FileText className="w-4 h-4" aria-hidden />
  );

interface Props {
  item: DocItem | Category;
  snippet: string;
  searchTerm: string;
  isSelected: boolean;
  styles: StyleTheme;
  onSelect: (item: DocItem | Category) => void;
  onClose: () => void;
}

export const SearchResultItem: React.FC<Props> = ({
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
        className={`mb-1 flex items-center gap-2 ${styles.searchModal.itemHeaderText}`}
      >
        {typeIcon(item)}
        <span
          dangerouslySetInnerHTML={{
            __html: highlightSearchTerm(item.title, searchTerm),
          }}
        />
      </div>

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
      {"tags" in item && Array.isArray(item.tags) && item.tags.length > 0 && (
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
