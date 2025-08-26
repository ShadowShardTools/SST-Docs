import { rgb } from "pdf-lib";
import { Config } from "../../../configs/pdf-config";
import type { RenderContext } from "../types/RenderContext";
import type { CodeData, CodeSection } from "../../../layouts/blocks/types";
import {
  CODE_LANGUAGE_CONFIG,
  type SupportedLanguage,
} from "../../../configs/code-languages-config";

/* ------------------------------- helpers ---------------------------------- */

const TAB_SIZE = 2;

/** Normalize text for code rendering */
function normalizeCode(src: string | undefined) {
  if (!src) return "";
  // keep trailing newline visually, but normalize CRLF and tabs
  return src.replace(/\r\n?/g, "\n").replace(/\t/g, " ".repeat(TAB_SIZE));
}

/** Split a single line into width-constrained chunks (hard wrap if needed). */
function wrapMonoLine(
  ctx: RenderContext,
  line: string,
  fontSize: number,
  maxWidth: number,
) {
  const font = ctx.fonts.mono;
  const chunks: string[] = [];
  let i = 0;
  while (i < line.length) {
    // fast path: binary search the longest slice that fits
    let lo = 1;
    let hi = line.length - i;
    let fit = 1;

    while (lo <= hi) {
      const mid = (lo + hi) >> 1;
      const slice = line.slice(i, i + mid);
      const w = font.widthOfTextAtSize(slice, fontSize);
      if (w <= maxWidth) {
        fit = mid;
        lo = mid + 1;
      } else {
        hi = mid - 1;
      }
    }

    // If even 1 char doesn't fit (super tiny width), force 1 char
    if (fit <= 0) fit = 1;

    chunks.push(line.slice(i, i + fit));
    i += fit;

    // If we broke in the middle of a long token and there’s still space
    // in the next iteration we keep slicing; no whitespace required.
  }
  return chunks;
}

/** Fully wrap content into lines respecting maxWidth; returns lines & height. */
function wrapCode(
  ctx: RenderContext,
  content: string,
  fontSize: number,
  maxWidth: number,
  lineHeight: number,
) {
  const rawLines = normalizeCode(content).split("\n");
  const out: string[] = [];

  for (const raw of rawLines) {
    if (raw === "") {
      out.push(""); // keep blank lines
      continue;
    }

    // First try a whitespace-based quick wrap via PdfCanvas measurement
    const m = ctx.canvas.measureAndWrap(raw, {
      font: ctx.fonts.mono,
      size: fontSize,
      maxWidth,
      lineHeight,
    });

    // measureAndWrap may fail to break very long tokens; guard with hard-wrap
    for (const soft of m.lines) {
      // If soft fits, accept; else hard-wrap this piece.
      const w = ctx.fonts.mono.widthOfTextAtSize(soft, fontSize);
      if (w <= maxWidth) {
        out.push(soft);
      } else {
        const hardChunks = wrapMonoLine(ctx, soft, fontSize, maxWidth);
        out.push(...hardChunks);
      }
    }
  }

  const lineHeightPx = lineHeight * fontSize;
  const totalHeight = out.length * lineHeightPx;
  return { lines: out, totalHeight, lineHeightPx };
}

/* --------------------------------- main ----------------------------------- */

