import React, { useEffect, useMemo } from "react";
import type { ContentBlock } from "../types/entities/ContentBlock";
import type { Category } from "../types/entities/Category";
import ContentBlockRenderer from "./ContentBlockRenderer";
import { type StyleTheme } from "../siteConfig";

interface Props {
  styles: StyleTheme;
  content: ContentBlock[];
  title: string;
  docId: string;
  tree: Category[];
}

/* -------------------------------------------------------------------------- */
/*                      Helpers (runs only inside useMemo)                    */
/* -------------------------------------------------------------------------- */

const findPath = (tree: Category[], docId: string): string[] => {
  const out: string[] = [];

  const dfs = (nodes: Category[], trail: string[]): boolean => {
    for (const n of nodes) {
      const next = [...trail, n.title];

      if (n.docs?.some((d) => d.id === docId)) {
        out.push(...next);
        return true;
      }
      if (n.children && dfs(n.children, next)) return true;
    }
    return false;
  };

  dfs(tree, []);
  return out;
};

/* -------------------------------------------------------------------------- */

const ContentRendererBase: React.FC<Props> = ({
  styles,
  content,
  title,
  docId,
  tree,
}) => {
  /* -------- smooth-scroll to #hash -------- */
  useEffect(() => {
    const [, , raw] = location.hash.split("#");
    if (!raw) return;

    const hash = decodeURIComponent(raw);
    const el = document.getElementById(hash);
    if (!el) return;

    requestAnimationFrame(() =>
      el.scrollIntoView({ behavior: "smooth", block: "start" }),
    );
  }, [content]);

  const currentPath =
    location.hash.split("#")[1] || location.pathname.slice(1);

  /* -------- breadcrumb (memoised) -------- */
  const breadcrumb = useMemo(() => {
    const arr = findPath(tree, docId);
    return arr.length ? `${arr.join(" > ")} > ${title}` : "";
  }, [tree, docId, title]);

  return (
    <>
      <h1 className={styles.textStyles.h1}>{title}</h1>

      {breadcrumb && (
        <div className="text-sm text-gray-400 mb-4">{breadcrumb}</div>
      )}

      <ContentBlockRenderer
        styles={styles}
        content={content}
        currentPath={currentPath}
      />
    </>
  );
};

/* Export memoised component */
export default React.memo(ContentRendererBase);
