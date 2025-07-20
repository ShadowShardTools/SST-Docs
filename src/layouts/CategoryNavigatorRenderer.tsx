import React from "react";
import type { Category } from "../types/entities/Category";
import type { DocItem } from "../types/entities/DocItem";
import type { StyleTheme } from "../types/entities/StyleTheme";
import { FileText, Folder } from "lucide-react";

interface CategoryNavigatorRendererProps {
  category: Category;
  styles: StyleTheme;
  onSelect: (entry: DocItem | Category) => void;
}

const CategoryNavigatorRenderer: React.FC<CategoryNavigatorRendererProps> = ({
  category,
  styles,
  onSelect,
}) => {
  const children = category.children ?? [];
  const docs = category.docs ?? [];

  if (children.length === 0 && docs.length === 0) {
    return (
      <div className={`${styles.category.empty} mt-16`}>
        This category is empty.
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {/* Child Categories */}
      {children.map((child) => (
        <button
          key={child.id}
          onClick={() => onSelect(child)}
          className={`p-4 cursor-pointer ${styles.category.cardBody}`}
        >
          <div
            className={`flex items-center gap-2 ${styles.category.cardHeaderText}`}
          >
            <Folder className="w-6 h-6 shrink-0" />
            <h3>{child.title}</h3>
          </div>
          {child.description && (
            <p className={`${styles.category.cardDescriptionText}`}>
              {child.description}
            </p>
          )}
        </button>
      ))}

      {/* Doc Items */}
      {docs.map((doc) => (
        <button
          key={doc.id}
          onClick={() => onSelect(doc)}
          className={`p-4 cursor-pointer ${styles.category.cardBody}`}
        >
          <div
            className={`flex items-center gap-2 ${styles.category.cardHeaderText}`}
          >
            <FileText className="w-6 h-6 shrink-0" />
            <h3>{doc.title}</h3>
          </div>
          {doc.description && (
            <p className={`${styles.category.cardDescriptionText}`}>
              {doc.description}
            </p>
          )}
        </button>
      ))}
    </div>
  );
};

export default CategoryNavigatorRenderer;
