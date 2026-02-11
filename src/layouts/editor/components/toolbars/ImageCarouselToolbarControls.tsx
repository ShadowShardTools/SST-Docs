import type { Content, StyleTheme } from "@shadow-shard-tools/docs-core";
import type { ImageCarouselData } from "@shadow-shard-tools/docs-core/types/ImageCarouselData";
import { ArrowLeftRight, RectangleEllipsis } from "lucide-react";
import AlignmentToggleButton from "./AlignmentToggleButton";
import Button from "../../../common/components/Button";
import NumericInput from "../../../common/components/NumericInput";

interface Props {
  data: any;
  onChange: (updater: (prev: Content) => Content) => void;
  styles: StyleTheme;
}

export function ImageCarouselToolbarControls({
  data,
  onChange,
  styles,
}: Props) {
  const carouselData: ImageCarouselData = data ?? {};
  const update = (partial: Partial<ImageCarouselData>) =>
    onChange((prev) => ({
      ...prev,
      imageCarouselData: { ...(prev as any).imageCarouselData, ...partial },
    }));

  const toggle = (
    key: keyof NonNullable<ImageCarouselData["carouselOptions"]>,
  ) =>
    update({
      carouselOptions: {
        ...(carouselData.carouselOptions ?? {}),
        [key]: !(carouselData.carouselOptions?.[key] ?? false),
      },
    });

  return (
    <div className="flex items-center gap-2">
      <AlignmentToggleButton
        styles={styles}
        value={
          (carouselData.alignment ?? "center") as "left" | "center" | "right"
        }
        onChange={(val) =>
          update({ alignment: val as ImageCarouselData["alignment"] })
        }
      />
      <Button
        type="button"
        className="inline-flex items-center justify-center w-8 h-8"
        styles={styles}
        variant={carouselData.carouselOptions?.pagination ? "tabActive" : "tab"}
        onClick={() => toggle("pagination")}
        aria-pressed={!!carouselData.carouselOptions?.pagination}
        title={
          carouselData.carouselOptions?.pagination
            ? "Pagination: On"
            : "Pagination: Off"
        }
        aria-label={
          carouselData.carouselOptions?.pagination
            ? "Pagination: On"
            : "Pagination: Off"
        }
      >
        <RectangleEllipsis className="w-5 h-5" />
      </Button>
      <Button
        type="button"
        className="inline-flex items-center justify-center w-8 h-8"
        styles={styles}
        variant={carouselData.carouselOptions?.arrows ? "tabActive" : "tab"}
        onClick={() => toggle("arrows")}
        aria-pressed={!!carouselData.carouselOptions?.arrows}
        title={
          carouselData.carouselOptions?.arrows ? "Arrows: On" : "Arrows: Off"
        }
        aria-label={
          carouselData.carouselOptions?.arrows ? "Arrows: On" : "Arrows: Off"
        }
      >
        <ArrowLeftRight className="w-5 h-5" />
      </Button>
      <label className="flex items-center gap-1">
        <span>Scale</span>
        <NumericInput
          step={0.01}
          min={0.01}
          max={1}
          className={`${styles.input} px-2 py-1 w-20`}
          value={carouselData.scale}
          clampOnBlur
          clampMin={false}
          onChange={(scale) => update({ scale })}
        />
      </label>
    </div>
  );
}

export default ImageCarouselToolbarControls;
