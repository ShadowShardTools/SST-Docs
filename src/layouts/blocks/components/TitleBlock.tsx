import React from "react";
import { LinkIcon } from "lucide-react";
import {
  ALIGNMENT_CLASSES,
  SPACING_CLASSES,
} from "@shadow-shard-tools/docs-core";
import { slugify } from "@shadow-shard-tools/docs-core/utilities/string/slugify";
import type { StyleTheme } from "@shadow-shard-tools/docs-core/types/StyleTheme";
import type { TitleData } from "@shadow-shard-tools/docs-core/types/TitleData";

interface Props {
  index: number;
  styles: StyleTheme;
  titleData: TitleData;
  currentPath?: string;
}

export const TitleBlock: React.FC<Props> = ({
  index,
  styles,
  titleData,
  currentPath = "",
}) => {
  const level = titleData.level ?? 1;
  const spacingClass = SPACING_CLASSES.none;
  const alignmentClass = ALIGNMENT_CLASSES[titleData.alignment ?? "left"].text;

  const levelClassMap = {
    1: styles.text.titleLevel1 || "text-4xl",
    2: styles.text.titleLevel2 || "text-3xl",
    3: styles.text.titleLevel3 || "text-2xl",
  };

  const underlineClass = "";

  const titleWrapperClass = styles.sections.contentBackground || "";

  const id =
    titleData.enableAnchorLink && titleData.text
      ? slugify(titleData.text)
      : undefined;

  const titleContent = (
    <>
      {titleData.text}
      {titleData.enableAnchorLink && id && (
        <a
          href={`#${currentPath}#${id}`}
          className={`ml-2 inline-block ${styles.text.titleAnchor}`}
          aria-label="Anchor link"
          onClick={(e) => {
            e.preventDefault();
            window.history.replaceState(null, "", `#${currentPath}#${id}`);
            document
              .getElementById(id)
              ?.scrollIntoView({ behavior: "smooth", block: "start" });
          }}
        >
          <LinkIcon className="w-4 h-4" />
        </a>
      )}
    </>
  );

  const titleClass = [
    alignmentClass,
    "font-bold scroll-mt-20 group relative",
    levelClassMap[level],
    underlineClass,
  ]
    .filter(Boolean)
    .join(" ");

  const titleProps = {
    className: titleClass,
    ...(id && { id, "data-anchor-id": id }),
  };

  const renderTitle = () => {
    switch (level) {
      case 1:
        return <h1 {...titleProps}>{titleContent}</h1>;
      case 2:
        return <h2 {...titleProps}>{titleContent}</h2>;
      case 3:
        return <h3 {...titleProps}>{titleContent}</h3>;
      default:
        return <h1 {...titleProps}>{titleContent}</h1>;
    }
  };

  return (
    <div key={index} className={spacingClass}>
      <div className={titleWrapperClass}>{renderTitle()}</div>
    </div>
  );
};

export default TitleBlock;
