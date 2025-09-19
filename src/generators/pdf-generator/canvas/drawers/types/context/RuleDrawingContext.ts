import type { PDFPage } from "pdf-lib";

export interface RuleDrawingContext {
  page: PDFPage;
  contentLeft: number;
  contentRight: number;
  contentWidth: number;
  cursorY: number;
  bottom: number;
  // Coordinate + layout helpers
  toPdfY: (yTopDown: number) => number;
  ensureSpace: (opts: { minHeight: number }) => void;
  moveY: (dy: number) => void;
}
