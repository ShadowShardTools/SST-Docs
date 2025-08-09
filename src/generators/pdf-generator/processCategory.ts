import type { Category } from "../../layouts/render/types";
import { addText } from "./blocks/addText";
import { addTitle } from "./blocks/addTitle";
import { processContent } from "./processContent";
import type { RenderContext } from "./types/RenderContext";

export function processCategory(
  ctx: RenderContext,
  category: Category,
  level = 1,
): void {
  if (!category || !category.title) return;
  addTitle(ctx, category.title, level);
  if (category.description) addText(ctx, category.description);
  if (category.content?.length) processContent(ctx, category.content);

  if (category.docs?.length) {
    for (const doc of category.docs) {
      addTitle(ctx, doc.title, level + 1);
      if (doc.description) addText(ctx, doc.description);
      if (doc.tags?.length) addText(ctx, `Tags: ${doc.tags.join(", ")}`);
      processContent(ctx, doc.content);
    }
  }

  if (category.children?.length) {
    for (const child of category.children)
      processCategory(ctx, child, level + 1);
  }
}
