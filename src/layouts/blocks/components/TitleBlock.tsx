import React from "react";
import { LinkIcon } from "lucide-react";
import type { StyleTheme } from "../../../application/types/StyleTheme";
import type { TitleData } from "../types";
import { slugify } from "../utilities";
import { ALIGNMENT_CLASSES, SPACING_CLASSES } from "../constants";

interface Props {
  index: number;
  styles: StyleTheme;
  titleData: TitleData;
  currentPath?: string;
}

const TitleBlock: React.FC<Props> = ({
  index,
  styles,
  titleData,
  currentPath = "",
}) => {
  const level = titleData.level ?? 1;
  const spacingKey = (titleData.spacing ??
    "none") as keyof typeof SPACING_CLASSES;
  const spacingClass = SPACING_CLASSES[spacingKey];
  const alignmentClass = ALIGNMENT_CLASSES[titleData.alignment ?? "left"].text;

  const levelClassMap = {
    1: styles.text.titleLevel1 || "text-4xl",
    2: styles.text.titleLevel2 || "text-3xl",
    3: styles.text.titleLevel3 || "text-2xl",
  };

  const underlineClass = titleData.underline
    ? `border-b-2 pb-2 ${styles.text.titleUnderline || "border-gray-300"}`
    : "";

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
      <div className={styles.sections.titleBackground || "border-gray-300"}>
        {renderTitle()}
      </div>
    </div>
  );
};

export default TitleBlock;
