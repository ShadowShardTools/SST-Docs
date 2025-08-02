export const isUserTyping = (): boolean => {
  const activeElement = document.activeElement;
  return (
    ["INPUT", "TEXTAREA"].includes(activeElement?.tagName as any) ||
    (activeElement as HTMLElement)?.isContentEditable === true
  );
};

export default isUserTyping;
