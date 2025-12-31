import type { Content } from "@shadow-shard-tools/docs-core";

interface Props {
  data: any;
  onChange: (updater: (prev: Content) => Content) => void;
}

export function ListToolbarControls({ data, onChange }: Props) {
  const listType = data.type ?? "ul";
  return (
    <>
      <label className="flex items-center gap-1">
        <span>Format</span>
        <select
          className="border rounded px-1.5 py-0.5 bg-white dark:bg-slate-800"
          value={listType}
          onChange={(e) =>
            onChange((prev) => ({
              ...prev,
              listData: { ...(prev as any).listData, type: e.target.value },
            }))
          }
        >
          <option value="ul">Bullets</option>
          <option value="ol">Numbers</option>
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
              listData: {
                ...(prev as any).listData,
                alignment: e.target.value,
              },
            }))
          }
        >
          <option value="left">Left</option>
          <option value="center">Center</option>
          <option value="right">Right</option>
        </select>
      </label>
      <label className="inline-flex items-center gap-1">
        <input
          type="checkbox"
          checked={data.inside ?? false}
          onChange={(e) =>
            onChange((prev) => ({
              ...prev,
              listData: { ...(prev as any).listData, inside: e.target.checked },
            }))
          }
        />
        <span>Inside</span>
      </label>
      {listType === "ol" && (
        <label className="flex items-center gap-1">
          <span>Start</span>
          <input
            type="number"
            min={1}
            className="border rounded px-1.5 py-0.5 w-16 bg-white dark:bg-slate-800"
            value={data.startNumber ?? 1}
            onChange={(e) =>
              onChange((prev) => ({
                ...prev,
                listData: {
                  ...(prev as any).listData,
                  startNumber: Number(e.target.value) || 1,
                },
              }))
            }
          />
        </label>
      )}
      <label className="flex items-center gap-1">
        <span>Aria</span>
        <input
          type="text"
          className="border rounded px-1.5 py-0.5 bg-white dark:bg-slate-800"
          value={data.ariaLabel ?? ""}
          onChange={(e) =>
            onChange((prev) => ({
              ...prev,
              listData: {
                ...(prev as any).listData,
                ariaLabel: e.target.value,
              },
            }))
          }
        />
      </label>
    </>
  );
}

export default ListToolbarControls;
