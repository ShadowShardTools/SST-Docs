import { useEffect, useMemo, useState } from "react";
import type { StyleTheme } from "../../types/entities/StyleTheme";
import type { MathData } from "../../types/data/MathData";

const MathBlock: React.FC<{
  index: number;
  styles: StyleTheme;
  mathData: MathData;
}> = ({ index, styles, mathData }) => {
  const [html, setHtml] = useState<string>("");

  const expression = mathData.expression ?? "";
  const trimmedContent = useMemo(() => expression.trim(), [expression]);

  useEffect(() => {
    let isMounted = true;

    import("katex").then((katex) => {
      if (isMounted) {
        try {
          const rendered = katex.renderToString(trimmedContent, {
            throwOnError: false,
            output: "html",
            trust: false,
            strict: "warn",
          });
          setHtml(rendered);
        } catch (e) {
          setHtml(`<span class="text-red-500">Invalid LaTeX</span>`);
        }
      }
    });

    return () => {
      isMounted = false;
    };
  }, [trimmedContent]);

  if (!trimmedContent) return null;

  const alignment = mathData.alignment ?? "center";
  const alignmentClasses = {
    left: "text-left",
    center: "text-center",
    right: "text-right",
  };

  return (
    <div key={index} className={`mb-6 ${alignmentClasses[alignment]}`}>
      <div
        className={styles.text.math}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
};

export default MathBlock;
