import type { Content } from "@shadow-shard-tools/docs-core";

interface Props {
  data: any;
  onChange: (updater: (prev: Content) => Content) => void;
}

export function MessageBoxToolbarControls({ data, onChange }: Props) {
  return (
    <>
      <label className="flex items-center gap-1">
        <span>Type</span>
        <select
          className="border rounded px-1.5 py-0.5 bg-white dark:bg-slate-800"
          value={data.type ?? "info"}
          onChange={(e) =>
            onChange((prev) => ({
              ...prev,
              messageBoxData: { ...(prev as any).messageBoxData, type: e.target.value },
            }))
          }
        >
          {(
            ["info", "warning", "error", "success", "neutral", "quote"] as const
          ).map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </label>
      <label className="flex items-center gap-1">
        <span>Size</span>
        <select
          className="border rounded px-1.5 py-0.5 bg-white dark:bg-slate-800"
          value={data.size ?? "medium"}
          onChange={(e) =>
            onChange((prev) => ({
              ...prev,
              messageBoxData: { ...(prev as any).messageBoxData, size: e.target.value },
            }))
          }
        >
          {(["small", "medium", "large"] as const).map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </label>
      <label className="inline-flex items-center gap-1">
        <input
          type="checkbox"
          checked={data.showIcon ?? true}
          onChange={(e) =>
            onChange((prev) => ({
              ...prev,
              messageBoxData: { ...(prev as any).messageBoxData, showIcon: e.target.checked },
            }))
          }
        />
        <span>Icon</span>
      </label>
    </>
  );
}

export default MessageBoxToolbarControls;
