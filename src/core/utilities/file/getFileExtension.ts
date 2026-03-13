export const getFileExtension = (filename: string): string => {
  const lastDot = filename.lastIndexOf(".");
  return lastDot !== -1 ? filename.slice(lastDot + 1).toLowerCase() : "";
};

export default getFileExtension;
