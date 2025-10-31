import { rgb, type PDFPage, type PDFFont } from "pdf-lib";
import type { ParagraphOptions, TextDrawingContext } from "./types";
import {
  measureSpace,
  measureString,
  measureToken,
  type WidthMeasurableFont,
} from "../utilities";
/** Split text with newlines preserved - matches original PdfCanvas logic */
function splitWithNewlines(text: string): string[] {
  const lines = text.replace(/\r\n?/g, "\n").split("\n");
  const out: string[] = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const parts = line.split(/(\s+)/); // keep spaces as tokens
    for (const p of parts) if (p.length) out.push(p);
    if (i < lines.length - 1) out.push("\n"); // hard break token
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
  line: string,
) {
  const words = line.split(/\s+/).filter(Boolean);
  if (words.length === 0) return;

  const spaceW = measureSpace(font, size);
  const wordsWidth = words.reduce(
    (sum, w) => sum + measureString(font, size, w),
    0,
  );
  const gaps = Math.max(1, words.length - 1);
  const baseWidth = wordsWidth + gaps * spaceW; // width with single spaces
  const extraPerGap = gaps > 0 ? (maxWidth - baseWidth) / gaps : 0;

  let x = xStart;
  for (let i = 0; i < words.length; i++) {
    const w = words[i];
    const wWidth = measureString(font, size, w);

    page.drawText(w, { x, y: yBasePdf, font, size, color });

    if (i < words.length - 1) {
      x += wWidth + spaceW + extraPerGap;
    }
  }
}

/**
 * Text wrapping that matches the original PdfCanvas implementation
 */
export function measureAndWrap(
  context: TextDrawingContext,
  text: string,
  opts?: ParagraphOptions,
): { lines: string[]; lineHeightPx: number; totalHeight: number } {
  const font = (opts?.font ?? context.fonts.regular) as WidthMeasurableFont;
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
    // For super-long tokens (no spaces), break by characters
    for (let i = 0; i < tok.length; i++) {
      const ch = tok[i];
      const w = measureToken(font, size, ch);
      if (currentW + w > maxWidth && current.length > 0) flush();
      current += ch;
      currentW += w;
    }
  };

  for (const tok of tokens) {
    if (tok === "\n") {
      flush();
      continue;
    }

    const isSpace = /\s+/.test(tok);
    const tokW = measureToken(font, size, tok);

    if (tokW <= maxWidth - currentW || current.length === 0) {
      current += tok;
      currentW += tokW;
    } else {
      if (!isSpace && tok.length > 1) {
        if (current.length > 0) flush();
        softBreakToken(tok);
      } else {
        flush();
        if (!isSpace) {
          current = tok;
          currentW = tokW;
        }
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
  minKeep = 2,
) {
  const needed = lines * lineHeight;
  const room = bottom - context.cursorY;
  if (room >= needed) return;
  const linesFit = Math.floor(room / lineHeight);
  if (linesFit < minKeep) context.addPage();
}

/**
 * Draw a paragraph with orphan/widow control and advance the cursor.
 * Matches the original PdfCanvas.drawText behavior.
 */
export function drawText(
  context: TextDrawingContext,
  text: string,
  bottom: number,
  options?: ParagraphOptions,
): { height: number; lines: string[] } {
  const font = (options?.font ?? context.fonts.regular) as PDFFont;
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
  context.ensureSpace({
    minHeight: spacingBefore + totalHeight + spacingAfter,
  });
  context.moveY(spacingBefore);

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    let x = context.contentLeft;

    // Match original baseline logic
    const yBasePdf = context.toPdfY(context.cursorY + size);

    let dx = 0;
    if (i === 0 && indent) dx += indent;

    const lineWidth = measureString(font, size, line);

    if (align === "center") {
      x = context.contentLeft + (maxWidth - lineWidth) / 2;
    } else if (align === "right") {
      x = context.contentLeft + (maxWidth - lineWidth);
    }

    const isLast = i === lines.length - 1;
    if (align === "justify" && !isLast) {
      drawJustifiedLine(
        context.page,
        font,
        size,
        color,
        x + dx,
        yBasePdf,
        maxWidth,
        line,
      );
    } else {
      context.page.drawText(line, {
        x: x + dx,
        y: yBasePdf,
        font,
        size,
        color,
      });
    }

    context.moveY(lineHeightPx);
  }

  context.moveY(spacingAfter);

  return { height: totalHeight + spacingBefore + spacingAfter, lines };
}
