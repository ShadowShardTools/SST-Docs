import { useEffect, useRef, useState } from "react";
import { Copy } from "lucide-react";
import type { StyleTheme } from "../../siteConfig";

const CodeBlock: React.FC<{
  index: number;
  styles: StyleTheme;
  content: string;
  scriptName?: string;
  scriptLanguage?: string;
}> = ({ index, styles, content, scriptName, scriptLanguage = "text" }) => {
  const codeRef = useRef<HTMLElement>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const highlight = async () => {
      const Prism = await import("prismjs");
      await import("prismjs/themes/prism-okaidia.css");
      await import("../../generated/prism-languages.generated");

      const grammar =
        Prism.languages[scriptLanguage] || Prism.languages.plaintext;
      if (isMounted && codeRef.current) {
        codeRef.current.innerHTML = Prism.highlight(
          content,
          grammar,
          scriptLanguage,
        );
      }
    };

    highlight();
    return () => {
      isMounted = false;
    };
  }, [scriptLanguage, content]);

  return (
    <div key={index} className="relative mb-6 overflow-hidden rounded-md">
      <div className={`flex items-center justify-between px-3 py-1.5 ${styles.componentsStyles.codeHeader}`}>
        <span>{scriptName}</span>
        <button
          onClick={() => {
            navigator.clipboard.writeText(content);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
          }}
          className={`flex justify-center items-center gap-2 py-1 px-2 cursor-pointer ${styles.componentsStyles.buttonSmall}`}
        >
          <Copy className="w-3.5 h-3.5" />
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
      <pre
        className={`language-${scriptLanguage} !m-0 !p-4 overflow-x-auto w-full`}
      >
        <code
          ref={codeRef}
          className={`!language-${scriptLanguage} break-words !whitespace-pre`}
        />
      </pre>
      {scriptLanguage && (
        <div className={`${styles.textStyles.codeLanguage}`}>
          {scriptLanguage}
        </div>
      )}
    </div>
  );
};

export default CodeBlock;
