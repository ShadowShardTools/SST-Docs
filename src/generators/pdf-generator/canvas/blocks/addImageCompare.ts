// src/generators/pdf-generator/blocks/addImageCompare.ts
import type { RenderContext } from "../../types/RenderContext";
import { Config } from "../../pdf-config";

import {
  clampScale,
  resolveImagePath,
  embedImageFromFile,
  getImageDimensions,
  getImageBoxPosition,
  measureCaptionHeight,
  drawCenteredCaption,
  handleImageError,
  getCaption,
  clampPercent,
} from "../utilities";
import type { ImageCompareData } from "@shadow-shard-tools/docs-core";
import type { BaseImage } from "@shadow-shard-tools/docs-core/types/BaseImage";

/* --------------------------------- API ----------------------------------- */

export async function addImageCompare(
  ctx: RenderContext,
  data: ImageCompareData,
): Promise<void> {
  const type = data.type ?? "individual"; // "individual" | "slider"
  const alignment: "left" | "center" | "right" =
    (data.alignment as any) ?? "center";
  const scale = clampScale(data.scale);

  const before = data.beforeImage;
  const after = data.afterImage;

  if (!before && !after) return;
  if (!!before && !after) return addSingle(ctx, before, alignment, scale);
  if (!!after && !before) return addSingle(ctx, after, alignment, scale);

  const spacingTop = Config.SPACING?.medium ?? 12;
  const spacingBottom = Config.SPACING?.medium ?? 12;

  const contentW = ctx.canvas.contentWidth;
  const contentLeft = ctx.canvas.contentLeft;
  const drawW = Math.max(1, Math.min(contentW, Math.round(contentW * scale)));

  let rendered = false;

  try {
    let bImg: any, aImg: any;
    try {
      [bImg, aImg] = await Promise.all([
        embedImageFromFile(ctx, resolveImagePath(before!.src!, ctx.fsDataPath)),
        embedImageFromFile(ctx, resolveImagePath(after!.src!, ctx.fsDataPath)),
      ]);
    } catch {
      handleImageError(
        ctx,
        `[Image compare could not be rendered: load failed]`,
        spacingTop,
        spacingBottom,
      );
      return;
    }

    const bAspect = bImg.height / bImg.width;
    const aAspect = aImg.height / aImg.width;

    // captions & sizing
    const capSize = Config.FONT_SIZES.alternative ?? 10;
    const capColor = Config.COLORS.alternativeText ?? Config.COLORS.text;
    const bCaption = getCaption(before!, "Before");
    const aCaption = getCaption(after!, "After");
    const capGap = 6;

    const boxX = getImageBoxPosition(contentLeft, contentW, drawW, alignment);

    if (type === "slider") {
      await renderSliderLayout({
        ctx,
        bImg,
        aImg,
        bCaption,
        aCaption,
        data,
        drawW,
        boxX,
        bAspect,
        aAspect,
        capSize,
        capColor,
        capGap,
        spacingTop,
        spacingBottom,
      });
    } else {
      await renderIndividualLayout({
        ctx,
        bImg,
        aImg,
        bCaption,
        aCaption,
        drawW,
        boxX,
        bAspect,
        aAspect,
        capSize,
        capColor,
        capGap,
        spacingTop,
        spacingBottom,
        alignment,
      });
    }

    rendered = true;
  } catch (err) {
    if (!rendered) {
      handleImageError(
        ctx,
        `[Image compare could not be rendered]`,
        spacingTop,
        spacingBottom,
      );
    }
    console.error("addImageCompare error:", err);
  }
}

/* ----------------------------- layout renderers ----------------------------- */

interface SliderLayoutParams {
  ctx: RenderContext;
  bImg: any;
  aImg: any;
  bCaption: string;
  aCaption: string;
  data: ImageCompareData;
  drawW: number;
  boxX: number;
  bAspect: number;
  aAspect: number;
  capSize: number;
  capColor: any;
  capGap: number;
  spacingTop: number;
  spacingBottom: number;
}

