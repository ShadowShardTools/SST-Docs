import type { PDFDocument, PDFPage } from "pdf-lib";

export interface LinkRectContext {
  doc: PDFDocument;
  page: PDFPage;
  toPdfY: (yTopDown: number) => number;
}
