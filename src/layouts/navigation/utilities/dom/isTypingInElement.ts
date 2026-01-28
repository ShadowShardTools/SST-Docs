export const isTypingInElement = (element: HTMLElement | null): boolean => {
  return element !== null && ["INPUT", "TEXTAREA"].includes(element.tagName);
};

export default isTypingInElement;
