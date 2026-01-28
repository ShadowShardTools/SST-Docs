import type { Content, StyleTheme } from "@shadow-shard-tools/docs-core";
import { FoldVertical, TextWrap, UnfoldVertical } from "lucide-react";
import Button from "../../../common/components/Button";

interface Props {
  data: any;
  onChange: (updater: (prev: Content) => Content) => void;
  styles: StyleTheme;
}

export function CodeToolbarControls({ data, onChange, styles }: Props) {
  const toggle = (key: string) =>
    onChange((prev) => ({
      ...prev,
      codeData: { ...(prev as any).codeData, [key]: !(data?.[key] ?? false) },
    }));

  const wrapEnabled = !!data?.wrapLines;
  const collapseEnabled = !!data?.defaultCollapsed;

  return (
    <div className="flex items-center gap-2">
      <Button
        type="button"
        className="flex justify-center items-center py-1 px-2 w-8 h-8 transition-colors cursor-pointer"
        styles={styles}
        variant={wrapEnabled ? "tabActive" : "tab"}
        onClick={() => toggle("wrapLines")}
        aria-pressed={wrapEnabled}
        title={wrapEnabled ? "Wrap: On" : "Wrap: Off"}
        aria-label={wrapEnabled ? "Wrap: On" : "Wrap: Off"}
      >
        <TextWrap className="w-5 h-5" />
      </Button>
      <Button
        type="button"
        className="flex justify-center items-center py-1 px-2 w-8 h-8 transition-colors cursor-pointer"
        styles={styles}
        variant={collapseEnabled ? "tabActive" : "tab"}
        onClick={() => toggle("defaultCollapsed")}
        aria-pressed={collapseEnabled}
        title={
          collapseEnabled ? "Default collapsed: On" : "Default collapsed: Off"
        }
        aria-label={
          collapseEnabled ? "Default collapsed: On" : "Default collapsed: Off"
        }
      >
        {collapseEnabled ? (
          <FoldVertical className="w-5 h-5" />
        ) : (
          <UnfoldVertical className="w-5 h-5" />
        )}
      </Button>
      <label className="inline-flex items-center gap-1 text-xs">
        <span>Max height</span>
        <input
          type="text"
          value={data?.maxHeight ?? ""}
          onChange={(e) =>
            onChange((prev) => ({
              ...prev,
              codeData: {
                ...(prev as any).codeData,
                maxHeight: e.target.value || undefined,
              },
            }))
          }
          placeholder="e.g. 400px"
          className={`${styles.input} px-2 py-1 w-24`}
        />
      </label>
    </div>
  );
}

export default CodeToolbarControls;
