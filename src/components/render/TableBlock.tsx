import React from "react";
import type { StyleTheme } from "../../config/siteConfig";

const TableBlock: React.FC<{
  index: number;
  styles: StyleTheme;
  tableHeaders?: string[];
  tableRows?: string[][];
}> = ({ index, styles, tableHeaders, tableRows }) => {

  return (
    <div key={index} className="mb-6 overflow-x-auto">
      <table className={`${styles.componentsStyles.tableBorder} min-w-full border rounded-lg`}>
        {tableHeaders && (
          <thead className={styles.sectionStyles.tableHeadersBackground}>
            <tr>
              {tableHeaders.map((h, i) => (
                <th
                  key={i}
                  className={`px-4 py-2 text-left border-b border-r ${styles.componentsStyles.tableBorder} last:border-r-0 ${styles.textStyles.tableHeadersText}`}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
        )}
        <tbody>
          {tableRows?.map((row, r) => (
            <tr
              key={r}
              className={`border-b ${styles.componentsStyles.tableBorder} last:border-b-0 ${styles.sectionStyles.tableRowsBackground}`}
            >
              {row.map((cell, c) => (
                <td
                  key={c}
                  className={`px-4 py-2 border-r ${styles.componentsStyles.tableBorder} last:border-r-0 ${styles.textStyles.tableRowsText}`}
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TableBlock;