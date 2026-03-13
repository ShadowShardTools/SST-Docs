export interface ChartData {
  type?: string;
  title?: string;
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string;
    borderColor?: string;
  }[];
  alignment?: "left" | "center" | "right";
  scale?: number;
}
