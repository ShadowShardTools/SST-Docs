export const createTimeout = (
  callback: () => void,
  delay: number,
): { clear: () => void } => {
  const timeoutId = setTimeout(callback, delay);

  return {
    clear: () => clearTimeout(timeoutId),
  };
};

export default createTimeout;
