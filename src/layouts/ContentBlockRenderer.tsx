import React, { Suspense, memo } from "react";
import {
  blockImports,
  type BlockType,
} from "../generated/blockImports.generated";
import type { ContentBlock } from "../types/entities/ContentBlock";
import type { StyleTheme } from "../siteConfig";
import LoadingSpinner from "../components/dialog/LoadingSpinner";

interface ContentBlockRendererProps {
  styles: StyleTheme;
  content: ContentBlock[];
  currentPath: string;
}

const ContentBlockRenderer: React.FC<ContentBlockRendererProps> = memo(
  ({ styles, content, currentPath }) => {
    return (
      <>
        {content.map((block, index) => {
          const type = (block.type || "unknown") as BlockType;
          const LazyBlock = (blockImports[type] ||
            blockImports["unknown"]) as React.ComponentType<any>;

          return (
            <Suspense key={index} fallback={<LoadingSpinner />}>
              <LazyBlock
                index={index}
                styles={styles}
                block={block}
                currentPath={currentPath}
                {...block}
              />
            </Suspense>
          );
        })}
      </>
    );
  },
);

ContentBlockRenderer.displayName = "ContentBlockRenderer";

export default ContentBlockRenderer;
