import { PDFDocument, StandardFonts } from "pdf-lib";
import { Config } from "../../../configs/pdf-config";
import type { Version, Category, DocItem } from "../../../layouts/render/types";
import { addTitle, addDivider, addText } from "../canvas/blocks";
import { PdfCanvas } from "../canvas";
import type { Fonts, PageConfig } from "../canvas/types";
import type { RenderContext } from "../types/RenderContext";
import { loadLucideIcons } from "../utilities";
import { processCategory } from "./processCategory";
import { processContent } from "./processContent";

export class DocsPdfWriter {
  private doc!: PDFDocument;
  private canvas!: PdfCanvas;
  private fonts!: Fonts;
  private ctx!: RenderContext;
  private pageConfig!: PageConfig;

  async init(): Promise<void> {
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

  async generate(
    version: Version,
    tree: Category[],
    standaloneDocs: DocItem[],
    outputPath: string,
  ): Promise<void> {
    // Cover / header
    addTitle(this.ctx, {
      text: `${version.label} — ${version.version}`,
      level: 1,
      spacing: "small",
    });
    addDivider(this.ctx, { type: "line", spacing: "medium" });

    // Render categories
    for (const category of tree) {
      await processCategory(this.ctx, category);
    }

    // Standalone docs
    if (standaloneDocs?.length) {
      addTitle(this.ctx, { text: "Standalone Documents", level: 1 });
      for (const doc of standaloneDocs) {
        addTitle(this.ctx, { text: doc.title, level: 2 });
        if (doc.description) addText(this.ctx, { text: doc.description });
        await processContent(this.ctx, doc.content);
      }
    }

    // Save
    const bytes = await this.doc.save();
    const fs = await import("node:fs/promises");
    const path = await import("node:path");
    await fs.mkdir(path.dirname(outputPath), { recursive: true });
    await fs.writeFile(outputPath, bytes);
  }
}
