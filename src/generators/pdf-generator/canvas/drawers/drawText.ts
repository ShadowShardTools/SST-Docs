/* --------------------------------------------------------------------------
 * Text drawing and measurement utilities for PdfCanvas
 * -------------------------------------------------------------------------- */

import { rgb, type PDFPage, type PDFFont } from "pdf-lib";
import type { ParagraphOptions, TextDrawingContext } from "./types";

type WidthCache = Map<string, number>;
const tokenWidthCache = new WeakMap<object, Map<number, WidthCache>>();

function getWidthCache(font: object, size: number): WidthCache {
  let bySize = tokenWidthCache.get(font);
  if (!bySize) {
    bySize = new Map<number, WidthCache>();
    tokenWidthCache.set(font, bySize);
  }
  let byToken = bySize.get(size);
  if (!byToken) {
    byToken = new Map<string, number>();
    bySize.set(size, byToken);
  }
  return byToken;
}

type WidthMeasurableFont = { widthOfTextAtSize: (s: string, n: number) => number };

export function measureToken(font: WidthMeasurableFont, size: number, token: string): number {
  const cache = getWidthCache(font as object, size);

  const cached = cache.get(token);
  if (cached !== undefined) return cached;

  const val = font.widthOfTextAtSize(token, size);
  cache.set(token, val);
  return val;
}

function splitWithNewlines(text: string): string[] {
  // Preserve NBSP, split on explicit \n while keeping delimiters as tokens
  // Then within each line, split into words + spaces.
  const lines = text.replace(/\r\n?/g, "\n").split("\n");
  const out: string[] = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    // push words and spaces as separate tokens
    const parts = line.split(/(\s+)/);
    for (const p of parts) if (p.length) out.push(p);
    if (i < lines.length - 1) out.push("\n"); // mark hard break
  }
  return out;
}

function drawJustifiedLine(
  page: PDFPage,
  font: PDFFont,
  size: number,
  color: ReturnType<typeof rgb>,
  xStart: number,
  yBasePdf: number,
  maxWidth: number,
  line: string
) {
  const words = line.split(/\s+/).filter(Boolean);
  if (words.length === 0) return;

  // Width without spaces
  const baseWidth = font.widthOfTextAtSize(words.join(" "), size);
  const gaps = Math.max(1, words.length - 1);
  const extraPerGap = gaps > 0 ? (maxWidth - baseWidth) / gaps : 0;

  let x = xStart;
  for (let i = 0; i < words.length; i++) {
    const w = words[i];
    const wWidth = font.widthOfTextAtSize(w, size);

    page.drawText(w, { x, y: yBasePdf, font, size, color });

    // advance by word width + one "gap": (space width + extra)
    if (i < words.length - 1) {
      const spaceWidth = font.widthOfTextAtSize(" ", size);
      x += wWidth + spaceWidth + extraPerGap;
    }
  }
}

/**
 * Improved text wrapping with better newline handling and caching
 */
export function measureAndWrap(
  context: TextDrawingContext,
  text: string,
  opts?: ParagraphOptions,
): { lines: string[]; lineHeightPx: number; totalHeight: number } {
  const font = opts?.font ?? context.fonts.regular;
  const size = opts?.size ?? 12;
  const lineH = (opts?.lineHeight ?? 1.4) * size;
  const maxWidth = Math.max(0, opts?.maxWidth ?? context.contentWidth);

  const tokens = splitWithNewlines(text);
  const lines: string[] = [];
  let current = "";
  let currentW = 0;

  const flush = () => {
    lines.push(current.trimEnd());
    current = "";
    currentW = 0;
  };

  const softBreakToken = (tok: string) => {
    // For super-long tokens (no spaces), break by grapheme clusters
    // (simple fallback: slice chars) to avoid infinite overflow
    for (let i = 0; i < tok.length; i++) {
      const ch = tok[i];
      const w = measureToken(font, size, ch);
      if (currentW + w > maxWidth && current.length > 0) flush();
      current += ch;
      currentW += w;
    }
  };

  for (const tok of tokens) {
    if (tok === "\n") { flush(); continue; }

    const isSpace = /\s+/.test(tok);
    const tokW = measureToken(font, size, tok);

    if (tokW <= maxWidth - currentW || current.length === 0) {
      // append
      current += tok;
      currentW += tokW;
    } else {
      // would overflow
      if (!isSpace && tok.length > 1) {
        // attempt soft breaking inside this token
        if (current.length > 0) flush();
        softBreakToken(tok);
      } else {
        flush();
        if (!isSpace) { current = tok; currentW = tokW; }
      }
    }
  }
  if (current) flush();

  const totalHeight = lines.length * lineH;
  return { lines, lineHeightPx: lineH, totalHeight };
}

/** Orphan/widow control for paragraphs */
function ensureOrphanControl(
  context: TextDrawingContext,
  lines: number,
  lineHeight: number,
  bottom: number,
  minKeep = 2
) {
  const needed = lines * lineHeight;
  const room = bottom - context.cursorY;
  if (room >= needed) return; // all fits
  // If only 1 line would fit, push to new page
  const linesFit = Math.floor(room / lineHeight);
  if (linesFit < minKeep) context.addPage();
}

/**
 * Draw a paragraph with orphan/widow control and advance the cursor. Returns height + lines.
 */
export function drawText(
  context: TextDrawingContext,
  text: string,
  bottom: number,
  options?: ParagraphOptions
): { height: number; lines: string[] } {
  const font = options?.font ?? context.fonts.regular;
  const size = options?.size ?? 12;
  const color = options?.color ?? rgb(0.22, 0.25, 0.32); // gray-700 default
  const align = options?.align ?? "left";
  const indent = options?.indent ?? 0;
  const spacingBefore = options?.spacingBefore ?? 0;
  const spacingAfter = options?.spacingAfter ?? 8;
  const maxWidth = options?.maxWidth ?? context.contentWidth;

  const { lines, lineHeightPx, totalHeight } = measureAndWrap(context, text, {
    ...options,
    maxWidth,
  });

  // Orphan/widow + spacing
  ensureOrphanControl(context, lines.length, lineHeightPx, bottom, 2);
  context.ensureSpace({ minHeight: spacingBefore + totalHeight + spacingAfter });
  context.moveY(spacingBefore);

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    let x = context.contentLeft;
    const yBasePdf = context.toPdfY(context.cursorY + size);

    let dx = 0;
    if (i === 0 && indent) dx += indent;

    const lineWidth = font.widthOfTextAtSize(line, size);

    if (align === "center") {
      x = context.contentLeft + (maxWidth - lineWidth) / 2;
    } else if (align === "right") {
      x = context.contentLeft + (maxWidth - lineWidth);
    }

    const isLast = i === lines.length - 1;
    if (align === "justify" && !isLast) {
      // Draw justified line by manual positioning
      drawJustifiedLine(context.page, font, size, color, x + dx, yBasePdf, maxWidth, line);
    } else {
      // Normal draw (left/center/right or last line)
      context.page.drawText(line, {
        x: x + dx,
        y: yBasePdf,
        font,
        size,
        color,
        maxWidth,
      });
    }

    context.moveY(lineHeightPx);
  }

  context.moveY(spacingAfter);

  return { height: totalHeight + spacingBefore + spacingAfter, lines };
}