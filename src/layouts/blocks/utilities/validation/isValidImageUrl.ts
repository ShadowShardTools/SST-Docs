import getFileExtension from "../file/getFileExtension";

export const isValidImageUrl = (url: string): boolean => {
  try {
    const urlObj = new URL(url);
    const validExtensions = ["jpg", "jpeg", "png", "gif", "webp", "svg"];
    const extension = getFileExtension(urlObj.pathname);

    return validExtensions.includes(extension) || urlObj.protocol === "data:";
  } catch {
    return false;
  }
};

export default isValidImageUrl;
