import type { Content, StyleTheme } from "@shadow-shard-tools/docs-core";
import Dropdown from "../../../common/components/Dropdown";

interface Props {
  data: any;
  onChange: (updater: (prev: Content) => Content) => void;
  styles: StyleTheme;
}

const ALIGN_OPTIONS = ["left", "center", "right"] as const;

export function MathToolbarControls({ data, onChange, styles }: Props) {
  const alignment = (data.alignment ??
    "center") as (typeof ALIGN_OPTIONS)[number];

  return (
    <>
      <div className="flex items-center gap-1">
        <span>Align</span>
        <Dropdown
          styles={styles}
          items={ALIGN_OPTIONS.map((opt) => ({
            value: opt,
            label: opt[0].toUpperCase() + opt.slice(1),
          }))}
          selectedValue={alignment}
          onSelect={(val) =>
            onChange((prev) => ({
              ...prev,
              mathData: { ...(prev as any).mathData, alignment: val },
            }))
          }
          className="min-w-[110px]"
        />
      </div>
    </>
  );
}

export default MathToolbarControls;
