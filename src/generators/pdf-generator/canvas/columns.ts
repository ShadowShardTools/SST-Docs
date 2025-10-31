import type { PdfCanvas } from ".";
import type { Region } from "./drawers/types";

/** Compute a single column region from a base region + columns config */
export function computeColumnsRegion(
  baseRegion: Region,
  columns: { count: number; gap: number },
  index: number,
): Region {
  const { count, gap } = columns;
  const totalGap = gap * (count - 1);
  const colW = (baseRegion.width - totalGap) / count;
  const x = baseRegion.x + (colW + gap) * index;
  return { x, y: baseRegion.y, width: colW, height: baseRegion.height };
}

/** Apply a computed region to the canvas (resets region + cursor) */
export function applyColumnsRegion(
  canvas: PdfCanvas,
  region: Region,
  index: number,
) {
  canvas["_setRegionFromColumns"](region, index);
}
