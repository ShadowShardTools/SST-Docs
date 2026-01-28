import { SPACING_CLASSES } from "@shadow-shard-tools/docs-core";
import { LinkIcon } from "lucide-react";
import { useEffect, useRef } from "react";

type TitleClasses = { 1: string; 2: string; 3: string };

interface EditableTitleProps {
  value: string;
  level: number;
  alignmentClass: string;
  titleClasses: TitleClasses;
  showAnchor?: boolean;
  anchorClass?: string;
  wrapperClass?: string;
  onChange: (next: string) => void;
}

export function EditableTitle({
  value,
  level,
  alignmentClass,
  titleClasses,
  showAnchor,
  anchorClass,
  wrapperClass,
  onChange,
}: EditableTitleProps) {
  const textRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!textRef.current) return;
    const el = textRef.current;
    const isActive = document.activeElement === el;
    if (!isActive && el.innerText !== (value ?? "")) {
      el.innerText = value ?? "";
    }
  }, [value, level]);

  const Heading = (["h1", "h2", "h3"] as const)[level - 1 > 0 ? level - 1 : 0];
  const levelClass = titleClasses[level as 1 | 2 | 3] ?? titleClasses[1];

  return (
    <div className={SPACING_CLASSES.none}>
      <div className={wrapperClass}>
        <Heading
          className={`${alignmentClass} ${levelClass} font-bold leading-tight scroll-mt-20 bg-transparent p-0`}
        >
          <span
            ref={textRef}
            contentEditable
            suppressContentEditableWarning
            className="inline-block bg-transparent outline-none min-h-[1.5rem] px-1.5 py-1.5 border border-transparent focus:border-sky-400 rounded"
            style={{ whiteSpace: "pre-wrap" }}
            onInput={(e) => onChange((e.target as HTMLElement).innerText ?? "")}
          />
          {showAnchor && (
            <span
              contentEditable={false}
              className={`ml-2 inline-block ${anchorClass ?? ""}`}
            >
              <LinkIcon className="w-4 h-4" />
            </span>
          )}
        </Heading>
      </div>
    </div>
  );
}
