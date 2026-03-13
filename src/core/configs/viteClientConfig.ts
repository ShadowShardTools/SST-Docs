import type { HtmlTagDescriptor, Plugin } from "vite";

import type { ClientVisibleSstDocsConfig } from "../types/ClientVisibleSstDocsConfig.js";
import type { ResolvedSstDocsConfig } from "../types/SstDocsConfig.js";

import { serializeClientConfigForBrowser } from "./clientConfig.js";

export interface SstDocsViteClientConfigPluginOptions {
  globalName?: string;
  pretty?: boolean;
  scriptId?: string;
  injectTo?: HtmlTagDescriptor["injectTo"];
}

export function createSstDocsViteClientConfigPlugin(
  config: ResolvedSstDocsConfig | ClientVisibleSstDocsConfig,
  options?: SstDocsViteClientConfigPluginOptions,
): Plugin {
  const script = serializeClientConfigForBrowser(config, {
    globalName: options?.globalName,
    pretty: options?.pretty,
  });

  const scriptId = options?.scriptId ?? "sst-docs-config";
  const injectTo = options?.injectTo ?? "head-prepend";

  return {
    name: "sst-docs-client-config",
    transformIndexHtml(html: string) {
      return {
        html,
        tags: [
          {
            tag: "script",
            attrs: { id: scriptId },
            children: script,
            injectTo,
          },
        ],
      };
    },
  };
}
