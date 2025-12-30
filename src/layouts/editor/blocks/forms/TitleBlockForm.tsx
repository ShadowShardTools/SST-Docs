import type { Content } from "@shadow-shard-tools/docs-core";
import { AlignLeft, AlignCenter, AlignRight } from "lucide-react";

type TitleBlock = Extract<Content, { type: "title" }>;

interface Props {
  block: TitleBlock;
  onChange: (updated: TitleBlock) => void;
}

export function TitleBlockForm({ block, onChange }: Props) {
  const data = block.titleData ?? {};
  return (
    <div className="space-y-3">
      <label className="flex flex-col gap-1 text-sm">
        <input
          className="border rounded px-2 py-1"
          value={data.text ?? ""}
          onChange={(e) =>
            onChange({
              ...block,
              titleData: { ...data, text: e.target.value },
            })
          }
        />
      </label>
      <div className="flex flex-wrap items-center gap-4 text-sm">
        <div className="flex items-center gap-2">
          <span>Level</span>
          <div className="inline-flex rounded border overflow-hidden bg-white dark:bg-slate-900">
            {[1, 2, 3].map((lvl) => (
              <button
                key={lvl}
                type="button"
                className={`px-3 py-1.5 text-sm border-r last:border-r-0 ${
                  (data.level ?? 2) === lvl
                    ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900"
                    : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200"
                }`}
                onClick={() =>
                  onChange({
                    ...block,
                    titleData: { ...data, level: lvl as 1 | 2 | 3 },
                  })
                }
              >
                H{lvl}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span>Alignment</span>
          <div className="inline-flex rounded border overflow-hidden bg-white dark:bg-slate-900">
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
                    titleData: { ...data, alignment: align },
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
                    titleData: { ...data, spacing: space },
                  })
                }
              >
                {space}
              </button>
            ))}
          </div>
        </div>

        <label className="inline-flex items-center gap-2">
          <input
            type="checkbox"
            checked={data.enableAnchorLink ?? false}
            onChange={(e) =>
              onChange({
                ...block,
                titleData: { ...data, enableAnchorLink: e.target.checked },
              })
            }
          />
          <span>Anchor link</span>
        </label>
        <label className="inline-flex items-center gap-2">
          <input
            type="checkbox"
            checked={data.underline ?? false}
            onChange={(e) =>
              onChange({
                ...block,
                titleData: { ...data, underline: e.target.checked },
              })
            }
          />
          <span>Underline</span>
        </label>
      </div>
    </div>
  );
}

export default TitleBlockForm;
