import type React from "react";
import {
  blockImports,
  type BlockType,
} from "./generatedImports/blockImports.generated";

export type BlockRenderer = React.ComponentType<any>;

const blockRenderers = blockImports as Record<BlockType, BlockRenderer>;

export const resolveBlockRenderer = (type?: string) => {
  const key = (type || "unknown") as BlockType;
  return (blockRenderers[key] ?? blockRenderers["unknown"]) as BlockRenderer;
};

export type { BlockType };
