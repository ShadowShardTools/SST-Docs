import type { CodeSection } from "@shadow-shard-tools/docs-core";
import { useEffect, useRef, useState } from "react";

export const usePrismHighlighting = (
  sections: CodeSection[],
  isVisible: boolean,
) => {
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
          import("../generatedImports/prism-languages.generated"),
        ]);
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
      if (highlightTimeoutRef.current)
        clearTimeout(highlightTimeoutRef.current);
    };
  }, [prismLoaded, sections, isVisible]);

  return { prismLoaded, codeRefs };
};
