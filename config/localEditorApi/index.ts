import type { Plugin, ViteDevServer } from "vite";
import path from "node:path";
import { EDITOR_API_PREFIX, handleEditorApiRequest } from "./routes";

type LocalEditorApiConfig = {
  FS_DATA_PATH?: string;
  PRODUCT_VERSIONING?: boolean;
};

function resolveDataRoot(config: LocalEditorApiConfig) {
  return path.resolve(
    process.cwd(),
    config.FS_DATA_PATH ?? "./public/SST-Docs/data",
  );
}

export function createLocalEditorApi(config: LocalEditorApiConfig): Plugin {
  const dataRoot = resolveDataRoot(config);
  const productVersioning = config.PRODUCT_VERSIONING ?? false;
  const allowedScripts = new Set([
    "generate",
    "generate:dev",
    "generate:blocks",
    "generate:blocks:full",
    "generate:prism",
    "generate:prism:full",
  ]);

  return {
    name: "local-editor-api",
    apply: "serve",
    configureServer(server: ViteDevServer) {
      server.middlewares.use((req, res, next) => {
        if (!req.url?.startsWith(EDITOR_API_PREFIX)) return next();
        void handleEditorApiRequest(req, res, {
          dataRoot,
          productVersioning,
          allowedScripts,
        });
      });
    },
  };
}

export default createLocalEditorApi;
