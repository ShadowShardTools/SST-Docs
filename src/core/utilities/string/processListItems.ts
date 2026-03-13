export const processListItems = (items?: string[]): string[] => {
  return (items ?? [])
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
};

export default processListItems;
