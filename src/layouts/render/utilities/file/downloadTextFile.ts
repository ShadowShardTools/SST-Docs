import sanitizeFilename from "../string/sanitizeFilename";

export const downloadTextFile = (
  content: string,
  filename: string,
  mimeType: string = "text/plain",
): void => {
  try {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = sanitizeFilename(filename);
    link.style.display = "none";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setTimeout(() => URL.revokeObjectURL(url), 100);
  } catch (error) {
    console.error("Failed to download file:", error);
  }
};

export default downloadTextFile;