async function renderSliderLayout(params: SliderLayoutParams): Promise<void> {
  const {
    ctx,
    bImg,
    aImg,
    bCaption,
    aCaption,
    data,
    drawW,
    boxX,
    bAspect,
    aAspect,
    capSize,
    capColor,
    capGap,
    spacingTop,
    spacingBottom,
  } = params;

  // slider split
  const splitPct = clampPercent((data as any).percentage);
  const splitW = (drawW * splitPct) / 100;

  // combined caption
  const combinedParts = [bCaption];
  if (data.showPercentage) combinedParts.push(`${splitPct}%`);
  combinedParts.push(aCaption);
  const combinedCaption = combinedParts.join("  |  ");

  const combinedCapH = combinedCaption
    ? measureCaptionHeight(ctx, combinedCaption, capSize, drawW)
    : 0;

  const drawH = Math.max(drawW * bAspect, drawW * aAspect);
  const totalH =
    spacingTop +
    drawH +
    (combinedCaption ? capGap + combinedCapH : 0) +
    spacingBottom;

  ctx.canvas.ensureBlock({ minHeight: totalH, keepTogether: true });
  ctx.canvas.moveY(spacingTop);

  const yTop = ctx.canvas.cursorY;

  // Draw before image (full)
  ctx.canvas.cursorY = yTop;
  ctx.canvas.drawImage(bImg, { x: boxX, width: drawW, height: drawH });

  // Draw after image (clipped)
  try {
    ctx.canvas.cursorY = yTop;
    ctx.canvas.withClipRect(
      { x: boxX + splitW, yTop, width: drawW - splitW, height: drawH },
      () => {
        ctx.canvas.drawImage(aImg, {
          x: boxX,
          width: drawW,
          height: drawH,
        });
      },
    );
  } catch {
    ctx.canvas.cursorY = yTop;
    ctx.canvas.drawImage(aImg, { x: boxX, width: drawW, height: drawH });
  }

  // Draw divider
  if ((Config as any).DRAW?.imageCompareDivider !== false) {
    const dividerX = boxX + splitW;
    ctx.canvas.withRegion(
      { x: dividerX, y: yTop, width: 0, height: drawH },
      () => {
        try {
          ctx.canvas.cursorY = yTop;
          ctx.canvas.drawRule({
            orientation: "vertical",
            length: drawH,
            thickness: 1,
            color: capColor,
            spacingBefore: 0,
            spacingAfter: 0,
            align: "left",
            inline: true,
          } as any);
        } catch {
          try {
            ctx.canvas.cursorY = yTop;
            ctx.canvas.drawBox(1, drawH, { fillColor: capColor } as any);
          } catch {
            /* no-op */
          }
        }
      },
    );
  }

  ctx.canvas.cursorY = yTop + drawH;

  if (combinedCaption) {
    ctx.canvas.moveY(capGap);
    drawCenteredCaption({
      ctx,
      text: combinedCaption,
      boxX,
      boxW: drawW,
      size: capSize,
      color: capColor,
    });
  }

  ctx.canvas.moveY(spacingBottom);
}

interface IndividualLayoutParams {
  ctx: RenderContext;
  bImg: any;
  aImg: any;
  bCaption: string;
  aCaption: string;
  drawW: number;
  boxX: number;
  bAspect: number;
  aAspect: number;
  capSize: number;
  capColor: any;
  capGap: number;
  spacingTop: number;
  spacingBottom: number;
  alignment: "left" | "center" | "right";
}

