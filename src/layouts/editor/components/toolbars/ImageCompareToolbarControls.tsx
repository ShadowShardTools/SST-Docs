import type { Content, StyleTheme } from "@shadow-shard-tools/docs-core";
import type { ImageCompareData } from "@shadow-shard-tools/docs-core/types/ImageCompareData";
import { Columns2, SlidersHorizontal, Percent } from "lucide-react";
import { useEffect, useState } from "react";
import AlignmentToggleButton from "./AlignmentToggleButton";
import Button from "../../../common/components/Button";
import NumericInput from "../../../common/components/NumericInput";

interface Props {
  data: any;
  onChange: (updater: (prev: Content) => Content) => void;
  styles: StyleTheme;
}

export function ImageCompareToolbarControls({ data, onChange, styles }: Props) {
  const imageCompareData: ImageCompareData = data ?? {};
  const defaultColor = "#ffffff";
  const [sliderDraft, setSliderDraft] = useState(
    imageCompareData.sliderColor ?? defaultColor,
  );
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

  useEffect(() => {
    setSliderDraft(imageCompareData.sliderColor ?? defaultColor);
  }, [imageCompareData.sliderColor]);

  const isValidHex = (value: string) => /^#([0-9a-fA-F]{6})$/.test(value);
  const pickerColor = isValidHex(sliderDraft)
    ? sliderDraft
    : (imageCompareData.sliderColor ?? defaultColor);

  return (
    <div className="flex items-center gap-2">
      <Button
        type="button"
        className="inline-flex items-center justify-center w-8 h-8"
        styles={styles}
        onClick={() => update({ type: nextMode })}
        title={`Mode: ${modeLabel}`}
        aria-label={`Mode: ${modeLabel}`}
      >
        <ModeIcon className="w-5 h-5" />
      </Button>

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
      {imageCompareData.type === "slider" && (
        <Button
          type="button"
          className={`inline-flex items-center justify-center w-8 h-8`}
          styles={styles}
          variant={imageCompareData.showPercentage ? "tabActive" : "tab"}
          onClick={() =>
            update({ showPercentage: !imageCompareData.showPercentage })
          }
          title={`${imageCompareData.showPercentage ? "Hide" : "Show"} percentage`}
          aria-label={`${imageCompareData.showPercentage ? "Hide" : "Show"} percentage`}
        >
          <Percent className="w-4 h-4" />
        </Button>
      )}

      <label className="flex items-center gap-1">
        <span>Scale</span>
        <NumericInput
          step={0.01}
          min={0.01}
          max={1}
          className={`${styles.input} px-2 py-1 w-20`}
          value={imageCompareData.scale}
          clampOnBlur
          clampMin={false}
          onChange={(scale) => update({ scale })}
        />
      </label>

      {imageCompareData.type === "slider" && (
        <label className="flex items-center gap-1">
          <span>Slider color</span>
          <input
            type="color"
            className={`${styles.input} w-10 h-8 p-1`}
            value={pickerColor}
            onChange={(e) => {
              setSliderDraft(e.target.value);
              update({ sliderColor: e.target.value || defaultColor });
            }}
            title="Slider color"
            aria-label="Slider color"
          />
          <input
            type="text"
            className={`${styles.input} h-8 px-2 text-[10px] font-mono w-20`}
            value={(sliderDraft ?? defaultColor).toUpperCase()}
            onChange={(e) => setSliderDraft(e.target.value.trim())}
            onBlur={() => {
              if (isValidHex(sliderDraft)) {
                update({ sliderColor: sliderDraft });
              } else {
                setSliderDraft(imageCompareData.sliderColor ?? defaultColor);
              }
            }}
          />
        </label>
      )}
    </div>
  );
}

export default ImageCompareToolbarControls;
