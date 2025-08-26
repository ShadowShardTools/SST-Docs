import type { PDFFont, rgb } from "pdf-lib";

export type ParagraphOptions = {
  font?: PDFFont;
  size?: number; // default 12
  color?: ReturnType<typeof rgb> | null;
  lineHeight?: number; // multiplier, default 1.4
  align?: "left" | "center" | "right";
  maxWidth?: number; // default: contentWidth
  indent?: number; // px to indent first line
  spacingBefore?: number; // extra space before
  spacingAfter?: number; // extra space after
};