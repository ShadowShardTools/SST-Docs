import type { PdfCanvas } from "../index";
import { rgb } from "pdf-lib";
import type { Rect, Region } from "./types";

/** Draws a light grid inside a region (or content area by default). */
export function debugGrid(
  self: PdfCanvas,
  step = 8,
  color = rgb(0.9, 0.9, 0.9),
  region?: Region,
) {
  const r = region ?? {
    x: self.contentLeft,
    y: self.top,
    width: self.contentWidth,
    height: self.bottom - self.top,
  };

  for (let x = r.x; x <= r.x + r.width; x += step) {
    self["_getPage"]().drawLine({
      start: { x, y: self["_toPdfY"](r.y) },
      end: { x, y: self["_toPdfY"](r.y + r.height) },
      thickness: 0.5,
      color,
    });
  }
  for (let y = r.y; y <= r.y + r.height; y += step) {
    self["_getPage"]().drawLine({
      start: { x: r.x, y: self["_toPdfY"](y) },
      end: { x: r.x + r.width, y: self["_toPdfY"](y) },
      thickness: 0.5,
      color,
    });
  }
}

/** Draws a debug rectangle (top-down coords). */
export function debugRect(self: PdfCanvas, r: Rect, color = rgb(1, 0, 0)) {
  self["_getPage"]().drawRectangle({
    x: r.x,
    y: self["_toPdfY"](r.y + r.height),
    width: r.width,
    height: r.height,
    borderWidth: 0.5,
    borderColor: color,
  });
}
