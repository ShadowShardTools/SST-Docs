import { type PDFDocument } from "pdf-lib";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);

export async function loadLucideIcons(
  doc: PDFDocument,
  opts?: { size?: number; stroke?: string },
) {
  const { default: fs } = await import("node:fs/promises");
  const path = await import("node:path");
  const sharp = (await import("sharp")).default;

  const lucidePkgDir = path.dirname(
    require.resolve("lucide-static/package.json"),
  );
  const iconsDir = path.join(lucidePkgDir, "icons");

  const toPngEmbed = async (
    lucideName: string,
    { size = 64, stroke = "#2c3e50" } = {},
  ) => {
    try {
      const svgPath = path.join(iconsDir, `${lucideName}.svg`);
      let svg = await fs.readFile(svgPath, "utf8");
      svg = svg
        .replace(/stroke="currentColor"/g, `stroke="${stroke}"`)
        .replace(/width="24"/, `width="${size}"`)
        .replace(/height="24"/, `height="${size}"`);
      const png = await sharp(Buffer.from(svg)).png().toBuffer();
      return await doc.embedPng(png);
    } catch {
      return undefined;
    }
  };

  return {
    info: await toPngEmbed("info", opts),
    warning: await toPngEmbed("alert-triangle", opts),
    error: await toPngEmbed("x-circle", opts),
    success: await toPngEmbed("check-circle", opts),
    neutral: await toPngEmbed("help-circle", opts),
  } as const;
}
