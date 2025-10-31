// src/generators/pdf-generator/blocks/addImage.ts
import type { RenderContext } from "../../types/RenderContext";
import type { ImageData } from "../../../../layouts/blocks/types";
import { Config } from "../../../../configs/pdf-config";
import {
  clampScale,
  resolveImagePath,
  embedImageFromFile,
  getImageDimensions,
  getImageBoxPosition,
  measureCaptionHeight,
  drawCenteredCaption,
  handleImageError,
} from "../utilities";

export async function addImage(
  ctx: RenderContext,
  data: ImageData,
): Promise<void> {
  const image = data.image;
  if (!image?.src) return;

  const src = image.src;
  const alignment: "left" | "center" | "right" =
    (data.alignment as any) ?? "center";
  const scale = clampScale(data.scale);

  const spacingTop = Config.SPACING.medium;
  const spacingBottom = Config.SPACING.medium;

  try {
    const absPath = resolveImagePath(src, ctx.fsDataPath);
    const pdfImg = await embedImageFromFile(ctx, absPath);

    const contentW = ctx.canvas.contentWidth;
    const contentLeft = ctx.canvas.contentLeft;

    const { drawW, drawH } = getImageDimensions(pdfImg, contentW, scale);
    const boxX = getImageBoxPosition(contentLeft, contentW, drawW, alignment);

    // Caption metrics
    const caption = (image.alt ?? "").trim();
    const capSize = Config.FONT_SIZES.alternative ?? 10;
    const capColor = Config.COLORS.alternativeText ?? Config.COLORS.text;
    const capGap = caption ? 6 : 0;

    const capH = measureCaptionHeight(ctx, caption, capSize, drawW);

    // Reserve block space (image + optional caption)
    ctx.canvas.ensureBlock({
      minHeight: spacingTop + drawH + capGap + capH + spacingBottom,
      keepTogether: true,
    });

    ctx.canvas.moveY(spacingTop);

    // Draw image aligned via explicit x so it matches our computed box
    ctx.canvas.drawImage(pdfImg as any, {
      x: boxX,
      width: drawW,
      height: undefined, // preserve aspect
    });

    if (caption) {
      ctx.canvas.moveY(capGap);
      drawCenteredCaption({
        ctx,
        text: caption,
        boxX,
        boxW: drawW,
        size: capSize,
        color: capColor,
      });
    }

    ctx.canvas.moveY(spacingBottom);
  } catch (err) {
    handleImageError(
      ctx,
      `[Image could not be embedded: ${src}]`,
      spacingTop,
      spacingBottom,
    );
  }
}
