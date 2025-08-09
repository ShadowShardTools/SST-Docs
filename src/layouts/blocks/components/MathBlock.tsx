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

const MathBlock: React.FC<Props> = ({ index, styles, mathData }) => {
  const expression = mathData.expression ?? "";
  const trimmedExpression = useMemo(() => expression.trim(), [expression]);
  const { html, isLoading, error } = useKaTeX(trimmedExpression);

  if (!trimmedExpression) return null;

  const alignment = mathData.alignment ?? "center";

  if (isLoading) {
    return (
      <div
        key={index}
        className={`${SPACING_CLASSES.medium} ${ALIGNMENT_CLASSES[alignment].text}`}
      >
        <div className="animate-pulse bg-gray-200 h-8 rounded" />
      </div>
    );
  }

  return (
    <div
      key={index}
      className={`${SPACING_CLASSES.medium} ${ALIGNMENT_CLASSES[alignment].text}`}
    >
      <div
        className={styles.text.math}
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
