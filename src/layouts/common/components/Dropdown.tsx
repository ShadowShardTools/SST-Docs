import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import type { StyleTheme } from "@shadow-shard-tools/docs-core";

export interface DropdownItem {
  value: string;
  label: string;
}

interface DropdownProps {
  styles: StyleTheme;
  items: DropdownItem[];
  selectedValue?: string;
  onSelect: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  listClassName?: string;
}

export function Dropdown({
  styles,
  items,
  selectedValue,
  onSelect,
  placeholder = "Select",
  disabled = false,
  className = "",
  listClassName = "",
}: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const selectedLabel = useMemo(
    () => items.find((item) => item.value === selectedValue)?.label ?? placeholder,
    [items, selectedValue, placeholder],
  );

  useEffect(() => {
    if (!isOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleEsc);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleEsc);
    };
  }, [isOpen]);

  const toggle = () => {
    if (disabled) return;
    setIsOpen((prev) => !prev);
  };

  return (
    <div className={`relative ${className}`} ref={ref}>
      <button
        type="button"
        onClick={toggle}
        className={`flex justify-between items-center w-full gap-2 px-3 py-1.5 cursor-pointer ${styles.buttons.common} ${
          disabled ? "opacity-60 cursor-not-allowed" : ""
        }`}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className="truncate text-left">{selectedLabel}</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <ul
          className={`absolute top-full left-0 mt-1 z-50 min-w-full max-h-60 overflow-y-auto ${styles.dropdown.container} ${listClassName}`}
          role="listbox"
        >
          {items.map(({ value, label }) => (
            <li key={value}>
              <button
                type="button"
                onClick={() => {
                  onSelect(value);
                  setIsOpen(false);
                }}
                className={`w-full px-3 py-2 text-left cursor-pointer ${styles.dropdown.item} ${
                  value === selectedValue ? styles.dropdown.itemActive : ""
                }`}
                role="option"
                aria-selected={value === selectedValue}
              >
                {label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default Dropdown;
