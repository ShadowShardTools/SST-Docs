import type { StyleTheme } from "@shadow-shard-tools/docs-core";
import { AlignCenter, AlignLeft, AlignRight } from "lucide-react";
import Button from "../../../common/components/Button";

export type AlignmentValue = "left" | "center" | "right";

const ORDER: AlignmentValue[] = ["left", "center", "right"];
const LABELS: Record<AlignmentValue, string> = {
  left: "Left",
  center: "Center",
  right: "Right",
};
const ICONS = {
  left: AlignLeft,
  center: AlignCenter,
  right: AlignRight,
} as const;

interface AlignmentToggleButtonProps {
  value: AlignmentValue;
  onChange: (next: AlignmentValue) => void;
  styles: StyleTheme;
}

export function AlignmentToggleButton({
  value,
  onChange,
  styles,
}: AlignmentToggleButtonProps) {
  const current = value ?? "left";
  const currentIndex = ORDER.indexOf(current);
  const next = ORDER[(currentIndex + 1) % ORDER.length];
  const Icon = ICONS[current] ?? AlignLeft;

  return (
    <Button
      type="button"
      className="inline-flex items-center justify-center w-8 h-8"
      styles={styles}
      onClick={() => onChange(next)}
      title={`Align: ${LABELS[current]}`}
      aria-label={`Align: ${LABELS[current]}`}
    >
      <Icon className="w-5 h-5" />
    </Button>
  );
}

export default AlignmentToggleButton;
