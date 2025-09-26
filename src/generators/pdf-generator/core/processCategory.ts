// processCategory.ts
import { Config } from "../../../configs/pdf-config";
import type { Category } from "../../../layouts/render/types";
import { addTitle } from "../canvas/blocks";
import type { RenderContext } from "../types";
import { processContent } from "./processContent";

interface StackItem {
  category: Category;
  depth: number;
  ancestors: string[]; // titles of parent categories in order (top->bottom)
}

export async function processCategory(
  ctx: RenderContext,
  root: Category,
): Promise<void> {
  if (!root) return;

  const stack: StackItem[] = [{ category: root, depth: 0, ancestors: [] }];

  while (stack.length) {
    const { category, depth, ancestors } = stack.pop()!;
    if (!category.title) continue;

    // Page breaks for nested categories if enabled
    if (Config.SPLIT_NESTED_CATEGORIES && depth > 0) {
      ctx.canvas.ensureSpace({ forcePageBreakBefore: true });
    }

    // Build breadcrumb title for nested categories:
    // Top-level => "Category"
    // Nested    => "Parent/Child[/...] / Current"
    const breadcrumb =
      ancestors.length > 0
        ? `${ancestors.join("/")}/${category.title}`
        : category.title;

    // Render category title and optional description
    addTitle(ctx, { text: breadcrumb, level: 1 });

    // Documents in this category
    if (category.docs?.length) {
      for (let i = 0; i < category.docs.length; i++) {
        const doc = category.docs[i];

        if (Config.SPLIT_BY_DOCUMENT && i > 0) {
          ctx.canvas.ensureSpace({ forcePageBreakBefore: true });
        }

        addTitle(ctx, { text: doc.title, level: 1 });
        await processContent(ctx, doc.content);
      }
    }

    // Push children with depth+1 and extended breadcrumb chain
    if (category.children?.length) {
      for (let j = category.children.length - 1; j >= 0; j--) {
        const child = category.children[j];
        stack.push({
          category: child,
          depth: depth + 1,
          ancestors: [...ancestors, category.title],
        });
      }
    }
  }
}
