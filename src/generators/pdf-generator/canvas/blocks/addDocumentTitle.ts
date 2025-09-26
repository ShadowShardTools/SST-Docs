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

export async function addDocumentTitle(ctx: RenderContext, data: TitleData) {
    if (!data?.text) return;

    const size = Config.FONT_SIZES.category;

    const spacingKey = data.spacing ?? "medium";
    const { top, bottom } = SPACING_MAP[spacingKey];

    const align = data.alignment ?? "left";
    const color = Config.COLORS.titleH1;

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
    ctx.canvas.drawRule({
        thickness: 2,
        color: Config.COLORS.titleUnderline,
        width: ctx.canvas.contentWidth,
        align: "left",
        spacingBefore: 0,
        spacingAfter: bottom,
    });
}
