import {
  type Color,
  PDFDocument,
  type PDFPage,
  type PDFFont,
  PDFName,
  PDFString,
} from "pdf-lib";
import { Config } from "../../configs/pdf-config";

export type Fonts = {
  regular: PDFFont;
  italic: PDFFont;
  bold: PDFFont;
  mono: PDFFont;
};

export class PdfCanvas {
  private doc: PDFDocument;
  private page: PDFPage;
  private fonts: Fonts;
  private yPosition = Config.MARGIN;

  readonly margin = Config.MARGIN;
  readonly pageWidth = Config.PAGE.width;
  readonly pageHeight = Config.PAGE.height;

  constructor(doc: PDFDocument, page: PDFPage, fonts: Fonts) {
    this.doc = doc;
    this.page = page;
    this.fonts = fonts;
  }

  /** Convert top-down Y to pdf-lib bottom-up Y */
  private toPdfY(yTopDown: number): number {
    return this.page.getHeight() - yTopDown;
  }

  addPage(): void {
    this.page = this.doc.addPage([this.pageWidth, this.pageHeight]);
    this.yPosition = Config.MARGIN;
  }

  /** Ensure we have space left, otherwise add a page. Uses provided y when given. */
  ensureSpace(requiredHeight: number, fromY?: number): void {
    const startY = fromY ?? this.yPosition;
    if (startY + requiredHeight > this.pageHeight - Config.MARGIN) {
      this.addPage();
    }
  }

  getPage() {
    return this.page;
  }

  /** Basic line height helper for font+size */
  lineHeight(_font: PDFFont, size: number, gap = 2): number {
    return size * Config.LINE_HEIGHT_SCALE + gap;
  }

  /** Measure width of text for wrapping */
  widthOf(text: string, font: PDFFont, size: number): number {
    return font.widthOfTextAtSize(text, size);
  }

  /** Split text into wrapped lines (word-first, char-fallback) */
  wrapText(
    text: string,
    font: PDFFont,
    size: number,
    maxWidth: number,
  ): string[] {
    const paragraphs = text.split("\n");
    const lines: string[] = [];
    for (const para of paragraphs) {
      if (para.trim() === "") {
        lines.push("");
        continue;
      }
      const words = para.split(/\s+/);
      let current = "";
      for (const word of words) {
        const test = current ? `${current} ${word}` : word;
        if (this.widthOf(test, font, size) <= maxWidth) {
          current = test;
        } else {
          if (current) lines.push(current);
          let long = word;
          while (this.widthOf(long, font, size) > maxWidth) {
            // Split by chars
            let chunk = "";
            let i = 0;
            for (; i < long.length; i++) {
              const next = chunk + long[i];
              if (this.widthOf(next, font, size) > maxWidth) break;
              chunk = next;
            }
            if (chunk.length === 0) {
              // fallback: force one char
              lines.push(long[0]);
              long = long.slice(1);
            } else {
              lines.push(chunk);
              long = long.slice(chunk.length);
            }
          }
          current = long;
        }
      }
      if (current) lines.push(current);
    }
    return lines;
  }

  /** Draw text block with wrapping. Returns height consumed. */
  drawTextBlock(opts: {
    text: string;
    x?: number;
    y?: number;
    width?: number;
    font?: PDFFont;
    size?: number;
    color?: Color;
    lineGap?: number;
    advanceCursor?: boolean;
    align?: "left" | "center" | "right";
  }): number {
    const {
      text,
      x = this.margin,
      y,
      width = this.pageWidth - 2 * this.margin,
      font = this.fonts.regular,
      size = 12,
      color,
      lineGap = 2,
      advanceCursor = true,
      align = "left",
    } = opts;

    if (!text) return 0;

    const lines = this.wrapText(text, font, size, width);
    const lh = this.lineHeight(font, size, lineGap);
    const totalHeight = lines.length * lh;

    // Ensure space based on the draw start (y if provided)
    this.ensureSpace(totalHeight, y);

    // Compute top after a potential page break
    const topY = y ?? this.yPosition;

    let cursorY = topY;
    for (const line of lines) {
      let tx = x;
      if (align !== "left") {
        const w = this.widthOf(line, font, size);
        if (align === "center") tx = x + (width - w) / 2;
        if (align === "right") tx = x + (width - w);
      }
      this.page.drawText(line, {
        x: tx,
        y: this.toPdfY(cursorY + size),
        size,
        font,
        color,
      });
      cursorY += lh;
    }

    if (advanceCursor) this.yPosition = cursorY;
    return totalHeight;
  }

