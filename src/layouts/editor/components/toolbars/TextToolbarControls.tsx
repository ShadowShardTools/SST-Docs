import type { Content, StyleTheme } from "#core";
import AlignmentToggleButton from "./AlignmentToggleButton";

interface Props {
  data: any;
  onChange: (updater: (prev: Content) => Content) => void;
  styles: StyleTheme;
}

export function TextToolbarControls({ data, onChange, styles }: Props) {
  return (
    <>
      <AlignmentToggleButton
        styles={styles}
        value={(data.alignment ?? "left") as "left" | "center" | "right"}
        onChange={(val) =>
          onChange((prev) => ({
            ...prev,
            textData: {
              ...(prev as any).textData,
              alignment: val,
            },
          }))
        }
      />
    </>
  );
}

export default TextToolbarControls;
