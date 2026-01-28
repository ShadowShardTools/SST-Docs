import { Suspense, lazy, useEffect, useMemo, useRef, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import type { StyleTheme } from "@shadow-shard-tools/docs-core/types/StyleTheme";
import type { CodeData } from "@shadow-shard-tools/docs-core/types/CodeData";
import {
  CODE_LANGUAGE_CONFIG,
  type SupportedLanguage,
} from "@shadow-shard-tools/docs-core/configs/codeLanguagesConfig";
import Dropdown from "../../../common/components/Dropdown";
import Button from "../../../common/components/Button";
import { LoadingSpinner } from "../../../dialog/components";

const CodeBlock = lazy(() => import("../../../blocks/components/CodeBlock"));

interface EditableCodeProps {
  data?: CodeData;
  styles: StyleTheme;
  onChange: (next: CodeData) => void;
}

export function EditableCode({ data, styles, onChange }: EditableCodeProps) {
  const { activeSectionIndex: initialActiveFromData, ...safeData } =
    (data as any) ?? {};
  const SUPPORTED_LANGUAGES = useMemo(
    () => Object.keys(CODE_LANGUAGE_CONFIG) as SupportedLanguage[],
    [],
  );
  const ensureLanguage = (lang?: string): SupportedLanguage =>
    SUPPORTED_LANGUAGES.includes(lang as SupportedLanguage)
      ? (lang as SupportedLanguage)
      : "plaintext";
  const getLanguageExtension = (language: SupportedLanguage) =>
    CODE_LANGUAGE_CONFIG[language]?.ext ?? "txt";
  const getDefaultFilenameBase = () => "snippet";
  const buildFilename = (base: string, language: SupportedLanguage) => {
    const safeBase = base.trim() || getDefaultFilenameBase();
    return `${safeBase}.${getLanguageExtension(language)}`;
  };
  const getFilenameBase = (
    filename: string | undefined,
    language: SupportedLanguage,
  ) => {
    if (!filename) return "";
    const ext = getLanguageExtension(language);
    const lower = filename.toLowerCase();
    const suffix = `.${ext.toLowerCase()}`;
    if (lower.endsWith(suffix)) {
      return filename.slice(0, -suffix.length);
    }
    const lastDot = filename.lastIndexOf(".");
    if (lastDot > 0) {
      return filename.slice(0, lastDot);
    }
    return filename;
  };

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
  const addMenuRef = useRef<HTMLDivElement>(null);
  const [localActive, setLocalActive] = useState<number>(
    typeof initialActiveFromData === "number" ? initialActiveFromData : 0,
  );
  const [isAddMenuOpen, setIsAddMenuOpen] = useState(false);

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
    if (
      textareaRef.current &&
      textareaRef.current.value !== (activeSection?.content ?? "")
    ) {
      textareaRef.current.value = activeSection?.content ?? "";
    }
  }, [activeSection?.content]);
  useEffect(() => {
    if (!isAddMenuOpen) return;
    const handleClick = (event: MouseEvent) => {
      if (
        addMenuRef.current &&
        !addMenuRef.current.contains(event.target as Node)
      ) {
        setIsAddMenuOpen(false);
      }
    };
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsAddMenuOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleEsc);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleEsc);
    };
  }, [isAddMenuOpen]);

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
      <div className="flex flex-wrap gap-2">
        {sections.map((section, idx) => (
          <div key={idx} className="flex items-center gap-1">
            <Button
              type="button"
              className="flex justify-center items-center gap-1 py-1 px-2 transition-colors"
              styles={styles}
              variant={idx === activeIndex ? "tabActive" : "tab"}
              onClick={() => setLocalActive(idx)}
              title={section.filename || section.language}
            >
              {section.filename || section.language}
            </Button>
            {sections.length > 1 && (
              <Button
                type="button"
                styles={styles}
                onClick={() => {
                  const updated = sections.filter((_, sIdx) => sIdx !== idx);
                  const nextActive = Math.min(
                    updated.length - 1,
                    activeIndex === idx ? activeIndex - 1 : activeIndex,
                  );
                  setLocalActive(Math.max(nextActive, 0));
                  onChange({
                    ...codeData,
                    sections: updated,
                  });
                }}
                aria-label={`Delete tab ${section.filename || section.language}`}
                title="Delete tab"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        ))}
        <div className="relative" ref={addMenuRef}>
          <Button
            type="button"
            className="inline-flex items-center justify-center w-7 h-7"
            styles={styles}
            onClick={() => setIsAddMenuOpen((prev) => !prev)}
            aria-label="Add tab"
            title="Add tab"
            aria-haspopup="listbox"
            aria-expanded={isAddMenuOpen}
          >
            <Plus className="w-4 h-4" />
          </Button>
          {isAddMenuOpen && (
            <ul
              className={`absolute top-full left-0 mt-1 z-50 min-w-[160px] max-h-60 overflow-y-auto ${styles.dropdown.container}`}
              role="listbox"
            >
              {SUPPORTED_LANGUAGES.map((lang) => (
                <li key={lang}>
                  <button
                    type="button"
                    className={`w-full px-3 py-2 text-left cursor-pointer flex items-center gap-2 ${styles.dropdown.item}`}
                    onClick={() => {
                      const language = ensureLanguage(lang);
                      const updated = [
                        ...sections,
                        {
                          language,
                          content: "",
                          filename: buildFilename("", language),
                        },
                      ];
                      setLocalActive(updated.length - 1);
                      onChange({
                        ...codeData,
                        sections: updated,
                      });
                      setIsAddMenuOpen(false);
                    }}
                    role="option"
                  >
                    {CODE_LANGUAGE_CONFIG[lang]?.name ?? lang}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-3 items-center">
        <label className="flex items-center gap-1">
          <span className={`${styles.text.alternative}`}>Title:</span>
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
          <span className={`${styles.text.alternative}`}>Filename:</span>
          <input
            className={`${styles.input} px-2 py-1`}
            value={
              getFilenameBase(
                activeSection?.filename,
                activeSection?.language ?? "plaintext",
              ) || getDefaultFilenameBase()
            }
            onChange={(e) =>
              onChange({
                ...codeData,
                sections: sections.map((section, idx) =>
                  idx === activeIndex
                    ? {
                        ...section,
                        filename: buildFilename(
                          e.target.value,
                          section.language,
                        ),
                      }
                    : section,
                ),
              })
            }
            placeholder="Filename"
          />
        </label>
        <div className="flex items-center gap-1">
          <span className={`${styles.text.alternative}`}>Language:</span>
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
                  idx === activeIndex
                    ? {
                        ...section,
                        language,
                        filename: buildFilename(
                          getFilenameBase(section.filename, section.language),
                          language,
                        ),
                      }
                    : section,
                ),
              });
            }}
            className="min-w-[150px]"
          />
        </div>
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
                idx === activeIndex
                  ? { ...section, content: e.target.value }
                  : section,
              ),
            })
          }
          placeholder="// Start typing your code"
        />
      </label>
      <Suspense fallback={<LoadingSpinner styles={styles} />}>
        <CodeBlock index={0} styles={styles} codeData={previewData} />
      </Suspense>
    </div>
  );
}

export default EditableCode;
