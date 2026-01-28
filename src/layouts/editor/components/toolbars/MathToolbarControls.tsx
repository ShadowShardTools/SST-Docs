import type { Content, StyleTheme } from "@shadow-shard-tools/docs-core";
import AlignmentToggleButton from "./AlignmentToggleButton";

interface Props {
  data: any;
  onChange: (updater: (prev: Content) => Content) => void;
  styles: StyleTheme;
}

export function MathToolbarControls({ data, onChange, styles }: Props) {
  const alignment = (data.alignment ?? "center") as "left" | "center" | "right";

  return (
    <>
      <AlignmentToggleButton
        styles={styles}
        value={alignment}
        onChange={(val) =>
          onChange((prev) => ({
            ...prev,
            mathData: { ...(prev as any).mathData, alignment: val },
          }))
        }
      />
    </>
  );
}

export default MathToolbarControls;
