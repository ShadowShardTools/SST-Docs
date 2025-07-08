import React, { Suspense, memo } from "react";
import {
  blockImports,
  type BlockType,
} from "../generated/blockImports.generated";
import type { ContentBlock } from "../types/entities/ContentBlock";
import type { StyleTheme } from "../siteConfig";

interface ContentBlockRendererProps {
  styles: StyleTheme;
  content: ContentBlock[];
  currentPath: string;
}

/** Simple skeleton shown while a lazily‑loaded block is still downloading. */
const LoadingSkeleton: React.FC = () => (
  <div className="my-4 h-6 w-full animate-pulse rounded bg-gray-200" />
);

const ContentBlockRenderer: React.FC<ContentBlockRendererProps> = memo(
  ({ styles, content, currentPath }) => {
    return (
      <>
        {content.map((block, index) => {
          const type = (block.type || "unknown") as BlockType;
          const LazyBlock = (blockImports[type] ||
            blockImports["unknown"]) as React.ComponentType<any>;

          return (
            <Suspense key={index} fallback={<LoadingSkeleton />}>
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
