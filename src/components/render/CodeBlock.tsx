import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
  useMemo,
  memo,
} from "react";
import { Copy, Check, Download, ChevronDown, ChevronUp } from "lucide-react";
import {
  CODE_LANGUAGE_CONFIG,
  type SupportedLanguage,
} from "../../configs/code-languages-config";
import type { StyleTheme } from "../../types/entities/StyleTheme";
import type { CodeData, CodeSection } from "../../types/data/CodeData";

interface CodeBlockProps {
  index: number;
  styles: StyleTheme;
  codeData: CodeData;
  onCopy?: (content: string, language: string) => void;
  onLanguageChange?: (language: string) => void;
}

// Memoized line numbers component to prevent unnecessary re-renders
const LineNumbers = memo(({ content }: { content: string }) => {
  const lines = content.split("\n");
  return (
    <div className="select-none pr-4 text-sm text-gray-500 border-r border-gray-300 dark:border-gray-600 flex-shrink-0">
      {lines.map((_, i) => (
        <div key={i} className="text-right leading-6 min-h-[1.5rem]">
          {i + 1}
        </div>
      ))}
    </div>
  );
});

LineNumbers.displayName = "LineNumbers";

// Utility function to sanitize filename
const sanitizeFilename = (filename: string): string => {
  return filename.replace(/[^\w\-_.]/g, "_");
};

