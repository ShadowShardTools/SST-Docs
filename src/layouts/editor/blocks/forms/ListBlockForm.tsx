import type { Content } from "@shadow-shard-tools/docs-core";
import {
  AlignLeft,
  AlignCenter,
  AlignRight,
  List as ListIcon,
  ListOrdered,
  Accessibility,
} from "lucide-react";

type ListBlock = Extract<Content, { type: "list" }>;

interface Props {
  block: ListBlock;
  onChange: (updated: ListBlock) => void;
}

export function ListBlockForm({ block, onChange }: Props) {
  const data = block.listData ?? {};
  const items = data.items ?? [];

  return (
    <div className="space-y-4">
      <label className="flex flex-col gap-1 text-sm">
        <span>Items (one per line)</span>
        <textarea
          className="border rounded px-2 py-1 min-h-[120px]"
          value={items.join("\n")}
          onChange={(e) =>
            onChange({
              ...block,
              listData: {
                ...data,
                items: e.target.value
                  .split("\n")
                  .map((line) => line.trim())
                  .filter(Boolean),
              },
            })
          }
        />
      </label>
      <div className="flex flex-wrap items-center gap-4 text-sm">
        <div className="inline-flex rounded border overflow-hidden bg-white dark:bg-slate-900">
          {(["ul", "ol"] as const).map((type) => (
            <button
              key={type}
              type="button"
              className={`px-3 py-1.5 flex items-center gap-1 text-sm border-r last:border-r-0 ${
                (data.type ?? "ul") === type
                  ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900"
                  : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200"
              }`}
              onClick={() =>
                onChange({
                  ...block,
                  listData: { ...data, type },
                })
              }
            >
              {type === "ul" ? (
                <ListIcon className="w-4 h-4" />
              ) : (
                <ListOrdered className="w-4 h-4" />
              )}
              <span>{type === "ul" ? "Bullets" : "Numbers"}</span>
            </button>
          ))}
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
                    listData: { ...data, alignment: align },
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
        <label className="inline-flex items-center gap-2">
          <input
            type="checkbox"
            checked={data.inside ?? false}
            onChange={(e) =>
              onChange({
                ...block,
                listData: { ...data, inside: e.target.checked },
              })
            }
          />
          <span>Inside</span>
        </label>
      </div>

      <div className="flex flex-wrap items-center gap-4 text-sm">
        {data.type === "ol" && (
          <label className="flex items-center gap-2">
            <span>Start</span>
            <input
              type="number"
              className="border rounded px-2 py-1 w-24"
              value={data.startNumber ?? 1}
              min={1}
              onChange={(e) =>
                onChange({
                  ...block,
                  listData: {
                    ...data,
                    startNumber: Number(e.target.value) || 1,
                  },
                })
              }
            />
          </label>
        )}
        <label className="flex items-center gap-2">
          <Accessibility className="w-4 h-4" />
          <input
            type="text"
            className="border rounded px-2 py-1"
            placeholder="Aria label"
            value={data.ariaLabel ?? ""}
            onChange={(e) =>
              onChange({
                ...block,
                listData: { ...data, ariaLabel: e.target.value },
              })
            }
          />
        </label>
      </div>
    </div>
  );
}

export default ListBlockForm;
