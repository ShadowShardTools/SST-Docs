import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
  useMemo,
} from "react";
import { Copy, Check, Download, Eye, EyeOff } from "lucide-react";
import type { StyleTheme } from "../../siteConfig";
import type { CodeSection } from "../../types/entities/CodeSection";
import { LANGUAGE_CONFIG, type SupportedLanguage } from "../../configs/languages-config";


interface CodeBlockProps {
  index: number;
  styles: StyleTheme;
  content?: string;
  codeName?: string;
  codeLanguage?: string;
  codeSections?: CodeSection[];
  codeShowLineNumbers?: boolean;
  codeAllowDownload?: boolean;
  codeMaxHeight?: string;
  codeWrapLines?: boolean;
  codeCollapsible?: boolean;
  codeDefaultCollapsed?: boolean;
  codeTitle?: string;
  onCopy?: (content: string, language: string) => void;
  onLanguageChange?: (language: string) => void;
}

const CodeBlock: React.FC<CodeBlockProps> = ({
  index,
  styles,
  content,
  codeName,
  codeLanguage = "text",
  codeSections,
  codeShowLineNumbers = false,
  codeAllowDownload = false,
  codeMaxHeight = "600px",
  codeWrapLines = false,
  codeCollapsible = false,
  codeDefaultCollapsed = false,
  codeTitle,
  onCopy,
  onLanguageChange,
}) => {
  const codeRefs = useRef<Map<string, HTMLElement>>(new Map());
  const [copied, setCopied] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [collapsed, setCollapsed] = useState(codeDefaultCollapsed);
  const [prismLoaded, setPrismLoaded] = useState(false);

  const normalizedSections = useMemo((): CodeSection[] => {
    if (codeSections?.length) {
      return codeSections.map(({ language, ...rest }) => ({
        language: (language in LANGUAGE_CONFIG
          ? language
          : "plaintext") as SupportedLanguage,
        ...rest,
      }));
    }

    if (content !== undefined) {
      return [
        {
          language: (codeLanguage in LANGUAGE_CONFIG
            ? codeLanguage
            : "plaintext") as SupportedLanguage,
          content,
          filename: codeName,
        },
      ];
    }

    return [];
  }, [codeSections, content, codeLanguage, codeName]);

  const currentSection = normalizedSections[activeTab];

  const getLanguageDisplayName = useCallback(
    (lang: SupportedLanguage) => LANGUAGE_CONFIG[lang].name,
    [],
  );

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      try {
        await import("prismjs/themes/prism-tomorrow.css");
        await import("../../generated/prism-languages.generated");
        if (isMounted) setPrismLoaded(true);
      } catch {
        if (isMounted) setPrismLoaded(true);
      }
    };
    load();
    return () => {
      isMounted = false;
    };
  });

  useEffect(() => {
    if (!prismLoaded) return;
    const highlight = async () => {
      const Prism = await import("prismjs");
      normalizedSections.forEach((s, i) => {
        const el = codeRefs.current.get(`${i}`);
        if (!el) return;
        try {
          const grammar =
            Prism.languages[s.language] || Prism.languages.plaintext;
          el.innerHTML = Prism.highlight(s.content, grammar, s.language);
        } catch {
          el.textContent = s.content;
        }
      });
    };
    highlight();
  }, [prismLoaded, normalizedSections]);

  const handleCopy = useCallback(
    async (i: number) => {
      const section = normalizedSections[i];
      try {
        await navigator.clipboard.writeText(section.content);
        setCopied(`${i}`);
        setTimeout(() => setCopied(null), 1500);
        onCopy?.(section.content, section.language);
      } catch { }
    },
    [normalizedSections, onCopy],
  );

  const handleDownload = useCallback(
    (i: number) => {
      const section = normalizedSections[i];
      const blob = new Blob([section.content], { type: "text/plain" });
      const a = document.createElement("a");
      const ext = LANGUAGE_CONFIG[section.language].ext ?? "txt";

      a.href = URL.createObjectURL(blob);
      a.download = section.filename || `code.${ext}`;
      a.click();
      URL.revokeObjectURL(a.href);
    },
    [normalizedSections],
  );

  if (!normalizedSections.length) {
    return (
      <div className="mb-6 p-4 border rounded text-gray-500 dark:text-gray-400">
        No code content provided
      </div>
    );
  }

  return (
    <div key={index} className="relative mb-6 overflow-hidden rounded">
      <div
        className={`flex items-center justify-between px-3 py-1.5 ${styles.components.codeHeader}`}
      >
        <div className="flex items-center gap-2">
          {codeTitle && <span className="font-medium">{codeTitle}</span>}
          {normalizedSections.length > 1 ? (
            normalizedSections.map((s, i) => (
              <button
                key={i}
                onClick={() => {
                  setActiveTab(i);
                  onLanguageChange?.(s.language);
                }}
                className={`flex justify-center items-center gap-2 py-1 px-2 cursor-pointer ${i === activeTab
                  ? styles.components.buttonTabSmallActive
                  : styles.components.buttonTabSmall
                  }`}
              >
                {getLanguageDisplayName(s.language)}
              </button>
            ))
          ) : (
            <span className="text-sm">
              {currentSection.filename ||
                getLanguageDisplayName(currentSection.language)}
            </span>
          )}
        </div>

        <div className="flex gap-2 items-center">
          {codeCollapsible && (
            <button
              onClick={() => setCollapsed(!collapsed)}
              className={`flex justify-center items-center gap-2 py-1 px-2 cursor-pointer ${styles.components.buttonSmall}`}
            >
              {collapsed ? (
                <Eye className="w-4 h-4" />
              ) : (
                <EyeOff className="w-4 h-4" />
              )}
              {collapsed ? "Show" : "Hide"}
            </button>
          )}
          {codeAllowDownload && (
            <button
              onClick={() => handleDownload(activeTab)}
              className={`flex justify-center items-center gap-2 py-1 px-2 cursor-pointer ${styles.components.buttonSmall}`}
            >
              <Download className="w-4 h-4" /> Download
            </button>
          )}
          <button
            onClick={() => handleCopy(activeTab)}
            className={`flex justify-center items-center gap-2 py-1 px-2 cursor-pointer ${styles.components.buttonSmall}`}
          >
            {copied === `${activeTab}` ? (
              <Check className="w-4 h-4" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
            {copied === `${activeTab}` ? "Copied!" : "Copy"}
          </button>
        </div>
      </div>

      <div
        className={`relative overflow-hidden transition-all duration-300 ease-in-out`}
        style={{
          maxHeight: collapsed ? "0px" : codeMaxHeight,
          opacity: collapsed ? 0 : 1,
          pointerEvents: collapsed ? "none" : "auto",
        }}
      >
        <pre
          className={`language-${currentSection.language} !m-0 overflow-x-auto w-full ${codeWrapLines ? "whitespace-pre-wrap" : "whitespace-pre"
            }`}
          style={{ maxHeight: codeMaxHeight }}
        >
          <div className="flex">
            {codeShowLineNumbers && (
              <div className="select-none pr-4 text-sm text-gray-500 border-r border-gray-300 dark:border-gray-600">
                {currentSection.content.split("\n").map((_, i) => (
                  <div key={i} className="text-right leading-6">
                    {i + 1}
                  </div>
                ))}
              </div>
            )}
            {normalizedSections.map((section, i) => (
              <code
                key={i}
                ref={(el) => {
                  if (el) {
                    codeRefs.current.set(`${i}`, el);
                  }
                }}
                className={`!language-${section.language} flex-1 !p-4 ${codeWrapLines ? "break-words" : ""
                  } ${i === activeTab ? "block" : "hidden"}`}
              >
                {!prismLoaded ? section.content : ""}
              </code>
            ))}
          </div>
        </pre>

        {normalizedSections.length === 1 && (
          <div
            className={`absolute top-2 right-2 px-2 py-1 rounded text-xs ${styles.text.codeLanguage}`}
          >
            {getLanguageDisplayName(currentSection.language)}
          </div>
        )}
      </div>
    </div>
  );
};

export default CodeBlock;
