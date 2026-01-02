import type { Content, StyleTheme } from "@shadow-shard-tools/docs-core";
import Dropdown from "../../../common/components/Dropdown";

interface Props {
  data: any;
  onChange: (updater: (prev: Content) => Content) => void;
  styles: StyleTheme;
}

export function TitleToolbarControls({ data, onChange, styles }: Props) {
  return (
    <>
      <div className="flex items-center gap-1">
        <span>Level</span>
        <Dropdown
          styles={styles}
          items={[1, 2, 3].map((lvl) => ({ value: String(lvl), label: `H${lvl}` }))}
          selectedValue={String(data.level ?? 2)}
          onSelect={(val) =>
            onChange((prev) => ({
              ...prev,
              titleData: {
                ...(prev as any).titleData,
                level: Number(val),
              },
            }))
          }
          className="min-w-[80px]"
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
              titleData: {
                ...(prev as any).titleData,
                alignment: val,
              },
            }))
          }
          className="min-w-[110px]"
        />
      </div>
      <button
        type="button"
        className={`px-2 py-1 border rounded ${
          data.enableAnchorLink
            ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900"
            : ""
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
    </>
  );
}

export default TitleToolbarControls;
