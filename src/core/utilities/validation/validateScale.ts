export const validateScale = (scale?: number): number => {
  return typeof scale === "number" && scale > 0 ? scale : 1;
};

export default validateScale;
