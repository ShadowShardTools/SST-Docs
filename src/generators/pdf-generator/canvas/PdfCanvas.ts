/* --------------------------------------------------------------------------
 * PdfCanvas – a small, high‑level drawing helper on top of pdf-lib
 * --------------------------------------------------------------------------
 * Goals
 *  - Top‑down coordinate system (y grows downward like normal layout engines)
 *  - Automatic pagination with configurable margins and spacing
 *  - Text measurement + wrapping, paragraph drawing, titles, rules, boxes
 *  - Minimal, framework‑agnostic, easy to test
 *
 * Dependencies: pdf-lib
 * -------------------------------------------------------------------------- */

import {
  PDFDocument,
  type PDFPage,
  rgb,
  PDFName,
  PDFString,
} from "pdf-lib";
import type {
  Fonts,
  PageConfig,
  EnsureSpaceOptions,
  RuleOptions,
  BoxOptions,
  ParagraphOptions,
} from "./types";
import { clamp } from "./utilities";

/* -------------------------------------------------------------------------- */
/* Local helpers & light extras                                                */
/* -------------------------------------------------------------------------- */
function toColor(c: ReturnType<typeof rgb> | undefined) {
  return c ?? undefined;
}

type Rect = { x: number; y: number; width: number; height: number };

type Region = { x: number; y: number; width: number; height: number };

type CanvasState = {
  font?: ParagraphOptions["font"];
  size?: number;
  color?: ParagraphOptions["color"];
  align?: ParagraphOptions["align"];
  lineHeight?: number; // multiplier
  region?: Region;
};

type LinkRectOptions = {
  x: number;
  y: number; // top‑down
  width: number;
  height: number;
  url: string;
  underline?: boolean;
};

/* -------------------------------------------------------------------------- */
/* PdfCanvas                                                                   */
/* -------------------------------------------------------------------------- */
export class PdfCanvas {
  private doc: PDFDocument;
  private page: PDFPage;
  private fonts: Fonts;
  private cfg: PageConfig;

  private y: number; // top‑down cursor

  // region & state stacks
  private regionStack: Region[] = [];
  private stateStack: CanvasState[] = [];

  // header/footer hooks
  private newPageCallbacks: Array<(pageIndex: number, page: PDFPage, canvas: PdfCanvas) => void> = [];

  // columns
  private columns: { count: number; gap: number } | null = null;
  private columnIndex = 0;

  constructor(params: {
    doc: PDFDocument;
    page?: PDFPage; // if omitted, a page is created
    fonts: Fonts;
    pageConfig: PageConfig; // {width,height,margin}
  }) {
    const { doc, page, fonts, pageConfig } = params;
    this.doc = doc;
    this.page = page ?? doc.addPage([pageConfig.width, pageConfig.height]);
    this.fonts = fonts;
    this.cfg = pageConfig;
    this.y = this.cfg.margin; // first content line below top margin
  }

  /* -------------------------------- geometry ------------------------------ */
  get pageWidth() { return this.cfg.width; }
  get pageHeight() { return this.cfg.height; }

  private get activeRegion(): Region | null {
    return this.regionStack.length ? this.regionStack[this.regionStack.length - 1] : null;
  }

  get contentLeft() {
    const r = this.activeRegion;
    return r ? r.x : this.cfg.margin;
  }
  get contentRight() {
    const r = this.activeRegion;
    return r ? r.x + r.width : this.cfg.width - this.cfg.margin;
  }
  get contentWidth() {
    return this.contentRight - this.contentLeft;
  }
  get top() {
    const r = this.activeRegion;
    return r ? r.y : this.cfg.margin;
  }
  get bottom() {
    const r = this.activeRegion;
    return r ? r.y + r.height : this.cfg.height - this.cfg.margin;
  }

  /** Convert top‑down Y to pdf-lib bottom‑up Y */
  private toPdfY(yTopDown: number): number {
    return this.page.getHeight() - yTopDown;
  }

