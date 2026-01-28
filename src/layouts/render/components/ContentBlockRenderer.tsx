import React, { Suspense, memo } from "react";
import { resolveBlockRenderer } from "../../blocks/blockRendererRegistry";
import { LoadingSpinner } from "../../dialog/components";
import type { StyleTheme } from "@shadow-shard-tools/docs-core";

interface Props {
  styles: StyleTheme;
  content: any[];
  currentPath: string;
}

export const ContentBlockRenderer: React.FC<Props> = memo(
  ({ styles, content, currentPath }) => {
    return (
      <>
        {content.map((block, index) => {
          const LazyBlock = resolveBlockRenderer(block?.type);

          return (
            <Suspense key={index} fallback={<LoadingSpinner styles={styles} />}>
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
