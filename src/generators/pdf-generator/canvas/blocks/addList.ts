import { Config } from "../../../../configs/pdf-config";
import type { RenderContext } from "../../types/RenderContext";
import type { ListData } from "../../../../layouts/blocks/types";

function normalizeItems(items?: string[]): string[] {
  return (items ?? [])
    .map((item) => (item ?? "").trim())
    .filter((item) => item.length > 0);
}

export async function addList(ctx: RenderContext, data: ListData) {
  const items = normalizeItems(data.items);
  if (!items.length) return;

  const type = data.type ?? "ul";
  const startNumber = data.startNumber ?? 1;
  const inside = data.inside === true;
  const align = data.alignment ?? "left";
  const keepTogether = (data as any).keepTogether === true;

  const font = ctx.fonts.regular;
  const size = Config.FONT_SIZES.list;
  const color = Config.COLORS.text;

  const contentW = ctx.canvas.contentWidth;
  const contentLeft = ctx.canvas.contentLeft;

  const bullet = "\u2022";
  const markerForIndex = (index: number) =>
    type === "ol" ? `${startNumber + index}.` : bullet;

  const lastIndex = startNumber + items.length - 1;
  const widestMarker = markerForIndex(lastIndex - startNumber);
  const bulletColW = Math.ceil(font.widthOfTextAtSize(widestMarker, size) + 6);

  const insideIndent = inside ? Math.max(12, bulletColW) : 0;
  const effectiveWidth = Math.max(1, contentW - insideIndent);
  const textMaxWidth = Math.max(1, effectiveWidth - bulletColW);

  const itemGap = 4;
  const lineHeight = undefined;
  let totalH = 0;
  let maxLineW = 0;

  const prewrapped: string[][] = [];

  for (let i = 0; i < items.length; i++) {
    const metrics = ctx.canvas.measureAndWrap(items[i], {
      font,
      size,
      maxWidth: textMaxWidth,
      lineHeight,
    });
    prewrapped.push(metrics.lines);
    totalH += metrics.totalHeight + (i < items.length - 1 ? itemGap : 0);
    for (const ln of metrics.lines) {
      maxLineW = Math.max(maxLineW, font.widthOfTextAtSize(ln, size));
    }
  }

  const spacingBottom = Config.SPACING.listBottom;
  const usedBlockW = Math.min(
    effectiveWidth,
    bulletColW + Math.max(1, maxLineW),
  );

  ctx.canvas.ensureBlock({ minHeight: totalH + spacingBottom, keepTogether });

  let baseX = contentLeft + insideIndent;
  if (align === "center")
    baseX = contentLeft + insideIndent + (effectiveWidth - usedBlockW) / 2;
  else if (align === "right")
    baseX = contentLeft + insideIndent + (effectiveWidth - usedBlockW);

  const startY = ctx.canvas.cursorY;
  const regionHeight = ctx.canvas.bottom - startY;

  ctx.canvas.withRegion(
    { x: baseX, y: startY, width: usedBlockW, height: regionHeight },
    () => {
      for (let i = 0; i < items.length; i++) {
        const lines = prewrapped[i];
        const marker = markerForIndex(i);

        if (!lines.length) {
          ctx.canvas.drawText(marker, {
            font,
            size,
            color,
            align: "left",
            maxWidth: usedBlockW,
            spacingBefore: 0,
            spacingAfter: 0,
            lineHeight,
          });
        } else {
          ctx.canvas.drawText(`${marker} ${lines[0]}`, {
            font,
            size,
            color,
            align: "left",
            maxWidth: usedBlockW,
            spacingBefore: 0,
            spacingAfter: 0,
            lineHeight,
          });

          for (let li = 1; li < lines.length; li++) {
            ctx.canvas.drawText(lines[li], {
              font,
              size,
              color,
              align: "left",
              maxWidth: usedBlockW,
              spacingBefore: 0,
              spacingAfter: 0,
              lineHeight,
              indent: bulletColW,
            });
          }
        }

        if (i < items.length - 1) ctx.canvas.moveY(itemGap);
      }
    },
  );

  ctx.canvas.moveY(spacingBottom);
}
