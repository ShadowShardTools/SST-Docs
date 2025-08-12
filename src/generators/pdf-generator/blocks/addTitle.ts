import { Config } from "../../../configs/pdf-config";
import type { RenderContext } from "../types/RenderContext";
import type { TitleData } from "../../../layouts/blocks/types";

// Spacing presets (keep your existing top; vary bottom)
const SPACING_MAP: Record<
  NonNullable<TitleData["spacing"]>,
  { top: number; bottom: number }
> = {
  none: { top: Config.SPACING.titleTop, bottom: 0 },
  small: {
    top: Config.SPACING.titleTop,
    bottom: Math.round(Config.SPACING.titleBottom * 0.5),
  },
  medium: { top: Config.SPACING.titleTop, bottom: Config.SPACING.titleBottom },
  large: {
    top: Config.SPACING.titleTop,
    bottom: Math.round(Config.SPACING.titleBottom * 1.5),
  },
};

function titleColor(level: 1 | 2 | 3) {
  if (level === 1) return Config.COLORS.titleH1;
  if (level === 2) return Config.COLORS.titleH2;
  return Config.COLORS.titleH3;
}

export async function addTitle(ctx: RenderContext, data: TitleData) {
  if (!data?.text) return;

  const level = (data.level ?? 1) as 1 | 2 | 3;
  const size = (Config.FONT_SIZES as any)[`h${level}`] ?? Config.FONT_SIZES.h3; // ← fixed template literal

  const spacingKey = data.spacing ?? "medium";
  const { top, bottom } = SPACING_MAP[spacingKey];

  const contentX = Config.MARGIN;
  const contentW = Config.PAGE.width - 2 * Config.MARGIN;

  const lh = ctx.canvas.lineHeight(ctx.fonts.bold, size);

  // Ensure space for title + optional underline + spacing
  ctx.canvas.ensureSpace(top + lh + (data.underline ? 8 : 0) + bottom);

  // Top spacing
  ctx.canvas.setY(ctx.canvas.getY() + top);

  // Draw title (align if your PdfCanvas supports it)
  ctx.canvas.drawTextBlock({
    text: data.text,
    x: contentX,
    y: ctx.canvas.getY(),
    width: contentW,
    font: ctx.fonts.bold,
    size,
    color: titleColor(level),
    align: data.alignment ?? "left",
    advanceCursor: false,
  });

  // Advance after title line
  ctx.canvas.setY(ctx.canvas.getY() + lh);

  // Underline (like border-b-2)
  if (data.underline) {
    const gap = 4;
    const ruleY = ctx.canvas.getY() + gap;

    ctx.canvas.drawLine({
      x1: contentX,
      x2: contentX + contentW,
      y: ruleY,
      color: Config.COLORS.titleUnderline,
      lineWidth: 2,
      advanceCursor: false,
    });

    ctx.canvas.setY(ruleY + 2);
  }

  // Bottom spacing
  ctx.canvas.setY(ctx.canvas.getY() + bottom);
}
