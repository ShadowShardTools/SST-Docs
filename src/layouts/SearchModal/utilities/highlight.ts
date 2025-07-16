export const highlightSearchTerm = (text: string, term: string): string => {
  if (!term.trim()) return text;

  // Escape special regex characters (like Regex.Escape in C#)
  const escapedTerm = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  
  return text.replace(
    new RegExp(`(${escapedTerm})`, "gi"),
    '<mark class="bg-yellow-200">$1</mark>',
  );
};