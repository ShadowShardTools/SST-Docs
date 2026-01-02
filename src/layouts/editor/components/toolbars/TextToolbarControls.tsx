import type { Content, StyleTheme } from "@shadow-shard-tools/docs-core";
import Dropdown from "../../../common/components/Dropdown";

interface Props {
  data: any;
  onChange: (updater: (prev: Content) => Content) => void;
  styles: StyleTheme;
}

export function TextToolbarControls({ data, onChange, styles }: Props) {
  return (
    <>
      <div className="flex items-center gap-1">
        <span>Align</span>
        <Dropdown
          styles={styles}
          items={[
            { value: "left", label: "Left" },
            { value: "center", label: "Center" },
            { value: "right", label: "Right" },
          ]}
          selectedValue={data.alignment ?? "left"}
          onSelect={(val) =>
            onChange((prev) => ({
              ...prev,
              textData: {
                ...(prev as any).textData,
                alignment: val,
              },
            }))
          }
          className="min-w-[110px]"
        />
      </div>
    </>
  );
}

export default TextToolbarControls;