// Custom hook for Prism.js loading and highlighting
const usePrismHighlighting = (sections: CodeSection[], isVisible: boolean) => {
  const [prismLoaded, setPrismLoaded] = useState(false);
  const codeRefs = useRef<Map<string, HTMLElement>>(new Map());
  const highlightTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    let isMounted = true;
    const loadPrism = async () => {
      try {
        await import("prismjs");

        await Promise.all([
          import("prismjs/themes/prism-tomorrow.css"),
          import("../../generated/prism-languages.generated"),
        ]);

        if (isMounted) {
          setPrismLoaded(true);
        }
      } catch (error) {
        console.warn("Failed to load Prism.js:", error);
        if (isMounted) {
          setPrismLoaded(true);
        }
      }
    };

    loadPrism();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!prismLoaded || !isVisible) return;

    // Clear previous timeout
    if (highlightTimeoutRef.current) {
      clearTimeout(highlightTimeoutRef.current);
    }

    // Debounce highlighting to improve performance
    highlightTimeoutRef.current = setTimeout(async () => {
      try {
        const Prism = await import("prismjs");

        sections.forEach((section, index) => {
          const element = codeRefs.current.get(`${index}`);
          if (!element) return;

          try {
            const grammar =
              Prism.languages[section.language] || Prism.languages.plaintext;
            element.innerHTML = Prism.highlight(
              section.content,
              grammar,
              section.language,
            );
          } catch (error) {
            console.warn(`Failed to highlight ${section.language}:`, error);
            element.textContent = section.content;
          }
        });
      } catch (error) {
        console.warn("Failed to highlight code:", error);
      }
    }, 100);

    return () => {
      if (highlightTimeoutRef.current) {
        clearTimeout(highlightTimeoutRef.current);
      }
    };
  }, [prismLoaded, sections, isVisible]);

  return { prismLoaded, codeRefs };
};

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

  // Memoize normalized sections to prevent unnecessary recalculations
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

  // Use custom hook for Prism highlighting
  const { prismLoaded, codeRefs } = usePrismHighlighting(
    normalizedSections,
    !collapsed,
  );

  const currentSection = normalizedSections[activeTab];

  const getLanguageDisplayName = useCallback(
    (lang: SupportedLanguage) => CODE_LANGUAGE_CONFIG[lang]?.name || lang,
    [],
  );

  // Improved copy function with better error handling
  const handleCopy = useCallback(
    async (sectionIndex: number) => {
      const section = normalizedSections[sectionIndex];
      if (!section) return;

      try {
        await navigator.clipboard.writeText(section.content);
        setCopied(`${sectionIndex}`);

        // Clear previous timeout
        if (copyTimeoutRef.current) {
          clearTimeout(copyTimeoutRef.current);
        }

        copyTimeoutRef.current = setTimeout(() => setCopied(null), 2000);
        onCopy?.(section.content, section.language);
      } catch (error) {
        console.error("Failed to copy to clipboard:", error);
        // Fallback: create a temporary textarea for older browsers
        const textarea = document.createElement("textarea");
        textarea.value = section.content;
        document.body.appendChild(textarea);
        textarea.select();
        try {
          document.execCommand("copy");
          setCopied(`${sectionIndex}`);
          copyTimeoutRef.current = setTimeout(() => setCopied(null), 2000);
        } catch (fallbackError) {
          console.error("Fallback copy failed:", fallbackError);
        } finally {
          document.body.removeChild(textarea);
        }
      }
    },
    [normalizedSections, onCopy],
  );

  // Improved download function with better filename handling
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

        // Clean up the URL object
        setTimeout(() => URL.revokeObjectURL(url), 100);
      } catch (error) {
        console.error("Failed to download file:", error);
      }
    },
    [normalizedSections, index],
  );

  // Handle tab change with validation
  const handleTabChange = useCallback(
    (tabIndex: number) => {
      if (tabIndex >= 0 && tabIndex < normalizedSections.length) {
        setActiveTab(tabIndex);
        onLanguageChange?.(normalizedSections[tabIndex].language);
      }
    },
    [normalizedSections, onLanguageChange],
  );

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (copyTimeoutRef.current) {
        clearTimeout(copyTimeoutRef.current);
      }
    };
  }, []);

  // Early return for empty content
  if (!normalizedSections.length) {
    return (
      <div className="mb-6 p-4 border rounded text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800">
        <div className="text-center">
          <p className="text-sm">No code content provided</p>
        </div>
      </div>
    );
  }

  const hasMultipleSections = normalizedSections.length > 1;

  return (
    <div key={index} className="relative mb-6 overflow-hidden rounded">
      {/* Header */}
      <div
        className={`flex items-center justify-between px-3 py-2 ${styles.code.header}`}
      >
        <div className="flex items-center gap-2 min-w-0 flex-1">
          {codeData.name && <span>{codeData.name}</span>}

          {hasMultipleSections ? (
            <div className="flex items-center gap-1 flex-wrap">
              {normalizedSections.map((section, i) => (
                <button
                  key={i}
                  onClick={() => handleTabChange(i)}
                  className={`flex justify-center items-center gap-1 py-1 px-2 text-xs rounded transition-colors cursor-pointer ${
                    i === activeTab
                      ? styles.buttons.tabSmallActive
                      : styles.buttons.tabSmall
                  }`}
                  title={`Switch to ${getLanguageDisplayName(section.language)}`}
                >
                  {getLanguageDisplayName(section.language)}
                </button>
              ))}
            </div>
          ) : (
            <span>
              {currentSection.filename ||
                getLanguageDisplayName(currentSection.language)}
            </span>
          )}
        </div>

        {/* Actions */}
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

      {/* Code Content */}
      <div
        className={`relative overflow-hidden transition-all duration-300 ease-in-out ${
          collapsed
            ? "border-t-0"
            : "border-t border-gray-200 dark:border-gray-700"
        }`}
        style={{
          maxHeight: collapsed ? "0px" : codeData.maxHeight,
          opacity: collapsed ? 0 : 1,
        }}
      >
        <pre
          className={`language-${currentSection.language} !m-0 overflow-x-auto w-full text-sm ${
            codeData.wrapLines ? "whitespace-pre-wrap" : "whitespace-pre"
          }`}
          style={{ maxHeight: codeData.maxHeight }}
        >
          <div className="flex min-h-full">
            {codeData.showLineNumbers && (
              <LineNumbers content={currentSection.content} />
            )}

            <div className="flex-1 relative">
              {normalizedSections.map((section, i) => (
                <code
                  key={i}
                  ref={(el) => {
                    if (el) {
                      codeRefs.current.set(`${i}`, el);
                      if (!prismLoaded) {
                        el.textContent = section.content;
                      }
                    }
                  }}
                  className={`!language-${section.language} block !p-4 ${
                    codeData.wrapLines ? "break-words" : ""
                  } ${i === activeTab ? "block" : "hidden"}`}
                  style={{ minHeight: "1.5rem" }}
                />
              ))}
            </div>
          </div>
        </pre>

        {/* Language indicator for single sections */}
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
