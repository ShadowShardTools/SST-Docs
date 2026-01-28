import React from "react";
import { FileText, Folder } from "lucide-react";
import type {
  Category,
  DocItem,
  StyleTheme,
} from "@shadow-shard-tools/docs-core";

interface Props {
  styles: StyleTheme;
  category: Category;
  onSelect: (entry: DocItem | Category) => void;
}

export const CategoryNavigatorRenderer: React.FC<Props> = ({
  styles,
  category,
  onSelect,
}) => {
  const children = category.children ?? [];
  const docs = category.docs ?? [];

  if (children.length === 0 && docs.length === 0) {
    return (
      <div className={`${styles.category.empty} mt-16 text-center`}>
        This category is empty.
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
