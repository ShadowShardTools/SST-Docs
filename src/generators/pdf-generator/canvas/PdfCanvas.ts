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
} from "pdf-lib";
import { clamp } from "./utilities";
import { drawImage, drawImageContained, estimateImagePhysicalSizePts } from "./drawers/drawImage";
import { drawLinkRect, drawLinkText } from "./drawers";
import type { ParagraphOptions, EnsureSpaceOptions, RuleOptions, Rect, BoxOptions, LinkRectContext, LinkTextContext, ImageObject, DrawImageOptions, ImageDrawingContext, LinkRectOptions, RuleDrawingContext, TextDrawingContext, BoxDrawingContext } from "./drawers/types";
import type { Fonts, PageConfig, Region, CanvasState } from "./types";
import { drawBox } from "./drawers/drawBox";
import { drawRule } from "./drawers/drawRule";
import { drawText, measureAndWrap } from "./drawers/drawText";

export class PdfCanvas {
  private doc: PDFDocument;
  private page: PDFPage;
  private fonts: Fonts;
  private cfg: PageConfig;

  private y: number; // top‑down cursor

  // region & state stacks
  private regionStack: Region[] = [];
  private stateStack: CanvasState[] = [];
  private baseRegion: Region | null = null;

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
    this.setBaseRegionFromPage();
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
  private setBaseRegionFromPage() {
    this.baseRegion = {
      x: this.cfg.margin,
      y: this.cfg.margin,
      width: this.cfg.width - this.cfg.margin * 2,
      height: this.cfg.height - this.cfg.margin * 2
    };
  }

