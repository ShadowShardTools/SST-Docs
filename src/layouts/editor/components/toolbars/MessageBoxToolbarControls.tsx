import type { Content, StyleTheme } from "@shadow-shard-tools/docs-core";
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
          items={
            (["info", "warning", "error", "success", "neutral", "quote"] as const).map((s) => ({
              value: s,
              label: s,
            }))
          }
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
