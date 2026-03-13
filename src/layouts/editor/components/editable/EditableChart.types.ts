import type { ChartData } from "#core/types/ChartData";

export type EditableChartDataset = {
  label: string;
  data: any[];
  backgroundColor?: string | string[];
  borderColor?: string | string[];
};

export type EditableChartData = Omit<ChartData, "datasets"> & {
  datasets: EditableChartDataset[];
};
