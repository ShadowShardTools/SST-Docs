// File: components/CodeBlock/CodeBlock.tsx
import React, {
  memo,
  useState,
  useRef,
  useCallback,
  useMemo,
  useEffect,
} from "react";
import { Copy, Check, Download, ChevronDown, ChevronUp } from "lucide-react";
import { usePrismHighlighting } from "../hooks";
import {
  CODE_LANGUAGE_CONFIG,
  type SupportedLanguage,
} from "@shadow-shard-tools/docs-core/configs/codeLanguagesConfig";
import { copyToClipboard } from "@shadow-shard-tools/docs-core/utilities/dom/copyToClipboard";
import { createTimeout } from "@shadow-shard-tools/docs-core/utilities/system/createTimeout";
import { downloadTextFile } from "@shadow-shard-tools/docs-core/utilities/dom/downloadTextFile";
import { sanitizeFilename } from "@shadow-shard-tools/docs-core/utilities/string/sanitizeFilename";
import type {
  CodeData,
  CodeSection,
} from "@shadow-shard-tools/docs-core/types/CodeData";
import type { StyleTheme } from "@shadow-shard-tools/docs-core/types/StyleTheme";
import Button from "../../common/components/Button";

interface Props {
  index: number;
  styles: StyleTheme;
  codeData: CodeData;
  onCopy?: (content: string, language: string) => void;
  onLanguageChange?: (language: string) => void;
}

