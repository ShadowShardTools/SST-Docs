import React from "react";
import type { StyleTheme } from "../../../application/types/StyleTheme";
import type { DividerData } from "../types";

interface Props {
  index: number;
  styles: StyleTheme;
  dividerData: DividerData;
}

const DividerBlock: React.FC<Props> = ({ index, styles, dividerData }) => {
  const getSpacingClass = (): string => {
    switch (dividerData.spacing) {
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

  const getDividerClass = (): string => {
    const base = `w-full ${styles.divider.border || "border-gray-300"}`;

    switch (dividerData.type) {
      case "line":
        return `${base} border-t`;
      case "dashed":
        return `${base} border-t-2 border-dashed`;
      case "dotted":
        return `${base} border-t-2 border-dotted`;
      case "double":
        return `${base} border-t-4 border-double`;
      case "thick":
        return `${base} border-t-2`;
      case "gradient":
        return `h-px w-full bg-gradient-to-r ${styles.divider.gradient || "from-transparent via-gray-300 to-transparent"}`;
      default:
        return `${base} border-t`;
    }
  };

  const spacingClass = getSpacingClass();
  const dividerClass = getDividerClass();

  if (dividerData.text) {
    const sideDivider = dividerClass.replace("w-full", "flex-1");

    return (
      <div key={index} className={`${spacingClass} flex items-center`}>
        <div className={sideDivider} />
        <span className={`px-4 ${styles.divider.text}`}>
          {dividerData.text}
        </span>
        <div className={sideDivider} />
      </div>
    );
  }

  return (
    <div key={index} className={spacingClass}>
      <div className={dividerClass} />
    </div>
  );
};

export default DividerBlock;