export async function addCode(ctx: RenderContext, data: CodeData) {
  if ((!data.content || !data.content.trim()) && !data.sections?.length) return;

  // Normalize sections like the React version
  const sections: CodeSection[] = data.sections?.length
    ? data.sections.map(({ language, ...rest }) => ({
        language: CODE_LANGUAGE_CONFIG[language as SupportedLanguage]
          ? (language as SupportedLanguage)
          : "plaintext",
        ...rest,
      }))
    : [
        {
          language: CODE_LANGUAGE_CONFIG[data.language as SupportedLanguage]
            ? (data.language as SupportedLanguage)
            : "plaintext",
          content: data.content || "",
          filename: data.name,
        },
      ];

  const width = ctx.canvas.contentWidth;
  const left = ctx.canvas.contentLeft;

  const mono = ctx.fonts.mono;
  const labelFont = ctx.fonts.bold;

  const paddingX = 10;
  const paddingY = 10;
  const gapBetweenSections = 10;

  const codeFontSize = Config.FONT_SIZES.code;
  const labelFontSize = Config.FONT_SIZES.codeLabel;

  const labelColor = rgb(0.424, 0.459, 0.49);
  const codeColor = rgb(0.129, 0.145, 0.161);

  const bg = Config.COLORS.codeBackground;
  const border = Config.COLORS.codeBorder;

  const showLineNumbers = !!data.showLineNumbers;
  // ~ +2px between lines (like old lineGap=2)
  const lineHeight = 1 + 2 / codeFontSize;

  for (let idx = 0; idx < sections.length; idx++) {
    const section = sections[idx];

    const label =
      section.filename ??
      CODE_LANGUAGE_CONFIG[section.language]?.name ??
      section.language;

    // Measure header precisely (single-line label)
    const { totalHeight: headerTotalH, lineHeightPx: headerLH } =
      ctx.canvas.measureAndWrap(label, {
        font: labelFont,
        size: labelFontSize,
        maxWidth: width - paddingX * 2,
        lineHeight: 1.2,
      });
    // Guard against zero; keep a tiny breathing room
    const headerHeight = Math.max(headerLH, headerTotalH, labelFontSize) + 4;

    // First pass: provisional number column to wrap code
    const provisionalNumW = showLineNumbers ? 24 : 0;
    const firstMaxW = width - paddingX * 2 - provisionalNumW;

    // Wrap code content into lines (hard-wrap when needed)
    let { lines, totalHeight } = wrapCode(
      ctx,
      section.content ?? "",
      codeFontSize,
      firstMaxW,
      lineHeight,
    );

    // Compute actual line number width from final line count
    const digits = Math.max(2, String(lines.length).length);
    const numW = showLineNumbers
      ? Math.ceil(mono.widthOfTextAtSize("0".repeat(digits), codeFontSize) + 8)
      : 0;

    // If the number column widened, re-wrap with the true text width
    if (showLineNumbers && numW !== provisionalNumW) {
      const maxW = width - paddingX * 2 - numW;
      const wrapped = wrapCode(
        ctx,
        section.content ?? "",
        codeFontSize,
        maxW,
        lineHeight,
      );
      lines = wrapped.lines;
      totalHeight = wrapped.totalHeight;
    }

    const innerWidth = width - paddingX * 2 - numW;

    // Block height (min 40)
    const codeHeight = Math.max(
      40,
      headerHeight + paddingY * 2 + totalHeight,
    );

    // Keep block together for readability
    ctx.canvas.ensureBlock({
      minHeight:
        codeHeight +
        (idx < sections.length - 1
          ? gapBetweenSections
          : Config.SPACING.medium),
      keepTogether: true,
    });

    const top = ctx.canvas.cursorY;

    // Background rounded box (advances cursor to bottom automatically)
    ctx.canvas.drawBox(width, codeHeight, {
      fill: bg,
      stroke: border,
      strokeWidth: 1,
      padding: 0,
    });

    // Inner drawing region
    const innerLeft = left + paddingX;

    ctx.canvas.withRegion(
      { x: innerLeft, y: top, width: width - paddingX * 2, height: codeHeight },
      () => {
        // Header
        ctx.canvas.cursorY = top + 4;
        ctx.canvas.drawText(label, {
          font: labelFont,
          size: labelFontSize,
          color: labelColor,
          align: "left",
          maxWidth: width - paddingX * 2,
          spacingBefore: 0,
          spacingAfter: 0,
          lineHeight: 1.2,
        });

        // Baseline for code
        const codeY = top + headerHeight + paddingY;

        // Line numbers column
        if (showLineNumbers && numW > 0) {
          ctx.canvas.withRegion(
            {
              x: innerLeft,
              y: codeY,
              width: numW,
              height: codeHeight - (codeY - top),
            },
            () => {
              // Compose numbers once
              const nums = Array.from({ length: lines.length }, (_, i) =>
                String(i + 1).padStart(digits, " "),
              ).join("\n");

              ctx.canvas.cursorY = codeY;
              ctx.canvas.drawText(nums, {
                font: mono,
                size: codeFontSize,
                color: rgb(0.55, 0.6, 0.65),
                align: "right",
                maxWidth: numW,
                spacingBefore: 0,
                spacingAfter: 0,
                lineHeight,
              });
            },
          );
        }

        // Code text area
        ctx.canvas.withRegion(
          {
            x: innerLeft + numW,
            y: codeY,
            width: innerWidth,
            height: codeHeight - (codeY - top),
          },
          () => {
            // Use our prewrapped lines to avoid a second wrap pass
            ctx.canvas.cursorY = codeY;
            ctx.canvas.drawText(lines.join("\n"), {
              font: mono,
              size: codeFontSize,
              color: codeColor,
              align: "left",
              maxWidth: innerWidth,
              spacingBefore: 0,
              spacingAfter: 0,
              lineHeight,
            });
          },
        );
      },
    );

    // Move below the box and add spacing after the section
    ctx.canvas.cursorY = top + codeHeight;
    ctx.canvas.moveY(
      idx < sections.length - 1 ? gapBetweenSections : Config.SPACING.medium,
    );
  }
}
