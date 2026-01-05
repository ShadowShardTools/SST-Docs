import type { Content, StyleTheme } from "@shadow-shard-tools/docs-core";
import type { ImageData } from "@shadow-shard-tools/docs-core/types/ImageData";
import Dropdown from "../../../common/components/Dropdown";

interface Props {
  data: any;
  onChange: (updater: (prev: Content) => Content) => void;
  styles: StyleTheme;
}

export function ImageToolbarControls({ data, onChange, styles }: Props) {
  const imageData: ImageData = data ?? {};
  const update = (next: Partial<ImageData>) =>
    onChange((prev) => ({
      ...prev,
      imageData: { ...(prev as any).imageData, ...next },
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
          selectedValue={imageData.alignment ?? "center"}
          onSelect={(val) =>
            update({ alignment: val as ImageData["alignment"] })
          }
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
