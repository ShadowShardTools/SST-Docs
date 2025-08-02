export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Fallback for older browsers
    const textarea = document.createElement("textarea");
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();

    try {
      const success = document.execCommand("copy");
      return success;
    } finally {
      document.body.removeChild(textarea);
    }
  }
};

export default copyToClipboard;
