import { rgb } from "pdf-lib";
import { Config } from "../../../configs/pdf-config";
import type { RenderContext } from "../types/RenderContext";
import type { MessageBoxData } from "../../../layouts/blocks/types";

// Tailwind-matched theme colors (normalized 0–1)
const themes: Record<
  "info" | "warning" | "error" | "success" | "neutral",
  {
    fill: [number, number, number];
    stroke: [number, number, number];
    text: [number, number, number];
  }
> = {
  info: {
    fill: [0.878, 0.949, 1], // bg-blue-100 #DBEAFE
    stroke: [0.761, 0.863, 0.976], // border-blue-300 #BFDBFE
    text: [0.031, 0.188, 0.388], // text-blue-800 #052F62
  },
  warning: {
    fill: [1, 0.973, 0.863], // bg-yellow-100 #FEF3C7
    stroke: [0.992, 0.925, 0.682], // border-yellow-300 #FCD34D
    text: [0.322, 0.255, 0.051], // text-yellow-800 #523E0D
  },
  error: {
    fill: [0.992, 0.871, 0.871], // bg-red-100 #FEE2E2
    stroke: [0.937, 0.631, 0.631], // border-red-300 #FCA5A5
    text: [0.451, 0.051, 0.051], // text-red-800 #730D0D
  },
  success: {
    fill: [0.863, 0.945, 0.882], // bg-green-100 #DCFCE7
    stroke: [0.678, 0.855, 0.737], // border-green-300 #86EFAC
    text: [0.031, 0.251, 0.118], // text-green-800 #084021
  },
  neutral: {
    fill: [0.961, 0.961, 0.961], // bg-stone-100 #F5F5F5
    stroke: [0.827, 0.827, 0.827], // border-gray-300 #D1D5DB
    text: [0.106, 0.122, 0.137], // text-gray-700 #1F2937-ish
  },
};

export async function addMessageBox(ctx: RenderContext, data: MessageBoxData) {
  if (!data?.text) return;

  if (data.type === "quote") {
    const ruleW = 4;
    const padX = 10;
    const padY = 8;
    const width = Config.PAGE.width - 2 * Config.MARGIN - ruleW - padX;
    const fontSize = Config.FONT_SIZES.body;

    const italicFont = (ctx.fonts as any).italic ?? ctx.fonts.regular;

    const lines = ctx.canvas.wrapText(data.text, italicFont, fontSize, width);
    const lh = ctx.canvas.lineHeight(italicFont, fontSize);
    const boxH = lines.length * lh + padY * 2;

    ctx.canvas.ensureSpace(boxH + Config.SPACING.messageBoxBottom);
    const top = ctx.canvas.getY();

    ctx.canvas.drawRect({
      x: Config.MARGIN,
      y: top,
      width: width + ruleW + padX,
      height: boxH,
      fill: rgb(0.939, 0.927, 0.92),
      advanceCursor: false,
    });

    ctx.canvas.drawRect({
      x: Config.MARGIN,
      y: top,
      width: ruleW,
      height: boxH,
      fill: rgb(0.371, 0.343, 0.324),
      advanceCursor: false,
    });

    ctx.canvas.drawTextBlock({
      text: data.text,
      x: Config.MARGIN + ruleW + padX,
      y: top + padY,
      width,
      font: italicFont,
      size: fontSize,
      color: rgb(0.116, 0.155, 0.218),
      lineGap: 2,
      advanceCursor: false,
    });

    ctx.canvas.setY(top + boxH + Config.SPACING.messageBoxBottom);
    return;
  }

  // Non-quote
  const type = (data.type ?? "info") as keyof typeof themes;

  const sizeKey = data.size ?? "medium";
  const showIcon = data.showIcon ?? true;

  const sizeMap = {
    small: { pad: 8, font: Config.FONT_SIZES.messageBox - 1, iconSize: 14 },
    medium: { pad: 12, font: Config.FONT_SIZES.messageBox, iconSize: 14 },
    large: { pad: 16, font: Config.FONT_SIZES.messageBox + 1, iconSize: 14 },
  } as const;
  const S = sizeMap[sizeKey];

  const width = Config.PAGE.width - 2 * Config.MARGIN;
  const theme = themes[type] ?? themes.info;

  // Icon space
  const hasIcon = Boolean(showIcon && ctx.icons?.[type]);
  const iconSpace = hasIcon ? S.iconSize + 8 : 0;
  const textX = Config.MARGIN + S.pad + iconSpace;
  const textW = width - S.pad * 2 - iconSpace;

  const lines = ctx.canvas.wrapText(
    data.text,
    ctx.fonts.regular,
    S.font,
    textW,
  );
  const lh = ctx.canvas.lineHeight(ctx.fonts.regular, S.font);
  const textH = lines.length * lh;

  const minContentH = hasIcon ? Math.max(textH, S.iconSize) : textH;
  const boxH = minContentH + S.pad * 2;

  ctx.canvas.ensureSpace(boxH + Config.SPACING.messageBoxBottom);
  const top = ctx.canvas.getY();

  // Background box
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

  // Icon
  if (hasIcon) {
    const iconX = Config.MARGIN + S.pad;
    const iconY = top + S.pad + (minContentH - S.iconSize) / 2;

    const page = ctx.canvas.getPage();
    page.drawImage(ctx.icons![type], {
      x: iconX,
      y: page.getHeight() - (iconY + S.iconSize),
      width: S.iconSize,
      height: S.iconSize,
    });
  }

  // Text
  ctx.canvas.drawTextBlock({
    text: data.text,
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
