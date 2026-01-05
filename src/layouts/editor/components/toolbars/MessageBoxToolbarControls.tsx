import type { Content, StyleTheme } from "@shadow-shard-tools/docs-core";
import {
  AlertTriangle,
  CheckCircle2,
  Info,
  MinusCircle,
  Quote,
  XCircle,
} from "lucide-react";
import Dropdown from "../../../common/components/Dropdown";

interface Props {
  data: any;
  onChange: (updater: (prev: Content) => Content) => void;
  styles: StyleTheme;
}

export function MessageBoxToolbarControls({ data, onChange, styles }: Props) {
  return (
    <>
      <div className="flex items-center gap-1">
        <span>Type</span>
        <Dropdown
          styles={styles}
          items={[
            { value: "info", label: "info", icon: <Info className="w-4 h-4" /> },
            {
              value: "warning",
              label: "warning",
              icon: <AlertTriangle className="w-4 h-4" />,
            },
            {
              value: "error",
              label: "error",
              icon: <XCircle className="w-4 h-4" />,
            },
            {
              value: "success",
              label: "success",
              icon: <CheckCircle2 className="w-4 h-4" />,
            },
            {
              value: "neutral",
              label: "neutral",
              icon: <MinusCircle className="w-4 h-4" />,
            },
            {
              value: "quote",
              label: "quote",
              icon: <Quote className="w-4 h-4" />,
            },
          ]}
          selectedValue={data.type ?? "info"}
          onSelect={(val) =>
            onChange((prev) => ({
              ...prev,
              messageBoxData: {
                ...(prev as any).messageBoxData,
                type: val,
              },
            }))
          }
          className="min-w-[140px]"
        />
      </div>
      <label className="inline-flex items-center gap-1">
        <input
          type="checkbox"
          checked={data.showIcon ?? true}
          onChange={(e) =>
            onChange((prev) => ({
              ...prev,
              messageBoxData: {
                ...(prev as any).messageBoxData,
                showIcon: e.target.checked,
              },
            }))
          }
        />
        <span>Icon</span>
      </label>
    </>
  );
}

export default MessageBoxToolbarControls;
