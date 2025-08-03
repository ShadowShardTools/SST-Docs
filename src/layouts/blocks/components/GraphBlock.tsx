import Desmos from "desmos";
import { useEffect, useRef } from "react";
import type { GraphData } from "../types";
import { useCurrentTheme } from "../../../application/hooks/useCurrentTheme";
import { ALIGNMENT_CLASSES } from "../constants";
import { validateScale, getResponsiveWidth } from "../utilities";

declare global {
  interface Window {
    Desmos: typeof Desmos;
  }
}

interface Props {
  index: number;
  graphData: GraphData;
}

const GraphBlock: React.FC<Props> = ({ index, graphData }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const calculatorRef = useRef<Desmos.Calculator | null>(null);
  const theme = useCurrentTheme();

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const calculator = Desmos.GraphingCalculator(container, {
      expressions: graphData.expressionsCustomization,
      keypad: graphData.expressionsCustomization,
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

  const scale = validateScale(graphData.scale);
  const width = getResponsiveWidth(scale, false);
  const alignment = graphData.alignment ?? "center";

  return (
    <div key={index} className="mb-6 w-full">
      <div
        className={`${scale !== 1 ? ALIGNMENT_CLASSES[alignment].container : "mx-auto"}`}
        style={{ width }}
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
    </div>
  );
};

export default GraphBlock;
