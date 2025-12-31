import type { Content } from "@shadow-shard-tools/docs-core";

interface Props {
  data: any;
  onChange: (updater: (prev: Content) => Content) => void;
}

export function DividerToolbarControls({ data, onChange }: Props) {
  return (
    <>
      <label className="flex items-center gap-1">
        <span>Style</span>
        <select
          className="border rounded px-1.5 py-0.5 bg-white dark:bg-slate-800"
          value={data.type ?? "line"}
          onChange={(e) =>
            onChange((prev) => ({
              ...prev,
              dividerData: {
                ...(prev as any).dividerData,
                type: e.target.value,
              },
            }))
          }
        >
          {(
            ["line", "dashed", "dotted", "double", "thick", "gradient"] as const
          ).map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </label>
    </>
  );
}

export default DividerToolbarControls;
