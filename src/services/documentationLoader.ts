import { loadVersionDataFromHttp } from "@shadow-shard-tools/docs-core/data";
import type { LoadVersionDataFromProviderResult } from "@shadow-shard-tools/docs-core/data/loadVersionData";
import { resolvePublicDataPath } from "@shadow-shard-tools/docs-core/configs/sstDocsConfigShared";
import { clientConfig } from "../application/config/clientConfig";

export class documentationLoader {
  private static getBaseUrl(): string {
    const base = import.meta.env.BASE_URL?.replace(/\/$/, "") ?? "";
    return base;
  }

  private static getDataPath(): string {
    return resolvePublicDataPath(this.getBaseUrl(), clientConfig);
  }

  static async loadVersionData(options?: {
    product?: string;
    version?: string;
  }): Promise<LoadVersionDataFromProviderResult> {
    return loadVersionDataFromHttp(this.getDataPath(), {
      product: options?.product,
      version: options?.version,
      productVersioning: clientConfig.PRODUCT_VERSIONING,
    });
  }
}