  /** Draw a rectangle (optionally filled/stroked). */
  drawRect(opts: {
    x: number;
    y?: number;
    width: number;
    height: number;
    fill?: Color;
    stroke?: Color;
    lineWidth?: number;
    advanceCursor?: boolean;
  }): void {
    const {
      x,
      y,
      width,
      height,
      fill,
      stroke,
      lineWidth = 1,
      advanceCursor = false,
    } = opts;

    this.ensureSpace(height, y);
    const topY = y ?? this.yPosition;

    this.page.drawRectangle({
      x,
      y: this.toPdfY(topY + height),
      width,
      height,
      color: fill, // fill color
      borderColor: stroke, // stroke color
      borderWidth: stroke ? lineWidth : undefined,
    });

    if (advanceCursor) this.yPosition = topY + height;
  }

  /** Horizontal line */
  drawLine(opts: {
    x1: number;
    x2: number;
    y?: number;
    color?: Color;
    lineWidth?: number;
    advanceCursor?: boolean;
    gapBelow?: number;
  }): void {
    const {
      x1,
      x2,
      y,
      color,
      lineWidth = 1,
      advanceCursor = false,
      gapBelow = 0,
    } = opts;

    const needed = lineWidth + gapBelow;
    this.ensureSpace(needed, y);
    const yy = y ?? this.yPosition;

    this.page.drawLine({
      start: { x: x1, y: this.toPdfY(yy) },
      end: { x: x2, y: this.toPdfY(yy) },
      thickness: lineWidth,
      color,
    });

    if (advanceCursor) this.yPosition = yy + needed;
  }

  /** Clickable link annotation (optionally underlines the area). */
  drawLink(opts: {
    x: number;
    y: number; // top-down Y (same coords as other PdfCanvas methods)
    width: number;
    height: number;
    url: string;
    underline?: boolean; // draw an underline under the area
    underlineColor?: Color; // color for underline (defaults to Config.COLORS.text)
    underlineWidth?: number; // thickness for underline
  }): void {
    const { x, y, width, height, url, underline = false } = opts;

    // Convert to PDF bottom-up rect
    const left = x;
    const bottom = this.page.getHeight() - (y + height);
    const right = x + width;
    const top = bottom + height;

    const ctx = this.doc.context;
    const rectArr = ctx.obj([left, bottom, right, top]);

    const action = ctx.obj({
      Type: PDFName.of("Action"),
      S: PDFName.of("URI"),
      URI: PDFString.of(url),
    });

    const linkAnnot = ctx.obj({
      Type: PDFName.of("Annot"),
      Subtype: PDFName.of("Link"),
      Rect: rectArr,
      Border: ctx.obj([0, 0, 0]), // no visible border
      A: action,
    });

    // Attach annotation to the current page
    // @ts-ignore - node is intentionally internal
    this.page.node.addAnnot(linkAnnot);

    // Optional underline (visual affordance)
    if (underline) {
      this.drawLine({
        x1: x,
        x2: x + width,
        y: y + height - 1, // just under the text area
        color: opts.underlineColor ?? (Config.COLORS?.text as Color),
        lineWidth: opts.underlineWidth ?? 1,
        advanceCursor: false,
      });
    }
  }

  getFonts(): Fonts {
    return this.fonts;
  }
  getY(): number {
    return this.yPosition;
  }
  setY(y: number): void {
    this.yPosition = y;
  }
}
