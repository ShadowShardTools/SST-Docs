export const isValidColor = (color: string): boolean => {
  const div = document.createElement("div");
  div.style.color = color;
  return div.style.color !== "";
};

export default isValidColor;
