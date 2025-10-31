import type { PDFPage } from "pdf-lib";

export interface BoxDrawingContext {
  page: PDFPage;
  contentLeft: number;
  cursorY: number;
  toPdfY: (yTopDown: number) => number;
  ensureSpace: (opts: { minHeight: number }) => void;
  moveY: (dy: number) => void;
}
