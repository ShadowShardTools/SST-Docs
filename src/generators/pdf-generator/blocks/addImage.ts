/*import { rgb, type PDFImage } from "pdf-lib";
import type { RenderContext } from "../../../generators/pdf-generator/types/RenderContext";
import type { ImageData } from "../../../layouts/blocks/types";
import { Config } from "../../../configs/pdf-config";
import type { BaseImage, CarouselImage } from "../../../layouts/blocks/types/ImageData";

export async function addImage(ctx: RenderContext, imageData: ImageData): Promise<void> {
  const align = imageData.alignment ?? "center";
  const scale = clampScale(imageData.scale);

  switch (imageData.type) {
    case "single":
      if (imageData.image) await drawSingle(ctx, imageData.image, align, scale);
      break;
    case "compare":
      if (imageData.beforeImage && imageData.afterImage) await drawCompare(ctx, imageData.beforeImage, imageData.afterImage, align, scale);
      break;
    case "slider":
      if (imageData.beforeImage && imageData.afterImage) await drawSliderSideBySide(ctx, imageData, align, scale);
      break;
    case "carousel":
      if (imageData.images?.length) await drawCarousel(ctx, imageData.images, align, scale);
      break;
    case "grid":
      if (imageData.images?.length) await drawGrid(ctx, imageData.images, align, scale);
      break;
  }
}

function clampScale(s?: number) { return s == null || Number.isNaN(s) ? 1 : Math.max(0.2, Math.min(1, s)); }

function contentBox(ctx: RenderContext, scale: number) {
  const pageW = (ctx.canvas as any).pageWidth ?? Config.PAGE.width;
  const margin = (ctx.canvas as any).margin ?? Config.MARGIN;
  const maxW = pageW - 2 * margin;
  return { x: margin, y: (ctx.canvas as any).getY?.() ?? Config.MARGIN, w: maxW * scale };
}

function xForAlign(totalW: number, boxX: number, boxW: number, align: "left" | "center" | "right") {
  if (align === "left") return boxX;
  if (align === "right") return boxX + (boxW - totalW);
  return boxX + (boxW - totalW) / 2;
}

async function drawCaption(ctx: RenderContext, text?: string, width?: number, align: "left" | "center" | "right" = "center") {
  if (!text?.trim()) return;
  const anyCanvas = ctx.canvas as any;
  anyCanvas.setY?.((anyCanvas.getY?.() ?? 0) + 6);
  anyCanvas.drawTextBlock?.({
    text,
    x: anyCanvas.margin ?? Config.MARGIN,
    width: width ?? ((anyCanvas.pageWidth ?? Config.PAGE.width) - 2 * (anyCanvas.margin ?? Config.MARGIN)),
    font: ctx.fonts.italic ?? ctx.fonts.regular,
    size: Config.FONT_SIZES?.body ?? 10,
    color: Config.COLORS?.text ?? rgb(0, 0, 0),
    align,
    lineGap: 2,
    advanceCursor: true,
  });
}

async function drawSingle(ctx: RenderContext, img: BaseImage, align: "left" | "center" | "right", scale: number) {
  const box = contentBox(ctx, scale);
  const pdfImg = await loadImage(ctx, img.src);
  const { w, h } = fitWithin(pdfImg, box.w, (ctx.canvas as any).pageHeight ? ((ctx.canvas as any).pageHeight - box.y - Config.MARGIN) : undefined);
  ensureSpace(ctx, h);
  drawPDFImage(ctx, pdfImg, xForAlign(w, box.x, box.w, align), (ctx.canvas as any).getY?.(), w, h);
  await drawCaption(ctx, img.alt, box.w, align);
}

async function drawCompare(ctx: RenderContext, before: BaseImage, after: BaseImage, align: "left" | "center" | "right", scale: number) {
  const gap = 12, box = contentBox(ctx, scale);
  const [leftImg, rightImg] = await Promise.all([loadImage(ctx, before.src), loadImage(ctx, after.src)]);
  const halfW = (box.w - gap) / 2;
  const leftSize = fitWithin(leftImg, halfW), rightSize = fitWithin(rightImg, halfW);
  const rowH = Math.max(leftSize.h, rightSize.h);
  ensureSpace(ctx, rowH);
  const startX = xForAlign(leftSize.w + rightSize.w + gap, box.x, box.w, align);
  const y = (ctx.canvas as any).getY?.();
  drawPDFImage(ctx, leftImg, startX, y, leftSize.w, rowH);
  drawPDFImage(ctx, rightImg, startX + leftSize.w + gap, y, rightSize.w, rowH);
  await drawCaption(ctx, [before.alt, after.alt].filter(Boolean).join("  |  ") || undefined, box.w, align);
}

async function drawSliderSideBySide(ctx: RenderContext, data: ImageData, align: "left" | "center" | "right", scale: number) {
  const perc = 0.5, gap = 8, box = contentBox(ctx, scale);
  const [leftImg, rightImg] = await Promise.all([loadImage(ctx, data.beforeImage!.src), loadImage(ctx, data.afterImage!.src)]);
  const halfW = (box.w - gap) / 2;
  const leftSize = fitWithin(leftImg, halfW), rightSize = fitWithin(rightImg, halfW);
  const rowH = Math.max(leftSize.h, rightSize.h);
  ensureSpace(ctx, rowH + 16);
  const startX = xForAlign(leftSize.w + rightSize.w + gap, box.x, box.w, align);
  const y = (ctx.canvas as any).getY?.();
  drawPDFImage(ctx, leftImg, startX, y, leftSize.w, rowH);
  (ctx.canvas as any).drawLine?.({ x1: startX + leftSize.w + gap / 2, y1: y, x2: startX + leftSize.w + gap / 2, y2: y + rowH, color: Config.COLORS?.divider ?? rgb(0.8, 0.8, 0.8), width: 1 });
  drawPDFImage(ctx, rightImg, startX + leftSize.w + gap, y, rightSize.w, rowH);
  if (data.showPercentage && (data.beforeImage?.alt || data.afterImage?.alt)) {
    const leftLabel = data.beforeImage?.alt ? `${Math.round(perc * 100)}% ${data.beforeImage.alt}` : undefined;
    const rightLabel = data.afterImage?.alt ? `${Math.round((1 - perc) * 100)}% ${data.afterImage.alt}` : undefined;
    await drawCaption(ctx, [leftLabel, rightLabel].filter(Boolean).join(" / ") || undefined, box.w, align);
  }
}

async function drawCarousel(ctx: RenderContext, images: CarouselImage[], align: "left" | "center" | "right", scale: number) {
  for (let i = 0; i < images.length; i++) {
    if (i > 0) (ctx.canvas as any).addPage?.();
    await drawSingle(ctx, images[i]!, align, scale);
  }
}

async function drawGrid(ctx: RenderContext, images: CarouselImage[], align: "left" | "center" | "right", scale: number) {
  const box = contentBox(ctx, scale), gap = 10, cols = box.w >= 440 ? 3 : 2, cellW = (box.w - gap * (cols - 1)) / cols;
  let x = 0, y = 0, rowH = 0;
  for (let i = 0; i < images.length; i++) {
    const pdfImg = await loadImage(ctx, images[i]!.src);
    const size = fitWithin(pdfImg, cellW);
    if (i % cols === 0) {
      if (i > 0) {
        ensureSpace(ctx, rowH + gap);
        (ctx.canvas as any).setY?.(((ctx.canvas as any).getY?.() ?? 0) + rowH + gap);
      } else ensureSpace(ctx, size.h);
      x = 0; y = (ctx.canvas as any).getY?.() ?? 0; rowH = 0;
    }
    const drawX = xForAlign(cols * cellW + (cols - 1) * gap, box.x, box.w, align) + x;
    drawPDFImage(ctx, pdfImg, drawX, y, size.w, size.h);
    rowH = Math.max(rowH, size.h);
    x += cellW + gap;
  }
  (ctx.canvas as any).setY?.(((ctx.canvas as any).getY?.() ?? 0) + rowH);
}

function fitWithin(img: PDFImage, maxW?: number, maxH?: number) {
  let w = img.width, h = img.height;
  if (maxW != null && w > maxW) { const k = maxW / w; w = maxW; h *= k; }
  if (maxH != null && h > maxH) { const k = maxH / h; h = maxH; w *= k; }
  return { w, h };
}
function ensureSpace(ctx: RenderContext, needed: number) {
  const anyCanvas = ctx.canvas as any;
  if (typeof anyCanvas.ensureSpace === "function") anyCanvas.ensureSpace(needed);
  else if (typeof anyCanvas.addPage === "function") {
    const y = anyCanvas.getY?.() ?? 0, pageH = anyCanvas.pageHeight ?? Config.PAGE.height;
    if (y + needed > pageH - (anyCanvas.margin ?? Config.MARGIN)) anyCanvas.addPage();
  }
}
function drawPDFImage(ctx: RenderContext, img: PDFImage, x: number, y: number, w: number, h: number) {
  const anyCanvas = ctx.canvas as any;
  if (typeof anyCanvas.drawImage === "function") anyCanvas.drawImage({ image: img, x, y, width: w, height: h });
  else {
    const page = (anyCanvas.page ?? (anyCanvas.getPage?.() ?? (ctx as any).page));
    page.drawImage(img, { x, y: page.getHeight() - y - h, width: w, height: h });
  }
}
*/
