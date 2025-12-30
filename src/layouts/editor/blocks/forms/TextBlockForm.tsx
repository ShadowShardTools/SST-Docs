import type { Content } from "@shadow-shard-tools/docs-core";
import { AlignLeft, AlignCenter, AlignRight } from "lucide-react";

type TextBlock = Extract<Content, { type: "text" }>;

interface Props {
  block: TextBlock;
  onChange: (updated: TextBlock) => void;
}

export function TextBlockForm({ block, onChange }: Props) {
  const data = block.textData ?? {};
  return (
    <div className="space-y-3">
      <label className="flex flex-col gap-1 text-sm">
        <textarea
          className="border rounded px-2 py-1 min-h-[120px]"
          value={data.text ?? ""}
          onChange={(e) =>
            onChange({
              ...block,
              textData: { ...data, text: e.target.value },
            })
          }
        />
      </label>
      <div className="flex flex-wrap items-center gap-4 text-sm">
        <div className="flex items-center gap-2">
          <span>Alignment</span>
          <div className="inline-flex rounded border overflow-hidden bg-white dark:bg-slate-900 w-auto">
            {(["left", "center", "right"] as const).map((align) => (
              <button
                key={align}
                type="button"
                className={`px-3 py-1.5 flex items-center gap-1 text-sm border-r last:border-r-0 ${
                  (data.alignment ?? "left") === align
                    ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900"
                    : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200"
                }`}
                onClick={() =>
                  onChange({
                    ...block,
                    textData: { ...data, alignment: align },
                  })
                }
              >
                {align === "left" && <AlignLeft className="w-4 h-4" />}
                {align === "center" && <AlignCenter className="w-4 h-4" />}
                {align === "right" && <AlignRight className="w-4 h-4" />}
                <span className="capitalize">{align}</span>
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span>Spacing</span>
          <div className="inline-flex rounded border overflow-hidden bg-white dark:bg-slate-900">
            {(["none", "small", "medium", "large"] as const).map((space) => (
              <button
                key={space}
                type="button"
                className={`px-3 py-1.5 text-sm border-r last:border-r-0 ${
                  (data.spacing ?? "medium") === space
                    ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900"
                    : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200"
                }`}
                onClick={() =>
                  onChange({
                    ...block,
                    textData: { ...data, spacing: space },
                  })
                }
              >
                {space}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default TextBlockForm;
