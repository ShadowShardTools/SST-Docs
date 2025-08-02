export const isMobileDevice = (): boolean => {
  return typeof window !== "undefined" && window.innerWidth < 768;
};

export default isMobileDevice;
