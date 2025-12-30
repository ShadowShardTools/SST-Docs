import type { Content } from "@shadow-shard-tools/docs-core";

type DividerBlock = Extract<Content, { type: "divider" }>;

interface Props {
  block: DividerBlock;
  onChange: (updated: DividerBlock) => void;
}

export function DividerBlockForm({ block, onChange }: Props) {
  const data = block.dividerData ?? {};
  return (
    <div className="flex flex-wrap items-center gap-3 text-sm">
      <input
        className="border rounded px-2 py-1"
        value={data.text ?? ""}
        onChange={(e) =>
          onChange({
            ...block,
            dividerData: { ...data, text: e.target.value },
          })
        }
      />
      <span>Style</span>
      <div className="inline-flex rounded border overflow-hidden bg-white dark:bg-slate-900">
        {(["line", "dashed", "dotted", "double", "thick", "gradient"] as const).map(
          (type) => (
            <button
              key={type}
              type="button"
              className={`px-3 py-1.5 text-sm border-r last:border-r-0 ${(data.type ?? "line") === type
                  ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900"
                  : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200"
                }`}
              onClick={() =>
                onChange({
                  ...block,
                  dividerData: { ...data, type },
                })
              }
            >
              {type}
            </button>
          ),
        )}
      </div>
      <div className="flex items-center gap-2">
        <span>Spacing</span>
        <div className="inline-flex rounded border overflow-hidden bg-white dark:bg-slate-900">
          {(["small", "medium", "large"] as const).map((space) => (
            <button
              key={space}
              type="button"
              className={`px-3 py-1.5 text-sm border-r last:border-r-0 ${(data.spacing ?? "medium") === space
                  ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900"
                  : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200"
                }`}
              onClick={() =>
                onChange({
                  ...block,
                  dividerData: { ...data, spacing: space },
                })
              }
            >
              {space}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default DividerBlockForm;
