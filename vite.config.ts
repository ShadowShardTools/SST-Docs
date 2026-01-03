import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import fs from "node:fs/promises";
import path from "node:path";
import {
  buildClientVisibleConfig,
  loadSstDocsConfigSync,
  serializeClientConfigForBrowser,
} from "@shadow-shard-tools/docs-core";
import { spawn } from "node:child_process";

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

const EDITOR_API_PREFIX = "/__editor/api";
const MAX_BODY_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB safeguard

function resolveDataRoot(config: { FS_DATA_PATH?: string }) {
  return path.resolve(process.cwd(), config.FS_DATA_PATH ?? "./public/SST-Docs/data");
}

function assertPathInsideRoot(root: string, target: string) {
  const resolved = path.resolve(root, target);
  const normalizedRoot = root.endsWith(path.sep) ? root : root + path.sep;
  if (resolved !== root && !resolved.startsWith(normalizedRoot)) {
    throw new Error("Path is outside of the configured data root");
  }
  return resolved;
}

async function readRequestBody(req: import("http").IncomingMessage) {
  return new Promise<Buffer>((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on("data", (chunk) => {
      const buf = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
      chunks.push(buf);
      const size = chunks.reduce((acc, b) => acc + b.length, 0);
      if (size > MAX_BODY_SIZE_BYTES) {
        reject(new Error("Payload too large"));
        req.destroy();
      }
    });
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}

function isTextFile(filePath: string) {
  const ext = path.extname(filePath).toLowerCase();
  return [
    ".json",
    ".md",
    ".txt",
    ".css",
    ".js",
    ".ts",
    ".tsx",
    ".html",
    ".svg",
  ].includes(ext);
}

function createLocalEditorApi(config: { FS_DATA_PATH?: string }): Plugin {
  const dataRoot = resolveDataRoot(config);
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
    configureServer(server: import("vite").ViteDevServer) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith(EDITOR_API_PREFIX)) return next();

        const url = new URL(req.url, "http://localhost");
        const pathname = url.pathname;

        const sendJson = (status: number, payload: unknown) => {
          res.statusCode = status;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify(payload));
        };

        try {
          if (pathname === `${EDITOR_API_PREFIX}/ping`) {
            return sendJson(200, {
              ok: true,
              mode: "dev-only",
              dataRoot,
            });
          }

          if (pathname === `${EDITOR_API_PREFIX}/list` && req.method === "GET") {
            const dirParam = url.searchParams.get("dir") ?? ".";
            const targetDir = assertPathInsideRoot(dataRoot, dirParam);
            const entries = await fs.readdir(targetDir, { withFileTypes: true });
            const listing = await Promise.all(
              entries.map(async (entry) => {
                const fullPath = path.join(targetDir, entry.name);
                const stats = await fs.stat(fullPath);
                return {
                  name: entry.name,
                  isDirectory: entry.isDirectory(),
                  size: stats.size,
                  mtime: stats.mtimeMs,
                };
              }),
            );
            return sendJson(200, { dir: dirParam, entries: listing });
          }

          if (pathname === `${EDITOR_API_PREFIX}/read` && req.method === "GET") {
            const fileParam = url.searchParams.get("path");
            if (!fileParam) return sendJson(400, { error: "Missing path" });
            const targetFile = assertPathInsideRoot(dataRoot, fileParam);
            const stats = await fs.stat(targetFile);
            if (stats.isDirectory()) {
              return sendJson(400, { error: "Requested path is a directory" });
            }
            const buffer = await fs.readFile(targetFile);
            if (isTextFile(targetFile)) {
              return sendJson(200, {
                path: fileParam,
                encoding: "utf8",
                content: buffer.toString("utf8"),
              });
            }
            return sendJson(200, {
              path: fileParam,
              encoding: "base64",
              content: buffer.toString("base64"),
            });
          }

          if (pathname === `${EDITOR_API_PREFIX}/write` && req.method === "POST") {
            const bodyBuffer = await readRequestBody(req);
            const bodyText = bodyBuffer.toString("utf8");
            const payload = JSON.parse(bodyText) as {
              path?: string;
              content?: string;
              encoding?: "utf8" | "base64";
            };
            if (!payload.path || typeof payload.content !== "string") {
              return sendJson(400, { error: "Missing path or content" });
            }
            const encoding = payload.encoding === "base64" ? "base64" : "utf8";
            const targetFile = assertPathInsideRoot(dataRoot, payload.path);
            await fs.mkdir(path.dirname(targetFile), { recursive: true });
            await fs.writeFile(targetFile, Buffer.from(payload.content, encoding));
            return sendJson(200, { ok: true, path: payload.path });
          }

          if (pathname === `${EDITOR_API_PREFIX}/upload` && req.method === "POST") {
            const fileParam = url.searchParams.get("path");
            if (!fileParam) return sendJson(400, { error: "Missing path" });
            const bodyBuffer = await readRequestBody(req);
            const targetFile = assertPathInsideRoot(dataRoot, fileParam);
            await fs.mkdir(path.dirname(targetFile), { recursive: true });
            await fs.writeFile(targetFile, bodyBuffer);
            return sendJson(200, {
              ok: true,
              path: fileParam,
              size: bodyBuffer.length,
            });
          }

          if (pathname === `${EDITOR_API_PREFIX}/run-generator` && req.method === "POST") {
            const bodyBuffer = await readRequestBody(req);
            const payload = JSON.parse(bodyBuffer.toString("utf8")) as {
              script?: string;
            };
            const script = payload.script ?? "";
            if (!allowedScripts.has(script)) {
              return sendJson(400, { error: `Script not allowed: ${script}` });
            }

            const child = spawn("npm", ["run", script], {
              cwd: process.cwd(),
              shell: true,
            });

            let stdout = "";
            let stderr = "";
            child.stdout.on("data", (chunk) => {
              stdout += chunk.toString();
            });
            child.stderr.on("data", (chunk) => {
              stderr += chunk.toString();
            });

            child.on("close", (code) => {
              if (code === 0) {
                return sendJson(200, { ok: true, script, stdout });
              }
              return sendJson(500, {
                error: `Script ${script} failed with code ${code}`,
                stdout,
                stderr,
              });
            });
            return;
          }

          return sendJson(404, { error: "Unknown editor API route" });
        } catch (err) {
          const message = err instanceof Error ? err.message : "Unknown error";
          return sendJson(500, { error: message });
        }
      });
    },
  };
}

// https://vite.dev/config/
export default defineConfig(async (_env) => {
  const config = loadSstDocsConfigSync();
  const clientConfig = buildClientVisibleConfig(config);
  const clientConfigScript = serializeClientConfigForBrowser(clientConfig);

  return {
    base: "/SST-Docs/",
    plugins: [
      react(),
      tailwindcss(),
      injectClientConfig(clientConfigScript),
      createLocalEditorApi(config),
    ],
  };
});
