import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import {
  buildClientVisibleConfig,
  loadSstDocsConfigSync,
  serializeClientConfigForBrowser,
} from "@shadow-shard-tools/docs-core";

function injectClientConfig(script: string) {
  return {
    name: "inject-sst-docs-config",
    transformIndexHtml(html: string) {
      return {
        html,
        tags: [
          {
            tag: "script",
            attrs: { id: "sst-docs-config" },
            children: script,
            injectTo: "head-prepend" as const,
          },
        ],
      };
    },
  };
}

// https://vite.dev/config/
export default defineConfig(async () => {
  const config = loadSstDocsConfigSync();
  const clientConfig = buildClientVisibleConfig(config);
  const clientConfigScript = serializeClientConfigForBrowser(clientConfig);

  return {
    base: "/SST-Docs/",
    plugins: [react(), tailwindcss(), injectClientConfig(clientConfigScript)],
  };
});
