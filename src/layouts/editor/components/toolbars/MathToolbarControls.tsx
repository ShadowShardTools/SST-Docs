import type { Content } from "@shadow-shard-tools/docs-core";

interface Props {
  data: any;
  onChange: (updater: (prev: Content) => Content) => void;
}

const ALIGN_OPTIONS = ["left", "center", "right"] as const;

export function MathToolbarControls({ data, onChange }: Props) {
  const alignment = (data.alignment ?? "center") as (typeof ALIGN_OPTIONS)[number];

  return (
    <>
      <label className="flex items-center gap-1">
        <span>Align</span>
        <select
          className="border rounded px-1.5 py-0.5 bg-white dark:bg-slate-800"
          value={alignment}
          onChange={(e) =>
            onChange((prev) => ({
              ...prev,
              mathData: { ...(prev as any).mathData, alignment: e.target.value },
            }))
          }
        >
          {ALIGN_OPTIONS.map((opt) => (
            <option key={opt} value={opt}>
              {opt[0].toUpperCase() + opt.slice(1)}
            </option>
          ))}
        </select>
      </label>
    </>
  );
}

export default MathToolbarControls;

