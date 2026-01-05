import type { Content, StyleTheme } from "@shadow-shard-tools/docs-core";
import Dropdown from "../../../common/components/Dropdown";

interface Props {
  data: any;
  onChange: (updater: (prev: Content) => Content) => void;
  styles: StyleTheme;
}

export function DividerToolbarControls({ data, onChange, styles }: Props) {
  return (
    <>
      <div className="flex items-center gap-1">
        <span>Style</span>
        <Dropdown
          styles={styles}
          items={(
            ["line", "dashed", "dotted", "double", "thick", "gradient"] as const
          ).map((s) => ({
            value: s,
            label: s,
          }))}
          selectedValue={data.type ?? "line"}
          onSelect={(val) =>
            onChange((prev) => ({
              ...prev,
              dividerData: {
                ...(prev as any).dividerData,
                type: val,
              },
            }))
          }
          className="min-w-[130px]"
        />
      </div>
    </>
  );
}

export default DividerToolbarControls;
