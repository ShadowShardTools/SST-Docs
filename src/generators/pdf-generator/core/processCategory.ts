import type { Category } from "../../../layouts/render/types";
import { processContent } from "./processContent";
import type { RenderContext } from "../types/RenderContext";
import { addText, addTitle } from "../canvas/blocks";

export async function processCategory(
  ctx: RenderContext,
  root: Category,
): Promise<void> {
  if (!root) return;
  const stack: Category[] = [root];

  while (stack.length) {
    const category = stack.pop()!;
    if (!category.title) continue;

    addTitle(ctx, { text: category.title, level: 1 });
    if (category.description) addText(ctx, { text: category.description });

    if (category.content?.length) await processContent(ctx, category.content);

    if (category.docs?.length) {
      for (const doc of category.docs) {
        addTitle(ctx, { text: doc.title, level: 1 });
        if (doc.description) addText(ctx, { text: doc.description });
        await processContent(ctx, doc.content);
      }
    }

    if (category.children?.length) {
      // Reverse for natural order using stack (DFS)
      for (let i = category.children.length - 1; i >= 0; i--) {
        stack.push(category.children[i]);
      }
    }
  }
}
