import type { Content, StyleTheme } from "@shadow-shard-tools/docs-core";
import Dropdown from "../../../common/components/Dropdown";

interface Props {
  data: any;
  onChange: (updater: (prev: Content) => Content) => void;
  styles: StyleTheme;
}

export function ListToolbarControls({ data, onChange, styles }: Props) {
  const listType = data.type ?? "ul";
  return (
    <>
      <div className="flex items-center gap-1">
        <span>Format</span>
        <Dropdown
          styles={styles}
          items={[
            { value: "ul", label: "Bullets" },
            { value: "ol", label: "Numbers" },
          ]}
          selectedValue={listType}
          onSelect={(val) =>
            onChange((prev) => ({
              ...prev,
              listData: { ...(prev as any).listData, type: val },
            }))
          }
          className="min-w-[120px]"
        />
      </div>
      <div className="flex items-center gap-1">
        <span>Align</span>
        <Dropdown
          styles={styles}
          items={[
            { value: "left", label: "Left" },
            { value: "center", label: "Center" },
            { value: "right", label: "Right" },
          ]}
          selectedValue={data.alignment ?? "left"}
          onSelect={(val) =>
            onChange((prev) => ({
              ...prev,
              listData: {
                ...(prev as any).listData,
                alignment: val,
              },
            }))
          }
          className="min-w-[110px]"
        />
      </div>
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
