// src/generators/pdf-generator/blocks/addImageCompare.ts
import * as fs from "node:fs/promises";
import * as path from "node:path";
import appRoot from "app-root-path";
import type { RenderContext } from "../../types/RenderContext";
import { Config } from "../../../../configs/pdf-config";
import type { BaseImage } from "../../../../layouts/blocks/types/BaseImage";
import type { ImageCompareData } from "../../../../layouts/blocks/types";
import { type RGB } from "pdf-lib";

/* ------------------------------ helpers ---------------------------------- */

function clampScale(scale?: number): number {
  if (typeof scale !== "number" || !Number.isFinite(scale)) return 1;
  return Math.min(Math.max(scale, 0.1), 1);
}
function clampPercent(p?: number): number {
  if (typeof p !== "number" || !Number.isFinite(p)) return 50;
  return Math.min(100, Math.max(0, Math.round(p)));
}
function isHttpUrl(p: string) {
  return /^https?:\/\//i.test(p);
}
function toAbs(raw: string): string {
  const cleaned = String(raw).replace(/\\/g, "/").replace(/\/+$/, "");
  return path.isAbsolute(cleaned)
    ? cleaned
    : path.resolve(cleaned.replace(/^\.\//, ""));
}
function getFsDataPathSync(): string {
  return toAbs(path.join(appRoot.path, "public"));
}
function resolveImagePath(src: string): string {
  if (isHttpUrl(src))
    throw new Error("Remote URLs are not supported in PDF generation.");
  let s = src.replace(/\\/g, "/");
  if (s.startsWith("/")) s = s.slice(1);
  return path.join(getFsDataPathSync(), s);
}
async function embedImageFromFile(ctx: RenderContext, absPath: string) {
  const buf = await fs.readFile(absPath);
  const ext = path.extname(absPath).toLowerCase();
  if (ext === ".png") return ctx.doc.embedPng(buf);
  if (ext === ".jpg" || ext === ".jpeg") return ctx.doc.embedJpg(buf);
  if (buf.length > 8 && buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e)
    return ctx.doc.embedPng(buf);
  if (buf.length > 2 && buf[0] === 0xff && buf[1] === 0xd8)
    return ctx.doc.embedJpg(buf);
  throw new Error(`Unsupported image format: ${absPath}. Use PNG or JPG.`);
}
function getCaption(img: BaseImage | undefined, fallback: string) {
  const t = (img?.alt ?? "").trim();
  return t || fallback;
}

/* ---------------------------- caption drawing ---------------------------- */

function drawCaptionCenteredInBox(opts: {
  ctx: RenderContext;
  text: string;
  boxX: number;
  boxW: number;
  size: number;
  color: RGB;
}) {
  const { ctx, text, boxX, boxW, size, color } = opts;
  if (!text) return;
  const contentLeft = ctx.canvas.contentLeft;
  const indent = Math.max(0, Math.round(boxX - contentLeft));
  ctx.canvas.drawText(text, {
    font: ctx.fonts.regular,
    size,
    color,
    align: "center",
    maxWidth: boxW,
    indent,
    spacingBefore: 0,
    spacingAfter: 0,
    lineHeight: 1 + 2 / size,
  });
}

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
        embedImageFromFile(ctx, resolveImagePath(before!.src!)),
        embedImageFromFile(ctx, resolveImagePath(after!.src!)),
      ]);
    } catch {
      ctx.canvas.drawText(
        `[Image compare could not be rendered: load failed]`,
        {
          font: ctx.fonts.mono ?? ctx.fonts.regular,
          size: Config.FONT_SIZES.body,
          color: Config.COLORS.text,
          align: "left",
          maxWidth: ctx.canvas.contentWidth,
          spacingBefore: spacingTop,
          spacingAfter: spacingBottom,
        },
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

    // slider split
    const splitPct = clampPercent((data as any).percentage);
    const splitW = (drawW * splitPct) / 100;

    // combined caption
    const combinedParts = [bCaption];
    if (data.showPercentage) combinedParts.push(`${splitPct}%`);
    combinedParts.push(aCaption);
    const combinedCaption =
      type === "slider" ? combinedParts.join("  |  ") : "";

    const combinedCapH = combinedCaption
      ? ctx.canvas.measureAndWrap(combinedCaption, {
          font: ctx.fonts.regular,
          size: capSize,
          maxWidth: drawW,
          lineHeight: 1 + 2 / capSize,
        }).totalHeight
      : 0;

    // compute heights
    let totalH = 0;
    let drawH = 0;
    let halfW = 0,
      bH = 0,
      aH = 0,
      pairH = 0;

    if (type === "slider") {
      drawH = Math.max(drawW * bAspect, drawW * aAspect);
      totalH =
        spacingTop +
        drawH +
        (combinedCaption ? capGap + combinedCapH : 0) +
        spacingBottom;
    } else {
      const imagesGap = Config.SPACING?.small ?? 12;
      halfW = Math.max(1, Math.floor((drawW - imagesGap) / 2));

      bH = Math.round(halfW * bAspect);
      aH = Math.round(halfW * aAspect);

      const bCapH = bCaption ? captionHeight(ctx, bCaption, capSize, halfW) : 0;
      const aCapH = aCaption ? captionHeight(ctx, aCaption, capSize, halfW) : 0;

      const bTotal = bH + (bCaption ? capGap + bCapH : 0);
      const aTotal = aH + (aCaption ? capGap + aCapH : 0);
      pairH = Math.max(bTotal, aTotal);

      totalH = spacingTop + pairH + spacingBottom;
    }

    const boxX =
      alignment === "left"
        ? contentLeft
        : alignment === "center"
          ? contentLeft + (contentW - drawW) / 2
          : contentLeft + (contentW - drawW);

    ctx.canvas.ensureBlock({ minHeight: totalH, keepTogether: true });
    ctx.canvas.moveY(spacingTop);

    if (type === "slider") {
      /* original slider drawing block unchanged */
      const yTop = ctx.canvas.cursorY;

      ctx.canvas.cursorY = yTop;
      ctx.canvas.drawImage(bImg, { x: boxX, width: drawW, height: drawH });

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
        drawCaptionCenteredInBox({
          ctx,
          text: combinedCaption,
          boxX,
          boxW: drawW,
          size: capSize,
          color: capColor,
        });
      }
    } else {
      /* new horizontal layout */
      const imagesGap = Config.SPACING?.small ?? 12;
      const leftX =
        alignment === "left"
          ? boxX
          : alignment === "center"
            ? boxX
            : boxX + (drawW - (2 * halfW + imagesGap));
      const rightX = leftX + halfW + imagesGap;
      const yTop = ctx.canvas.cursorY;

      // left image
      ctx.canvas.withRegion(
        { x: leftX, y: yTop, width: halfW, height: pairH },
        () => {
          ctx.canvas.cursorY = yTop;
          ctx.canvas.drawImage(bImg, { x: leftX, width: halfW, height: bH });
          if (bCaption) {
            ctx.canvas.cursorY = yTop + bH;
            ctx.canvas.moveY(capGap);
            drawCaptionCenteredInBox({
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
            drawCaptionCenteredInBox({
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
    }

    ctx.canvas.moveY(spacingBottom);
    rendered = true;
  } catch (err) {
    if (!rendered) {
      ctx.canvas.drawText(`[Image compare could not be rendered]`, {
        font: ctx.fonts.mono ?? ctx.fonts.regular,
        size: Config.FONT_SIZES.body,
        color: Config.COLORS.text,
        align: "left",
        maxWidth: ctx.canvas.contentWidth,
        spacingBefore: Config.SPACING?.medium ?? 12,
        spacingAfter: Config.SPACING?.medium ?? 12,
      });
    }
    console.error("addImageCompare error:", err);
  }
}

/* ----------------------------- helpers ----------------------------------- */

function captionHeight(
  ctx: RenderContext,
  text: string,
  size: number,
  width: number,
) {
  if (!text) return 0;
  return ctx.canvas.measureAndWrap(text, {
    font: ctx.fonts.regular,
    size,
    maxWidth: width,
    lineHeight: 1 + 2 / size,
  }).totalHeight;
}

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
    const pdfImg = await embedImageFromFile(ctx, resolveImagePath(img.src!));
    const aspect = pdfImg.height / pdfImg.width;
    const drawH = drawW * aspect;

    const caption = (img.alt ?? "").trim();
    const capSize = Config.FONT_SIZES.alternative ?? 10;
    const capColor = Config.COLORS.alternativeText ?? Config.COLORS.text;
    const capGap = caption ? 6 : 0;

    let capH = 0;
    if (caption) {
      capH = captionHeight(ctx, caption, capSize, drawW);
    }

    const totalH =
      spacingTop + drawH + (caption ? capGap + capH : 0) + spacingBottom;

    const boxX =
      alignment === "left"
        ? contentLeft
        : alignment === "center"
          ? contentLeft + (contentW - drawW) / 2
          : contentLeft + (contentW - drawW);

    ctx.canvas.ensureBlock({ minHeight: totalH, keepTogether: true });
    ctx.canvas.moveY(spacingTop);

    ctx.canvas.drawImage(pdfImg, {
      x: boxX,
      width: drawW,
      height: undefined,
    });

    if (caption) {
      ctx.canvas.moveY(capGap);
      drawCaptionCenteredInBox({
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
    ctx.canvas.drawText(`[Image could not be embedded: ${img.src}]`, {
      font: ctx.fonts.mono ?? ctx.fonts.regular,
      size: Config.FONT_SIZES.body,
      color: Config.COLORS.text,
      align: "left",
      maxWidth: ctx.canvas.contentWidth,
      spacingBefore: spacingTop,
      spacingAfter: spacingBottom,
    });
    console.error("addSingle image error:", e);
  }
}
