import React, { useMemo } from "react";
import { useKaTeX } from "../hooks";
import {
  ALIGNMENT_CLASSES,
  SPACING_CLASSES,
} from "@shadow-shard-tools/docs-core";
import type { MathData } from "@shadow-shard-tools/docs-core/types/MathData";
import type { StyleTheme } from "@shadow-shard-tools/docs-core/types/StyleTheme";

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
  const alignment: keyof typeof ALIGNMENT_CLASSES =
    rawAlignment === "left" || rawAlignment === "right"
      ? rawAlignment
      : "center";

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
          <div
            className={`animate-pulse h-8 rounded w-24 ${styles.sections.contentBackground || "sst-content-bg"}`}
          />
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
        <div
          className={`mt-2 text-sm rounded p-2 ${styles.messageBox.error || "sst-msg-error"}`}
          role="alert"
        >
          {error}
        </div>
      )}
    </div>
  );
};

export default MathBlock;
