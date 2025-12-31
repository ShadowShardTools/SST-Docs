import type { Content } from "@shadow-shard-tools/docs-core";

interface Props {
  data: any;
  onChange: (updater: (prev: Content) => Content) => void;
}

export function TextToolbarControls({ data, onChange }: Props) {
  return (
    <>
      <label className="flex items-center gap-1">
        <span>Align</span>
        <select
          className="border rounded px-1.5 py-0.5 bg-white dark:bg-slate-800"
          value={data.alignment ?? "left"}
          onChange={(e) =>
            onChange((prev) => ({
              ...prev,
              textData: {
                ...(prev as any).textData,
                alignment: e.target.value,
              },
            }))
          }
        >
          <option value="left">Left</option>
          <option value="center">Center</option>
          <option value="right">Right</option>
        </select>
      </label>
    </>
  );
}

export default TextToolbarControls;
