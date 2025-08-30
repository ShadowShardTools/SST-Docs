import { PDFDocument, StandardFonts } from "pdf-lib";
import type { Category, Version, DocItem } from "../../../layouts/render/types";
import { Config } from "../../../configs/pdf-config";
import { PdfCanvas } from "../canvas";
import { loadLucideIcons } from "../utilities/loadLucideIcons";
import type { RenderContext } from "../types/RenderContext";
import { addDivider } from "../blocks/addDivider";
import { addText } from "../blocks/addText";
import { addTitle } from "../blocks/addTitle";
import { processCategory } from "./processCategory";
import type { Fonts, PageConfig } from "../canvas/types";

export class PDFGenerator {
  private doc!: PDFDocument;
  private canvas!: PdfCanvas;
  private fonts!: Fonts;
  private ctx!: RenderContext;
  private pageConfig!: PageConfig;

  private async initContext() {
    this.doc = await PDFDocument.create();

    // Embed standard fonts
    const regular = await this.doc.embedFont(StandardFonts.Helvetica);
    const italic = await this.doc.embedFont(StandardFonts.HelveticaOblique);
    const bold = await this.doc.embedFont(StandardFonts.HelveticaBold);
    const mono = await this.doc.embedFont(StandardFonts.Courier);
    this.fonts = { regular, italic, bold, mono };

    this.pageConfig = {
      width: Config.PAGE.width,
      height: Config.PAGE.height,
      margin: Config.MARGIN,
    };

    const page = this.doc.addPage([
      this.pageConfig.width,
      this.pageConfig.height,
    ]);

    this.canvas = new PdfCanvas({
      doc: this.doc,
      page,
      fonts: this.fonts,
      pageConfig: this.pageConfig,
    });

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
      await addText(this.ctx, { text: `- ${category.title}` });
      if (category.children?.length) {
        for (const child of category.children) {
          await addText(this.ctx, { text: `  - ${child.title}` });
        }
      }
    }
    if (standaloneDocs.length > 0) {
      await addText(this.ctx, { text: "- Additional Documentation" });
      for (const d of standaloneDocs) {
        await addText(this.ctx, { text: `  - ${d.title}` });
      }
    }
    await addDivider(this.ctx, { type: "line", spacing: "medium" });

    // Body
    for (const category of tree) {
      await processCategory(this.ctx, category);
    }

    // Standalone docs
    if (standaloneDocs.length > 0) {
      await addTitle(this.ctx, { text: "Additional Documentation", level: 1 });
      const { processContent } = await import("./processContent");
      for (const doc of standaloneDocs) {
        await addTitle(this.ctx, { text: doc.title, level: 2 });
        if (doc.description) {
          await addText(this.ctx, { text: doc.description });
        }
        await processContent(this.ctx, doc.content);
      }
    }

    // Save
    const bytes = await this.doc.save();
    const { default: fs } = await import("node:fs/promises");
    const path = await import("node:path");
    await fs.mkdir(path.dirname(outputPath), { recursive: true });
    await fs.writeFile(outputPath, bytes);
  }
}
