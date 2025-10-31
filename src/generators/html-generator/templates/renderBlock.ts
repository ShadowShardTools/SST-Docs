import type { Content } from "../../../layouts/render/types";
import type { RenderContext } from "./types";
import { renderContentBlock } from "./blocks";

export const renderBlock = (block: Content, ctx: RenderContext) =>
  renderContentBlock(ctx, block);
