import { PDFDocument, StandardFonts } from "pdf-lib";
import type { Category, Version, DocItem } from "../../layouts/render/types";
import { Config } from "./config";
import { PdfCanvas, type Fonts } from "./PdfCanvas";
import { loadLucideIcons } from "./icons";
import type { RenderContext } from "./types/RenderContext";
import { addDivider } from "./blocks/addDivider";
import { addText } from "./blocks/addText";
import { addTitle } from "./blocks/addTitle";
import { processCategory } from "./processCategory";

export class PDFGenerator {
  private doc!: PDFDocument;
  private canvas!: PdfCanvas;
  private fonts!: Fonts;

  private ctx!: RenderContext;

  private async initContext() {
    this.doc = await PDFDocument.create();
    const regular = await this.doc.embedFont(StandardFonts.Helvetica);
    const bold = await this.doc.embedFont(StandardFonts.HelveticaBold);
    const mono = await this.doc.embedFont(StandardFonts.Courier);
    this.fonts = { regular, bold, mono };

    const page = this.doc.addPage([Config.LETTER.width, Config.LETTER.height]);
    this.canvas = new PdfCanvas(this.doc, page, this.fonts);

    const icons = await loadLucideIcons(this.doc);

    this.ctx = { doc: this.doc, canvas: this.canvas, fonts: this.fonts, icons };
  }

  async generatePDF(
    version: Version,
    tree: Category[],
    standaloneDocs: DocItem[],
    outputPath: string,
  ): Promise<void> {
    await this.initContext();

    // Title page
    addTitle(this.ctx, "SST Documentation", 1);
    addText(this.ctx, `Version: ${version.version}`);
    addDivider(this.ctx);

    // Simple TOC
    addTitle(this.ctx, "Table of Contents", 2);
    for (const category of tree) {
      addText(this.ctx, `- ${category.title}`);
      if (category.children?.length) {
        for (const child of category.children)
          addText(this.ctx, `  - ${child.title}`);
      }
    }
    if (standaloneDocs.length > 0) {
      addText(this.ctx, "- Additional Documentation");
      for (const d of standaloneDocs) addText(this.ctx, `  - ${d.title}`);
    }
    addDivider(this.ctx);

    // Body
    for (const category of tree) processCategory(this.ctx, category, 1);

    // Standalone docs
    if (standaloneDocs.length > 0) {
      addTitle(this.ctx, "Additional Documentation", 1);
      for (const doc of standaloneDocs) {
        addTitle(this.ctx, doc.title, 2);
        if (doc.description) addText(this.ctx, doc.description);
        if (doc.tags?.length)
          addText(this.ctx, `🏷️ Tags: ${doc.tags.join(", ")}`);
        // Reuse content processor via a tiny shim
        const { processContent } = await import("./processContent");
        processContent(this.ctx, doc.content);
      }
    }

    const bytes = await this.doc.save();
    const { default: fs } = await import("node:fs/promises");
    const path = await import("node:path");
    await fs.mkdir(path.dirname(outputPath), { recursive: true });
    await fs.writeFile(outputPath, bytes);
  }
}
