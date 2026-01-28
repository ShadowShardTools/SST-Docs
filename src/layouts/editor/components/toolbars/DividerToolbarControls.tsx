import type { Content, StyleTheme } from "@shadow-shard-tools/docs-core";
import {
  Equal,
  Minus,
  MoreHorizontal,
  ScissorsLineDashed,
  Sparkles,
} from "lucide-react";
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
          items={[
            {
              value: "line",
              label: "line",
              icon: <Minus className="w-4 h-4" />,
            },
            {
              value: "dashed",
              label: "dashed",
              icon: <ScissorsLineDashed className="w-4 h-4" />,
            },
            {
              value: "dotted",
              label: "dotted",
              icon: <MoreHorizontal className="w-4 h-4" />,
            },
            {
              value: "double",
              label: "double",
              icon: <Equal className="w-4 h-4" />,
            },
            {
              value: "thick",
              label: "thick",
              icon: <Minus className="w-4 h-4" strokeWidth={3} />,
            },
            {
              value: "gradient",
              label: "gradient",
              icon: <Sparkles className="w-4 h-4" />,
            },
          ]}
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
