// src/layouts/blocks/components/GraphBlock.tsx
import functionPlot from "function-plot";
import { useEffect, useRef } from "react";
import type { GraphData } from "../types";
import { ALIGNMENT_CLASSES } from "../constants";
import { validateScale, getResponsiveWidth } from "../utilities";
import type { StyleTheme } from "../../../application/types/StyleTheme";

interface Props {
  index: number;
  styles: StyleTheme;
  graphData: GraphData;
}

// helper → make sure width is always a number
function coerceToPx(
  val: number | string | undefined,
  fallback: number,
): number {
  if (typeof val === "number") return val;
  if (typeof val === "string") {
    if (val.trim().endsWith("%")) return fallback;
    const n = parseFloat(val);
    return Number.isFinite(n) ? n : fallback;
  }
  return fallback;
}

const GraphBlock: React.FC<Props> = ({ index, styles, graphData }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const plotRef = useRef<any>(null);
  const roRef = useRef<ResizeObserver | null>(null);

  const scale = validateScale(graphData.scale);
  const widthStyle = getResponsiveWidth(scale, false);
  const alignment = graphData.alignment ?? "center";

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const outer = container.parentElement as HTMLDivElement | null;
    if (!outer) return;

    const render = () => {
      let w = container.getBoundingClientRect().width;
      if (!w && outer) w = outer.getBoundingClientRect().width;
      if (!w) w = coerceToPx(widthStyle as any, 600);

      w = Math.max(200, Math.floor(w));
      const h = Math.max(120, Math.round((w * 9) / 16)); // keep 16:9 aspect

      container.innerHTML = "";

      plotRef.current = functionPlot({
        target: container,
        width: w,
        height: h,
        grid: true,
        disableZoom: false,
        tip: {
          xLine: true,
          yLine: true,
          renderer: (x, y) => `(${x.toFixed(3)}, ${y.toFixed(3)})`,
        },
        data: (graphData.expressions ?? []).map((expr) => ({
          fn: expr,
          graphType: "polyline",
        })),
      });

      // style background + text
      const svg = container.querySelector("svg") as SVGElement | null;

      // background (SVG doesn't *have* a background by default; style works on outer <svg>)
      if (svg) svg.style.background = styles.graph.background;
    };

    render();

    roRef.current?.disconnect();
    roRef.current = new ResizeObserver(() => render());
    roRef.current.observe(outer);

    return () => {
      roRef.current?.disconnect();
      roRef.current = null;
      container.innerHTML = "";
      plotRef.current = null;
    };
  }, [
    widthStyle,
    graphData.expressions,
    styles.graph.background,
    styles.graph.grid,
    styles.graph.text,
    styles.graph.defaultCurve,
  ]);

  return (
    <div key={index} className="mb-6 w-full">
      <div
        className={`${
          scale !== 1 ? ALIGNMENT_CLASSES[alignment].container : "mx-auto"
        }`}
        style={{ width: widthStyle }}
      >
        {/* Aspect wrapper (16:9) */}
        <div className="relative w-full" style={{ paddingTop: "56.25%" }}>
          <div
            className="absolute top-0 left-0 w-full h-full rounded-xl overflow-hidden"
            style={{ background: styles.graph.background }}
          >
            <div
              ref={containerRef}
              role="img"
              aria-label="Interactive graph"
              className="w-full h-full"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default GraphBlock;
