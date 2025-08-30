import type { PDFPage } from "pdf-lib";

export interface ImageDrawingContext {
  page: PDFPage;
  contentLeft: number;
  contentRight: number;
  contentWidth: number;
  bottom: number;
  cursorY: number;
  toPdfY: (yTopDown: number) => number;
  ensureSpace: (opts: { minHeight: number }) => void;
  moveY: (dy: number) => void;
}
