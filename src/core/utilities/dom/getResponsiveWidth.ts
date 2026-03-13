export const getResponsiveWidth = (
  scale: number,
  isMobile: boolean,
): string => {
  if (isMobile || scale === 1) {
    return "100%";
  }
  return `${scale * 100}%`;
};

export default getResponsiveWidth;
