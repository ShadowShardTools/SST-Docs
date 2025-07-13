import React from "react";
import { LinkIcon } from "lucide-react";
import type { StyleTheme } from "../../types/entities/StyleTheme";
import type { TitleData } from "../../types/data/TitleData";

const TitleBlock: React.FC<{
  index: number;
  styles: StyleTheme;
  titleData: TitleData;
  currentPath?: string;
}> = ({ index, styles, titleData, currentPath = "" }) => {
  const slugify = (text: string) =>
    text
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[^\w-]/g, "");

  const getSpacingClasses = () => {
    switch (titleData.spacing) {
      case "small":
        return "mb-4";
      case "medium":
        return "mb-6";
      case "large":
        return "mb-8";
      default:
        return "";
    }
  };

  const getAlignmentClasses = () => {
    switch (titleData.alignment) {
      case "left":
        return "text-left";
      case "center":
        return "text-center";
      case "right":
        return "text-right";
      default:
        return "text-left";
    }
  };

  const getTitleClasses = () => {
    const baseClasses = `${getAlignmentClasses()} font-bold scroll-mt-20 group relative`;
    const levelClasses = {
      1: styles.text.titleLevel1 || "text-4xl",
      2: styles.text.titleLevel2 || "text-3xl",
      3: styles.text.titleLevel3 || "text-2xl",
    };

    const level = titleData.level ?? 1; // ensure level is defined
    const underlineClass = titleData.underline
      ? `border-b-2 pb-2 ${styles.text.titleUnderline || "border-gray-300"}`
      : "";

    return `${baseClasses} ${levelClasses[level]} ${underlineClass}`;
  };

  const renderTitle = () => {
    const id =
      titleData.enableAnchorLink && titleData.text
        ? slugify(titleData.text)
        : undefined;

    const titleContent = (
      <>
        {titleData.text}
        {titleData.enableAnchorLink && (
          <a
            href={`#${currentPath}#${id}`}
            className="ml-2 inline-block text-gray-400 hover:text-blue-500"
            aria-label="Anchor link"
            onClick={(e) => {
              e.preventDefault();
              window.history.replaceState(null, "", `#${currentPath}#${id}`);
              document
                .getElementById(id!)
                ?.scrollIntoView({ behavior: "smooth", block: "start" });
            }}
          >
            <LinkIcon className="w-4 h-4" />
          </a>
        )}
      </>
    );

    const titleClasses = getTitleClasses();
    const titleProps = {
      className: titleClasses,
      ...(id && { id, "data-anchor-id": id }),
    };

    switch (titleData.level) {
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
    <div key={index} className={getSpacingClasses()}>
      <div
        className={`${styles.sections.titleBackground || "border-gray-300"}`}
      >
        {renderTitle()}
      </div>
    </div>
  );
};

export default TitleBlock;
