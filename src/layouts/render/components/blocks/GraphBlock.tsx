import Desmos from "desmos";
import { useEffect, useRef } from "react";
import type { GraphData } from "../../types";
import { useTheme } from "../../../../application/hooks/useTheme";

declare global {
  interface Window {
    Desmos: typeof Desmos;
  }
}

const GraphBlock: React.FC<{ index: number; graphData: GraphData }> = ({
  index,
  graphData,
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

    graphData.expressions.forEach((expr, index) => {
      calculator.setExpression({
        id: `expr-${index}`,
        latex: expr,
      });
    });

    return () => {
      calculatorRef.current?.destroy?.();
      calculatorRef.current = null;
    };
  }, [graphData.expressions, theme]);

  const alignment = graphData.alignment ?? "center";
  const rawScale = graphData.scale ?? 1;
  const scale = rawScale > 0 ? rawScale : 1;
  const width = `${scale * 100}%`;

  const alignmentClasses = {
    left: "mr-auto",
    center: "mx-auto",
    right: "ml-auto",
  };

  return (
    <div
      key={index}
      className={`mb-6 w-full md:${alignmentClasses[alignment]}`}
      style={{ width: undefined, ...(scale !== 1 && { width }) }}
    >
      <div className="relative w-full" style={{ paddingTop: "56.25%" }}>
        <div
          ref={containerRef}
          role="img"
          aria-label="Interactive graph"
          className="absolute top-0 left-0 w-full h-full"
        />
      </div>
    </div>
  );
};

export default GraphBlock;
