import type { Content } from "@shadow-shard-tools/docs-core";
import type { ImageCompareData } from "@shadow-shard-tools/docs-core/types/ImageCompareData";

interface Props {
  data: any;
  onChange: (updater: (prev: Content) => Content) => void;
}

export function ImageCompareToolbarControls({ data, onChange }: Props) {
  const imageCompareData: ImageCompareData = data ?? {};

  const update = (partial: Partial<ImageCompareData>) =>
    onChange((prev) => ({
      ...prev,
      imageCompareData: { ...(prev as any).imageCompareData, ...partial },
    }));

  return (
    <div className="flex items-center gap-2">
      <label className="flex items-center gap-1">
        <span>Mode</span>
        <select
          className="border rounded px-1.5 py-0.5 bg-white dark:bg-slate-800"
          value={imageCompareData.type ?? "slider"}
          onChange={(e) => update({ type: e.target.value as ImageCompareData["type"] })}
        >
          <option value="slider">Slider</option>
          <option value="individual">Side by side</option>
        </select>
      </label>

      <label className="flex items-center gap-1">
        <span>Align</span>
        <select
          className="border rounded px-1.5 py-0.5 bg-white dark:bg-slate-800"
          value={imageCompareData.alignment ?? "center"}
          onChange={(e) => update({ alignment: e.target.value as ImageCompareData["alignment"] })}
        >
          <option value="left">Left</option>
          <option value="center">Center</option>
          <option value="right">Right</option>
        </select>
      </label>

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
