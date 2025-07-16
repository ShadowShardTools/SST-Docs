export const sanitizeFilename = (filename: string): string => {
  return filename.replace(/[^\w\-_.]/g, "_");
};
