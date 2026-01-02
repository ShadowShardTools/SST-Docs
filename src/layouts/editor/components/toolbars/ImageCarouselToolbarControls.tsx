import type { Content, StyleTheme } from "@shadow-shard-tools/docs-core";
import type { ImageCarouselData } from "@shadow-shard-tools/docs-core/types/ImageCarouselData";
import Dropdown from "../../../common/components/Dropdown";

interface Props {
  data: any;
  onChange: (updater: (prev: Content) => Content) => void;
  styles: StyleTheme;
}

export function ImageCarouselToolbarControls({ data, onChange, styles }: Props) {
  const carouselData: ImageCarouselData = data ?? {};
  const update = (partial: Partial<ImageCarouselData>) =>
    onChange((prev) => ({
      ...prev,
      imageCarouselData: { ...(prev as any).imageCarouselData, ...partial },
    }));

  const toggle = (key: keyof NonNullable<ImageCarouselData["carouselOptions"]>) =>
    update({
      carouselOptions: {
        ...(carouselData.carouselOptions ?? {}),
        [key]: !(carouselData.carouselOptions?.[key] ?? false),
      },
    });

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
          selectedValue={carouselData.alignment ?? "center"}
          onSelect={(val) => update({ alignment: val as ImageCarouselData["alignment"] })}
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
          value={carouselData.scale ?? 1}
          onChange={(e) => update({ scale: Math.min(Number.parseFloat(e.target.value) || 1, 1) })}
        />
      </label>
      <label className="inline-flex items-center gap-1">
        <input
          type="checkbox"
          checked={!!carouselData.carouselOptions?.pagination}
          onChange={() => toggle("pagination")}
        />
        <span>Pagination</span>
      </label>
      <label className="inline-flex items-center gap-1">
        <input
          type="checkbox"
          checked={!!carouselData.carouselOptions?.arrows}
          onChange={() => toggle("arrows")}
        />
        <span>Arrows</span>
      </label>
    </div>
  );
}

export default ImageCarouselToolbarControls;
