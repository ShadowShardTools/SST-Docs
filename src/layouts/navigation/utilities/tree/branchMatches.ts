import type { Category } from "@shadow-shard-tools/docs-core";
import testString from "../string/testString";

export const branchMatches = (node: Category, q: string): boolean =>
  testString(node.title, q) ||
  (node.docs?.some((d) => testString(d.title, q)) ?? false) ||
  (node.children?.some((c) => branchMatches(c, q)) ?? false);

export default branchMatches;
