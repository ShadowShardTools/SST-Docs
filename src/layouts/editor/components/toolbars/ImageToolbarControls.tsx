import type { Content } from "@shadow-shard-tools/docs-core";
import type { ImageData } from "@shadow-shard-tools/docs-core/types/ImageData";

interface Props {
  data: any;
  onChange: (updater: (prev: Content) => Content) => void;
}

export function ImageToolbarControls({ data, onChange }: Props) {
  const imageData: ImageData = data ?? {};
  const update = (next: Partial<ImageData>) =>
    onChange((prev) => ({
      ...prev,
      imageData: { ...(prev as any).imageData, ...next },
    }));

  return (
    <div className="flex items-center gap-2">
      <label className="flex items-center gap-1">
        <span>Align</span>
        <select
          className="border rounded px-1.5 py-0.5 bg-white dark:bg-slate-800"
          value={imageData.alignment ?? "center"}
          onChange={(e) => update({ alignment: e.target.value as ImageData["alignment"] })}
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
          value={imageData.scale ?? 1}
          onChange={(e) =>
            update({
              scale: Math.min(Number.parseFloat(e.target.value) || 1, 1),
            })
          }
        />
      </label>
    </div>
  );
}

export default ImageToolbarControls;