  addPage(): void {
    this.page = this.doc.addPage([this.cfg.width, this.cfg.height]);
    this.resetRegion(); // region should reset per page
    this.setBaseRegionFromPage();
    this.y = this.top;

    // columns reset
    if (this.columns) {
      this.applyColumnsRegion(0);
    }

    // call hooks with stable page index
    const pageIndex = this.doc.getPages().length - 1;
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
  ensureBlock(opts: { minHeight?: number; keepTogether?: boolean; keepWithNext?: number; pageBreakBefore?: boolean } = {}) {
    const { minHeight = 0, keepTogether = false, keepWithNext = 0, pageBreakBefore = false } = opts;
    if (pageBreakBefore) { this.addPage(); return; }
    const reserve = minHeight + keepWithNext;
    if (keepTogether) {
      if (this.cursorY + reserve > this.bottom) this.addPage();
      return;
    }
    this.ensureSpace({ minHeight: reserve });
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

  /** Convenience method for setting paragraph defaults temporarily */
  withParagraphDefaults(p: ParagraphOptions, fn: () => void) {
    this.withState({
      font: p.font,
      size: p.size,
      color: p.color,
      align: p.align,
      lineHeight: p.lineHeight,
    }, fn);
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

  /** Columns API with improved region safety */
  setColumns(opts: { count: number; gap: number }) {
    this.columns = { count: Math.max(1, Math.floor(opts.count)), gap: Math.max(0, opts.gap) };
    this.applyColumnsRegion(0);
  }
  private applyColumnsRegion(index: number) {
    if (!this.columns) return;
    const { count, gap } = this.columns;
    const br = this.baseRegion!;
    const totalGap = gap * (count - 1);
    const colW = (br.width - totalGap) / count;
    const x = br.x + (colW + gap) * index;
    const region = { x, y: br.y, width: colW, height: br.height };
    this.resetRegion();
    this.setRegion(region);
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
    return drawRule(this.getRuleContext(), opts);
  }

  /* -------------------------------- boxes --------------------------------- */
  drawBox(width: number, height: number, opts?: BoxOptions): Rect {
    return drawBox(this.getBoxContext(), width, height, opts);
  }

  /* ----------------------------- text layout ------------------------------ */
  /**
   * Improved text wrapping with better newline handling and caching
   */
  measureAndWrap(
    text: string,
    opts?: ParagraphOptions,
  ): { lines: string[]; lineHeightPx: number; totalHeight: number } {
    return measureAndWrap(this.getTextContext(), text, opts);
  }

  /** Alias for parity */
  measureText(text: string, options?: ParagraphOptions) {
    return this.measureAndWrap(text, options);
  }

  /** Draw a paragraph with orphan/widow control and advance the cursor. Returns height + lines. */
  drawText(text: string, options?: ParagraphOptions): { height: number; lines: string[] } {
    return drawText(this.getTextContext(), text, this.bottom, options);
  }

  /* --------------------------- links & annotations ------------------------ */
  /** Draw a clickable link rect with safer annotation handling */
  drawLinkRect(opts: LinkRectOptions): Rect {
    return drawLinkRect(this.getLinkRectContext(), opts);
  }

  /** Draw a URL as text and place a link annotation over each rendered line */
  drawLinkText(url: string, opts?: ParagraphOptions & { underline?: boolean }): { rects: Rect[]; height: number } {
    return drawLinkText(this.getLinkTextContext(), url, opts);
  }

  /* ------------------------------ images api ------------------------------ */
  /**
   * Draws an image buffer already embedded via doc.embedPng/Jpg by caller.
   * x,y,width,height are in top‑down coordinates; if width/height omitted it
   * preserves aspect. Returns the drawn {x,y,w,h} in top‑down coords.
   */
  drawImage(image: ImageObject, opts: DrawImageOptions = {}): Rect {
    return drawImage(this.getImageContext(), image, opts);
  }

  /** Convenience method for contained image drawing */
  drawImageContained(
    image: ImageObject,
    maxWidth = this.contentWidth,
    maxHeight = this.bottom - this.cursorY,
    align: "left" | "center" | "right" = "left"
  ): Rect {
    return drawImageContained(this.getImageContext(), image, maxWidth, maxHeight, align);
  }

  /** DPI helper for estimating image physical size */
  estimateImagePhysicalSizePts(pxW: number, pxH: number, dpi = 72) {
    return estimateImagePhysicalSizePts(pxW, pxH, dpi);
  }
  
  /* ---------------------------- context helpers --------------------------- */
  private getRuleContext(): RuleDrawingContext {
    return {
      page: this.page,
      contentLeft: this.contentLeft,
      contentRight: this.contentRight,
      contentWidth: this.contentWidth,
      cursorY: this.cursorY,
      toPdfY: (yTopDown: number) => this.toPdfY(yTopDown),
      ensureSpace: (opts: { minHeight: number }) => this.ensureSpace(opts),
      moveY: (dy: number) => this.moveY(dy),
    };
  }

  private getBoxContext(): BoxDrawingContext {
    return {
      page: this.page,
      contentLeft: this.contentLeft,
      cursorY: this.cursorY,
      toPdfY: (yTopDown: number) => this.toPdfY(yTopDown),
      ensureSpace: (opts: { minHeight: number }) => this.ensureSpace(opts),
      moveY: (dy: number) => this.moveY(dy),
    };
  }

  private getTextContext(): TextDrawingContext {
    return {
      page: this.page,
      fonts: this.fonts,
      contentLeft: this.contentLeft,
      contentWidth: this.contentWidth,
      cursorY: this.cursorY,
      toPdfY: (yTopDown: number) => this.toPdfY(yTopDown),
      ensureSpace: (opts: { minHeight: number }) => this.ensureSpace(opts),
      moveY: (dy: number) => this.moveY(dy),
      addPage: () => this.addPage(),
    };
  }

  private getLinkRectContext(): LinkRectContext {
    return {
      doc: this.doc,
      page: this.page,
      toPdfY: (yTopDown: number) => this.toPdfY(yTopDown),
    };
  }

  private getLinkTextContext(): LinkTextContext {
    return {
      doc: this.doc,
      page: this.page,
      toPdfY: (yTopDown: number) => this.toPdfY(yTopDown),
      contentLeft: this.contentLeft,
      contentWidth: this.contentWidth,
      cursorY: this.cursorY,
      fonts: this.fonts,
      measureAndWrap: (text: string, opts?: ParagraphOptions) => this.measureAndWrap(text, opts),
      drawText: (text: string, opts?: ParagraphOptions) => this.drawText(text, opts),
    };
  }

  private getImageContext(): ImageDrawingContext {
    return {
      page: this.page,
      contentLeft: this.contentLeft,
      contentRight: this.contentRight,
      contentWidth: this.contentWidth,
      bottom: this.bottom,
      cursorY: this.cursorY,
      toPdfY: (yTopDown: number) => this.toPdfY(yTopDown),
      ensureSpace: (opts: { minHeight: number }) => this.ensureSpace(opts),
      moveY: (dy: number) => this.moveY(dy),
    };
  }

  /* ------------------------------ debug utils ----------------------------- */
  debugGrid(step = 8, color = rgb(0.9, 0.9, 0.9), region?: Region) {
    const r = region ?? { x: this.contentLeft, y: this.top, width: this.contentWidth, height: this.bottom - this.top };
    for (let x = r.x; x <= r.x + r.width; x += step) {
      this.page.drawLine({ start: { x, y: this.toPdfY(r.y) }, end: { x, y: this.toPdfY(r.y + r.height) }, thickness: 0.5, color });
    }
    for (let y = r.y; y <= r.y + r.height; y += step) {
      this.page.drawLine({ start: { x: r.x, y: this.toPdfY(y) }, end: { x: r.x + r.width, y: this.toPdfY(y) }, thickness: 0.5, color });
    }
  }

  debugRect(r: Rect, color = rgb(1, 0, 0)) {
    this.page.drawRectangle({ x: r.x, y: this.toPdfY(r.y + r.height), width: r.width, height: r.height, borderWidth: 0.5, borderColor: color });
  }
}