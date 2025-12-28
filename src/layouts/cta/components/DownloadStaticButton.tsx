import React, { useCallback, useState } from "react";
import { Download } from "lucide-react";
import JSZip from "jszip";
import { resolvePublicDataPath } from "@shadow-shard-tools/docs-core/configs/sstDocsConfigShared";
import type { StyleTheme } from "@shadow-shard-tools/docs-core/types/StyleTheme";
import { clientConfig } from "../../../application/config/clientConfig";

interface StaticManifest {
  version: string;
  generatedAt: string;
  index: string;
  categories: string[];
  docs: string[];
  charts: string[];
  media: string[];
  staticStylesPath: string;
  assetsManifest: string;
}

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url, { credentials: "same-origin" });
  if (!res.ok) {
    throw new Error(`Failed to fetch ${url}: ${res.status} ${res.statusText}`);
  }
  return res.json() as Promise<T>;
}

async function fetchBinary(url: string): Promise<ArrayBuffer> {
  const res = await fetch(url, { credentials: "same-origin" });
  if (!res.ok) {
    throw new Error(`Failed to fetch ${url}: ${res.status} ${res.statusText}`);
  }
  return res.arrayBuffer();
}

const trimTrailingSlash = (value: string) => value.replace(/\/+$/, "");
const ensureTrailingSlash = (value: string) =>
  value.endsWith("/") ? value : `${value}/`;

const resolveRelativeUrl = (base: string, relative: string) =>
  new URL(relative, base.endsWith("/") ? base : `${base}/`).toString();

interface Props {
  styles: StyleTheme;
  currentVersion: string;
  currentProduct?: string;
  productVersioning?: boolean;
  showText?: boolean;
}

export const DownloadStaticButton: React.FC<Props> = ({
  styles,
  currentVersion,
  currentProduct,
  productVersioning,
  showText = false,
}) => {
  const [isDownloading, setIsDownloading] = useState(false);

  const isProductVersioningEnabled =
    typeof productVersioning === "boolean"
      ? productVersioning
      : (clientConfig.PRODUCT_VERSIONING ?? false);

  const selectedProduct =
    isProductVersioningEnabled && currentProduct ? currentProduct : undefined;

  const handleDownload = useCallback(async () => {
    if (!currentVersion) return;
    if (isProductVersioningEnabled && !selectedProduct) return;
    try {
      setIsDownloading(true);

      const trimmedBase = import.meta.env.BASE_URL?.replace(/\/$/, "") ?? "";
      const dataRoot = resolvePublicDataPath(trimmedBase, clientConfig);
      const versionId = encodeURIComponent(currentVersion);
      const normalizedBase = dataRoot.replace(/\/+$/, "");
      const extraSegments = [
        selectedProduct ? encodeURIComponent(selectedProduct) : null,
        versionId,
      ]
        .filter(Boolean)
        .map((part) => (part as string).replace(/^\/+|\/+$/g, ""));
      const versionRoot =
        normalizedBase.length > 0
          ? `${normalizedBase}/${extraSegments.join("/")}`
          : `/${extraSegments.join("/")}`;

      const origin = window.location.origin;
      const versionRootUrl = new URL(
        versionRoot.replace(/\/?$/, "/"),
        origin,
      ).toString();

      const siteRootCandidates = [
        ensureTrailingSlash(versionRootUrl),
        resolveRelativeUrl(versionRootUrl, "static/"),
      ];
      const manifestRelativePath = "static-manifest.json";

      let manifest: StaticManifest | undefined;
      let siteRootUrl: string | undefined;
      let lastManifestError: unknown;

      for (const candidateRoot of siteRootCandidates) {
        try {
          const candidateManifestUrl = resolveRelativeUrl(
            candidateRoot,
            manifestRelativePath,
          );
          manifest = await fetchJson<StaticManifest>(candidateManifestUrl);
          siteRootUrl = ensureTrailingSlash(candidateRoot);
          break;
        } catch (error) {
          lastManifestError = error;
        }
      }

      if (!manifest || !siteRootUrl) {
        throw lastManifestError ?? new Error("Static manifest not found");
      }

      const staticStylesRootUrl = resolveRelativeUrl(
        siteRootUrl,
        manifest.staticStylesPath.replace(/\/?$/, "/"),
      );
      const assetsManifestUrl = resolveRelativeUrl(
        siteRootUrl,
        manifest.assetsManifest,
      );
      const staticStylesFiles = await fetchJson<string[]>(assetsManifestUrl);
      const staticStylesZipDir =
        trimTrailingSlash(manifest.staticStylesPath)
          .split("/")
          .filter(Boolean)
          .pop() ?? "static-styles";

      const zip = new JSZip();

      const addFile = async (zipPath: string, url: string) => {
        const data = await fetchBinary(url);
        zip.file(zipPath, data);
      };

      await addFile(
        manifest.index,
        resolveRelativeUrl(siteRootUrl, manifest.index),
      );

      for (const categoryPath of manifest.categories) {
        await addFile(
          categoryPath,
          resolveRelativeUrl(siteRootUrl, categoryPath),
        );
      }

      for (const docPath of manifest.docs) {
        await addFile(docPath, resolveRelativeUrl(siteRootUrl, docPath));
      }

      for (const chartPath of manifest.charts) {
        await addFile(chartPath, resolveRelativeUrl(siteRootUrl, chartPath));
      }

      for (const mediaPath of manifest.media) {
        await addFile(mediaPath, resolveRelativeUrl(versionRootUrl, mediaPath));
      }

      for (const assetPath of staticStylesFiles) {
        await addFile(
          `${staticStylesZipDir}/${assetPath}`,
          resolveRelativeUrl(staticStylesRootUrl, assetPath),
        );
      }

      zip.file(
        `${staticStylesZipDir}/assets-manifest.json`,
        JSON.stringify(staticStylesFiles, null, 2),
      );

      const blob = await zip.generateAsync({ type: "blob" });
      const downloadUrl = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = downloadUrl;
      anchor.download = `${
        selectedProduct ? `${selectedProduct}-` : ""
      }${currentVersion}.zip`;
      anchor.rel = "noopener";
      anchor.click();
      URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error("Failed to create static zip:", error);
      window.alert(
        "Unable to assemble the static site archive. Please try again.",
      );
    } finally {
      setIsDownloading(false);
    }
  }, [currentVersion, isProductVersioningEnabled, selectedProduct]);

  if (!currentVersion) return null;
  if (isProductVersioningEnabled && !selectedProduct) return null;

  return (
    <button
      type="button"
      onClick={handleDownload}
      disabled={isDownloading}
      aria-busy={isDownloading}
      className={`flex justify-center w-full items-center gap-2 p-2 cursor-pointer ${styles.buttons.common} ${
        isDownloading ? "opacity-70 pointer-events-none" : ""
      }`}
    >
      <Download className={`w-6 h-6 ${isDownloading ? "animate-pulse" : ""}`} />
      {showText && (
        <span>{isDownloading ? "Preparing..." : "Download static"}</span>
      )}
    </button>
  );
};
