import React from "react";
import { LinkIcon } from "lucide-react";
import type { StyleTheme } from "../../siteConfig";

const TitleBlock: React.FC<{
  index: number;
  styles: StyleTheme;
  content?: string;
  titleLevel?: 1 | 2 | 3;
  titleAlignment?: "left" | "center" | "right";
  titleSpacing?: string;
  titleUnderline?: boolean;
  enableAnchorLink?: boolean;
  currentPath?: string;
}> = ({
  index,
  styles,
  content = "",
  titleLevel = 1,
  titleAlignment = "left",
  titleSpacing,
  titleUnderline = false,
  enableAnchorLink = false,
  currentPath = "",
}) => {
  const slugify = (text: string) =>
    text
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[^\w-]/g, "");
  const getSpacingClasses = () => {
    switch (titleSpacing) {
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
    switch (titleAlignment) {
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

    const underlineClass = titleUnderline
      ? `border-b-2 pb-2 ${styles.components.titleUnderline || "border-gray-300"}`
      : "";

    return `${baseClasses} ${levelClasses[titleLevel]} ${underlineClass}`;
  };

  const renderTitle = () => {
    const id = enableAnchorLink ? slugify(content) : undefined;

    const titleContent = (
      <>
        {content}
        {enableAnchorLink && (
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

    switch (titleLevel) {
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
