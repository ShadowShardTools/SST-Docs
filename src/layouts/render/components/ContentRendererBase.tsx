import React, { lazy, useMemo } from "react";
import type { StyleTheme } from "../../../types/StyleTheme";
import { findPath } from "../../navigation/utilities";
import { useHashScroll } from "../hooks";
import ContentBlockRenderer from "./ContentBlockRenderer";
import type { Category } from "../types";
import type { TitleData } from "../../blocks/types";
const TitleBlock = lazy(() => import("../../blocks/components/TitleBlock"));

interface Props {
  styles: StyleTheme;
  content: any[];
  title: string;
  docId: string;
  tree: Category[];
}

const ContentRendererBase: React.FC<Props> = ({
  styles,
  content,
  title,
  docId,
  tree,
}) => {
  useHashScroll(content);

  const currentPath = location.hash.split("#")[1] || location.pathname.slice(1);

  const breadcrumb = useMemo(() => {
    const arr = findPath(tree, docId);
    return arr.length ? `${arr.join(" > ")} > ${title}` : "";
  }, [tree, docId, title]);

  const titleData: TitleData = {
    text: title,
    level: 1,
    enableAnchorLink: true,
  };

  return (
    <>
      <TitleBlock index={0} styles={styles} titleData={titleData} />
      {breadcrumb && (
        <div className={`${styles.text.breadcrumb} mb-4`}>{breadcrumb}</div>
      )}
      <ContentBlockRenderer
        styles={styles}
        content={content}
        currentPath={currentPath}
      />
    </>
  );
};

export default React.memo(ContentRendererBase);
