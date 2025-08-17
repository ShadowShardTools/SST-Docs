import * as fs from "node:fs/promises";
import path from "node:path";

import type { Category, DocItem, Version } from "../../layouts/render/types";
import type { IndexJson, RawCategory } from "./types";
import { PDFGenerator } from "./PDFGenerator";

import { stylesConfig } from "../../configs/site-config";

export class DocumentationPDFGenerator {
  private dataPath: string;

  constructor(dataPath: string = stylesConfig.fsDataPath) {
    // Resolve relative path against project root
    this.dataPath = path.isAbsolute(dataPath)
      ? dataPath
      : path.resolve(dataPath);
  }

  private async fileExists(filePath: string): Promise<boolean> {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  private async readJsonFile<T>(filePath: string): Promise<T> {
    const content = await fs.readFile(filePath, "utf-8");
    return JSON.parse(content);
  }

  private async loadVersions(): Promise<Version[]> {
    const versionsPath = path.join(this.dataPath, "versions.json");
    if (!(await this.fileExists(versionsPath))) {
      throw new Error(`Versions file not found at: ${versionsPath}`);
    }
    return this.readJsonFile<Version[]>(versionsPath);
  }

  private async loadAllCategories(
    basePath: string,
    ids: string[],
  ): Promise<Record<string, RawCategory>> {
    const map: Record<string, RawCategory> = {};
    for (const id of ids) {
      try {
        const categoryPath = path.join(basePath, "categories", `${id}.json`);
        if (await this.fileExists(categoryPath)) {
          map[id] = await this.readJsonFile<RawCategory>(categoryPath);
        }
      } catch (error) {
        console.warn(
          `⚠️  Failed to load category ${id}:`,
          (error as Error).message,
        );
      }
    }
    return map;
  }

  private async loadAllItems(
    basePath: string,
    ids: string[],
  ): Promise<DocItem[]> {
    const items: DocItem[] = [];
    for (const id of ids) {
      try {
        const itemPath = path.join(basePath, "items", `${id}.json`);
        if (await this.fileExists(itemPath)) {
          const item = await this.readJsonFile<DocItem>(itemPath);
          items.push(item);
        }
      } catch (error) {
        console.warn(
          `⚠️  Failed to load item ${id}:`,
          (error as Error).message,
        );
      }
    }
    return items;
  }

  private buildTree(
    rawMap: Record<string, RawCategory>,
    allDocs: DocItem[],
  ): { tree: Category[]; usedDocIds: Set<string> } {
    const docLookup = new Map(allDocs.map((d) => [d.id, d]));
    const used = new Set<string>();

    const convert = (raw: RawCategory): Category => {
      let docs: DocItem[] | undefined;
      if (raw.docs?.length) {
        docs = raw.docs
          .map((id) => {
            const doc = docLookup.get(id);
            if (doc) {
              used.add(id);
              return doc;
            }
            return null;
          })
          .filter((d): d is DocItem => !!d);
        if (docs.length === 0) docs = undefined;
      }

      let children: Category[] | undefined;
      if (raw.children?.length) {
        children = raw.children
          .map((cid) => (rawMap[cid] ? convert(rawMap[cid]) : null))
          .filter((c): c is Category => !!c);
        if (children.length === 0) children = undefined;
      }

      return {
        id: raw.id,
        title: raw.title,
        description: raw.description,
        content: raw.content ?? [],
        docs,
        children,
      };
    };

    const childIds = new Set<string>();
    Object.values(rawMap).forEach((c) =>
      c.children?.forEach((id) => childIds.add(id)),
    );

    const tree = Object.values(rawMap)
      .filter((c) => c?.id && !childIds.has(c.id))
      .map(convert);

    return { tree, usedDocIds: used };
  }

  private async loadVersionData(version: string): Promise<{
    items: DocItem[];
    tree: Category[];
    standaloneDocs: DocItem[];
  }> {
    const basePath = path.join(this.dataPath, version);
    const indexPath = path.join(basePath, "index.json");

    if (!(await this.fileExists(indexPath))) {
      throw new Error(
        `Index file not found for version '${version}' at: ${indexPath}`,
      );
    }
    const index = await this.readJsonFile<IndexJson>(indexPath);

    const [rawCats, items] = await Promise.all([
      this.loadAllCategories(basePath, index.categories),
      this.loadAllItems(basePath, index.items),
    ]);

    const { tree, usedDocIds } = this.buildTree(rawCats, items);
    const standaloneDocs = items.filter((d) => !usedDocIds.has(d.id));
    return { items, tree, standaloneDocs };
  }

  async generateAllPDFs(): Promise<void> {
    try {
      console.log("🚀 SST Documentation PDF Generator (pdf-lib)");
      console.log(`📁 Data path: ${this.dataPath}`);

      console.log("\n📖 Loading documentation versions...");
      const versions = await this.loadVersions();
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
          const data = await this.loadVersionData(version.version);
          console.log(
            `📊 Loaded: ${data.items.length} items, ${data.tree.length} categories, ${data.standaloneDocs.length} standalone docs`,
          );

          // Fonts are embedded per-document inside PDFGenerator.init()
          const generator = new PDFGenerator();
          const outputPath = path.join(
            this.dataPath,
            version.version,
            `SST-Documentation-${version.version}.pdf`,
          );
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
