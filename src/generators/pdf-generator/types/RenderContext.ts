import type { PDFDocument } from "pdf-lib";
import type { Fonts, PdfCanvas } from "../PdfCanvas";
import type { IconMap } from "./IconMap";

export type RenderContext = {
  doc: PDFDocument;
  canvas: PdfCanvas;
  fonts: Fonts;
  icons: IconMap;
};
