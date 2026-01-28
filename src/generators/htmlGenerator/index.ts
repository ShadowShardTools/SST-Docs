import type {
  ChartData,
  DocItem,
  StyleTheme,
} from "@shadow-shard-tools/docs-core";
import {
  renderDocument,
  renderConsolidatedDocument,
} from "./templates/document.js";

export interface GenerateOptions {
  product: string;
  version: string;
  productId?: string;
  versionId?: string;
  tocEntries?: Array<{ id: string; title: string; indent: number }>;
  itemMeta?: Record<string, { breadcrumb: string[]; isCategory: boolean }>;
  categoryIndex?: Record<string, { children: string[]; docs: string[] }>;
  pagePaddings?: [number, number, number, number];
  getChartAssetHref?: (
    chartData: ChartData,
    targetWidthPx: number,
  ) => { src: string; width: number; height: number } | null;
  pageSize: "A4" | "Letter";
  includeTOC: boolean;
  theme: StyleTheme;
  staticStylesBase?: string;
}

export function generateHTML(item: DocItem, options: GenerateOptions): string {
  return renderDocument(item, options);
}

export function generateConsolidatedHTML(
  items: DocItem[],
  options: GenerateOptions,
): string {
  return renderConsolidatedDocument(items, options);
}
