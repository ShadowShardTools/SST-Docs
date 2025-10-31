import React, { useMemo } from "react";
import type { StyleTheme } from "../../../application/types/StyleTheme";
import { ALIGNMENT_CLASSES, SPACING_CLASSES } from "../constants";
import { useKaTeX } from "../hooks";
import type { MathData } from "../types";

interface Props {
  index: number;
  styles: StyleTheme;
  mathData: MathData;
}

const JUSTIFY_MAP = {
  left: "flex-start",
  center: "center",
  right: "flex-end",
} as const;

export const MathBlock: React.FC<Props> = ({ index, styles, mathData }) => {
  const expression = mathData.expression ?? "";
  const trimmedExpression = useMemo(() => expression.trim(), [expression]);
  const { html, isLoading, error } = useKaTeX(trimmedExpression);

  if (!trimmedExpression) return null;

  const rawAlignment = (mathData.alignment ?? "center").toLowerCase();
  const alignment = (
    ["left", "right"].includes(rawAlignment) ? rawAlignment : "center"
  ) as keyof typeof ALIGNMENT_CLASSES;

  const containerStyle = useMemo<React.CSSProperties>(
    () => ({
      display: "flex",
      justifyContent: JUSTIFY_MAP[alignment] ?? JUSTIFY_MAP.center,
      width: "100%",
      textAlign: alignment,
    }),
    [alignment],
  );

  if (isLoading) {
    return (
      <div
        key={index}
        className={`${SPACING_CLASSES.medium} ${ALIGNMENT_CLASSES[alignment].text}`}
      >
        <div style={containerStyle}>
          <div className="animate-pulse bg-gray-200 h-8 rounded w-24" />
        </div>
      </div>
    );
  }

  return (
    <div
      key={index}
      className={`${SPACING_CLASSES.medium} ${ALIGNMENT_CLASSES[alignment].text}`}
    >
      <div
        className={`${styles.text.math} math-block`}
        style={containerStyle}
        dangerouslySetInnerHTML={{ __html: html }}
      />
      {error && (
        <div className="mt-2 text-sm text-red-500" role="alert">
          {error}
        </div>
      )}
    </div>
  );
};

export default MathBlock;
