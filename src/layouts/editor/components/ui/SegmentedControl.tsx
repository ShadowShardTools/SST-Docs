import type { ReactNode } from "react";

export interface SegmentedOption<T> {
  value: T;
  label?: ReactNode;
  icon?: ReactNode;
  title?: string;
}

interface SegmentedControlProps<T> {
  value: T;
  options: SegmentedOption<T>[];
  onChange: (value: T) => void;
  className?: string;
}

export function SegmentedControl<T>({
  value,
  options,
  onChange,
  className = "",
}: SegmentedControlProps<T>) {
  return (
    <div
      className={`inline-flex rounded border overflow-hidden bg-white dark:bg-slate-900 ${className}`}
    >
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={String(option.value)}
            type="button"
            className={`px-3 py-1.5 text-sm border-r last:border-r-0 flex items-center gap-2 ${
              active
                ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900"
                : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200"
            }`}
            onClick={() => onChange(option.value)}
            aria-pressed={active}
            title={option.title}
          >
            {option.icon}
            {option.label && <span>{option.label}</span>}
          </button>
        );
      })}
    </div>
  );
}

export type SpacingSize = "none" | "small" | "medium" | "large";

const spacingLines: Record<SpacingSize, [number, number, number]> = {
  none: [4, 7, 10],
  small: [3, 7, 11],
  medium: [2.5, 7, 11.5],
  large: [2, 7, 12],
};

export function SpacingGlyph({ size }: { size: SpacingSize }) {
  const [y1, y2, y3] = spacingLines[size];
  return (
    <svg
      aria-hidden
      width="22"
      height="14"
      viewBox="0 0 22 14"
      className="text-current"
    >
      <line
        x1="1"
        x2="21"
        y1={y1}
        y2={y1}
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <line
        x1="5"
        x2="17"
        y1={y2}
        y2={y2}
        stroke="currentColor"
        strokeWidth="1.5"
        opacity={0.8}
      />
      <line
        x1="1"
        x2="21"
        y1={y3}
        y2={y3}
        stroke="currentColor"
        strokeWidth="1.5"
      />
    </svg>
  );
}
