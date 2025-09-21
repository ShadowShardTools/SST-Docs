import React from "react";
import { Printer } from "lucide-react";
import type { StyleTheme } from "../../../application/types/StyleTheme";

interface Props {
  styles: StyleTheme;
  showText: boolean;
  currentVersion: string;
}

export const PrintPdfButton: React.FC<Props> = ({
  styles,
  showText,
  currentVersion,
}) => {
  if (!currentVersion) return null;

  // Use Vite's BASE_URL and append the folder structure
  const pdfUrl = `${import.meta.env.BASE_URL}SST-Docs/data/${encodeURIComponent(currentVersion)}/index.pdf`;

  return (
    <a
      href={pdfUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={`flex justify-center w-full items-center gap-2 p-2 cursor-pointer ${styles.buttons.common}`}
    >
      <Printer className="w-6 h-6" />
      {showText && <span>Print</span>}
    </a>
  );
};
