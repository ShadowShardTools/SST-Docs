import type { Content, StyleTheme } from "@shadow-shard-tools/docs-core";

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

  return (
    <div className="flex items-center gap-2">
      <label className="inline-flex items-center gap-1">
        <input
          type="checkbox"
          checked={!!data?.wrapLines}
          onChange={() => toggle("wrapLines")}
        />
        <span>Wrap</span>
      </label>
      <label className="inline-flex items-center gap-1">
        <input
          type="checkbox"
          checked={!!data?.defaultCollapsed}
          onChange={() => toggle("defaultCollapsed")}
        />
        <span>Default collapsed</span>
      </label>
      <label className="inline-flex items-center gap-1">
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
