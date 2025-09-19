import React, { Suspense, memo } from "react";
import {
  blockImports,
  type BlockType,
} from "../../blocks/generatedImports/blockImports.generated";
import type { StyleTheme } from "../../../application/types/StyleTheme";
import { LoadingSpinner } from "../../dialog/components";

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
