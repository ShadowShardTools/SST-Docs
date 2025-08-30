import type { PDFPage } from "pdf-lib";
import type { Fonts } from "../../../types";

export interface TextDrawingContext {
  page: PDFPage;
  fonts: Fonts;
  contentLeft: number;
  contentWidth: number;
  cursorY: number;
  toPdfY: (yTopDown: number) => number;
  ensureSpace: (opts: { minHeight: number }) => void;
  moveY: (dy: number) => void;
  addPage: () => void;
}
