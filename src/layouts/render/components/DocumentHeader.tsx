import React from "react";
import type { StyleTheme } from "../../../application/types/StyleTheme";
import { FileText, Folder } from "lucide-react";

interface Props {
  styles: StyleTheme;
  title: string;
  breadcrumb: string;
  isSelectedCategory: boolean;
}

export const DocumentHeader: React.FC<Props> = ({
  styles,
  title,
  breadcrumb,
  isSelectedCategory,
}) => {
  const Icon = isSelectedCategory ? Folder : FileText;

  return (
    <div className={`flex flex-col gap-1 items-center py-2 mb-4 ${styles.sections.documentHeaderBackground}`}>
      {/* Title row */}
      <div className={`flex items-center gap-2 ${styles.text.documentTitle}`}>
        <Icon className="w-6 h-6" aria-hidden="true" />
        <h1 aria-label={title}>
          {title}
        </h1>
      </div>

      {/* Breadcrumb */}
      {breadcrumb && (
        <p
          className={`${styles.text.breadcrumb} text-sm text-gray-400 text-center`}
        >
          {breadcrumb}
        </p>
      )}
    </div>
  );
};

export default DocumentHeader;
