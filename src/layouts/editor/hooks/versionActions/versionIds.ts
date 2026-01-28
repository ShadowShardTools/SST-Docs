import type { Product, Version } from "@shadow-shard-tools/docs-core";
import { nextIncrementTitle } from "../../utilities/editorIds";

const generateRandomSuffix = (fallbackLength: number) => {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return Math.random()
    .toString(36)
    .slice(2, 2 + fallbackLength);
};

const generateUniqueId = (
  prefix: string,
  existing: Set<string>,
  fallbackLength: number,
) => {
  let candidate = "";
  do {
    candidate = `${prefix}${generateRandomSuffix(fallbackLength)}`;
  } while (existing.has(candidate));
  return candidate;
};

export const getProductIdSet = (products: Product[]) =>
  new Set(products.map((product) => product.product));

export const getVersionIdSet = (versions: Version[]) =>
  new Set(versions.map((version) => version.version));

export const getProductLabelSet = (products: Product[]) =>
  new Set(products.map((product) => product.label ?? product.product));

export const getVersionLabelSet = (versions: Version[]) =>
  new Set(versions.map((version) => version.label ?? version.version));

export const generateProductId = (existing: Set<string>) =>
  generateUniqueId("product-", existing, 8);

export const generateVersionId = (existing: Set<string>) =>
  generateUniqueId("v-", existing, 6);

export const getNextLabel = (baseLabel: string, existing: Set<string>) =>
  nextIncrementTitle(baseLabel, existing);
