export const testString = (s: string | undefined, q: string): boolean =>
  s?.toLowerCase().includes(q) ?? false;

export default testString;
