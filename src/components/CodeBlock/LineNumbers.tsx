import { memo } from "react";
import type { StyleTheme } from "../../types/entities/StyleTheme";

export const LineNumbers = memo(
  ({ styles, content }: { styles: StyleTheme; content: string }) => {
    const lines = content.split("\n");
    return (
      <div className={`select-none pr-4 flex-shrink-0 ${styles.code.lines}`}>
        {lines.map((_, i) => (
          <div key={i} className="text-right leading-6 min-h-[1.5rem]">
            {i + 1}
          </div>
        ))}
      </div>
    );
  },
);

LineNumbers.displayName = "LineNumbers";
