// src/generators/pdf-generator/blocks/addImage.ts
import * as fs from "node:fs/promises";
import * as path from "node:path";
import appRoot from "app-root-path";
import type { RenderContext } from "../types/RenderContext";
import type { ImageData } from "../../../layouts/blocks/types";
import { Config } from "../../../configs/pdf-config";

/* ------------------------------ helpers ---------------------------------- */

function clampScale(scale?: number): number {
  if (typeof scale !== "number" || !Number.isFinite(scale)) return 1;
  return Math.min(Math.max(scale, 0.1), 1);
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
  if (isHttpUrl(src)) {
    throw new Error("Remote URLs are not supported in PDF generation.");
  }
  let s = src.replace(/\\/g, "/");
  if (s.startsWith("/")) s = s.slice(1); // keep path.join from discarding the root
  const dataRootAbs = getFsDataPathSync();
  return path.join(dataRootAbs, s);
}

async function embedImageFromFile(ctx: RenderContext, absPath: string) {
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

/* --------------------------------- API ----------------------------------- */

export async function addImage(ctx: RenderContext, data: ImageData): Promise<void> {
  const image = data.image;
  if (!image?.src) return;                    // ← narrow once
  const src = image.src;

  const alignment: "left" | "center" | "right" =
    (data.alignment as any) ?? "center";
  const scale = clampScale(data.scale);

  const spacingTop = Config.SPACING.medium;
  const spacingBottom = Config.SPACING.medium;

  try {
    const absPath = resolveImagePath(src);
    const pdfImg = await embedImageFromFile(ctx, absPath);

    const contentW = ctx.canvas.contentWidth;
    const drawW = Math.max(1, Math.min(contentW, Math.round(contentW * scale)));

    const aspect = (pdfImg as any).height / (pdfImg as any).width;
    const drawH = drawW * aspect;

    const caption = (image.alt ?? "").trim(); // ← use `image`, not `data.image`
    const capSize = Config.FONT_SIZES.alternative ?? 10;
    const capColor = Config.COLORS.alternativeText ?? Config.COLORS.text;
    const capGap = caption ? 6 : 0;

    let capH = 0;
    if (caption) {
      const m = ctx.canvas.measureAndWrap(caption, {
        font: ctx.fonts.regular,
        size: capSize,
        maxWidth: drawW,
        lineHeight: 1 + 2 / capSize,
      });
      capH = m.totalHeight;
    }

    ctx.canvas.ensureBlock({
      minHeight: spacingTop + drawH + capGap + capH + spacingBottom,
      keepTogether: true,
    });

    ctx.canvas.moveY(spacingTop);

    ctx.canvas.drawImage(pdfImg as any, {
      width: drawW,
      height: undefined, // preserve aspect
      align: alignment,
    });

    if (caption) {
      ctx.canvas.moveY(capGap);
      ctx.canvas.drawText(caption, {
        font: ctx.fonts.regular,
        size: capSize,
        color: capColor,
        align: alignment === "center" ? "center" : "left",
        maxWidth: drawW,
        spacingBefore: 0,
        spacingAfter: 0,
        lineHeight: 1 + 2 / capSize,
      });
    }

    ctx.canvas.moveY(spacingBottom);
  } catch (err) {
    const msg = `[Image could not be embedded: ${src}]`;
    ctx.canvas.drawText(msg, {
      font: ctx.fonts.mono ?? ctx.fonts.regular,
      size: Config.FONT_SIZES.body,
      color: Config.COLORS.text,
      align: "left",
      maxWidth: ctx.canvas.contentWidth,
      spacingBefore: spacingTop,
      spacingAfter: spacingBottom,
    });
  }
}
