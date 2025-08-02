// utilities/index.ts

// validation
export { default as isMobileDevice } from "./validation/isMobileDevice";
export { default as isValidColor } from "./validation/isValidColor";
export { default as isValidImageUrl } from "./validation/isValidImageUrl";
export { default as isValidYouTubeId } from "./validation/isValidYouTubeId";
export { default as validateScale } from "./validation/validateScale";

// string
export { default as slugify } from "./string/slugify";
export { default as truncateText } from "./string/truncateText";
export { default as sanitizeFilename } from "./string/sanitizeFilename";
export { default as extractYouTubeId } from "./string/extractYouTubeId";

// file
export { default as copyToClipboard } from "./file/copyToClipboard";
export { default as downloadTextFile } from "./file/downloadTextFile";
export { default as getFileExtension } from "./file/getFileExtension";

// system
export { default as createTimeout } from "./system/createTimeout";
export { default as debounce } from "./system/debounce";
export { default as formatTime } from "./system/formatTime";

// media
export { default as getResponsiveWidth } from "./dom/getResponsiveWidth";
