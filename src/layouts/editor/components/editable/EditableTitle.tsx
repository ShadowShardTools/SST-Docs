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
  const ref = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (ref.current && ref.current.innerText !== value) {
      ref.current.innerText = value ?? "";
    }
  }, [value]);

  const Heading = (["h1", "h2", "h3"] as const)[level - 1 > 0 ? level - 1 : 0];
  const levelClass = titleClasses[level as 1 | 2 | 3] ?? titleClasses[1];

  return (
    <div className={SPACING_CLASSES.none}>
      <div className={wrapperClass}>
        <Heading
          ref={ref}
          contentEditable
          suppressContentEditableWarning
          className={`${alignmentClass} ${levelClass} font-bold leading-tight scroll-mt-20 group relative bg-transparent outline-none border-0 focus:border-0 focus:ring-0 px-0 py-0`}
          onInput={(e) => onChange((e.target as HTMLElement).innerText)}
        >
          {value}
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
