export const scrollElementIntoView = (key: string): void => {
  const el = document.querySelector<HTMLElement>(`[data-key="${key}"]`);
  el?.scrollIntoView({ block: "nearest" });
};

export default scrollElementIntoView;
