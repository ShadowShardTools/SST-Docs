import type { Content } from "@shadow-shard-tools/docs-core";

interface Props {
  data: any;
  onChange: (updater: (prev: Content) => Content) => void;
}

export function TitleToolbarControls({ data, onChange }: Props) {
  return (
    <>
      <label className="flex items-center gap-1">
        <span>Level</span>
        <select
          className="border rounded px-1.5 py-0.5 bg-white dark:bg-slate-800"
          value={data.level ?? 2}
          onChange={(e) =>
            onChange((prev) => ({
              ...prev,
              titleData: { ...(prev as any).titleData, level: Number(e.target.value) },
            }))
          }
        >
          {[1, 2, 3].map((lvl) => (
            <option key={lvl} value={lvl}>
              H{lvl}
            </option>
          ))}
        </select>
      </label>
      <label className="flex items-center gap-1">
        <span>Align</span>
        <select
          className="border rounded px-1.5 py-0.5 bg-white dark:bg-slate-800"
          value={data.alignment ?? "left"}
          onChange={(e) =>
            onChange((prev) => ({
              ...prev,
              titleData: { ...(prev as any).titleData, alignment: e.target.value },
            }))
          }
        >
          <option value="left">Left</option>
          <option value="center">Center</option>
          <option value="right">Right</option>
        </select>
      </label>
      <label className="flex items-center gap-1">
        <span>Spacing</span>
        <select
          className="border rounded px-1.5 py-0.5 bg-white dark:bg-slate-800"
          value={data.spacing ?? "medium"}
          onChange={(e) =>
            onChange((prev) => ({
              ...prev,
              titleData: { ...(prev as any).titleData, spacing: e.target.value },
            }))
          }
        >
          {(["none", "small", "medium", "large"] as const).map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </label>
      <button
        type="button"
        className={`px-2 py-1 border rounded ${
          data.enableAnchorLink ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900" : ""
        }`}
        onClick={() =>
          onChange((prev) => ({
            ...prev,
            titleData: {
              ...(prev as any).titleData,
              enableAnchorLink: !(data.enableAnchorLink ?? false),
            },
          }))
        }
      >
        Anchor
      </button>
      <button
        type="button"
        className={`px-2 py-1 border rounded ${
          data.underline ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900" : ""
        }`}
        onClick={() =>
          onChange((prev) => ({
            ...prev,
            titleData: { ...(prev as any).titleData, underline: !(data.underline ?? false) },
          }))
        }
      >
        Underline
      </button>
    </>
  );
}

export default TitleToolbarControls;