  /** Current top‑down cursor Y */
  get cursorY() { return this.y; }
  set cursorY(v: number) { this.y = clamp(v, this.top, this.bottom); }

  /** Move cursor down by dy */
  moveY(dy: number) { this.cursorY = this.y + dy; }

  /** Convenience: newline by current state size * lineHeight (default 1.4) */
  newline(extra = 0) {
    const st = this.peekState();
    const size = st?.size ?? 12;
    const lh = (st?.lineHeight ?? 1.4) * size;
    this.moveY(lh + extra);
  }

  /* -------------------------------- pages --------------------------------- */
  addPage(): void {
    this.page = this.doc.addPage([this.cfg.width, this.cfg.height]);
    this.resetRegion(); // region should reset per page
    this.y = this.top;

    // columns reset
    if (this.columns) {
      this.applyColumnsRegion(0);
    }

    // call hooks
    const pageIndex = (this.doc as any).getPageIndices ? (this.doc as any).getPageIndices().length - 1 : 0;
    for (const cb of this.newPageCallbacks) cb(pageIndex, this.page, this);
  }

  /** Ensures there's enough space; creates a new page if needed. */
  ensureSpace(opts?: EnsureSpaceOptions) {
    const minH = opts?.minHeight ?? 0;
    if (opts?.forcePageBreakBefore) {
      this.addPage();
      return;
    }
    if (this.y + minH > this.bottom) {
      this.addPage();
    }
  }

  /** Block-aware space check with keepTogether/keepWithNext semantics */
  ensureBlock(opts: { minHeight?: number; keepTogether?: boolean; keepWithNext?: boolean; pageBreakBefore?: boolean } = {}) {
    const { minHeight = 0, keepTogether = false, pageBreakBefore = false } = opts;
    if (pageBreakBefore) {
      this.addPage();
      return;
    }
    if (keepTogether) {
      if (this.cursorY + minHeight > this.bottom) this.addPage();
      return;
    }
    this.ensureSpace({ minHeight });
  }

  onNewPage(cb: (pageIndex: number, page: PDFPage, canvas: PdfCanvas) => void) {
    this.newPageCallbacks.push(cb);
  }

  /* -------------------------------- state --------------------------------- */
  pushState(s: CanvasState) {
    this.stateStack.push(s);
  }
  popState() {
    this.stateStack.pop();
  }
  withState(s: CanvasState, fn: () => void) {
    this.pushState(s);
    try { fn(); } finally { this.popState(); }
  }
  private peekState(): CanvasState | undefined {
    return this.stateStack.length ? this.stateStack[this.stateStack.length - 1] : undefined;
  }

  /* ------------------------------- regions -------------------------------- */
  setRegion(r: Region) {
    this.regionStack.push(r);
    // clamp cursor to new region
    this.cursorY = Math.max(this.cursorY, this.top);
  }
  resetRegion() {
    this.regionStack = [];
  }
  withRegion(r: Region, fn: () => void) {
    this.setRegion(r);
    try { fn(); } finally { this.regionStack.pop(); }
  }

  /** Columns API */
  setColumns(opts: { count: number; gap: number }) {
    this.columns = { count: Math.max(1, Math.floor(opts.count)), gap: Math.max(0, opts.gap) };
    this.applyColumnsRegion(0);
  }
  private applyColumnsRegion(index: number) {
    if (!this.columns) return;
    const { count, gap } = this.columns;
    const totalGap = gap * (count - 1);
    const colW = (this.cfg.width - this.cfg.margin * 2 - totalGap) / count;
    const x = this.cfg.margin + (colW + gap) * index;
    const y = this.cfg.margin;
    const width = colW;
    const height = this.cfg.height - this.cfg.margin * 2;
    this.resetRegion();
    this.setRegion({ x, y, width, height });
    this.columnIndex = index;
    this.cursorY = this.top;
  }
  nextColumn() {
    if (!this.columns) return this.addPage();
    const next = this.columnIndex + 1;
    if (next >= this.columns.count) {
      this.addPage();
      this.applyColumnsRegion(0);
    } else {
      this.applyColumnsRegion(next);
    }
  }

