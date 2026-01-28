import type { StyleTheme } from "@shadow-shard-tools/docs-core";
import { SPACING_CLASSES } from "@shadow-shard-tools/docs-core";
import EditableRichText from "./EditableRichText";

interface EditableTextProps {
  value: string;
  alignmentClass: string;
  textClass: string;
  styles: StyleTheme;
  onChange: (next: string) => void;
}

export function EditableText({
  value,
  alignmentClass,
  textClass,
  styles,
  onChange,
}: EditableTextProps) {
  return (
    <EditableRichText
      value={value}
      styles={styles}
      wrapperClassName="relative"
      className={`${alignmentClass} ${textClass} ${SPACING_CLASSES.medium} bg-transparent outline-none min-h-[1.5rem] px-1.5 py-1.5 border border-transparent focus:border-sky-400 rounded`}
      style={{ whiteSpace: "pre-wrap" }}
      onChange={onChange}
    />
  );
}
