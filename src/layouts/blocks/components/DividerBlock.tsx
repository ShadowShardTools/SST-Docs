import React from "react";
import type { StyleTheme } from "../../../types/StyleTheme";
import type { DividerData } from "../types";

interface Props {
  index: number;
  styles: StyleTheme;
  dividerData: DividerData;
}

const DividerBlock: React.FC<Props> = ({ index, styles, dividerData }) => {
  const getSpacingClasses = () => {
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

  const getDividerClasses = () => {
    const baseClasses = `w-full ${styles.divider.border || "border-gray-300"}`;

    switch (dividerData.type) {
      case "line":
        return `${baseClasses} border-t`;
      case "dashed":
        return `${baseClasses} border-t-2 border-dashed`;
      case "dotted":
        return `${baseClasses} border-t-2 border-dotted`;
      case "double":
        return `${baseClasses} border-t-4 border-double`;
      case "thick":
        return `${baseClasses} border-t-2`;
      case "gradient":
        return `h-px w-full bg-gradient-to-r ${styles.divider.gradient || "from-transparent via-gray-300 to-transparent"}`;
      default:
        return `${baseClasses} border-t`;
    }
  };

  if (dividerData.text) {
    return (
      <div key={index} className={`${getSpacingClasses()} flex items-center`}>
        <div className={getDividerClasses().replace("w-full", "flex-1")} />
        <span className={`px-4 ${styles.divider.text}`}>
          {dividerData.text}
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
