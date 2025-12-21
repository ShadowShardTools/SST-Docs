// src/generators/pdf-generator/blocks/imageUtils.ts
import * as fs from "node:fs/promises";
import * as path from "node:path";
import type { RenderContext } from "../../types/RenderContext";
import { Config } from "../../pdf-config";
import type { RGB } from "pdf-lib";
import { clamp } from ".";
import type { BaseImage } from "@shadow-shard-tools/docs-core/types/BaseImage";

/* ------------------------------ shared helpers ---------------------------------- */
export function clampScale(scale?: number): number {
  if (typeof scale !== "number" || !Number.isFinite(scale)) return 1;
  return clamp(scale, 0.1, 1);
}

export function clampPercent(p?: number): number {
  if (typeof p !== "number" || !Number.isFinite(p)) return 50;
  return Math.min(100, Math.max(0, Math.round(p)));
}

function isHttpUrl(p: string) {
  return /^https?:\/\//i.test(p);
}

export function resolveImagePath(src: string, fsDataPath: string): string {
  if (isHttpUrl(src))
    throw new Error("Remote URLs are not supported in PDF generation.");

  let s = src.replace(/\\/g, "/");

  // If the source starts with /SST-Docs/data/, resolve it directly against the parent of fsDataPath
  if (s.startsWith("/SST-Docs/data/")) {
    // fsDataPath should end with "SST-Docs/data", so go to its parent (public) and append the full path
    const publicDir = fsDataPath.replace(/[\\\/]SST-Docs[\\\/]data$/, "");
    const resolvedPath = path.join(publicDir, s.substring(1)); // Remove leading /
    return resolvedPath;
  }

  // For other paths starting with /SST-Docs/
  if (s.startsWith("/SST-Docs/")) {
    const publicDir = fsDataPath.replace(/[\\\/]SST-Docs[\\\/]data$/, "");
    const resolvedPath = path.join(publicDir, s.substring(1)); // Remove leading /
    return resolvedPath;
  }

  // For relative paths, resolve against public directory
  if (s.startsWith("/")) s = s.slice(1);
  const publicDir = fsDataPath.replace(/[\\\/]SST-Docs[\\\/]data$/, "");
  const resolvedPath = path.join(publicDir, s);

  return resolvedPath;
}

export async function embedImageFromFile(ctx: RenderContext, absPath: string) {
  const buf = await fs.readFile(absPath);
  const ext = path.extname(absPath).toLowerCase();

  if (ext === ".png") return ctx.doc.embedPng(buf);
  if (ext === ".jpg" || ext === ".jpeg") return ctx.doc.embedJpg(buf);

  // Auto-detect by magic
  if (buf.length > 8 && buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e)
    return ctx.doc.embedPng(buf);
  if (buf.length > 2 && buf[0] === 0xff && buf[1] === 0xd8)
    return ctx.doc.embedJpg(buf);

  throw new Error(`Unsupported image format: ${absPath}. Use PNG or JPG.`);
}

export function getCaption(
  img: BaseImage | undefined,
  fallback: string = "",
): string {
  const t = (img?.alt ?? "").trim();
  return t || fallback;
}

export function getImageDimensions(
  pdfImg: any,
  contentWidth: number,
  scale: number,
): { drawW: number; drawH: number; aspect: number } {
  const drawW = Math.max(
    1,
    Math.min(contentWidth, Math.round(contentWidth * scale)),
  );
  const aspect = pdfImg.height / pdfImg.width;
  const drawH = drawW * aspect;
  return { drawW, drawH, aspect };
}

export function getImageBoxPosition(
  contentLeft: number,
  contentWidth: number,
  drawW: number,
  alignment: "left" | "center" | "right",
): number {
  switch (alignment) {
    case "left":
      return contentLeft;
    case "center":
      return contentLeft + (contentWidth - drawW) / 2;
    case "right":
      return contentLeft + (contentWidth - drawW);
    default:
      return contentLeft;
  }
}

export function measureCaptionHeight(
  ctx: RenderContext,
  text: string,
  size: number,
  width: number,
): number {
  if (!text) return 0;
  return ctx.canvas.measureAndWrap(text, {
    font: ctx.fonts.regular,
    size,
    maxWidth: width,
    lineHeight: 1 + 2 / size,
  }).totalHeight;
}

export function drawCenteredCaption(opts: {
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

export function handleImageError(
  ctx: RenderContext,
  errorMessage: string,
  spacingTop: number,
  spacingBottom: number,
) {
  ctx.canvas.drawText(errorMessage, {
    font: ctx.fonts.mono ?? ctx.fonts.regular,
    size: Config.FONT_SIZES.body,
    color: Config.COLORS.text,
    align: "left",
    maxWidth: ctx.canvas.contentWidth,
    spacingBefore: spacingTop,
    spacingAfter: spacingBottom,
  });
}

export interface ImageLayoutConfig {
  spacingTop: number;
  spacingBottom: number;
  captionSize: number;
  captionColor: RGB;
  captionGap: number;
}
