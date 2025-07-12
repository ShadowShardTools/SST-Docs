import React from "react";
import type { StyleTheme } from "../../siteConfig";
import type { TableCell } from "../../types/entities/TableCell";

interface TableBlockProps {
  index: number;
  styles: StyleTheme;
  tableType?: "vertical" | "horizontal" | "matrix";
  tableData: TableCell[][];
}

const TableBlock: React.FC<TableBlockProps> = ({
  tableData,
  styles,
  index,
  tableType = "vertical",
}) => {
  if (!tableData?.length) {
    return (
      <div key={index} className="mb-6 p-4 text-center text-gray-500">
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
        className={`${styles.components.tableBorder} border rounded-lg`}
        style={{
          borderCollapse: "collapse",
          tableLayout: "auto",
          minWidth: "100%",
        }}
      >
        <tbody>
          {tableData.map((row, rowIndex) => (
            <tr
              key={`row-${rowIndex}`}
              className={`border-b ${styles.components.tableBorder} last:border-b-0 ${styles.components.tableRows}`}
            >
              {row.map((cell, cellIndex) => {
                const CellComponent = cell.isHeader ? "th" : "td";
                const isMatrixCorner =
                  tableType === "matrix" && rowIndex === 0 && cellIndex === 0;
                const baseCellClass = `px-2 py-1 border-r ${styles.components.tableBorder} last:border-r-0`;

                const cellStyle = isMatrixCorner
                  ? styles.components.tableCorner
                  : cell.isHeader ||
                      (tableType === "vertical" && rowIndex === 0) ||
                      (tableType === "horizontal" && cellIndex === 0)
                    ? styles.components.tableHeaders
                    : styles.components.tableRows;

                return (
                  <CellComponent
                    key={`cell-${rowIndex}-${cellIndex}`}
                    className={`${baseCellClass} ${cellStyle}`}
                    scope={cell.scope}
                  >
                    {cell.content}
                  </CellComponent>
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
