import { ALIGNMENT_CLASSES } from "@shadow-shard-tools/docs-core";
import { useEffect, useMemo, useRef } from "react";
import MathBlock from "../../../blocks/components/MathBlock";
import type { StyleTheme } from "@shadow-shard-tools/docs-core/types/StyleTheme";
import type { MathData } from "@shadow-shard-tools/docs-core/types/MathData";

interface EditableMathProps {
  data?: MathData;
  styles: StyleTheme;
  onChange: (next: MathData) => void;
}

export function EditableMath({ data, styles, onChange }: EditableMathProps) {
  const mathData = data ?? {};
  const expression = mathData.expression ?? "";
  const alignment = (mathData.alignment ?? "center") as keyof typeof ALIGNMENT_CLASSES;
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current && textareaRef.current.value !== expression) {
      textareaRef.current.value = expression;
    }
  }, [expression]);

  const textAlignClass = ALIGNMENT_CLASSES[alignment]?.text ?? ALIGNMENT_CLASSES.center.text;
  const previewData = useMemo(
    () => ({
      ...mathData,
      expression,
      alignment,
    }),
    [mathData, expression, alignment],
  );

  return (
    <div className="space-y-2">
      <label className="flex flex-col gap-1">
        <span className="text-xs text-slate-500">Expression</span>
        <textarea
          ref={textareaRef}
          className="w-full min-h-[90px] rounded border px-2 py-1 font-mono text-sm bg-white dark:bg-slate-900"
          defaultValue={expression}
          onChange={(e) =>
            onChange({
              ...mathData,
              expression: e.target.value,
            })
          }
          placeholder="Enter LaTeX expression"
        />
      </label>
      <div className={`rounded border px-3 py-2 ${textAlignClass}`}>
        <MathBlock index={0} styles={styles} mathData={previewData as MathData} />
      </div>
    </div>
  );
}

export default EditableMath;
