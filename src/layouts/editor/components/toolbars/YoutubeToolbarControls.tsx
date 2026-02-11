import type { Content, StyleTheme } from "@shadow-shard-tools/docs-core";
import type { YoutubeData } from "@shadow-shard-tools/docs-core/types/YoutubeData";
import AlignmentToggleButton from "./AlignmentToggleButton";
import NumericInput from "../../../common/components/NumericInput";

interface Props {
  data: any;
  onChange: (updater: (prev: Content) => Content) => void;
  styles: StyleTheme;
}

export function YoutubeToolbarControls({ data, onChange, styles }: Props) {
  const youtubeData: YoutubeData = data ?? {};

  const update = (partial: Partial<YoutubeData>) =>
    onChange((prev) => ({
      ...prev,
      youtubeData: { ...(prev as any).youtubeData, ...partial },
    }));

  return (
    <div className="flex items-center gap-2">
      <AlignmentToggleButton
        styles={styles}
        value={
          (youtubeData.alignment ?? "center") as "left" | "center" | "right"
        }
        onChange={(val) =>
          update({ alignment: val as YoutubeData["alignment"] })
        }
      />
      <label className="flex items-center gap-1">
        <span>Scale</span>
        <NumericInput
          step={0.01}
          min={0.01}
          max={1}
          className={`${styles.input} px-2 py-1 w-20`}
          value={youtubeData.scale}
          clampOnBlur
          clampMin={false}
          onChange={(scale) => update({ scale })}
        />
      </label>
    </div>
  );
}

export default YoutubeToolbarControls;
