import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { loadSstDocsConfigSync } from "#core/configs/sstDocsConfig";
import { createSstDocsViteClientConfigPlugin } from "#core/configs/viteClientConfig";
import { createLocalEditorApi } from "./config/localEditorApi";

// https://vite.dev/config/
export default defineConfig(async (_env) => {
  const config = loadSstDocsConfigSync();

  return {
    base: "/SST-Docs/",
    plugins: [
      react(),
      tailwindcss(),
      createSstDocsViteClientConfigPlugin(config),
      createLocalEditorApi(config),
    ],
  };
});
