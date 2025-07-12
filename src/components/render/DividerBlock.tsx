import React from "react";
import type { StyleTheme } from "../../siteConfig";

const DividerBlock: React.FC<{
  index: number;
  styles: StyleTheme;
  content?: string;
  dividerType?: "line" | "dashed" | "dotted" | "double" | "thick" | "gradient";
  dividerSpacing?: "small" | "medium" | "large";
}> = ({
  index,
  styles,
  content,
  dividerType = "line",
  dividerSpacing = "medium",
}) => {
  const getSpacingClasses = () => {
    switch (dividerSpacing) {
      case "small":
        return "my-4";
      case "medium":
        return "my-6";
      case "large":
        return "my-8";
      default:
        return "";
    }
  };

  const getDividerClasses = () => {
    const baseClasses = `w-full ${styles.components.dividerBorder || "border-gray-300"}`;

    switch (dividerType) {
      case "line":
        return `${baseClasses} border-t`;
      case "dashed":
        return `${baseClasses} border-t border-dashed`;
      case "dotted":
        return `${baseClasses} border-t border-dotted`;
      case "double":
        return `${baseClasses} border-t-4 border-double`;
      case "thick":
        return `${baseClasses} border-t-2`;
      case "gradient":
        return `h-px w-full bg-gradient-to-r ${styles.components.dividerGradient || "from-transparent via-gray-300 to-transparent"}`;
      default:
        return `${baseClasses} border-t`;
    }
  };

  if (content) {
    return (
      <div key={index} className={`${getSpacingClasses()} flex items-center`}>
        <div className={getDividerClasses().replace("w-full", "flex-1")} />
        <span
          className={`px-4 ${styles.text.dividerText || "text-gray-500 text-sm"}`}
        >
          {content}
        </span>
        <div className={getDividerClasses().replace("w-full", "flex-1")} />
      </div>
    );
  }

  return (
    <div key={index} className={getSpacingClasses()}>
      <div className={getDividerClasses()} />
    </div>
  );
};

export default DividerBlock;
