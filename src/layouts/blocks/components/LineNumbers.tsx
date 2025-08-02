import { memo } from "react";
import type { StyleTheme } from "../../../types/StyleTheme";

interface Props {
  styles: StyleTheme;
  content: string;
}

export const LineNumbers = memo(({ styles, content }: Props) => {
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
});

LineNumbers.displayName = "LineNumbers";
