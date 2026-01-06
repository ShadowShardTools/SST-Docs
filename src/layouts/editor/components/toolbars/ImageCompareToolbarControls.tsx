import type { Content, StyleTheme } from "@shadow-shard-tools/docs-core";
import type { ImageCompareData } from "@shadow-shard-tools/docs-core/types/ImageCompareData";
import { Columns2, SlidersHorizontal } from "lucide-react";
import AlignmentToggleButton from "./AlignmentToggleButton";

interface Props {
  data: any;
  onChange: (updater: (prev: Content) => Content) => void;
  styles: StyleTheme;
}

export function ImageCompareToolbarControls({ data, onChange, styles }: Props) {
  const imageCompareData: ImageCompareData = data ?? {};
  const mode = (imageCompareData.type ?? "slider") as ImageCompareData["type"];
  const modeOrder: ImageCompareData["type"][] = ["slider", "individual"];
  const modeIndex = Math.max(modeOrder.indexOf(mode), 0);
  const nextMode = modeOrder[(modeIndex + 1) % modeOrder.length];
  const ModeIcon = mode === "slider" ? SlidersHorizontal : Columns2;
  const modeLabel = mode === "slider" ? "Slider" : "Side by side";

  const update = (partial: Partial<ImageCompareData>) =>
    onChange((prev) => ({
      ...prev,
      imageCompareData: { ...(prev as any).imageCompareData, ...partial },
    }));

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        className={`inline-flex items-center justify-center w-8 h-8 ${styles.buttons.common}`}
        onClick={() => update({ type: nextMode })}
        title={`Mode: ${modeLabel}`}
        aria-label={`Mode: ${modeLabel}`}
      >
        <ModeIcon className="w-5 h-5" />
      </button>

      <AlignmentToggleButton
        styles={styles}
        value={
          (imageCompareData.alignment ?? "center") as
            | "left"
            | "center"
            | "right"
        }
        onChange={(val) =>
          update({ alignment: val as ImageCompareData["alignment"] })
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
          value={imageCompareData.scale ?? 1}
          onChange={(e) =>
            update({
              scale: Math.min(Number.parseFloat(e.target.value) || 1, 1),
            })
          }
        />
      </label>

      {imageCompareData.type === "slider" && (
        <label className="flex items-center gap-1">
          <span>Slider color</span>
          <input
            type="text"
            className={`${styles.input} px-2 py-1 text-xs w-24`}
            value={imageCompareData.sliderColor ?? "#ffffff"}
            onChange={(e) =>
              update({ sliderColor: e.target.value || "#ffffff" })
            }
            placeholder="#ffffff"
          />
        </label>
      )}
    </div>
  );
}

export default ImageCompareToolbarControls;
