// src/generators/pdf-generator/blocks/addMessageBox.ts
import { rgb } from "pdf-lib";
import { Config } from "../../../configs/pdf-config";
import type { RenderContext } from "../types/RenderContext";
import type { MessageBoxData } from "../../../layouts/blocks/types";

// Tailwind-matched theme colors (0–1)
const themes: Record<
  "info" | "warning" | "error" | "success" | "neutral",
  {
    fill: [number, number, number];
    stroke: [number, number, number];
    text: [number, number, number];
  }
> = {
  info: {
    fill: [0.878, 0.949, 1],
    stroke: [0.761, 0.863, 0.976],
    text: [0.031, 0.188, 0.388],
  },
  warning: {
    fill: [1, 0.973, 0.863],
    stroke: [0.992, 0.925, 0.682],
    text: [0.322, 0.255, 0.051],
  },
  error: {
    fill: [0.992, 0.871, 0.871],
    stroke: [0.937, 0.631, 0.631],
    text: [0.451, 0.051, 0.051],
  },
  success: {
    fill: [0.863, 0.945, 0.882],
    stroke: [0.678, 0.855, 0.737],
    text: [0.031, 0.251, 0.118],
  },
  neutral: {
    fill: [0.961, 0.961, 0.961],
    stroke: [0.827, 0.827, 0.827],
    text: [0.106, 0.122, 0.137],
  },
};

export async function addMessageBox(ctx: RenderContext, data: MessageBoxData) {
  const text = (data.text ?? "").trim();
  if (!text) return;

  const contentWidth = ctx.canvas.contentWidth;
  const left = ctx.canvas.contentLeft;

  // ------- QUOTE STYLE -------------------------------------------------------
  if (data.type === "quote") {
    const ruleW = 4;
    const padX = 10;
    const padY = 8;
    const fontSize = Config.FONT_SIZES.body;
    const italicFont = ctx.fonts.italic ?? ctx.fonts.regular;

    const textMaxW = Math.max(0, contentWidth - ruleW - padX);
    const lineHeight = 1 + 2 / fontSize;
    const { totalHeight } = ctx.canvas.measureAndWrap(text, {
      font: italicFont,
      size: fontSize,
      maxWidth: textMaxW,
      lineHeight,
    });

    const boxH = totalHeight + padY * 2;
    const spacingBottom = Config.SPACING.messageBoxBottom;

    ctx.canvas.ensureSpace({ minHeight: boxH + spacingBottom });
    const top = ctx.canvas.cursorY;

    // Draw background
    ctx.canvas.drawBox(contentWidth, boxH, {
      fill: rgb(0.939, 0.927, 0.92),
      padding: 0,
      strokeWidth: 0,
    });

    // Reset cursor and draw left border rule
    ctx.canvas.cursorY = top;
    ctx.canvas.drawBox(ruleW, boxH, {
      fill: rgb(0.371, 0.343, 0.324),
      padding: 0,
      strokeWidth: 0,
    });

    // Reset cursor and draw text
    ctx.canvas.cursorY = top + padY;
    ctx.canvas.withRegion(
      {
        x: left + ruleW + padX,
        y: top + padY,
        width: textMaxW,
        height: Math.max(0, boxH - padY * 2),
      },
      () => {
        ctx.canvas.drawText(text, {
          font: italicFont,
          size: fontSize,
          color: rgb(0.116, 0.155, 0.218),
          align: "left",
          maxWidth: textMaxW,
          spacingBefore: 0,
          spacingAfter: 0,
          lineHeight,
        });
      },
    );

    ctx.canvas.cursorY = top + boxH;
    ctx.canvas.moveY(spacingBottom);
    return;
  }

  // ------- STANDARD MESSAGE BOX ---------------------------------------------
  const type = (data.type ?? "info") as keyof typeof themes;
  const theme = themes[type] ?? themes.info;

  const sizeKey = data.size ?? "medium";
  const showIcon = data.showIcon ?? true;

  const sizeMap = {
    small: { pad: 8, font: Config.FONT_SIZES.messageBox - 1, iconSize: 14 },
    medium: { pad: 12, font: Config.FONT_SIZES.messageBox, iconSize: 14 },
    large: { pad: 16, font: Config.FONT_SIZES.messageBox + 1, iconSize: 14 },
  } as const;
  const S = sizeMap[sizeKey];

  const hasIcon = Boolean(showIcon && ctx.icons?.[type]);
  const iconGap = 8;
  const iconSize = S.iconSize;
  const iconSpace = hasIcon ? iconSize + iconGap : 0;

  const innerW = Math.max(0, contentWidth - S.pad * 2);
  const textMaxW = Math.max(0, innerW - iconSpace);
  const lineHeight = 1 + 2 / S.font;

  const { totalHeight: textH } = ctx.canvas.measureAndWrap(text, {
    font: ctx.fonts.regular,
    size: S.font,
    maxWidth: textMaxW,
    lineHeight,
  });

  const minContentH = hasIcon ? Math.max(textH, iconSize) : textH;
  const boxH = minContentH + S.pad * 2;
  const spacingBottom = Config.SPACING.messageBoxBottom;

  ctx.canvas.ensureSpace({ minHeight: boxH + spacingBottom });
  const top = ctx.canvas.cursorY;

  ctx.canvas.drawBox(contentWidth, boxH, {
    fill: rgb(...theme.fill),
    stroke: rgb(...theme.stroke),
    strokeWidth: 1.5,
    padding: 0,
  });

  // Reset cursor after drawing box
  ctx.canvas.cursorY = top;

  // Draw icon if present
  if (hasIcon && ctx.icons) {
    const icon = ctx.icons[type];
    if (icon) {
      const iconX = left + S.pad;
      const iconY = top + S.pad + (minContentH - iconSize) / 2;
      ctx.canvas.drawImage(icon, {
        x: iconX,
        y: iconY,
        width: iconSize,
        height: iconSize,
      });
    }
  }

  // Draw text content
  const textX = left + S.pad + iconSpace;
  const textY = top + S.pad;
  const textWidth = Math.max(0, contentWidth - S.pad * 2 - iconSpace);
  const textHeight = Math.max(0, boxH - S.pad * 2);

  ctx.canvas.withRegion(
    { x: textX, y: textY, width: textWidth, height: textHeight },
    () => {
      ctx.canvas.cursorY = textY;
      ctx.canvas.drawText(text, {
        font: ctx.fonts.regular,
        size: S.font,
        color: rgb(...theme.text),
        align: "left",
        maxWidth: textWidth,
        spacingBefore: 0,
        spacingAfter: 0,
        lineHeight,
      });
    },
  );

  // Move cursor to end of box and add spacing
  ctx.canvas.cursorY = top + boxH;
  ctx.canvas.moveY(spacingBottom);
}
