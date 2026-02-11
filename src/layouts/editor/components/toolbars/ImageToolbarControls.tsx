import type { Content, StyleTheme } from "@shadow-shard-tools/docs-core";
import type { ImageData } from "@shadow-shard-tools/docs-core/types/ImageData";
import AlignmentToggleButton from "./AlignmentToggleButton";
import NumericInput from "../../../common/components/NumericInput";

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
      <AlignmentToggleButton
        styles={styles}
        value={(imageData.alignment ?? "center") as "left" | "center" | "right"}
        onChange={(val) => update({ alignment: val as ImageData["alignment"] })}
      />
      <label className="flex items-center gap-1">
        <span>Scale</span>
        <NumericInput
          step={0.01}
          min={0.01}
          max={1}
          className={`${styles.input} px-2 py-1 w-20`}
          value={imageData.scale}
          clampOnBlur
          clampMin={false}
          onChange={(scale) => update({ scale })}
        />
      </label>
    </div>
  );
}

export default ImageToolbarControls;
