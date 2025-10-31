export interface TableCell {
  content: string;
  isHeader?: boolean;
  scope?: "row" | "col";
}

export interface TableData {
  type?: "vertical" | "horizontal" | "matrix";
  data: TableCell[][];
}
