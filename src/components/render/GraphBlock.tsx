import Desmos from "desmos";
import { useEffect, useRef } from "react";
import { useTheme } from "../../hooks/useTheme";

declare global {
  interface Window {
    Desmos: typeof Desmos;
  }
}

const GraphBlock: React.FC<{ index: number; graphExpressions: string[] }> = ({
  index,
  graphExpressions,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const calculatorRef = useRef<Desmos.Calculator | null>(null);
  const theme = useTheme();

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const calculator = Desmos.GraphingCalculator(container, {
      expressions: true,
      keypad: true,
      invertedColors: theme === "dark",
    });

    calculatorRef.current = calculator;

    graphExpressions.forEach((expr, index) => {
      calculator.setExpression({
        id: `expr-${index}`,
        latex: expr,
      });
    });

    return () => {
      calculatorRef.current?.destroy?.();
      calculatorRef.current = null;
    };
  }, [graphExpressions, theme]);

  return (
    <div key={index} className="mb-6">
      <div
        ref={containerRef}
        role="img"
        aria-label="Interactive graph"
        className="w-full h-96 rounded border bg-white dark:bg-zinc-900 shadow-sm"
      />
    </div>
  );
};

export default GraphBlock;
