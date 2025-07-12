export interface TableCell {
  content: string;
  isHeader?: boolean;
  scope?: "row" | "col";
}
