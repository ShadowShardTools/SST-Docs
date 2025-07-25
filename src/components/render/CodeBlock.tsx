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
import {
  CODE_LANGUAGE_CONFIG,
  type SupportedLanguage,
} from "../../configs/code-languages-config";
import type { StyleTheme } from "../../types/entities/StyleTheme";
import type { CodeData, CodeSection } from "../../types/data/CodeData";
import { LineNumbers } from "../CodeBlock/LineNumbers";
import { sanitizeFilename } from "../CodeBlock/sanitizeFilename";
import { usePrismHighlighting } from "../CodeBlock/usePrismHighlighting";

interface CodeBlockProps {
  index: number;
  styles: StyleTheme;
  codeData: CodeData;
  onCopy?: (content: string, language: string) => void;
  onLanguageChange?: (language: string) => void;
}

const CodeBlock: React.FC<CodeBlockProps> = ({
  index,
  styles,
  codeData,
  onCopy,
  onLanguageChange,
}) => {
  const [copied, setCopied] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [collapsed, setCollapsed] = useState(codeData.defaultCollapsed);
  const copyTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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
  }, [codeData.sections, codeData.content, codeData.language, codeData.name]);

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

      try {
        await navigator.clipboard.writeText(section.content);
        setCopied(`${sectionIndex}`);
        if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
        copyTimeoutRef.current = setTimeout(() => setCopied(null), 2000);
        onCopy?.(section.content, section.language);
      } catch {
        const textarea = document.createElement("textarea");
        textarea.value = section.content;
        document.body.appendChild(textarea);
        textarea.select();
        try {
          document.execCommand("copy");
          setCopied(`${sectionIndex}`);
          copyTimeoutRef.current = setTimeout(() => setCopied(null), 2000);
        } finally {
          document.body.removeChild(textarea);
        }
      }
    },
    [normalizedSections, onCopy],
  );

  const handleDownload = useCallback(
    (sectionIndex: number) => {
      const section = normalizedSections[sectionIndex];
      if (!section) return;

      try {
        const blob = new Blob([section.content], { type: "text/plain" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        const ext = CODE_LANGUAGE_CONFIG[section.language]?.ext ?? "txt";
        const filename = section.filename
          ? sanitizeFilename(section.filename)
          : `code-${index}-${sectionIndex}.${ext}`;

        link.href = url;
        link.download = filename;
        link.style.display = "none";

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setTimeout(() => URL.revokeObjectURL(url), 100);
      } catch (error) {
        console.error("Failed to download file:", error);
      }
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
    return () => {
      if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
    };
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
                  <button
                    key={i}
                    onClick={() => handleTabChange(i)}
                    className={`flex justify-center items-center gap-1 py-1 px-2 text-xs rounded transition-colors cursor-pointer ${i === activeTab ? styles.buttons.tabSmallActive : styles.buttons.tabSmall}`}
                    title={`Switch to ${getLanguageDisplayName(section.language)}`}
                  >
                    {getLanguageDisplayName(section.language)}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
        <div className="flex gap-1 items-center flex-shrink-0">
          {codeData.collapsible && (
            <button
              onClick={() => setCollapsed(!collapsed)}
              className={`flex justify-center items-center gap-1 py-1 px-2 text-xs rounded transition-colors cursor-pointer ${styles.buttons.small}`}
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
            </button>
          )}
          {codeData.allowDownload && (
            <button
              onClick={() => handleDownload(activeTab)}
              className={`flex justify-center items-center gap-1 py-1 px-2 text-xs rounded transition-colors cursor-pointer ${styles.buttons.small}`}
              title="Download code file"
            >
              <Download className="w-3 h-3" />
              <span className="hidden sm:inline">Download</span>
            </button>
          )}
          <button
            onClick={() => handleCopy(activeTab)}
            className={`flex justify-center items-center gap-1 py-1 px-2 text-xs rounded transition-colors cursor-pointer ${styles.buttons.small}`}
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
          </button>
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
          className={`language-${currentSection.language} !m-0 overflow-x-auto w-full text-sm ${codeData.wrapLines ? "whitespace-pre-wrap" : "whitespace-pre"}`}
          style={{ maxHeight: codeData.maxHeight }}
        >
          <div className="flex min-h-full">
            {codeData.showLineNumbers && (
              <LineNumbers styles={styles} content={currentSection.content} />
            )}
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
                  className={`!language-${section.language} block !p-4 ${codeData.wrapLines ? "break-words" : ""} ${i === activeTab ? "block" : "hidden"}`}
                  style={{ minHeight: "1.5rem" }}
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
