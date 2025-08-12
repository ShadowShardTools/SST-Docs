import { PDFDocument, StandardFonts } from "pdf-lib";
import type { Category, Version, DocItem } from "../../layouts/render/types";
import { Config } from "../../configs/pdf-config";
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
    const italic = await this.doc.embedFont(StandardFonts.HelveticaOblique);
    const bold = await this.doc.embedFont(StandardFonts.HelveticaBold);
    const mono = await this.doc.embedFont(StandardFonts.Courier);
    this.fonts = { regular, italic, bold, mono };

    const page = this.doc.addPage([Config.PAGE.width, Config.PAGE.height]);
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
    await addTitle(this.ctx, { text: "SST Documentation", level: 1 });
    await addText(this.ctx, { text: `Version: ${version.version}` });
    await addDivider(this.ctx, { type: "line", spacing: "medium" });

    // Simple TOC
    await addTitle(this.ctx, { text: "Table of Contents", level: 2 });
    for (const category of tree) {
      addText(this.ctx, { text: `- ${category.title}` });
      if (category.children?.length) {
        for (const child of category.children) {
          await addText(this.ctx, { text: `  - ${child.title}` });
        }
      }
    }
    if (standaloneDocs.length > 0) {
      await addText(this.ctx, { text: "- Additional Documentation" });
      for (const d of standaloneDocs)
        await addText(this.ctx, { text: `  - ${d.title}` });
    }
    await addDivider(this.ctx, { type: "line", spacing: "medium" });

    // Body
    for (const category of tree) {
      await processCategory(this.ctx, category);
    }

    // Standalone docs
    if (standaloneDocs.length > 0) {
      await addTitle(this.ctx, { text: "Additional Documentation", level: 1 });
      const { processContent } = await import("./processContent"); // async processor
      for (const doc of standaloneDocs) {
        await addTitle(this.ctx, { text: doc.title, level: 2 });
        if (doc.description) addText(this.ctx, { text: doc.description });
        await processContent(this.ctx, doc.content);
      }
    }

    const bytes = await this.doc.save();
    const { default: fs } = await import("node:fs/promises");
    const path = await import("node:path");
    await fs.mkdir(path.dirname(outputPath), { recursive: true });
    await fs.writeFile(outputPath, bytes);
  }
}
