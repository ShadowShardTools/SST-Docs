import { rgb } from "pdf-lib";
import { Config } from "../../../generators/pdf-generator/config";
import type { RenderContext } from "../../../generators/pdf-generator/types/RenderContext";

const themes: Record<
  string,
  { fill: [number, number, number]; stroke: [number, number, number]; text: [number, number, number] }
> = {
  info:    { fill: [0.878, 0.949, 1],       stroke: [0.769, 0.867, 0.933], text: [0.031, 0.188, 0.388] },
  warning: { fill: [1, 0.973, 0.863],       stroke: [0.996, 0.925, 0.682], text: [0.322, 0.255, 0.051] },
  error:   { fill: [0.992, 0.871, 0.871],   stroke: [0.937, 0.631, 0.631], text: [0.451, 0.051, 0.051] },
  success: { fill: [0.863, 0.945, 0.882],   stroke: [0.678, 0.855, 0.737], text: [0.031, 0.251, 0.118] },
  neutral: { fill: [0.961, 0.961, 0.961],   stroke: [0.827, 0.827, 0.827], text: [0.106, 0.122, 0.137] },
};

function drawImageTop(
  ctx: RenderContext,
  img: any,
  x: number,
  topY: number,
  width: number,
) {
  if (!img) return;
  const height = (img.height / img.width) * width;
  const yBottom = topY - height;                // convert top->pdf bottom
  ctx.canvas.getPage().drawImage(img, { x, y: yBottom, width, height });
}

export function addMessageBox(
  ctx: RenderContext,
  text: string,
  type: "info" | "warning" | "error" | "success" | "neutral" | "quote" = "info",
  opts?: { size?: "small" | "medium" | "large"; showIcon?: boolean },
) {
  if (!text) return;

  // ---- Quote (pl-4 py-2) ----
  if (type === "quote") {
    const ruleW = 4;
    const padX = 16;
    const padY = 8;
    const width = Config.LETTER.width - 2 * Config.MARGIN - ruleW - padX;
    const fontSize = Config.FONT_SIZES.body;
    const lines = ctx.canvas.wrapText(text, ctx.fonts.regular, fontSize, width);
    const lh = ctx.canvas.lineHeight(ctx.fonts.regular, fontSize);
    const boxH = lines.length * lh + padY * 2;

    ctx.canvas.ensureSpace(boxH + Config.SPACING.messageBoxBottom);
    const top = ctx.canvas.getY();

    // light background
    ctx.canvas.drawRect({
      x: Config.MARGIN,
      y: top,
      width: width + ruleW + padX,
      height: boxH,
      fill: rgb(0.96, 0.96, 0.96),
      advanceCursor: false,
    });

    // left rule
    ctx.canvas.drawRect({
      x: Config.MARGIN,
      y: top,
      width: ruleW,
      height: boxH,
      fill: rgb(0.7, 0.7, 0.7),
      advanceCursor: false,
    });

    // text
    ctx.canvas.drawTextBlock({
      text,
      x: Config.MARGIN + ruleW + padX,
      y: top + padY,
      width,
      font: ctx.fonts.regular,
      size: fontSize,
      color: Config.COLORS.text,
      lineGap: 2,
      advanceCursor: false,
    });

    ctx.canvas.setY(top + boxH + Config.SPACING.messageBoxBottom);
    return;
  }

  const sizeKey = opts?.size ?? "medium";
  const showIcon = opts?.showIcon ?? true;

  // Tailwind paddings: p-3=12, p-4=16, p-6=24
  const sizeMap = {
    small:  { pad: 10, font: Config.FONT_SIZES.messageBox - 1, iconSize: 16 },
    medium: { pad: 14, font: Config.FONT_SIZES.messageBox,     iconSize: 20 },
    large:  { pad: 16, font: Config.FONT_SIZES.messageBox + 1, iconSize: 24 },
  } as const;
  const S = sizeMap[sizeKey];

  const width = Config.LETTER.width - 2 * Config.MARGIN;
  const theme = themes[type] ?? themes.info;

  const hasIcon = Boolean(showIcon && ctx.icons?.[type]);
  const iconGap = hasIcon ? 12 : 0;            // mr-3 = 12
  const iconSpace = hasIcon ? S.iconSize + iconGap : 0;

  const textX = Config.MARGIN + S.pad + iconSpace;
  const textW = width - S.pad * 2 - iconSpace;

  const lines = ctx.canvas.wrapText(text, ctx.fonts.regular, S.font, textW);
  const lh = ctx.canvas.lineHeight(ctx.fonts.regular, S.font);
  const textH = lines.length * lh;

  const contentH = hasIcon ? Math.max(textH, S.iconSize) : textH;
  const boxH = contentH + S.pad * 2;

  ctx.canvas.ensureSpace(boxH + Config.SPACING.messageBoxBottom);
  const top = ctx.canvas.getY();

  // background + border
  ctx.canvas.drawRect({
    x: Config.MARGIN,
    y: top,
    width,
    height: boxH,
    fill: rgb(...theme.fill),
    stroke: rgb(...theme.stroke),
    lineWidth: 1.5,
    advanceCursor: false,
  });

  // icon (centered within content area)
  if (hasIcon) {
    const iconTop = top + S.pad + (contentH - S.iconSize) / 2 + S.iconSize; // topY for drawImageTop
    drawImageTop(ctx, ctx.icons![type], Config.MARGIN + S.pad, iconTop, S.iconSize);
  }

  // text top-aligned inside content padding (like Tailwind box with flex items-center)
  ctx.canvas.drawTextBlock({
    text,
    x: textX,
    y: top + S.pad,
    width: textW,
    font: ctx.fonts.regular,
    size: S.font,
    color: rgb(...theme.text),
    lineGap: 2,
    advanceCursor: false,
  });

  ctx.canvas.setY(top + boxH + Config.SPACING.messageBoxBottom);
}
