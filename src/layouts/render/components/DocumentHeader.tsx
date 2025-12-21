import React from "react";
import { FileText, Folder } from "lucide-react";
import type { BreadcrumbSegment } from "../types/BreadcrumbSegment";
import type { StyleTheme } from "@shadow-shard-tools/docs-core";

interface Props {
  styles: StyleTheme;
  title: string;
  breadcrumbSegments?: BreadcrumbSegment[];
  isSelectedCategory: boolean;
}

export const DocumentHeader: React.FC<Props> = ({
  styles,
  title,
  breadcrumbSegments = [],
  isSelectedCategory,
}) => {
  const Icon = isSelectedCategory ? Folder : FileText;
  const breadcrumbLength = breadcrumbSegments.length;

  return (
    <div
      className={`flex flex-col gap-1 items-center py-2 mb-4 ${styles.sections.documentHeaderBackground}`}
    >
      {/* Title row */}
      <div className={`flex items-center gap-2 ${styles.text.documentTitle}`}>
        <Icon className="w-6 h-6" aria-hidden="true" />
        <h1 aria-label={title}>{title}</h1>
      </div>

      {/* Breadcrumb */}
      {breadcrumbLength > 0 && (
        <nav aria-label="Breadcrumb" className="flex justify-center">
          <ol
            className={`flex flex-wrap items-center justify-center gap-2 text-sm ${styles.text.breadcrumb}`}
          >
            {breadcrumbSegments.map((segment, index) => {
              const isLast = index === breadcrumbLength - 1;
              const interactive = !isLast && (segment.onSelect || segment.href);
              const commonInteractiveClass =
                "hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-current rounded transition-colors cursor-pointer";

              let content: React.ReactNode;

              if (segment.onSelect && interactive) {
                content = (
                  <button
                    type="button"
                    onClick={segment.onSelect}
                    className={commonInteractiveClass}
                  >
                    {segment.label}
                  </button>
                );
              } else if (segment.href && interactive) {
                content = (
                  <a href={segment.href} className={commonInteractiveClass}>
                    {segment.label}
                  </a>
                );
              } else {
                content = (
                  <span className="cursor-default">{segment.label}</span>
                );
              }

              return (
                <li
                  key={`${segment.label}-${index}`}
                  className="flex items-center gap-2"
                  aria-current={isLast ? "page" : undefined}
                >
                  {content}
                  {!isLast && <span aria-hidden="true">/</span>}
                </li>
              );
            })}
          </ol>
        </nav>
      )}
    </div>
  );
};

export default DocumentHeader;
