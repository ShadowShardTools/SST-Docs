import type { Content } from "../../../layouts/render/types";
import type { RenderContext } from "./types";
import { renderBlock } from "./renderBlock";

export const renderBlocks = (content: Content[], ctx: RenderContext) => {
  return content
    .map((block) => renderBlock(block, ctx))
    .filter((fragment): fragment is string => typeof fragment === "string")
    .join("\n");
};
