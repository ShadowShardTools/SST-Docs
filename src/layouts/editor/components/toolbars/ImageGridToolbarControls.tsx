import type { Content, StyleTheme } from "@shadow-shard-tools/docs-core";
import type { ImageGridData } from "@shadow-shard-tools/docs-core/types/ImageGridData";
import Dropdown from "../../../common/components/Dropdown";

interface Props {
  data: any;
  onChange: (updater: (prev: Content) => Content) => void;
  styles: StyleTheme;
}

export function ImageGridToolbarControls({ data, onChange, styles }: Props) {
  const gridData: ImageGridData = data ?? {};
  const update = (partial: Partial<ImageGridData>) =>
    onChange((prev) => ({
      ...prev,
      imageGridData: { ...(prev as any).imageGridData, ...partial },
    }));

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1">
        <span>Align</span>
        <Dropdown
          styles={styles}
          items={[
            { value: "left", label: "Left" },
            { value: "center", label: "Center" },
            { value: "right", label: "Right" },
          ]}
          selectedValue={gridData.alignment ?? "center"}
          onSelect={(val) => update({ alignment: val as ImageGridData["alignment"] })}
          className="min-w-[110px]"
        />
      </div>
      <label className="flex items-center gap-1">
        <span>Scale</span>
        <input
          type="number"
          step={0.01}
          min={0.01}
          max={1}
          className="border rounded px-1.5 py-0.5 bg-white dark:bg-slate-800 w-20"
          value={gridData.scale ?? 1}
          onChange={(e) => update({ scale: Math.min(Number.parseFloat(e.target.value) || 1, 1) })}
        />
      </label>
    </div>
  );
}

export default ImageGridToolbarControls;
