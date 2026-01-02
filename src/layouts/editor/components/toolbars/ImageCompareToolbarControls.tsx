import type { Content, StyleTheme } from "@shadow-shard-tools/docs-core";
import type { ImageCompareData } from "@shadow-shard-tools/docs-core/types/ImageCompareData";
import Dropdown from "../../../common/components/Dropdown";

interface Props {
  data: any;
  onChange: (updater: (prev: Content) => Content) => void;
  styles: StyleTheme;
}

export function ImageCompareToolbarControls({ data, onChange, styles }: Props) {
  const imageCompareData: ImageCompareData = data ?? {};

  const update = (partial: Partial<ImageCompareData>) =>
    onChange((prev) => ({
      ...prev,
      imageCompareData: { ...(prev as any).imageCompareData, ...partial },
    }));

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1">
        <span>Mode</span>
        <Dropdown
          styles={styles}
          items={[
            { value: "slider", label: "Slider" },
            { value: "individual", label: "Side by side" },
          ]}
          selectedValue={imageCompareData.type ?? "slider"}
          onSelect={(val) => update({ type: val as ImageCompareData["type"] })}
          className="min-w-[140px]"
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
          selectedValue={imageCompareData.alignment ?? "center"}
          onSelect={(val) => update({ alignment: val as ImageCompareData["alignment"] })}
          className="min-w-[120px]"
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
          value={imageCompareData.scale ?? 1}
          onChange={(e) => update({ scale: Math.min(Number.parseFloat(e.target.value) || 1, 1) })}
        />
      </label>

      {imageCompareData.type === "slider" && (
        <label className="flex items-center gap-1">
          <span>Slider color</span>
          <input
            type="text"
            className="border rounded px-1.5 py-0.5 text-xs bg-white dark:bg-slate-800 w-24"
            value={imageCompareData.sliderColor ?? "#ffffff"}
            onChange={(e) => update({ sliderColor: e.target.value || "#ffffff" })}
            placeholder="#ffffff"
          />
        </label>
      )}
    </div>
  );
}

export default ImageCompareToolbarControls;
