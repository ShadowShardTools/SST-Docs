import type { StyleTheme } from "@shadow-shard-tools/docs-core";
import { sanitizeRichText } from "../../../common/utils/richText";
import EditableRichText from "./EditableRichText";

interface EditableListProps {
  data: any;
  listClass: string;
  styles: StyleTheme;
  onChange: (items: string[]) => void;
}

export function EditableList({
  data,
  listClass,
  styles,
  onChange,
}: EditableListProps) {
  const items: string[] = (data?.items ?? []).length ? data.items : [""];

  // Render <br> for empty items so caret always has a place to sit.
  const html = items
    .map((item) => `<li>${item && item.trim() ? item : "<br>"}</li>`)
    .join("");

  const Tag = (data?.type === "ol" ? "ol" : "ul") as "ol" | "ul";

  const handleChange = (newHtml: string) => {
    if (typeof document === "undefined") return;

    const temp = document.createElement("div");
    temp.innerHTML = newHtml;

    const newItems = Array.from(temp.querySelectorAll("li")).map((li) => {
      const raw = li.innerHTML;

      const isEmpty =
        !raw ||
        raw === "<br>" ||
        raw === "<br/>" ||
        li.textContent?.trim() === "";

      return isEmpty ? "" : sanitizeRichText(raw);
    });

    onChange(newItems.length ? newItems : [""]);
  };

  return (
    <div className="bg-transparent border border-transparent focus-within:border-sky-400 rounded px-1.5 py-1.5">
      <EditableRichText
        tagName={Tag}
        value={html}
        styles={styles}
        className={`${listClass} outline-none`}
        onChange={handleChange}
        {...(Tag === "ol" && data?.startNumber !== undefined
          ? { start: data.startNumber }
          : {})}
      />
    </div>
  );
}
