import type { Category } from "../../../layouts/render/types";
import { addText } from "../blocks/addText";
import { addTitle } from "../blocks/addTitle";
import { processContent } from "./processContent";
import type { RenderContext } from "../types/RenderContext";

export async function processCategory(
  ctx: RenderContext,
  category: Category,
): Promise<void> {
  if (!category || !category.title) return;

  // Title
  addTitle(ctx, { text: category.title, level: 1 });

  // Description
  if (category.description) {
    addText(ctx, { text: category.description });
  }

  // Content
  if (category.content?.length) {
    await processContent(ctx, category.content);
  }

  // Docs
  if (category.docs?.length) {
    for (const doc of category.docs) {
      addTitle(ctx, { text: doc.title, level: 1 });
      if (doc.description) addText(ctx, { text: doc.description });
      await processContent(ctx, doc.content);
    }
  }

  // Children
  if (category.children?.length) {
    for (const child of category.children) {
      await processCategory(ctx, child);
    }
  }
}