export const CodeBlock: React.FC<Props> = ({
  index,
  styles,
  codeData,
  onCopy,
  onLanguageChange,
}) => {
  const [copied, setCopied] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [collapsed, setCollapsed] = useState(!!codeData.defaultCollapsed);
  const timeoutRef = useRef<{ clear: () => void } | null>(null);

  const normalizedSections = useMemo((): CodeSection[] => {
    if (codeData.sections?.length) {
      return codeData.sections.map(({ language, ...rest }) => ({
        language: CODE_LANGUAGE_CONFIG[language as SupportedLanguage]
          ? (language as SupportedLanguage)
          : "plaintext",
        ...rest,
      }));
    }

    if (codeData.content) {
      return [
        {
          language: CODE_LANGUAGE_CONFIG[codeData.language as SupportedLanguage]
            ? (codeData.language as SupportedLanguage)
            : "plaintext",
          content: codeData.content,
          filename: codeData.name,
        },
      ];
    }

    return [];
  }, [codeData]);

  const { prismLoaded, codeRefs } = usePrismHighlighting(
    normalizedSections,
    !collapsed,
  );
  const currentSection = normalizedSections[activeTab];

  const getLanguageDisplayName = useCallback(
    (lang: SupportedLanguage) => CODE_LANGUAGE_CONFIG[lang]?.name || lang,
    [],
  );

  const handleCopy = useCallback(
    async (sectionIndex: number) => {
      const section = normalizedSections[sectionIndex];
      if (!section) return;

      const success = await copyToClipboard(section.content);
      if (success) {
        setCopied(`${sectionIndex}`);
        if (timeoutRef.current) timeoutRef.current.clear();
        timeoutRef.current = createTimeout(() => setCopied(null), 2000);
        onCopy?.(section.content, section.language);
      }
    },
    [normalizedSections, onCopy],
  );

  const handleDownload = useCallback(
    (sectionIndex: number) => {
      const section = normalizedSections[sectionIndex];
      if (!section) return;

      const ext = CODE_LANGUAGE_CONFIG[section.language]?.ext ?? "txt";
      const filename = section.filename
        ? sanitizeFilename(section.filename)
        : `code-${index}-${sectionIndex}.${ext}`;

      downloadTextFile(section.content, filename);
    },
    [normalizedSections, index],
  );

  const handleTabChange = useCallback(
    (tabIndex: number) => {
      if (tabIndex >= 0 && tabIndex < normalizedSections.length) {
        setActiveTab(tabIndex);
        onLanguageChange?.(normalizedSections[tabIndex].language);
      }
    },
    [normalizedSections, onLanguageChange],
  );

  useEffect(() => {
    return () => timeoutRef.current?.clear();
  }, []);

  if (!normalizedSections.length) {
    return (
      <div className={`mb-6 p-4 rounded`}>
        <p>No code content provided</p>
      </div>
    );
  }

  const hasMultipleSections = normalizedSections.length > 1;

  return (
    <div key={index} className="relative mb-6 overflow-hidden rounded">
      <div
        className={`flex items-center justify-between px-3 py-2 ${styles.code.header}`}
      >
        <div className="flex items-center gap-2 min-w-0 flex-1 flex-wrap">
          {!hasMultipleSections ? (
            <span className="truncate">
              {codeData.name ??
                currentSection.filename ??
                getLanguageDisplayName(currentSection.language)}
            </span>
          ) : (
            <>
              {codeData.name && (
                <span className="truncate">{codeData.name}</span>
              )}
              <div className="flex items-center gap-1 flex-wrap">
                {normalizedSections.map((section, i) => (
                  <Button
                    key={i}
                    onClick={() => handleTabChange(i)}
                    className="flex justify-center items-center gap-1 py-1 px-2 text-xs"
                    styles={styles}
                    variant={i === activeTab ? "tabActive" : "tab"}
                    title={`Switch to ${getLanguageDisplayName(section.language)}`}
                  >
                    {getLanguageDisplayName(section.language)}
                  </Button>
                ))}
              </div>
            </>
          )}
        </div>
        <div className="flex gap-1 items-center flex-shrink-0">
          <Button
            onClick={() => setCollapsed(!collapsed)}
            className="flex justify-center items-center gap-1 py-1 px-2 text-xs"
            styles={styles}
            title={collapsed ? "Expand code block" : "Collapse code block"}
          >
            {collapsed ? (
              <ChevronDown className="w-3 h-3" />
            ) : (
              <ChevronUp className="w-3 h-3" />
            )}
            <span className="hidden sm:inline">
              {collapsed ? "Show" : "Hide"}
            </span>
          </Button>
          <Button
            onClick={() => handleDownload(activeTab)}
            className="flex justify-center items-center gap-1 py-1 px-2 text-xs"
            styles={styles}
            title="Download code file"
          >
            <Download className="w-3 h-3" />
            <span className="hidden sm:inline">Download</span>
          </Button>
          <Button
            onClick={() => handleCopy(activeTab)}
            className="flex justify-center items-center gap-1 py-1 px-2 text-xs"
            styles={styles}
            title="Copy code to clipboard"
          >
            {copied === `${activeTab}` ? (
              <Check className="w-3 h-3 text-green-500" />
            ) : (
              <Copy className="w-3 h-3" />
            )}
            <span className="hidden sm:inline">
              {copied === `${activeTab}` ? "Copied!" : "Copy"}
            </span>
          </Button>
        </div>
      </div>

      <div
        className={`relative overflow-hidden transition-all duration-300 ease-in-out`}
        style={{
          maxHeight: collapsed ? "0px" : codeData.maxHeight,
          opacity: collapsed ? 0 : 1,
        }}
      >
        <pre
          className={`language-${currentSection.language} !m-0 overflow-x-auto w-full text-sm`}
          style={{ maxHeight: codeData.maxHeight }}
        >
          <div className="flex min-h-full px-4 py-3">
            <div className="flex-1 relative">
              {normalizedSections.map((section, i) => (
                <code
                  key={i}
                  ref={(el) => {
                    if (el) {
                      codeRefs.current.set(`${i}`, el);
                      if (!prismLoaded) el.textContent = section.content;
                    }
                  }}
                  className={`!language-${section.language} block !p-0 leading-6 ${
                    codeData.wrapLines
                      ? "whitespace-pre-wrap break-words"
                      : "whitespace-pre overflow-x-auto"
                  } ${i === activeTab ? "block" : "hidden"}`}
                  style={{
                    minHeight: "1.5rem",
                    whiteSpace: codeData.wrapLines ? "pre-wrap" : "pre",
                    display: i === activeTab ? "block" : "none",
                  }}
                />
              ))}
            </div>
          </div>
        </pre>
        {!hasMultipleSections && (
          <div
            className={`absolute top-2 right-2 px-2 py-1 rounded text-xs backdrop-blur-sm ${styles.code.language}`}
          >
            {getLanguageDisplayName(currentSection.language)}
          </div>
        )}
      </div>
    </div>
  );
};

export default memo(CodeBlock);
