import { useEffect, useMemo, useRef, useState } from "react";
import CodeBlock from "../../../blocks/components/CodeBlock";
import type { StyleTheme } from "@shadow-shard-tools/docs-core/types/StyleTheme";
import type { CodeData } from "@shadow-shard-tools/docs-core/types/CodeData";
import type { SupportedLanguage } from "@shadow-shard-tools/docs-core/configs/codeLanguagesConfig";

interface EditableCodeProps {
  data?: CodeData;
  styles: StyleTheme;
  onChange: (next: CodeData) => void;
}

export function EditableCode({ data, styles, onChange }: EditableCodeProps) {
  const codeData: CodeData = {
    language: "javascript",
    content: "",
    showLineNumbers: true,
    wrapLines: false,
    allowDownload: false,
    collapsible: false,
    defaultCollapsed: false,
    ...data,
  };

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [localActive, setLocalActive] = useState<number>(
    (codeData as any).activeSectionIndex ?? 0,
  );

  const sections = useMemo(() => {
    if (codeData.sections?.length) {
      return codeData.sections.map((section) => ({
        language: section.language as SupportedLanguage,
        content: section.content ?? "",
        filename: section.filename,
      }));
    }
    return [
      {
        language: (codeData.language as SupportedLanguage) ?? "plaintext",
        content: codeData.content ?? "",
        filename: codeData.name,
      },
    ];
  }, [codeData]);

  useEffect(() => {
    if (localActive >= sections.length) {
      setLocalActive(sections.length - 1);
    }
  }, [sections.length, localActive]);

  const activeIndex = Math.min(Math.max(localActive, 0), sections.length - 1);
  const activeSection = sections[activeIndex];

  useEffect(() => {
    if (textareaRef.current && textareaRef.current.value !== (activeSection?.content ?? "")) {
      textareaRef.current.value = activeSection?.content ?? "";
    }
  }, [activeSection?.content]);

  const previewData = useMemo<CodeData>(
    () => ({
      ...codeData,
      sections,
      // allow sections to drive rendering
      content: undefined,
      language: undefined,
    }),
    [codeData, sections],
  );

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2 text-xs">
        {sections.map((section, idx) => (
          <div key={idx} className="flex items-center gap-1">
            <button
              type="button"
              className={`px-2 py-1 rounded border ${
                idx === activeIndex
                  ? "bg-indigo-600 text-white border-indigo-600"
                  : "bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
              onClick={() => setLocalActive(idx)}
              title={section.filename || section.language}
            >
              {section.filename || section.language}
            </button>
            {sections.length > 1 && (
              <button
                type="button"
                className="px-1.5 py-1 rounded border text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30"
                onClick={() => {
                  const updated = sections.filter((_, sIdx) => sIdx !== idx);
                  const nextActive = Math.min(updated.length - 1, activeIndex === idx ? activeIndex - 1 : activeIndex);
                  setLocalActive(Math.max(nextActive, 0));
                  onChange({
                    ...codeData,
                    sections: updated,
                    activeSectionIndex: Math.max(nextActive, 0),
                  });
                }}
                aria-label={`Delete tab ${section.filename || section.language}`}
              >
                ×
              </button>
            )}
          </div>
        ))}
        <button
          type="button"
          className="px-2 py-1 rounded border bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800"
          onClick={() => {
            const updated = [
              ...sections,
              { language: "javascript" as SupportedLanguage, content: "", filename: "" },
            ];
            setLocalActive(updated.length - 1);
            onChange({
              ...codeData,
              sections: updated,
              activeSectionIndex: updated.length - 1,
            });
          }}
        >
          + Tab
        </button>
      </div>

      <div className="flex flex-wrap gap-3 items-center text-xs text-slate-600">
        <label className="flex items-center gap-1">
          <span>Language</span>
          <select
            className="border rounded px-2 py-1 bg-white dark:bg-slate-900 text-sm"
            value={activeSection?.language ?? "plaintext"}
            onChange={(e) => {
              const language = e.target.value as SupportedLanguage;
              onChange({
                ...codeData,
                activeSectionIndex: activeIndex,
                sections: sections.map((section, idx) =>
                  idx === activeIndex ? { ...section, language } : section,
                ),
              });
            }}
          >
            {Array.from(new Set(sections.map((s) => s.language))).concat(
              ["plaintext" as SupportedLanguage],
            )
              .filter(Boolean)
              .map((lang) => (
                <option key={lang} value={lang}>
                  {lang}
                </option>
              ))}
          </select>
        </label>
        <label className="flex items-center gap-1">
          <span>Block title</span>
          <input
            className="border rounded px-2 py-1 text-sm bg-white dark:bg-slate-900"
            value={codeData.name ?? ""}
            onChange={(e) =>
              onChange({
                ...codeData,
                name: e.target.value,
              })
            }
            placeholder="Optional display name"
          />
        </label>
        <label className="flex items-center gap-1">
          <span>Filename</span>
          <input
            className="border rounded px-2 py-1 text-sm bg-white dark:bg-slate-900"
            value={activeSection?.filename ?? ""}
            onChange={(e) =>
              onChange({
                ...codeData,
                activeSectionIndex: activeIndex,
                sections: sections.map((section, idx) =>
                  idx === activeIndex ? { ...section, filename: e.target.value } : section,
                ),
              })
            }
            placeholder="Optional filename"
          />
        </label>
      </div>

      <label className="flex flex-col gap-1">
        <span className="text-xs text-slate-500">Code</span>
        <textarea
          ref={textareaRef}
          className="w-full min-h-[160px] rounded border px-2 py-1 font-mono text-sm bg-white dark:bg-slate-900"
          value={activeSection?.content ?? ""}
          onChange={(e) =>
            onChange({
              ...codeData,
              activeSectionIndex: activeIndex,
              sections: sections.map((section, idx) =>
                idx === activeIndex ? { ...section, content: e.target.value } : section,
              ),
            })
          }
          placeholder="// Start typing your code"
        />
      </label>

      <div className="rounded border px-3 py-2">
        <CodeBlock index={0} styles={styles} codeData={previewData} />
      </div>
    </div>
  );
}

export default EditableCode;
