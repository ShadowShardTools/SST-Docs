// src/generator/blocks/addCodeBlock.ts
import { rgb } from "pdf-lib";
import { Config } from "../../../configs/pdf-config";
import type { RenderContext } from "../types/RenderContext";
import type { CodeData, CodeSection } from "../../../layouts/blocks/types";
import {
  CODE_LANGUAGE_CONFIG,
  type SupportedLanguage,
} from "../../../configs/code-languages-config";

export async function addCode(ctx: RenderContext, data: CodeData) {
  if ((!data.content || !data.content.trim()) && !data.sections?.length) return;

  // Normalize sections like in React version
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

  const width = Config.PAGE.width - 2 * Config.MARGIN;
  const mono = ctx.fonts.mono;
  const paddingX = 10;
  const paddingY = 10;
  const gapBetweenSections = 10;

  sections.forEach((section, idx) => {
    const size = Config.FONT_SIZES.code;
    const label = section.filename
      ? section.filename
      : CODE_LANGUAGE_CONFIG[section.language]?.name || section.language;

    // Header height
    const headerHeight = Config.FONT_SIZES.codeLabel + 8;

    // Optional line numbers
    const showLineNumbers = data.showLineNumbers;
    const lineNumWidth = showLineNumbers ? 24 : 0;

    // Wrap code text
    const lines = ctx.canvas.wrapText(
      section.content,
      mono,
      size,
      width - paddingX * 2 - lineNumWidth,
    );
    const lh = ctx.canvas.lineHeight(mono, size);
    const codeHeight = Math.max(
      40,
      lines.length * lh + paddingY * 2 + headerHeight,
    );

    ctx.canvas.ensureSpace(codeHeight + Config.SPACING.medium);

    const top = ctx.canvas.getY();

    // Background + border
    ctx.canvas.drawRect({
      x: Config.MARGIN,
      y: top,
      width,
      height: codeHeight,
      fill: Config.COLORS.codeBackground,
      stroke: Config.COLORS.codeBorder,
      lineWidth: 1,
      advanceCursor: false,
    });

    // Header label
    ctx.canvas.drawTextBlock({
      text: label,
      x: Config.MARGIN + paddingX,
      y: top + 4,
      width: width - paddingX * 2,
      font: ctx.fonts.bold,
      size: Config.FONT_SIZES.codeLabel,
      color: rgb(0.424, 0.459, 0.49),
      advanceCursor: false,
    });

    // Code content
    let textStartX = Config.MARGIN + paddingX;
    ctx.canvas.drawTextBlock({
      text: section.content,
      x: textStartX,
      y: top + headerHeight + paddingY,
      width: width - paddingX * 2 - lineNumWidth,
      font: mono,
      size,
      color: rgb(0.129, 0.145, 0.161),
      lineGap: 2,
      advanceCursor: false,
    });

    ctx.canvas.setY(
      top +
        codeHeight +
        (idx < sections.length - 1
          ? gapBetweenSections
          : Config.SPACING.medium),
    );
  });
}
