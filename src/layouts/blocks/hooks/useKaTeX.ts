import { useState, useEffect } from "react";

export const useKaTeX = (expression: string) => {
  const [html, setHtml] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    setError(null);

    if (!expression.trim()) {
      setHtml("");
      setIsLoading(false);
      return;
    }

    import("katex")
      .then((katex) => {
        if (isMounted) {
          try {
            const rendered = katex.renderToString(expression.trim(), {
              throwOnError: false,
              output: "html",
              trust: false,
              strict: "warn",
            });
            setHtml(rendered);
          } catch (e) {
            setError("Invalid LaTeX");
            setHtml(`<span class="sst-msg-error">Invalid LaTeX</span>`);
          } finally {
            setIsLoading(false);
          }
        }
      })
      .catch(() => {
        if (isMounted) {
          setError("Failed to load KaTeX");
          setHtml(`<span class="sst-msg-error">Failed to load KaTeX</span>`);
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [expression]);

  return { html, isLoading, error };
};

export default useKaTeX;
