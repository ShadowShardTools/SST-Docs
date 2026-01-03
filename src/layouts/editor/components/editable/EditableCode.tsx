import { useEffect, useMemo, useRef, useState } from "react";
import CodeBlock from "../../../blocks/components/CodeBlock";
import type { StyleTheme } from "@shadow-shard-tools/docs-core/types/StyleTheme";
import type { CodeData } from "@shadow-shard-tools/docs-core/types/CodeData";
import {
  CODE_LANGUAGE_CONFIG,
  type SupportedLanguage,
} from "@shadow-shard-tools/docs-core/configs/codeLanguagesConfig";
import Dropdown from "../../../common/components/Dropdown";

interface EditableCodeProps {
  data?: CodeData;
  styles: StyleTheme;
  onChange: (next: CodeData) => void;
}

export function EditableCode({ data, styles, onChange }: EditableCodeProps) {
  const { activeSectionIndex: initialActiveFromData, ...safeData } = (data as any) ?? {};
  const SUPPORTED_LANGUAGES = useMemo(
    () => Object.keys(CODE_LANGUAGE_CONFIG) as SupportedLanguage[],
    [],
  );
  const ensureLanguage = (lang?: string): SupportedLanguage =>
    SUPPORTED_LANGUAGES.includes(lang as SupportedLanguage)
      ? (lang as SupportedLanguage)
      : "plaintext";

  const baseData: CodeData = {
    language: "javascript",
    content: "",
    wrapLines: false,
    defaultCollapsed: true,
    ...safeData,
  };
  const codeData: CodeData = {
    ...baseData,
    language: ensureLanguage(baseData.language),
  };

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [localActive, setLocalActive] = useState<number>(
    typeof initialActiveFromData === "number" ? initialActiveFromData : 0,
  );

  const sections = useMemo(() => {
    if (codeData.sections?.length) {
      return codeData.sections.map((section) => ({
        language: ensureLanguage(section.language),
        content: section.content ?? "",
        filename: section.filename,
      }));
    }
    return [
      {
        language: ensureLanguage(codeData.language),
        content: codeData.content ?? "",
        filename: codeData.name,
      },
    ];
  }, [codeData, ensureLanguage, SUPPORTED_LANGUAGES]);

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
              {
                language: ensureLanguage("javascript"),
                content: "",
                filename: "",
              },
            ];
            setLocalActive(updated.length - 1);
            onChange({
              ...codeData,
              sections: updated,
            });
          }}
        >
          + Tab
        </button>
      </div>

      <div className="flex flex-wrap gap-3 items-center text-xs text-slate-600">
        <div className="flex items-center gap-1">
          <span>Language</span>
          <Dropdown
            styles={styles}
            items={SUPPORTED_LANGUAGES.map((lang) => ({
              value: lang,
              label: CODE_LANGUAGE_CONFIG[lang]?.name ?? lang,
            }))}
            selectedValue={activeSection?.language ?? "plaintext"}
            onSelect={(val) => {
              const language = ensureLanguage(val);
              onChange({
                ...codeData,
                sections: sections.map((section, idx) =>
                  idx === activeIndex ? { ...section, language } : section,
                ),
              });
            }}
            className="min-w-[150px]"
          />
        </div>
        <label className="flex items-center gap-1">
          <span>Block title</span>
          <input
            className={`${styles.input} px-2 py-1`}
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
            className={`${styles.input} px-2 py-1`}
            value={activeSection?.filename ?? ""}
            onChange={(e) =>
              onChange({
                ...codeData,
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
          className={`${styles.input} w-full min-h-[160px] px-2 py-1 font-mono`}
          value={activeSection?.content ?? ""}
          onChange={(e) =>
            onChange({
              ...codeData,
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