  /* -------------------------------- rules --------------------------------- */
  drawRule(opts?: RuleOptions): Rect {
    const thickness = opts?.thickness ?? 1;
    const color = opts?.color ?? rgb(0.8, 0.85, 0.9);
    const width = opts?.width ?? this.contentWidth;
    const align = opts?.align ?? "left";
    const x =
      align === "left" ? this.contentLeft :
      align === "right" ? this.contentRight - width :
      this.contentLeft + (this.contentWidth - width) / 2;

    const spacingBefore = opts?.spacingBefore ?? 8;
    const spacingAfter = opts?.spacingAfter ?? 8;

    this.ensureSpace({ minHeight: spacingBefore + thickness + spacingAfter });

    this.moveY(spacingBefore);
    const yTop = this.y;
    const yPdf = this.toPdfY(this.y);

    this.page.drawLine({
      start: { x, y: yPdf },
      end:   { x: x + width, y: yPdf },
      thickness,
      color,
    });

    this.moveY(thickness + spacingAfter);
    return { x, y: yTop, width, height: thickness };
  }

  /* -------------------------------- boxes --------------------------------- */
  drawBox(width: number, height: number, opts?: BoxOptions): Rect {
    const pad = opts?.padding ?? 12;
    const stroke = toColor(opts?.stroke ?? rgb(0.88, 0.9, 0.93));
    const strokeWidth = opts?.strokeWidth ?? 1;
    const fill = toColor(opts?.fill ?? undefined);

    this.ensureSpace({ minHeight: height });

    const x = this.contentLeft;
    const yTop = this.y;

    this.page.drawRectangle({
      x,
      y: this.toPdfY(yTop + height),
      width,
      height,
      borderColor: stroke ?? undefined,
      borderWidth: stroke ? strokeWidth : 0,
      color: fill,
    });

    this.moveY(height);

    return {
      x: x + pad,
      y: yTop + pad,
      width: Math.max(0, width - pad * 2),
      height: Math.max(0, height - pad * 2),
    };
  }

  /* ----------------------------- text layout ------------------------------ */
  /**
   * Splits text into wrapped lines that fit maxWidth using the provided font.
   * Returns lines and total height.
   */
  measureAndWrap(
    text: string,
    opts?: ParagraphOptions,
  ): { lines: string[]; lineHeightPx: number; totalHeight: number } {
    const font = opts?.font ?? this.fonts.regular;
    const size = opts?.size ?? 12;
    const lineH = (opts?.lineHeight ?? 1.4) * size;
    const maxWidth = opts?.maxWidth ?? this.contentWidth;

    const words = text.replace(/\r\n?/g, "\n").split(/(\s+)/);
    const lines: string[] = [];
    let current = "";

    for (const token of words) {
      if (token === "\n") {
        lines.push(current.trimEnd());
        current = "";
        continue;
      }
      const tentative = current + token;
      const w = font.widthOfTextAtSize(tentative, size);
      if (w <= maxWidth || current.length === 0) {
        current = tentative;
      } else {
        lines.push(current.trimEnd());
        // remove leading space if token is whitespace
        current = /\s+/.test(token) ? "" : token;
      }
    }
    if (current) lines.push(current.trimEnd());

    const totalHeight = lines.length * lineH;
    return { lines, lineHeightPx: lineH, totalHeight };
  }

  /** Alias for parity */
  measureText(text: string, options?: ParagraphOptions) {
    return this.measureAndWrap(text, options);
  }

