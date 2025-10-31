import type { PDFFont } from "pdf-lib";

export type WidthCache = Map<string, number>;

const tokenWidthCache = new WeakMap<object, Map<number, WidthCache>>();
const heightCache = new WeakMap<object, Map<number, number>>();

function getWidthCache(font: object, size: number): WidthCache {
  let bySize = tokenWidthCache.get(font);
  if (!bySize) {
    bySize = new Map<number, WidthCache>();
    tokenWidthCache.set(font, bySize);
  }
  let byToken = bySize.get(size);
  if (!byToken) {
    byToken = new Map<string, number>();
    bySize.set(size, byToken);
  }
  return byToken;
}

export type WidthMeasurableFont = {
  widthOfTextAtSize: (s: string, n: number) => number;
};

export function measureToken(
  font: WidthMeasurableFont,
  size: number,
  token: string,
): number {
  const cache = getWidthCache(font as object, size);
  const cached = cache.get(token);
  if (cached !== undefined) return cached;
  const val = font.widthOfTextAtSize(token, size);
  cache.set(token, val);
  return val;
}

/** For complete strings; currently just aliases token caching. */
export function measureString(
  font: WidthMeasurableFont,
  size: number,
  s: string,
): number {
  return measureToken(font, size, s);
}

/** Cached single-space width helper. */
export function measureSpace(font: WidthMeasurableFont, size: number): number {
  return measureToken(font, size, " ");
}

/** Optional: cache font.heightAtSize(size) if you need vertical metrics. */
export function measureHeight(font: PDFFont, size: number): number {
  let bySize = heightCache.get(font as object);
  if (!bySize) {
    bySize = new Map<number, number>();
    heightCache.set(font as object, bySize);
  }
  const hit = bySize.get(size);
  if (hit !== undefined) return hit;
  const h = font.heightAtSize(size);
  bySize.set(size, h);
  return h;
}

/** Clear all caches (useful for tests). */
export function clearTextMetricsCaches() {
  (tokenWidthCache as any) = new WeakMap();
  (heightCache as any) = new WeakMap();
}
