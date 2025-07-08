import { LinkIcon } from "lucide-react";
import React from "react";
import { siteConfig } from "../../siteConfig";
import { useTheme } from "../../hooks/useTheme";

type Level = "h1" | "h2" | "h3";

const slugify = (text: string) =>
  text
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]/g, "");

interface Props {
  level: Level;
  index: number;
  content: string;
  currentPath: string;
}

const HeadingBase: React.FC<Props> = ({
  level,
  index,
  content,
  currentPath,
}) => {
  const theme = useTheme();
  const styles = siteConfig.themes[theme];

  const cls: Record<Level, string> = {
    h1: `${styles.textStyles.h1}`,
    h2: `${styles.textStyles.h2}`,
    h3: `${styles.textStyles.h3}`,
  };

  const id = slugify(content);
  const Tag = level;

  return (
    <Tag
      key={index}
      id={id}
      className={`${cls[level]} scroll-mt-20 group relative`}
      data-anchor-id={id}
    >
      {content}
      <a
        href={`#${currentPath}#${id}`}
        className="ml-2 inline-block text-gray-400 hover:text-blue-500"
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
    </Tag>
  );
};

export default HeadingBase;