async function renderIndividualLayout(
  params: IndividualLayoutParams,
): Promise<void> {
  const {
    ctx,
    bImg,
    aImg,
    bCaption,
    aCaption,
    drawW,
    boxX,
    bAspect,
    aAspect,
    capSize,
    capColor,
    capGap,
    spacingTop,
    spacingBottom,
    alignment,
  } = params;

  const imagesGap = Config.SPACING?.small ?? 12;
  const halfW = Math.max(1, Math.floor((drawW - imagesGap) / 2));

  const bH = Math.round(halfW * bAspect);
  const aH = Math.round(halfW * aAspect);

  const bCapH = bCaption
    ? measureCaptionHeight(ctx, bCaption, capSize, halfW)
    : 0;
  const aCapH = aCaption
    ? measureCaptionHeight(ctx, aCaption, capSize, halfW)
    : 0;

  const bTotal = bH + (bCaption ? capGap + bCapH : 0);
  const aTotal = aH + (aCaption ? capGap + aCapH : 0);
  const pairH = Math.max(bTotal, aTotal);

  const totalH = spacingTop + pairH + spacingBottom;

  const leftX =
    alignment === "left"
      ? boxX
      : alignment === "center"
        ? boxX
        : boxX + (drawW - (2 * halfW + imagesGap));
  const rightX = leftX + halfW + imagesGap;
  const yTop = ctx.canvas.cursorY;

  ctx.canvas.ensureBlock({ minHeight: totalH, keepTogether: true });
  ctx.canvas.moveY(spacingTop);

  // left image
  ctx.canvas.withRegion(
    { x: leftX, y: yTop, width: halfW, height: pairH },
    () => {
      ctx.canvas.cursorY = yTop;
      ctx.canvas.drawImage(bImg, { x: leftX, width: halfW, height: bH });
      if (bCaption) {
        ctx.canvas.cursorY = yTop + bH;
        ctx.canvas.moveY(capGap);
        drawCenteredCaption({
          ctx,
          text: bCaption,
          boxX: leftX,
          boxW: halfW,
          size: capSize,
          color: capColor,
        });
      }
    },
  );

  // right image
  ctx.canvas.withRegion(
    { x: rightX, y: yTop, width: halfW, height: pairH },
    () => {
      ctx.canvas.cursorY = yTop;
      ctx.canvas.drawImage(aImg, { x: rightX, width: halfW, height: aH });
      if (aCaption) {
        ctx.canvas.cursorY = yTop + aH;
        ctx.canvas.moveY(capGap);
        drawCenteredCaption({
          ctx,
          text: aCaption,
          boxX: rightX,
          boxW: halfW,
          size: capSize,
          color: capColor,
        });
      }
    },
  );

  ctx.canvas.cursorY = yTop + pairH;
  ctx.canvas.moveY(spacingBottom);
}

/* ----------------------------- single image fallback ----------------------------- */

async function addSingle(
  ctx: RenderContext,
  img: BaseImage,
  alignment: "left" | "center" | "right",
  scale: number,
) {
  const spacingTop = Config.SPACING?.medium ?? 12;
  const spacingBottom = Config.SPACING?.medium ?? 12;
  const contentW = ctx.canvas.contentWidth;
  const contentLeft = ctx.canvas.contentLeft;
  const drawW = Math.max(1, Math.min(contentW, Math.round(contentW * scale)));

  try {
    const pdfImg = await embedImageFromFile(
      ctx,
      resolveImagePath(img.src!, ctx.fsDataPath),
    );
    const { drawH } = getImageDimensions(pdfImg, contentW, scale);
    const boxX = getImageBoxPosition(contentLeft, contentW, drawW, alignment);

    const caption = (img.alt ?? "").trim();
    const capSize = Config.FONT_SIZES.alternative ?? 10;
    const capColor = Config.COLORS.alternativeText ?? Config.COLORS.text;
    const capGap = caption ? 6 : 0;

    const capH = measureCaptionHeight(ctx, caption, capSize, drawW);
    const totalH = spacingTop + drawH + capGap + capH + spacingBottom;

    ctx.canvas.ensureBlock({ minHeight: totalH, keepTogether: true });
    ctx.canvas.moveY(spacingTop);

    ctx.canvas.drawImage(pdfImg, {
      x: boxX,
      width: drawW,
      height: undefined,
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
  } catch (e) {
    handleImageError(
      ctx,
      `[Image could not be embedded: ${img.src}]`,
      spacingTop,
      spacingBottom,
    );
    console.error("addSingle image error:", e);
  }
}
