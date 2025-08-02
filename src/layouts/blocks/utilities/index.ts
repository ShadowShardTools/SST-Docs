// utilities/index.ts

// string
export { slugify } from "../../blocks/utilities/string/slugify";
export { truncateText } from "../../blocks/utilities/string/truncateText";
export { sanitizeFilename } from "../../blocks/utilities/string/sanitizeFilename";
export { extractYouTubeId } from "../../blocks/utilities/string/extractYouTubeId";

// file
export { copyToClipboard } from "./file/copyToClipboard";
export { downloadTextFile } from "./file/downloadTextFile";
export { getFileExtension } from "./file/getFileExtension";

// system
export { createTimeout } from "./system/createTimeout";
export { debounce } from "./system/debounce";
export { formatTime } from "./system/formatTime";

// validation
export { isMobileDevice } from "./validation/isMobileDevice";
export { isValidColor } from "./validation/isValidColor";
export { isValidImageUrl } from "./validation/isValidImageUrl";
export { isValidYouTubeId } from "./validation/isValidYouTubeId";
export { validateScale } from "./validation/validateScale";

// media
export { getResponsiveWidth } from "./dom/getResponsiveWidth";
