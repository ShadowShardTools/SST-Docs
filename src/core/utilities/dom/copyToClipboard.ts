export const copyToClipboard = async (text: string): Promise<boolean> => {
  const hasNavigatorClipboard =
    typeof navigator !== "undefined" &&
    !!navigator.clipboard &&
    typeof navigator.clipboard.writeText === "function";

  if (hasNavigatorClipboard) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Intentionally fall through to the DOM-based fallback.
    }
  }

  if (
    typeof document === "undefined" ||
    typeof document.createElement !== "function" ||
    typeof document.body === "undefined"
  ) {
    return false;
  }

  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "true");
  textarea.style.position = "absolute";
  textarea.style.left = "-9999px";
  document.body.appendChild(textarea);
  textarea.select();

  try {
    const success =
      typeof document.execCommand === "function"
        ? document.execCommand("copy")
        : false;
    return success;
  } finally {
    document.body.removeChild(textarea);
  }
};

export default copyToClipboard;
