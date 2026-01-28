import type { Content, StyleTheme } from "@shadow-shard-tools/docs-core";
import type { ImageGridData } from "@shadow-shard-tools/docs-core/types/ImageGridData";
import AlignmentToggleButton from "./AlignmentToggleButton";

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
      <AlignmentToggleButton
        styles={styles}
        value={(gridData.alignment ?? "center") as "left" | "center" | "right"}
        onChange={(val) =>
          update({ alignment: val as ImageGridData["alignment"] })
        }
      />
      <label className="flex items-center gap-1">
        <span>Scale</span>
        <input
          type="number"
          step={0.01}
          min={0.01}
          max={1}
          className={`${styles.input} px-2 py-1 w-20`}
          value={gridData.scale ?? 1}
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

export default ImageGridToolbarControls;
