import { Config } from "../../../../configs/pdf-config";
import type { RenderContext } from "../../types/RenderContext";
import type { TitleData } from "../../../../layouts/blocks/types";

const SPACING_MAP: Record<
  NonNullable<TitleData["spacing"]>,
  { top: number; bottom: number }
> = {
  none: { top: Config.SPACING.titleTop, bottom: 0 },
  small: {
    top: Config.SPACING.titleTop,
    bottom: Math.round(Config.SPACING.titleBottom * 0.35),
  },
  medium: { top: Config.SPACING.titleTop, bottom: Config.SPACING.titleBottom },
  large: {
    top: Config.SPACING.titleTop,
    bottom: Math.round(Config.SPACING.titleBottom * 3),
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
  const size = (Config.FONT_SIZES as any)[`h${level}`] ?? Config.FONT_SIZES.h3;

  const spacingKey = data.spacing ?? "medium";
  const { top, bottom } = SPACING_MAP[spacingKey];

  const align = data.alignment ?? "left";
  const color = titleColor(level);

  const gapAfterTitleForUnderline = data.underline ? 4 : 0;

  ctx.canvas.drawText(data.text, {
    font: ctx.fonts.bold,
    size,
    color,
    align,
    maxWidth: ctx.canvas.contentWidth,
    spacingBefore: top,
    spacingAfter: gapAfterTitleForUnderline,
  });

  if (data.underline) {
    ctx.canvas.drawRule({
      thickness: 2,
      color: Config.COLORS.titleUnderline,
      width: ctx.canvas.contentWidth,
      align: "left",
      spacingBefore: 0,
      spacingAfter: bottom,
    });
  } else {
    // No underline
    ctx.canvas.moveY(bottom);
  }
}
