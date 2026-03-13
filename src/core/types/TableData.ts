export interface TableCell {
  content: string;
  scope?: "row" | "col";
}

export interface TableData {
  type?: "blank" | "vertical" | "horizontal" | "matrix";
  data: TableCell[][];
}
