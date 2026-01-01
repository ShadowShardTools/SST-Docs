import type { Content } from "@shadow-shard-tools/docs-core";
import type { YoutubeData } from "@shadow-shard-tools/docs-core/types/YoutubeData";

interface Props {
  data: any;
  onChange: (updater: (prev: Content) => Content) => void;
}

export function YoutubeToolbarControls({ data, onChange }: Props) {
  const youtubeData: YoutubeData = data ?? {};

  const update = (partial: Partial<YoutubeData>) =>
    onChange((prev) => ({
      ...prev,
      youtubeData: { ...(prev as any).youtubeData, ...partial },
    }));

  return (
    <div className="flex items-center gap-2">
      <label className="flex items-center gap-1">
        <span>Align</span>
        <select
          className="border rounded px-1.5 py-0.5 bg-white dark:bg-slate-800"
          value={youtubeData.alignment ?? "center"}
          onChange={(e) => update({ alignment: e.target.value as YoutubeData["alignment"] })}
        >
          <option value="left">Left</option>
          <option value="center">Center</option>
          <option value="right">Right</option>
        </select>
      </label>
      <label className="flex items-center gap-1">
        <span>Scale</span>
        <input
          type="number"
          step={0.01}
          min={0.01}
          max={1}
          className="border rounded px-1.5 py-0.5 bg-white dark:bg-slate-800 w-20"
          value={youtubeData.scale ?? 1}
          onChange={(e) => update({ scale: Math.min(Number.parseFloat(e.target.value) || 1, 1) })}
        />
      </label>
    </div>
  );
}

export default YoutubeToolbarControls;
