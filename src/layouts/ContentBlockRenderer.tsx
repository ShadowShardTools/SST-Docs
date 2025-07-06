import React, { Suspense, memo } from "react";
import {
  blockImports,
  type BlockType,
} from "../generated/blockImports.generated";
import type { ContentBlock } from "../types/entities/ContentBlock";
import type { StyleTheme } from "../config/siteConfig";

interface ContentBlockRendererProps {
  styles: StyleTheme;
  /** Array of blocks that make up the document */
  content: ContentBlock[];
  /** Part of the URL before the #anchor – helps heading blocks build permalinks */
  currentPath: string;
}

/** Simple skeleton shown while a lazily‑loaded block is still downloading. */
const LoadingSkeleton: React.FC = () => (
  <div className="my-4 h-6 w-full animate-pulse rounded bg-gray-200" />
);

/**
 * Renders every block in the `content` array by looking up the matching
 * lazily‑loaded component from `blockImports`. Falls back to the `UnknownBlock`
 * if the type is not recognised.
 */
const ContentBlockRenderer: React.FC<ContentBlockRendererProps> = memo(
  ({ styles, content, currentPath }) => {
    return (
      <>
        {content.map((block, index) => {
          // Resolve component for the given block type (or use `unknown`).
          const type = (block.type || "unknown") as BlockType;
          const LazyBlock = (blockImports[type] ||
            blockImports["unknown"]) as React.ComponentType<any>;

          return (
            <Suspense key={index} fallback={<LoadingSkeleton />}>
              {/*
                Most block components accept { index, block, currentPath }.
                UnknownBlock only needs { index, type } but extra props are fine.
              */}
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