  /** Draw a paragraph and advance the cursor. Returns height + lines. */
  drawText(text: string, options?: ParagraphOptions): { height: number; lines: string[] } {
    const font = options?.font ?? this.fonts.regular;
    const size = options?.size ?? 12;
    const color = options?.color ?? rgb(0.22, 0.25, 0.32); // gray-700 default
    const align = options?.align ?? "left";
    const indent = options?.indent ?? 0;
    const spacingBefore = options?.spacingBefore ?? 0;
    const spacingAfter = options?.spacingAfter ?? 8;
    const maxWidth = options?.maxWidth ?? this.contentWidth;

    const { lines, lineHeightPx, totalHeight } = this.measureAndWrap(text, {
      ...options,
      maxWidth,
    });

    this.ensureSpace({ minHeight: spacingBefore + totalHeight + spacingAfter });
    this.moveY(spacingBefore);

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      let x = this.contentLeft;
      const yBase = this.toPdfY(this.y + size); // baseline

      let dx = 0;
      if (i === 0 && indent) dx += indent;

      const lineWidth = font.widthOfTextAtSize(line, size);
      if (align === "center") {
        x = this.contentLeft + (maxWidth - lineWidth) / 2;
      } else if (align === "right") {
        x = this.contentLeft + (maxWidth - lineWidth);
      } // justify intentionally skipped for simplicity

      this.page.drawText(line, {
        x: x + dx,
        y: yBase,
        font,
        size,
        color,
        maxWidth,
      });
      this.moveY(lineHeightPx);
    }

    // add spacing after
    this.moveY(spacingAfter);

