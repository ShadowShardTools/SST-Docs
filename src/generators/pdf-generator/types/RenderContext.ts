import type { PDFDocument } from "pdf-lib";
import type { IconMap } from "./IconMap";
import type { Fonts } from "../canvas/types";
import type { PdfCanvas } from "../canvas";

export type RenderContext = {
  doc: PDFDocument;
  canvas: PdfCanvas;
  fonts: Fonts;
  icons: IconMap;
};
