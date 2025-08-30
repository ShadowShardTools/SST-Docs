import { rgb, PDFName, PDFString } from "pdf-lib";
import type { LinkRectContext, LinkRectOptions, Rect } from "./types";

export function drawLinkRect(
  context: LinkRectContext,
  opts: LinkRectOptions,
): Rect {
  const { x, y, width, height, url, underline } = opts;
  const yBottom = context.toPdfY(y + height);
  const yTop = context.toPdfY(y);

  // optional underline at the bottom of the rect (top‑down y)
  if (underline) {
    context.page.drawLine({
      start: { x, y: yBottom },
      end: { x: x + width, y: yBottom },
      thickness: 1,
      color: rgb(0, 0, 0),
    });
  }

  // low‑level annotation creation with safer array handling
  try {
    const docContext = (context.doc as any).context;
    const pageNode = (context.page as any).node;
    const rect = (docContext as any).obj([x, yBottom, x + width, yTop]);
    const action = (docContext as any).obj({
      Type: PDFName.of("Action"),
      S: PDFName.of("URI"),
      URI: PDFString.of(url),
    });
    const annot = (docContext as any).obj({
      Type: PDFName.of("Annot"),
      Subtype: PDFName.of("Link"),
      Rect: rect,
      Border: (docContext as any).obj([0, 0, 0]),
      A: action,
    });

    const AnnotsName = PDFName.of("Annots");
    let annots = pageNode.lookup(AnnotsName);
    if (!annots) {
      annots = (docContext as any).obj([]);
      pageNode.set(AnnotsName, annots);
    }
    annots.push(annot);
  } catch {
    // ignore if pdf-lib internals differ
  }

  return { x, y, width, height };
}
