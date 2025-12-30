import type { Content, MessageBoxData } from "@shadow-shard-tools/docs-core";
import { Info, AlertTriangle, CheckCircle, MinusCircle, Quote } from "lucide-react";

type MessageBoxBlock = Extract<Content, { type: "messageBox" }>;

interface Props {
  block: MessageBoxBlock;
  onChange: (updated: MessageBoxBlock) => void;
}

const TYPES: MessageBoxData["type"][] = [
  "info",
  "warning",
  "error",
  "success",
  "neutral",
  "quote",
];

export function MessageBoxBlockForm({ block, onChange }: Props) {
  const data = block.messageBoxData ?? {};
  return (
    <div className="space-y-4">
      <label className="flex flex-col gap-1 text-sm">
        <textarea
          className="border rounded px-2 py-1 min-h-[40px]"
          value={data.text ?? ""}
          onChange={(e) =>
            onChange({
              ...block,
              messageBoxData: { ...data, text: e.target.value },
            })
          }
        />
      </label>
      <div className="flex flex-wrap items-center gap-4 text-sm">
        <div className="flex items-center gap-2">
          <span>Type</span>
          <div className="inline-flex rounded border overflow-hidden bg-white dark:bg-slate-900 w-fit">
            {TYPES.map((t) => (
              <button
                key={t}
                type="button"
                className={`px-3 py-1.5 flex items-center gap-1 text-sm border-r last:border-r-0 ${(data.type ?? "info") === t
                    ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900"
                    : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200"
                  }`}
                onClick={() =>
                  onChange({
                    ...block,
                    messageBoxData: { ...data, type: t },
                  })
                }
              >
                {t === "info" && <Info className="w-4 h-4" />}
                {t === "warning" && <AlertTriangle className="w-4 h-4" />}
                {t === "error" && <MinusCircle className="w-4 h-4" />}
                {t === "success" && <CheckCircle className="w-4 h-4" />}
                {t === "quote" && <Quote className="w-4 h-4" />}
                <span className="capitalize">{t}</span>
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span>Size</span>
          <div className="inline-flex rounded border overflow-hidden bg-white dark:bg-slate-900">
            {(["small", "medium", "large"] as const).map((size) => (
              <button
                key={size}
                type="button"
                className={`px-3 py-1.5 text-sm border-r last:border-r-0 ${(data.size ?? "medium") === size
                    ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900"
                    : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200"
                  }`}
                onClick={() =>
                  onChange({
                    ...block,
                    messageBoxData: { ...data, size },
                  })
                }
              >
                {size}
              </button>
            ))}
          </div>
        </div>
        <label className="inline-flex items-center gap-2">
          <input
            type="checkbox"
            checked={data.showIcon ?? true}
            onChange={(e) =>
              onChange({
                ...block,
                messageBoxData: { ...data, showIcon: e.target.checked },
              })
            }
          />
          <span>Show icon</span>
        </label>
      </div>
    </div>
  );
}

export default MessageBoxBlockForm;
