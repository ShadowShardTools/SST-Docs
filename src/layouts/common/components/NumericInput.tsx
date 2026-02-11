import { useEffect, useState } from "react";
import type { ChangeEvent, FocusEvent, InputHTMLAttributes } from "react";

type InputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "value" | "onChange">;

interface NumericInputProps extends InputProps {
  value?: number;
  onChange: (value: number | undefined) => void;
  clampOnBlur?: boolean;
  clampMin?: boolean;
  clampMax?: boolean;
}

const formatValue = (value: number | undefined) =>
  typeof value === "number" && Number.isFinite(value) ? String(value) : "";

const normalizeValue = (value: string) => value.replace(/,/g, ".");

export function NumericInput({
  value,
  onChange,
  clampOnBlur = false,
  clampMin = true,
  clampMax = true,
  min,
  max,
  onBlur,
  onFocus,
  inputMode,
  ...props
}: NumericInputProps) {
  const [draft, setDraft] = useState(() => formatValue(value));
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    if (!isFocused) {
      setDraft(formatValue(value));
    }
  }, [value, isFocused]);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const normalized = normalizeValue(event.target.value);
    setDraft(normalized);

    if (normalized === "") {
      onChange(undefined);
      return;
    }

    if (normalized === "-" || normalized === "." || normalized === "-.") {
      return;
    }

    const parsed = Number(normalized);
    if (Number.isFinite(parsed)) {
      onChange(parsed);
    }
  };

  const handleBlur = (event: FocusEvent<HTMLInputElement>) => {
    setIsFocused(false);
    const normalized = normalizeValue(draft);

    if (normalized === "") {
      onChange(undefined);
      setDraft("");
      onBlur?.(event);
      return;
    }

    const parsed = Number(normalized);
    if (!Number.isFinite(parsed)) {
      setDraft(formatValue(value));
      onBlur?.(event);
      return;
    }

    let next = parsed;
    if (clampOnBlur) {
      if (clampMin && typeof min === "number") {
        next = Math.max(min, next);
      }
      if (clampMax && typeof max === "number") {
        next = Math.min(max, next);
      }
    }

    onChange(next);
    setDraft(formatValue(next));
    onBlur?.(event);
  };

  const handleFocus = (event: FocusEvent<HTMLInputElement>) => {
    setIsFocused(true);
    onFocus?.(event);
  };

  return (
    <input
      {...props}
      type="text"
      inputMode={inputMode ?? "decimal"}
      value={draft}
      min={min}
      max={max}
      onChange={handleChange}
      onBlur={handleBlur}
      onFocus={handleFocus}
    />
  );
}

export default NumericInput;
