import type { IncomingMessage, ServerResponse } from "http";
import fs from "node:fs/promises";
import path from "node:path";
import { spawn } from "node:child_process";
import { HttpError, readJsonBody, readRequestBody } from "./http";
import {
  assertPathInsideRoot,
  camelId,
  initProductDirectory,
  initVersionDirectory,
  isTextFile,
  loadProducts,
  loadVersions,
  randomId,
  saveProducts,
  saveVersions,
} from "./storage";

export const EDITOR_API_PREFIX = "/__editor/api";
const MAX_BODY_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB safeguard

export type EditorApiContext = {
  dataRoot: string;
  productVersioning: boolean;
  allowedScripts: Set<string>;
};

const sendJson = (res: ServerResponse, status: number, payload: unknown) => {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(payload));
};

export async function handleEditorApiRequest(
  req: IncomingMessage,
  res: ServerResponse,
  ctx: EditorApiContext,
): Promise<void> {
  try {
    if (!req.url) {
      return sendJson(res, 400, { error: "Missing request URL" });
    }
    const url = new URL(req.url, "http://localhost");
    const pathname = url.pathname;
    const { dataRoot, productVersioning, allowedScripts } = ctx;

    if (pathname === `${EDITOR_API_PREFIX}/ping`) {
      return sendJson(res, 200, {
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
      return sendJson(res, 200, { dir: dirParam, entries: listing });
    }

    if (pathname === `${EDITOR_API_PREFIX}/read` && req.method === "GET") {
      const fileParam = url.searchParams.get("path");
      if (!fileParam) return sendJson(res, 400, { error: "Missing path" });
      const targetFile = assertPathInsideRoot(dataRoot, fileParam);
      const stats = await fs.stat(targetFile);
      if (stats.isDirectory()) {
        return sendJson(res, 400, { error: "Requested path is a directory" });
      }
      const buffer = await fs.readFile(targetFile);
      if (isTextFile(targetFile)) {
        return sendJson(res, 200, {
          path: fileParam,
          encoding: "utf8",
          content: buffer.toString("utf8"),
        });
      }
      return sendJson(res, 200, {
        path: fileParam,
        encoding: "base64",
        content: buffer.toString("base64"),
      });
    }

    if (pathname === `${EDITOR_API_PREFIX}/write` && req.method === "POST") {
      const payload = await readJsonBody<{
        path?: string;
        content?: string;
        encoding?: "utf8" | "base64";
      }>(req, MAX_BODY_SIZE_BYTES);
      if (!payload.path || typeof payload.content !== "string") {
        return sendJson(res, 400, { error: "Missing path or content" });
      }
      const encoding = payload.encoding === "base64" ? "base64" : "utf8";
      const targetFile = assertPathInsideRoot(dataRoot, payload.path);
      await fs.mkdir(path.dirname(targetFile), { recursive: true });
      await fs.writeFile(targetFile, Buffer.from(payload.content, encoding));
      return sendJson(res, 200, { ok: true, path: payload.path });
    }

    if (pathname === `${EDITOR_API_PREFIX}/delete` && req.method === "DELETE") {
      const fileParam = url.searchParams.get("path");
      if (!fileParam) return sendJson(res, 400, { error: "Missing path" });
      const normalized = fileParam.trim();
      if (!normalized || normalized === "." || normalized === "/") {
        return sendJson(res, 400, { error: "Invalid delete path" });
      }
      const targetPath = assertPathInsideRoot(dataRoot, normalized);
      await fs.rm(targetPath, { recursive: true, force: true });
      return sendJson(res, 200, { ok: true, path: fileParam });
    }

    if (pathname === `${EDITOR_API_PREFIX}/upload` && req.method === "POST") {
      const fileParam = url.searchParams.get("path");
      if (!fileParam) return sendJson(res, 400, { error: "Missing path" });
      const bodyBuffer = await readRequestBody(req, MAX_BODY_SIZE_BYTES);
      const targetFile = assertPathInsideRoot(dataRoot, fileParam);
      await fs.mkdir(path.dirname(targetFile), { recursive: true });
      await fs.writeFile(targetFile, bodyBuffer);
      return sendJson(res, 200, {
        ok: true,
        path: fileParam,
        size: bodyBuffer.length,
      });
    }

    if (pathname === `${EDITOR_API_PREFIX}/run-generator` && req.method === "POST") {
      const payload = await readJsonBody<{ script?: string }>(
        req,
        MAX_BODY_SIZE_BYTES,
      );
      const script = payload.script ?? "";
      if (!allowedScripts.has(script)) {
        return sendJson(res, 400, { error: `Script not allowed: ${script}` });
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
          return sendJson(res, 200, { ok: true, script, stdout });
        }
        return sendJson(res, 500, {
          error: `Script ${script} failed with code ${code}`,
          stdout,
          stderr,
        });
      });
      return;
    }

    if (pathname === `${EDITOR_API_PREFIX}/product` && req.method === "POST") {
      if (!productVersioning) {
        return sendJson(res, 400, { error: "Product versioning disabled" });
      }
      const payload = await readJsonBody<{
        product?: string;
        label?: string;
        skipInit?: boolean;
      }>(req, MAX_BODY_SIZE_BYTES);
      const { product, label, skipInit } = payload;
      if (!label || !label.trim()) {
        return sendJson(res, 400, { error: "Missing product label" });
      }
      const safeId = product && product.trim() ? product.trim() : camelId(label);
      const safeLabel = label.trim();
      const productsPath = assertPathInsideRoot(dataRoot, "products.json");
      const products = await loadProducts(productsPath);
      if (products.some((p) => p.product === safeId)) {
        return sendJson(res, 400, { error: "Product already exists" });
      }
      products.push({ product: safeId, label: safeLabel });
      await saveProducts(productsPath, products);

      const productDir = assertPathInsideRoot(dataRoot, safeId);
      if (!skipInit) {
        const defaultVersion = { version: randomId("v-"), label: "v1.0" };
        await initProductDirectory(productDir, defaultVersion);
      } else {
        await fs.mkdir(productDir, { recursive: true });
      }

      return sendJson(res, 200, {
        ok: true,
        product: safeId,
        label: safeLabel,
      });
    }

    if (pathname === `${EDITOR_API_PREFIX}/product` && req.method === "DELETE") {
      if (!productVersioning) {
        return sendJson(res, 400, { error: "Product versioning disabled" });
      }
      const product = url.searchParams.get("product");
      if (!product) return sendJson(res, 400, { error: "Missing product" });

      const productsPath = assertPathInsideRoot(dataRoot, "products.json");
      const products = await loadProducts(productsPath);
      if (products.length <= 1) {
        return sendJson(res, 400, {
          error: "Cannot delete the last remaining product",
        });
      }
      const next = products.filter((p) => p.product !== product);
      if (next.length === products.length) {
        return sendJson(res, 404, { error: "Product not found" });
      }
      await saveProducts(productsPath, next);

      const productDir = assertPathInsideRoot(dataRoot, product);
      await fs.rm(productDir, { recursive: true, force: true });
      return sendJson(res, 200, { ok: true });
    }

    if (pathname === `${EDITOR_API_PREFIX}/product` && req.method === "PUT") {
      if (!productVersioning) {
        return sendJson(res, 400, { error: "Product versioning disabled" });
      }
      const payload = await readJsonBody<{
        product?: string;
        label?: string;
      }>(req, MAX_BODY_SIZE_BYTES);
      const { product, label } = payload;
      if (!product || !label) {
        return sendJson(res, 400, { error: "Missing product or label" });
      }

      const productsPath = assertPathInsideRoot(dataRoot, "products.json");
      const products = await loadProducts(productsPath);
      const existingIndex = products.findIndex((p) => p.product === product);
      if (existingIndex === -1) {
        return sendJson(res, 404, { error: "Product not found" });
      }
      products[existingIndex] = { product, label };
      await saveProducts(productsPath, products);

      return sendJson(res, 200, { ok: true, product, label });
    }

    if (pathname === `${EDITOR_API_PREFIX}/version` && req.method === "POST") {
      const payload = await readJsonBody<{
        product?: string;
        version?: string;
        label?: string;
      }>(req, MAX_BODY_SIZE_BYTES);
      const { product, version, label } = payload;
      if (!version || !label) {
        return sendJson(res, 400, { error: "Missing version or label" });
      }

      if (productVersioning) {
        if (!product) {
          return sendJson(res, 400, { error: "Missing product" });
        }

        const productDir = assertPathInsideRoot(dataRoot, product);
        const versionsPath = path.join(productDir, "versions.json");
        const versions = await loadVersions(versionsPath);
        if (versions.some((v) => v.version === version)) {
          return sendJson(res, 400, { error: "Version already exists" });
        }
        versions.push({ version, label });
        await saveVersions(versionsPath, versions);

        const versionDir = path.join(productDir, version);
        await initVersionDirectory(versionDir);

        return sendJson(res, 200, { ok: true });
      }

      const versionsPath = assertPathInsideRoot(dataRoot, "versions.json");
      const versions = await loadVersions(versionsPath);
      if (versions.some((v) => v.version === version)) {
        return sendJson(res, 400, { error: "Version already exists" });
      }
      versions.push({ version, label });
      await saveVersions(versionsPath, versions);

      const versionDir = assertPathInsideRoot(dataRoot, version);
      await initVersionDirectory(versionDir);

      return sendJson(res, 200, { ok: true });
    }

    if (pathname === `${EDITOR_API_PREFIX}/version` && req.method === "DELETE") {
      const product = url.searchParams.get("product");
      const version = url.searchParams.get("version");
      if (!version) {
        return sendJson(res, 400, { error: "Missing version" });
      }

      if (productVersioning) {
        if (!product) {
          return sendJson(res, 400, { error: "Missing product" });
        }
        const productDir = assertPathInsideRoot(dataRoot, product);
        const versionsPath = path.join(productDir, "versions.json");
        const versions = await loadVersions(versionsPath);
        if (versions.length <= 1) {
          return sendJson(res, 400, {
            error: "Cannot delete the last remaining version",
          });
        }
        const next = versions.filter((v) => v.version !== version);
        if (next.length === versions.length) {
          return sendJson(res, 404, { error: "Version not found" });
        }
        await saveVersions(versionsPath, next);

        const versionDir = path.join(productDir, version);
        await fs.rm(versionDir, { recursive: true, force: true });
        return sendJson(res, 200, { ok: true });
      }

      const versionsPath = assertPathInsideRoot(dataRoot, "versions.json");
      const versions = await loadVersions(versionsPath);
      if (versions.length <= 1) {
        return sendJson(res, 400, {
          error: "Cannot delete the last remaining version",
        });
      }
      const next = versions.filter((v) => v.version !== version);
      if (next.length === versions.length) {
        return sendJson(res, 404, { error: "Version not found" });
      }
      await saveVersions(versionsPath, next);

      const versionDir = assertPathInsideRoot(dataRoot, version);
      await fs.rm(versionDir, { recursive: true, force: true });
      return sendJson(res, 200, { ok: true });
    }

    if (pathname === `${EDITOR_API_PREFIX}/version` && req.method === "PUT") {
      const payload = await readJsonBody<{
        product?: string;
        version?: string;
        label?: string;
      }>(req, MAX_BODY_SIZE_BYTES);
      const { product, version, label } = payload;
      if (!version || !label) {
        return sendJson(res, 400, { error: "Missing version or label" });
      }

      if (productVersioning) {
        if (!product) {
          return sendJson(res, 400, { error: "Missing product" });
        }
        const productDir = assertPathInsideRoot(dataRoot, product);
        const versionsPath = path.join(productDir, "versions.json");
        const versions = await loadVersions(versionsPath);
        const existingIndex = versions.findIndex((v) => v.version === version);
        if (existingIndex === -1) {
          return sendJson(res, 404, { error: "Version not found" });
        }

        versions[existingIndex] = { version, label };
        await saveVersions(versionsPath, versions);

        return sendJson(res, 200, { ok: true, version, label });
      }

      const versionsPath = assertPathInsideRoot(dataRoot, "versions.json");
      const versions = await loadVersions(versionsPath);
      const existingIndex = versions.findIndex((v) => v.version === version);
      if (existingIndex === -1) {
        return sendJson(res, 404, { error: "Version not found" });
      }

      versions[existingIndex] = { version, label };
      await saveVersions(versionsPath, versions);

      return sendJson(res, 200, { ok: true, version, label });
    }

    return sendJson(res, 404, { error: "Unknown editor API route" });
  } catch (err) {
    if (err instanceof HttpError) {
      return sendJson(res, err.status, { error: err.message });
    }
    const message = err instanceof Error ? err.message : "Unknown error";
    return sendJson(res, 500, { error: message });
  }
}
