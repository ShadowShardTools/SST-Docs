import type { Content } from "@shadow-shard-tools/docs-core";

type CodeBlock = Extract<Content, { type: "code" }>;

interface Props {
  block: CodeBlock;
  onChange: (updated: CodeBlock) => void;
}

export function CodeBlockForm({ block, onChange }: Props) {
  const data = block.codeData ?? {};
  const isMulti = Array.isArray(data.sections) && data.sections.length > 0;

  if (isMulti) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Multi-section code blocks can be edited in JSON for now.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <label className="flex flex-col gap-1 text-sm">
        <span>Language</span>
        <input
          className="border rounded px-2 py-1"
          value={data.language ?? "javascript"}
          onChange={(e) =>
            onChange({
              ...block,
              codeData: { ...data, language: e.target.value },
            })
          }
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        <span>Name (optional)</span>
        <input
          className="border rounded px-2 py-1"
          value={data.name ?? ""}
          onChange={(e) =>
            onChange({
              ...block,
              codeData: { ...data, name: e.target.value },
            })
          }
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        <span>Content</span>
        <textarea
          className="border rounded px-2 py-1 min-h-[160px] font-mono text-sm"
          value={data.content ?? ""}
          onChange={(e) =>
            onChange({
              ...block,
              codeData: { ...data, content: e.target.value },
            })
          }
        />
      </label>
      <label className="inline-flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={data.showLineNumbers ?? true}
          onChange={(e) =>
            onChange({
              ...block,
              codeData: { ...data, showLineNumbers: e.target.checked },
            })
          }
        />
        <span>Show line numbers</span>
      </label>
    </div>
  );
}

export default CodeBlockForm;
