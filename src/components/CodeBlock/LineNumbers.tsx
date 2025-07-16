// File: components/CodeBlock/LineNumbers.tsx
import { memo } from "react";

export const LineNumbers = memo(({ content }: { content: string }) => {
  const lines = content.split("\n");
  return (
    <div className="select-none pr-4 text-sm text-gray-500 border-r border-gray-300 dark:border-gray-600 flex-shrink-0">
      {lines.map((_, i) => (
        <div key={i} className="text-right leading-6 min-h-[1.5rem]">
          {i + 1}
        </div>
      ))}
    </div>
  );
});

LineNumbers.displayName = "LineNumbers";