    return { height: totalHeight + spacingBefore + spacingAfter, lines };
  }

  /* --------------------------- links & annotations ------------------------ */
  /** Draw a clickable link rect (best‑effort; falls back silently if pdf-lib internals change) */
  drawLinkRect(opts: LinkRectOptions): Rect {
    const { x, y, width, height, url, underline } = opts;
    const yBottom = this.toPdfY(y + height);
    const yTop = this.toPdfY(y);

    // optional underline at the bottom of the rect (top‑down y)
    if (underline) {
      this.page.drawLine({
        start: { x, y: yBottom },
        end: { x: x + width, y: yBottom },
        thickness: 1,
        color: rgb(0, 0, 0),
      });
    }

    // low‑level annotation creation (unsafe types → any)
    try {
      const context = (this.doc as any).context;
      const pageNode = (this.page as any).node;
      const rect = (context as any).obj([x, yBottom, x + width, yTop]);
      const action = (context as any).obj({
        Type: PDFName.of("Action"),
        S: PDFName.of("URI"),
        URI: PDFString.of(url),
      });
      const annot = (context as any).obj({
        Type: PDFName.of("Annot"),
        Subtype: PDFName.of("Link"),
        Rect: rect,
        Border: (context as any).obj([0, 0, 0]),
        A: action,
      });

      const AnnotsName = PDFName.of("Annots");
      const existing = pageNode.lookup(AnnotsName);
      if (existing) {
        existing.push(annot);
      } else {
        pageNode.set(AnnotsName, (context as any).obj([annot]));
      }
    } catch {
      // ignore if pdf-lib internals differ
    }

    return { x, y, width, height };
  }

  /** Draw a URL as text and place a link annotation over each rendered line */
  drawLinkText(url: string, opts?: ParagraphOptions & { underline?: boolean }): { rects: Rect[]; height: number } {
    const font = opts?.font ?? this.fonts.regular;
    const size = opts?.size ?? 12;
    const color = opts?.color ?? rgb(0, 0, 1);
    const align = opts?.align ?? "left";
    const lineHeight = opts?.lineHeight;
    const maxWidth = opts?.maxWidth ?? this.contentWidth;

    const { lines } = this.measureAndWrap(url, { font, size, lineHeight, maxWidth });

    const rects: Rect[] = [];

    // render and annotate line by line
    const beforeY = this.cursorY;
    const { height } = this.drawText(url, { ...opts, color, align, maxWidth });

    // Recompute rects by measuring each line separately
    // (approximation: assume left/center/right alignment positions)
    let yCursor = beforeY;
    for (const line of lines) {
      const lineWidth = font.widthOfTextAtSize(line, size);
      let x = this.contentLeft;
      if (align === "center") x = this.contentLeft + (maxWidth - lineWidth) / 2;
      else if (align === "right") x = this.contentLeft + (maxWidth - lineWidth);

      const rect: Rect = { x, y: yCursor, width: lineWidth, height: (lineHeight ?? 1.4) * size };
      this.drawLinkRect({ ...rect, url, underline: opts?.underline });
      rects.push(rect);
      yCursor += (lineHeight ?? 1.4) * size;
    }

    return { rects, height };
  }

  /* ------------------------------ images api ------------------------------ */
  /**
   * Draws an image buffer already embedded via doc.embedPng/Jpg by caller.
   * x,y,width,height are in top‑down coordinates; if width/height omitted it
   * preserves aspect. Returns the drawn {x,y,w,h} in top‑down coords.
   */
  drawImage(
    image: {
      width: number;
      height: number;
      scale: (n: number) => { width: number; height: number };
      bytesPerRow?: number;
    },
    opts: { x?: number; y?: number; width?: number; height?: number; fit?: "contain" | "cover" | "scale-down" | "none"; maxWidth?: number; maxHeight?: number; align?: "left" | "center" | "right" } = {},
  ): Rect {
    const naturalW = image.width;
    const naturalH = image.height;

    const maxW = opts.maxWidth ?? this.contentWidth;
    const maxH = opts.maxHeight ?? (this.bottom - this.cursorY);
    const fit = opts.fit ?? "scale-down";

    let w = opts.width ?? Math.min(naturalW, maxW);
    let h = opts.height ?? (naturalH * w) / naturalW;

    // object-fit like behavior
    if (fit === "contain") {
      const scale = Math.min(maxW / w, maxH / h, 1);
      w *= scale; h *= scale;
    } else if (fit === "cover") {
      const scale = Math.max(maxW / w, maxH / h);
      w *= scale; h *= scale;
    } else if (fit === "scale-down") {
      const scale = Math.min(1, Math.min(maxW / w, maxH / h));
      w *= scale; h *= scale;
    }

    let x = opts.x ?? this.contentLeft;
    const yTop = opts.y ?? this.y;

    const align = opts.align ?? "left";
    if (align === "center") x = this.contentLeft + (this.contentWidth - w) / 2;
    else if (align === "right") x = this.contentRight - w;

    this.ensureSpace({ minHeight: h });

    this.page.drawImage(image as any, {
      x,
      y: this.toPdfY(yTop + h),
      width: w,
      height: h,
    });

    // advance cursor only if we drew at current cursor position
    if (opts.y === undefined) this.moveY(h);

    return { x, y: yTop, width: w, height: h };
  }

  /* ------------------------------ debug utils ----------------------------- */
  debugGrid(step = 8, color = rgb(0.9, 0.9, 0.9)) {
    // vertical lines
    for (let x = this.contentLeft; x <= this.contentRight; x += step) {
      this.page.drawLine({ start: { x, y: this.toPdfY(this.top) }, end: { x, y: this.toPdfY(this.bottom) }, thickness: 0.5, color });
    }
    // horizontal lines
    for (let y = this.top; y <= this.bottom; y += step) {
      this.page.drawLine({ start: { x: this.contentLeft, y: this.toPdfY(y) }, end: { x: this.contentRight, y: this.toPdfY(y) }, thickness: 0.5, color });
    }
  }

  debugRect(r: Rect, color = rgb(1, 0, 0)) {
    this.page.drawRectangle({ x: r.x, y: this.toPdfY(r.y + r.height), width: r.width, height: r.height, borderWidth: 0.5, borderColor: color });
  }
}
