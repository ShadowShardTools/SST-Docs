import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import type { StyleTheme } from "@shadow-shard-tools/docs-core";
import Button from "./Button";

export interface DropdownItem {
  value: string;
  label: string;
  icon?: ReactNode;
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
  const [openAbove, setOpenAbove] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const selectedItem = useMemo(
    () => items.find((item) => item.value === selectedValue),
    [items, selectedValue],
  );
  const selectedLabel = selectedItem?.label ?? placeholder;
  const selectedIcon = selectedItem?.icon;

  useEffect(() => {
    if (!isOpen) return;

    // Check if there is space below for the dropdown
    // max-h-60 is approximately 240px (15rem = 240px)
    const MENU_HEIGHT_ESTIMATE = 250;
    const rect = ref.current?.getBoundingClientRect();

    if (rect) {
      const spaceBelow = window.innerHeight - rect.bottom;
      setOpenAbove(spaceBelow < MENU_HEIGHT_ESTIMATE);
    }
  }, [isOpen]);

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
      <Button
        type="button"
        onClick={toggle}
        className={`flex justify-between items-center w-full gap-2 px-3 py-1.5 ${
          disabled ? "opacity-60 cursor-not-allowed" : ""
        }`}
        styles={styles}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className="flex items-center gap-2 min-w-0">
          {selectedIcon && (
            <span className="flex items-center">{selectedIcon}</span>
          )}
          <span className="truncate text-left">{selectedLabel}</span>
        </span>
        <ChevronDown
          className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </Button>

      {isOpen && (
        <ul
          className={`absolute left-0 z-50 min-w-full max-h-60 overflow-y-auto ${
            styles.dropdown.container
          } ${listClassName} ${
            openAbove ? "bottom-full mb-1" : "top-full mt-1"
          }`}
          role="listbox"
        >
          {items.map(({ value, label, icon }) => (
            <li key={value}>
              <button
                type="button"
                onClick={() => {
                  onSelect(value);
                  setIsOpen(false);
                }}
                className={`w-full px-3 py-2 text-left cursor-pointer flex items-center gap-2 ${
                  styles.dropdown.item
                } ${value === selectedValue ? styles.dropdown.itemActive : ""}`}
                role="option"
                aria-selected={value === selectedValue}
              >
                {icon && <span className="flex items-center">{icon}</span>}
                <span>{label}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default Dropdown;
