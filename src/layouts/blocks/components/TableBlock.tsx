import React from "react";
import type { StyleTheme, TableData } from "@shadow-shard-tools/docs-core";

interface Props {
  index: number;
  styles: StyleTheme;
  tableData: TableData;
}

export const TableBlock: React.FC<Props> = ({ tableData, styles, index }) => {
  const tableType = tableData.type ?? "horizontal";
  if (!tableData.data?.length) {
    return (
      <div key={index} className={`${styles.table.empty} mb-6 p-4 text-center`}>
        No data available
      </div>
    );
  }

  return (
    <div
      key={index}
      className="mb-6 overflow-x-auto"
      style={{
        WebkitOverflowScrolling: "touch",
        overflowX: "auto",
        whiteSpace: "nowrap",
      }}
    >
      <table
        className={`${styles.table.border} border rounded-lg`}
        style={{
          borderCollapse: "collapse",
          tableLayout: "auto",
          minWidth: "100%",
        }}
      >
        <tbody>
          {tableData.data.map((row, rowIndex) => (
            <tr
              key={`row-${rowIndex}`}
              className={`border-b ${styles.table.border} last:border-b-0 ${styles.table.rows}`}
            >
              {row.map((cell, cellIndex) => {
                const isHeader =
                  (tableType === "vertical" && rowIndex === 0) ||
                  (tableType === "horizontal" && cellIndex === 0) ||
                  (tableType === "matrix" &&
                    (rowIndex === 0 || cellIndex === 0));
                const CellComponent = isHeader ? "th" : "td";
                const isMatrixCorner =
                  tableType === "matrix" && rowIndex === 0 && cellIndex === 0;
                const baseCellClass = `px-2 py-1 border-r ${styles.table.border} last:border-r-0`;

                const cellStyle = isMatrixCorner
                  ? styles.table.cornerCell
                  : isHeader
                    ? styles.table.headers
                    : styles.table.rows;

                const scope =
                  cell.scope ??
                  (tableType === "horizontal" && cellIndex === 0
                    ? "row"
                    : tableType === "vertical" && rowIndex === 0
                      ? "col"
                      : tableType === "matrix"
                        ? rowIndex === 0 && cellIndex === 0
                          ? undefined
                          : rowIndex === 0
                            ? "col"
                            : cellIndex === 0
                              ? "row"
                              : undefined
                        : undefined);

                return (
                  <CellComponent
                    key={`cell-${rowIndex}-${cellIndex}`}
                    className={`${baseCellClass} ${cellStyle}`}
                    scope={scope}
                    dangerouslySetInnerHTML={{
                      __html: cell.content ?? "",
                    }}
                  />
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TableBlock;
