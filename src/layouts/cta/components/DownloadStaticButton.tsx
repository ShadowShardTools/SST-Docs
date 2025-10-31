import React, { useCallback, useState } from "react";
import { Download } from "lucide-react";
import JSZip from "jszip";
import type { StyleTheme } from "../../../application/types/StyleTheme";

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
  showText?: boolean;
}

export const DownloadStaticButton: React.FC<Props> = ({
  styles,
  currentVersion,
  showText = false,
}) => {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = useCallback(async () => {
    if (!currentVersion) return;
    try {
      setIsDownloading(true);

      const trimmedBase = import.meta.env.BASE_URL?.replace(/\/$/, "") ?? "";
      const dataPath =
        (import.meta.env.VITE_PUBLIC_DATA_PATH as string | undefined) ?? "";
      const trimmedDataPath = trimTrailingSlash(dataPath);

      const dataRoot = `${trimmedBase}${trimmedDataPath}`;
      const versionId = encodeURIComponent(currentVersion);
      const versionRoot = `${dataRoot}/${versionId}`;

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
      anchor.download = `${currentVersion}.zip`;
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
  }, [currentVersion]);

  if (!currentVersion) return null;

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
        <span>{isDownloading ? "Preparing…" : "Download static"}</span>
      )}
    </button>
  );
};
