import type { Content } from "@shadow-shard-tools/docs-core";

interface Props {
  data: any;
  onChange: (updater: (prev: Content) => Content) => void;
}

export function CodeToolbarControls({ data, onChange }: Props) {
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
          checked={!!data?.showLineNumbers}
          onChange={() => toggle("showLineNumbers")}
        />
        <span>Lines</span>
      </label>
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
          checked={!!data?.allowDownload}
          onChange={() => toggle("allowDownload")}
        />
        <span>Download</span>
      </label>
      <label className="inline-flex items-center gap-1">
        <input
          type="checkbox"
          checked={!!data?.collapsible}
          onChange={() => toggle("collapsible")}
        />
        <span>Collapsible</span>
      </label>
    </div>
  );
}

export default CodeToolbarControls;
