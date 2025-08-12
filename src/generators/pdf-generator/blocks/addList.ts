import { Config } from "../../../configs/pdf-config";
import type { RenderContext } from "../../../generators/pdf-generator/types/RenderContext";
import type { ListData } from "../../../layouts/blocks/types";

export async function addList(ctx: RenderContext, data: ListData) {
  if (!data.items?.length) return;

  const type = data.type ?? "ul";
  const startNumber = data.startNumber ?? 1;
  const inside = data.inside ?? false; // list-inside behavior (marker inside text box)
  const align = data.alignment ?? "left";

  const font = ctx.fonts.regular;
  const size = Config.FONT_SIZES.list;
  const lh = ctx.canvas.lineHeight(font, size);
  const itemGap = 4; // ~space-y-1
  const color = Config.COLORS.text;

  // Page box
  const pageW = Config.PAGE.width;
  const marginX = Config.MARGIN;

  // Helper to measure text width (use canvas if available, fallback heuristic)
  const tw = (s: string) => {
    const anyCanvas = ctx.canvas as any;
    if (typeof anyCanvas?.textWidth === "function") {
      return anyCanvas.textWidth(font, size, s);
    }
    return s.length * size * 0.55; // reasonable sans fallback
  };

  // Determine bullet column width from the widest marker we will draw
  const lastIndex = startNumber + data.items.length - 1;
  const widestMarker = type === "ol" ? `${lastIndex}.` : "•";
  const bulletColW = Math.ceil(tw(widestMarker) + 6); // marker + gap
  const padInside = inside ? 2 : 0; // tiny gap when inside
  const outerIndent = inside ? 16 : 0; // emulate list-outside when not inside

  // Max content area available between margins (account for outer indent)
  const contentW = pageW - marginX * 2 - outerIndent;

  // We wrap text to this width
  const textW = Math.max(0, contentW - bulletColW - padInside);

  // Pre-measure: total height and actual max line width (to align the block)
  let totalH = 0;
  let maxLineW = 0;

  for (let i = 0; i < data.items.length; i++) {
    const lines = ctx.canvas.wrapText(data.items[i], font, size, textW);
    // Height
    const h = Math.max(lh, lines.length * lh);
    totalH += h + (i === data.items.length - 1 ? 0 : itemGap);
    // Track longest wrapped line width
    for (const line of lines) {
      maxLineW = Math.max(maxLineW, tw(line));
    }
  }

  // Actual used block width (bullet + gap + longest line)
  const usedBlockW = Math.min(contentW, bulletColW + padInside + maxLineW);

  // Ensure we have space for the whole list (plus bottom spacing)
  ctx.canvas.ensureSpace(totalH + Config.SPACING.listBottom);

  // Compute left X based on alignment, placing the *used* width within the content box
  const contentLeft = marginX + outerIndent;
  let baseX = contentLeft; // left-aligned default

  if (align === "center") {
    baseX = contentLeft + (contentW - usedBlockW) / 2;
  } else if (align === "right") {
    baseX = contentLeft + (contentW - usedBlockW);
  }

  // Draw
  let y = ctx.canvas.getY();

  for (let i = 0; i < data.items.length; i++) {
    const marker = type === "ol" ? `${startNumber + i}.` : "•";

    // Marker
    ctx.canvas.drawTextBlock({
      text: marker,
      x: baseX,
      y,
      font,
      size,
      color,
      advanceCursor: false,
    });

    // Text with hanging indent
    const textTop = y;
    const textH = ctx.canvas.drawTextBlock({
      text: data.items[i],
      x: baseX + bulletColW + padInside,
      y: textTop,
      width: textW,
      font,
      size,
      color,
      lineGap: 0,
      advanceCursor: false,
    });

    const itemH = Math.max(lh, textH);
    y = textTop + itemH + itemGap;
  }

  ctx.canvas.setY(y - itemGap + Config.SPACING.listBottom);
}
