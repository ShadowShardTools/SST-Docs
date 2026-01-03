import type { CodeSection } from "@shadow-shard-tools/docs-core";
import { useEffect, useRef, useState } from "react";
import "prismjs/themes/prism-tomorrow.css";

export const usePrismHighlighting = (
  sections: CodeSection[],
  isVisible: boolean,
) => {
  const [prismLoaded, setPrismLoaded] = useState(false);
  const prismRef = useRef<any>(null);
  const codeRefs = useRef<Map<string, HTMLElement>>(new Map());
  const highlightTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    let isMounted = true;
    const loadPrism = async () => {
      try {
        const prismModule: any = await import("prismjs");
        const Prism = prismModule.default ?? prismModule;
        prismRef.current = Prism;
        // Ensure Prism is available globally for component files.
        (globalThis as any).Prism = Prism;
        // Load core dependencies commonly needed by other components.
        await import("prismjs/components/prism-markup.js");
        await import("prismjs/components/prism-clike.js");
        await import("prismjs/components/prism-javascript.js");
        await import("prismjs/components/prism-markup-templating.js");
        await import("../generatedImports/prism-languages.generated");
        if (isMounted) setPrismLoaded(true);
      } catch (error) {
        console.warn("Failed to load Prism.js:", error);
        if (isMounted) setPrismLoaded(true);
      }
    };
    loadPrism();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!prismLoaded || !isVisible) return;
    if (highlightTimeoutRef.current) clearTimeout(highlightTimeoutRef.current);
    highlightTimeoutRef.current = setTimeout(async () => {
      try {
        const Prism = prismRef.current ?? (await import("prismjs")).default;
        if (!Prism) return;
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
      if (highlightTimeoutRef.current)
        clearTimeout(highlightTimeoutRef.current);
    };
  }, [prismLoaded, sections, isVisible]);

  return { prismLoaded, codeRefs };
};
