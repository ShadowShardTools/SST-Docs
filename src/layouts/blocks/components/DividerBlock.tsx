import React from "react";
import type { DividerData, StyleTheme } from "@shadow-shard-tools/docs-core";

interface Props {
  index: number;
  styles: StyleTheme;
  dividerData: DividerData;
}

export const DividerBlock: React.FC<Props> = ({
  index,
  styles,
  dividerData,
}) => {
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
    const base = `w-full ${styles.divider.border || "sst-divider-border"}`;

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
        return `h-px w-full ${styles.divider.gradient || "sst-divider-gradient"}`;
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
        <span className={`px-4 ${styles.divider.text || "sst-divider-text"}`}>
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
