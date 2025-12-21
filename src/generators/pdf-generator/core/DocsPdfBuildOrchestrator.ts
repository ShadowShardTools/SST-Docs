import path from "node:path";
import { DocsPdfWriter } from "./DocsPdfWriter";
import {
  loadVersionData,
  loadVersions,
  resolveDataPath,
} from "@shadow-shard-tools/docs-core";
import { fsDataProvider } from "@shadow-shard-tools/docs-core";

export class DocsPdfBuildOrchestrator {
  private dataPath: string;
  private provider = new fsDataProvider();

  constructor(dataPath?: string) {
    this.dataPath = resolveDataPath(dataPath);
  }

  async generateAll(): Promise<void> {
    console.log("🚀 SST Documentation PDF Builder");
    console.log(`📁 Data path: ${this.dataPath}`);

    const versions = await loadVersions(this.provider, this.dataPath);
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
        const data = await loadVersionData(this.provider, versionRoot);
        console.log(
          `📊 Loaded: ${data.items.length} items, ${data.tree.length} categories, ${data.standaloneDocs.length} standalone docs`,
        );

        // Pass the data path to the writer
        const writer = new DocsPdfWriter(this.dataPath);
        await writer.init();
        const outputPath = path.join(versionRoot, `index.pdf`);
        await writer.generate(
          version,
          data.tree,
          data.standaloneDocs,
          outputPath,
        );
        console.log(
          `✅ PDF saved: ${path.relative(process.cwd(), outputPath)}`,
        );
      } catch (err) {
        console.error(`❌ Failed for ${version.version}:`, err);
      }
    }

    console.log("\n🎉 PDF generation complete!");
  }
}
