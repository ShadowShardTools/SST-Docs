import type { StyleTheme } from "@shadow-shard-tools/docs-core";
import { useEffect, useRef } from "react";

interface EditableDividerProps {
  data: any;
  styles: StyleTheme;
  onChange: (next: string) => void;
}

export function EditableDivider({
  data,
  styles,
  onChange,
}: EditableDividerProps) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (ref.current && ref.current.innerText !== (data?.text ?? "")) {
      ref.current.innerText = data?.text ?? "";
    }
  }, [data?.text]);

  const spacing = "mb-6";
  const base = `w-full ${styles.divider.border || "sst-divider-border"}`;
  const dividerClass = (() => {
    switch (data?.type) {
      case "line":
        return `${base} border-t`;
      case "dashed":
        return `${base} border-t-2 border-dashed`;
      case "dotted":
        return `${base} border-t-2 border-dotted`;
      case "double":
        return `${base} border-t-4 border-double`;
      case "thick":
        return `${base} border-t-2`;
      case "gradient":
        return `bg-gradient-to-r ${styles.divider.gradient} h-px w-full`;
      default:
        return `${base} border-t`;
    }
  })();

  const side = dividerClass.replace("w-full", "flex-1");
  return (
    <div className={`${spacing} flex items-center`}>
      <div className={side} />
      <span
        ref={ref}
        className={`px-4 min-w-[2rem] outline-none empty:before:content-[''] cursor-text ${
          styles.divider.text || "sst-divider-text"
        }`}
        contentEditable
        suppressContentEditableWarning
        onInput={(e) => onChange((e.target as HTMLElement).innerText)}
      />
      <div className={side} />
    </div>
  );
}
