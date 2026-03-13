import type { DataProvider } from "../types/DataProvider.js";
import type { Product } from "../types/Product.js";

export async function loadProducts(
  provider: DataProvider,
  dataRootAbs: string,
): Promise<Product[]> {
  return provider.readJson<Product[]>(`${dataRootAbs}/products.json`);
}
