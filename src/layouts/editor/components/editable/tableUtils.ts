import type { TableCell, TableData } from "@shadow-shard-tools/docs-core";

export const normalizeTableData = (incoming?: TableData): TableData => {
  if (!incoming?.data?.length) {
    return { type: "horizontal", data: [[{ content: "" }]] };
  }

  const normalizedRows = incoming.data.map((row) =>
    row?.length
      ? row.map((cell) => ({
          content: cell?.content ?? "",
          scope: cell?.scope,
        }))
      : [{ content: "" }],
  );

  return {
    type: incoming.type ?? "horizontal",
    data: normalizedRows,
  };
};

export const toPlainText = (value: string) => {
  if (!value) return "";
  if (typeof document === "undefined") {
    return value.replace(/<[^>]*>/g, "");
  }
  const container = document.createElement("div");
  container.innerHTML = value;
  return container.textContent ?? "";
};

export const getTableDimensions = (tableData: TableData) => {
  const rowCount = tableData.data.length;
  const columnCount = tableData.data.reduce(
    (max, row) => Math.max(max, row.length),
    tableData.data[0]?.length ?? 1,
  );
  return { rowCount, columnCount };
};

export const createEmptyCell = (): TableCell => ({ content: "" });

export const createEmptyRow = (columnCount: number) =>
  Array.from({ length: Math.max(columnCount, 1) }, () => createEmptyCell());

export const addRow = (tableData: TableData, columnCount: number) => ({
  ...tableData,
  data: [...tableData.data, createEmptyRow(columnCount)],
});

export const addColumn = (tableData: TableData) => ({
  ...tableData,
  data: tableData.data.map((row) => [...row, createEmptyCell()]),
});

export const removeRow = (tableData: TableData, rowIndex: number) => ({
  ...tableData,
  data: tableData.data.filter((_, i) => i !== rowIndex),
});

export const removeColumn = (tableData: TableData, columnIndex: number) => ({
  ...tableData,
  data: tableData.data.map((row) =>
    row.length > 1
      ? row.filter((_, idx) => idx !== columnIndex)
      : [createEmptyCell()],
  ),
});

export const isHeaderRow = (
  tableType: TableData["type"] | undefined,
  rowIndex: number,
) =>
  tableType !== "blank" &&
  (tableType === "vertical" || tableType === "matrix") &&
  rowIndex === 0;

export const isHeaderColumn = (
  tableType: TableData["type"] | undefined,
  columnIndex: number,
) =>
  tableType !== "blank" &&
  (tableType === "horizontal" || tableType === "matrix") &&
  columnIndex === 0;

export const isHeaderCell = (
  tableType: TableData["type"] | undefined,
  rowIndex: number,
  columnIndex: number,
) =>
  (tableType === "vertical" && rowIndex === 0) ||
  (tableType === "horizontal" && columnIndex === 0) ||
  (tableType === "matrix" && (rowIndex === 0 || columnIndex === 0));

export const getCellScope = (
  tableType: TableData["type"] | undefined,
  rowIndex: number,
  columnIndex: number,
  scope?: TableCell["scope"],
) => {
  if (scope) return scope;
  if (tableType === "horizontal" && columnIndex === 0) return "row";
  if (tableType === "vertical" && rowIndex === 0) return "col";
  if (tableType === "matrix") {
    if (rowIndex === 0 && columnIndex === 0) return undefined;
    if (rowIndex === 0) return "col";
    if (columnIndex === 0) return "row";
  }
  return undefined;
};
