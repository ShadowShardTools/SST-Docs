// src/utilities/TextMetricsCache.ts

import type { PDFFont } from "pdf-lib";

export class textMetricsCache {
  private cache = new Map<string, { width: number; height: number }>();
  public cacheHits = 0;
  public totalMeasurements = 0;

  measure(text: string, font: PDFFont, size: number) {
    const key = `${font.name}|${size}|${text}`;
    this.totalMeasurements++;

    if (this.cache.has(key)) {
      this.cacheHits++;
      return this.cache.get(key)!;
    }

    const width = font.widthOfTextAtSize(text, size);
    const height = font.heightAtSize(size);
    const metrics = { width, height };

    this.cache.set(key, metrics);
    return metrics;
  }

  get stats() {
    return {
      hits: this.cacheHits,
      total: this.totalMeasurements,
      size: this.cache.size,
      hitRate: this.totalMeasurements > 0 ? (this.cacheHits / this.totalMeasurements) : 0,
    };
  }

  clear() {
    this.cache.clear();
    this.cacheHits = 0;
    this.totalMeasurements = 0;
  }
}