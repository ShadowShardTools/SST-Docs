import { SPACING_CLASSES } from "@shadow-shard-tools/docs-core";
import { useEffect, useRef } from "react";

interface EditableTextProps {
  value: string;
  alignmentClass: string;
  textClass: string;
  onChange: (next: string) => void;
}

export function EditableText({
  value,
  alignmentClass,
  textClass,
  onChange,
}: EditableTextProps) {
  const ref = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const el = ref.current;
    const isActive = document.activeElement === el;
    if (!isActive && el.innerText !== (value ?? "")) {
      el.innerText = value ?? "";
    }
  }, [value]);

  return (
    <p
      ref={ref}
      contentEditable
      suppressContentEditableWarning
      className={`${alignmentClass} ${textClass} ${SPACING_CLASSES.medium} bg-transparent outline-none min-h-[1.5rem] px-1.5 py-1.5 border border-transparent focus:border-sky-400 rounded`}
      style={{ whiteSpace: "pre-wrap" }}
      onInput={(e) => onChange((e.target as HTMLElement).innerText)}
    />
  );
}
