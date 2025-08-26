import { Config } from "../../../configs/pdf-config";
import type { RenderContext } from "../../../generators/pdf-generator/types/RenderContext";
import type { ListData } from "../../../layouts/blocks/types";

export async function addList(ctx: RenderContext, data: ListData) {
  const items = data.items ?? [];
  if (items.length === 0) return;

  const type = data.type ?? "ul";
  const startNumber = data.startNumber ?? 1;
  const inside = data.inside ?? false;           // list-inside if true
  const align = data.alignment ?? "left";
  const keepTogether = (data as any).keepTogether === true; // optional flag

  const font = ctx.fonts.regular;
  const size = Config.FONT_SIZES.list;
  const color = Config.COLORS.text;

  const contentW = ctx.canvas.contentWidth;
  const lastIndex = startNumber + items.length - 1;
  const widestMarker = type === "ol" ? `${lastIndex}.` : "•";
  const bulletColW = Math.ceil(font.widthOfTextAtSize(widestMarker, size) + 6); // marker + gap
  const textW = inside ? contentW : Math.max(0, contentW - bulletColW);

  // Pre-measure total height + used width for alignment
  const itemGap = 4;
  const lineHeight = undefined; // default (1.4 * size)
  let totalH = 0;

  const prewrapped: string[][] = [];
  let maxLineW = 0;

  for (let i = 0; i < items.length; i++) {
    const raw = items[i] ?? "";

    if (inside) {
      const marker = type === "ol" ? `${startNumber + i}.` : "•";
      const full = `${marker} ${raw}`;
      const { lines, totalHeight } = ctx.canvas.measureAndWrap(full, {
        font, size, maxWidth: contentW, lineHeight,
      });
      totalH += totalHeight + (i < items.length - 1 ? itemGap : 0);
      for (const ln of lines) maxLineW = Math.max(maxLineW, font.widthOfTextAtSize(ln, size));
      prewrapped.push(lines);
    } else {
      const { lines, lineHeightPx, totalHeight } = ctx.canvas.measureAndWrap(raw, {
        font, size, maxWidth: textW, lineHeight,
      });
      prewrapped.push(lines);
      const h = Math.max(lineHeightPx, totalHeight);
      totalH += h + (i < items.length - 1 ? itemGap : 0);
      for (const ln of lines) maxLineW = Math.max(maxLineW, font.widthOfTextAtSize(ln, size));
    }
  }

  const spacingBottom = Config.SPACING.listBottom;

  // Actual used block width for clean center/right alignment
  const usedBlockW = inside
    ? Math.min(contentW, maxLineW)
    : Math.min(contentW, bulletColW + maxLineW);

  // Reserve space (optionally keep list together)
  ctx.canvas.ensureBlock({ minHeight: totalH + spacingBottom, keepTogether });

  // Compute aligned region placement
  const contentLeft = ctx.canvas.contentLeft;
  let baseX = contentLeft;
  if (align === "center") baseX = contentLeft + (contentW - usedBlockW) / 2;
  else if (align === "right") baseX = contentLeft + (contentW - usedBlockW);

  const startY = ctx.canvas.cursorY;
  const regionHeight = ctx.canvas.bottom - startY;

  // Draw inside a region so the block aligns visually
  ctx.canvas.withRegion({ x: baseX, y: startY, width: usedBlockW, height: regionHeight }, () => {
    for (let i = 0; i < items.length; i++) {
      const raw = items[i] ?? "";

      if (inside) {
        const marker = type === "ol" ? `${startNumber + i}.` : "•";
        const paragraph = `${marker} ${raw}`;
        ctx.canvas.drawText(paragraph, {
          font, size, color, align: "left", // region is already aligned
          maxWidth: usedBlockW,
          spacingBefore: 0,
          spacingAfter: 0,
          lineHeight,
        });
      } else {
        const lines = prewrapped[i];
        const marker = type === "ol" ? `${startNumber + i}.` : "•";

        if (lines.length === 0) {
          ctx.canvas.drawText(`${marker}`, {
            font, size, color, align: "left",
            maxWidth: usedBlockW,
            spacingBefore: 0,
            spacingAfter: 0,
            lineHeight,
          });
        } else {
          ctx.canvas.drawText(`${marker} ${lines[0]}`, {
            font, size, color, align: "left",
            maxWidth: usedBlockW,
            spacingBefore: 0,
            spacingAfter: 0,
            lineHeight,
          });

          for (let li = 1; li < lines.length; li++) {
            ctx.canvas.drawText(lines[li], {
              font, size, color, align: "left",
              maxWidth: usedBlockW,
              spacingBefore: 0,
              spacingAfter: 0,
              lineHeight,
              indent: bulletColW, // hanging indent for continuation lines
            });
          }
        }
      }

      if (i < items.length - 1) ctx.canvas.moveY(itemGap);
    }
  });

  ctx.canvas.moveY(spacingBottom);
}
