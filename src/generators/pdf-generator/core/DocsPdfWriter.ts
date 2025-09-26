import { PDFDocument, StandardFonts } from "pdf-lib";
import { Config } from "../../../configs/pdf-config";
import type { Version, Category, DocItem } from "../../../layouts/render/types";
import { addTitle, addDivider } from "../canvas/blocks";
import { PdfCanvas } from "../canvas";
import type { Fonts, PageConfig } from "../canvas/types";
import type { RenderContext } from "../types/RenderContext";
import { loadLucideIcons } from "../utilities";
import { processCategory } from "./processCategory";
import { processContent } from "./processContent";
import { stylesConfig } from "../../../configs/site-config";

export class DocsPdfWriter {
  private doc!: PDFDocument;
  private canvas!: PdfCanvas;
  private fonts!: Fonts;
  private ctx!: RenderContext;
  private pageConfig!: PageConfig;
  private fsDataPath: string;

  constructor(fsDataPath: string) {
    this.fsDataPath = fsDataPath;
  }

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
    this.ctx = {
      doc: this.doc,
      canvas: this.canvas,
      fonts: this.fonts,
      icons,
      fsDataPath: this.fsDataPath,
    };
  }

  async generate(
    version: Version,
    tree: Category[],
    standaloneDocs: DocItem[],
    outputPath: string,
  ): Promise<void> {
    // Cover / header
    addTitle(this.ctx, {
      text: `${stylesConfig.logo.text} — ${version.label}`,
      level: 1,
      spacing: "small",
    });
    addDivider(this.ctx, { type: "line", spacing: "medium" });

    // Standalone docs
    if (standaloneDocs?.length) {
      for (let i = 0; i < standaloneDocs.length; i++) {
        const doc = standaloneDocs[i];

        if (Config.SPLIT_BY_DOCUMENT && i > 0) {
          this.canvas.ensureSpace({ forcePageBreakBefore: true });
        }

        addTitle(this.ctx, { text: doc.title, level: 1 });
        await processContent(this.ctx, doc.content);
      }
    }

    // Render categories
    for (let i = 0; i < tree.length; i++) {
      const category = tree[i];

      if (Config.SPLIT_BY_CATEGORY && i > 0) {
        this.canvas.ensureSpace({ forcePageBreakBefore: true });
      }

      await processCategory(this.ctx, category);
    }

    // Save
    const bytes = await this.doc.save();
    const fs = await import("node:fs/promises");
    const path = await import("node:path");
    await fs.mkdir(path.dirname(outputPath), { recursive: true });
    await fs.writeFile(outputPath, bytes);
  }
}
