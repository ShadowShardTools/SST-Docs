import type { StyleTheme } from "../../../application/types/StyleTheme";
import type { ChartData } from "../../../layouts/blocks/types/ChartData";
import type { Content } from "../../../layouts/render/types";

export interface RenderContext {
  styles: StyleTheme;
  basePath: string;
  currentPath: string;
  resolveAssetHref?: (original: string) => string;
  getChartAssetHref?: (
    chartData: ChartData,
    targetWidth: number,
  ) => { src: string; width: number; height: number } | null;
}

export type BlockRenderer = (
  ctx: RenderContext,
  block: Content,
) => string | null;
