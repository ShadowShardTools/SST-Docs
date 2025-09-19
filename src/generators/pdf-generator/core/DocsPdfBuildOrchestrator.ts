import path from "node:path";
import { DocsPdfWriter } from "./DocsPdfWriter";
import {
  loadVersions as coreLoadVersions,
  loadVersionData as coreLoadVersionData,
} from "../../../services/docsData";
import { fsDataProvider, resolveDataPath } from "../utilities";

export class DocsPdfBuildOrchestrator {
  private dataPath: string;
  private provider = new fsDataProvider();

  constructor(dataPath?: string) {
    this.dataPath = resolveDataPath(dataPath);
  }

  async generateAll(): Promise<void> {
    console.log("🚀 SST Documentation PDF Builder");
    console.log(`📁 Data path: ${this.dataPath}`);

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

        const writer = new DocsPdfWriter();
        await writer.init();
        const outputPath = path.join(versionRoot, `${version.version}.pdf`);
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
