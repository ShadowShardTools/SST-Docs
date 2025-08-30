// src/generators/pdf-generator/DocumentationPDFGenerator.ts
import * as fs from "node:fs/promises";
import path from "node:path";
import appRoot from "app-root-path";

import { PDFGenerator } from "./PDFGenerator";

import {
  loadVersions as coreLoadVersions,
  loadVersionData as coreLoadVersionData,
} from "../../../services/docsData";
import type { DataProvider } from "../../../services/types";

/* ------------------------------- FS Provider ------------------------------ */
class FsProvider implements DataProvider {
  async readJson<T>(absPath: string): Promise<T> {
    const text = await fs.readFile(absPath, "utf-8");
    return JSON.parse(text) as T;
  }
  async fileExists(absPath: string): Promise<boolean> {
    try {
      await fs.access(absPath);
      return true;
    } catch {
      return false;
    }
  }
}

/* ------------------------------ path helpers ------------------------------ */
function normalizeDir(p: string): string {
  return p.replace(/\\/g, "/").replace(/\/+$/, "");
}

function resolveAgainstProjectRoot(candidate: string): string {
  return path.isAbsolute(candidate)
    ? candidate
    : path.join(appRoot.path, candidate);
}

function resolveDataPath(input?: string): string {
  const argv = process.argv.slice(2);
  const i = argv.indexOf("--fsDataPath");
  const fromCli = i !== -1 && argv[i + 1] ? argv[i + 1] : undefined;

  const fromEnv = process.env.FS_DATA_PATH;
  const candidate = input ?? fromCli ?? fromEnv ?? "./public/SST-Docs/data";

  const abs = resolveAgainstProjectRoot(String(candidate));
  return normalizeDir(path.resolve(abs));
}

/* ---------------------------- Generator wrapper --------------------------- */
export class DocumentationPDFGenerator {
  private dataPath: string;
  private provider: DataProvider;

  constructor(dataPath?: string) {
    this.dataPath = resolveDataPath(dataPath);
    this.provider = new FsProvider();
  }

  async generateAllPDFs(): Promise<void> {
    try {
      console.log("🚀 SST Documentation PDF Generator (pdf-lib)");
      console.log(`📁 Data path: ${this.dataPath}`);

      console.log("\n📖 Loading documentation versions...");
      const versions = await coreLoadVersions(this.provider, this.dataPath);
      console.log(
        "📚 Found %d versions: %s",
        versions.length,
        versions.map((v) => `${v.version} (${v.label})`).join(", "),
      );

      for (const version of versions) {
        try {
          console.log(
            `\n📄 Generating PDF for ${version.label} (${version.version})...`,
          );
          const versionRoot = path.join(this.dataPath, version.version);

          const data = await coreLoadVersionData(this.provider, versionRoot);
          console.log(
            `📊 Loaded: ${data.items.length} items, ${data.tree.length} categories, ${data.standaloneDocs.length} standalone docs`,
          );

          const generator = new PDFGenerator();
          const outputPath = path.join(versionRoot, `${version.version}.pdf`);

          await generator.generatePDF(
            version,
            data.tree,
            data.standaloneDocs,
            outputPath,
          );

          console.log(
            `✅ PDF saved: ${path.relative(process.cwd(), outputPath)}`,
          );
        } catch (error) {
          console.error(
            `❌ Failed to generate PDF for ${version.version}:`,
            error,
          );
        }
      }

      console.log("\n🎉 PDF generation complete!");
    } catch (error) {
      console.error("💥 Failed to generate PDFs:", error);
      throw error;
    }
  }
}
