import { memo, useMemo, useState, useRef, useEffect } from "react";
import { ChevronDown, Loader } from "lucide-react";
import type { Version } from "../types/entities/Version";
import type { StyleTheme } from "../config/siteConfig";

interface VersionSelectorProps {
  styles: StyleTheme;
  versions: Version[];
  currentVersion: string;
  onVersionChange: (version: string) => void;
  loading: boolean;
}

const VersionSelector = memo<VersionSelectorProps>(
  ({ styles, versions, currentVersion, onVersionChange, loading }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const current = useMemo(
      () => versions.find((v) => v.version === currentVersion),
      [versions, currentVersion],
    );

    useEffect(() => {
      if (!isOpen) return;
      const handleClick = (e: MouseEvent) => {
        if (!dropdownRef.current?.contains(e.target as Node)) {
          setIsOpen(false);
        }
      };
      document.addEventListener("click", handleClick);
      return () => document.removeEventListener("click", handleClick);
    }, [isOpen]);

    useEffect(() => {
      if (!isOpen) return;
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") setIsOpen(false);
      };
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }, [isOpen]);

    const handleSelect = (version: string) => {
      onVersionChange(version);
      setIsOpen(false);
    };

    if (loading) {
      return (
        <div className="px-3 py-2 bg-gray-100 rounded-md">
          <div className="flex items-center gap-2">
            <Loader className="w-4 h-4 animate-spin" />
            <span className="text-sm text-gray-600">Loading versions...</span>
          </div>
        </div>
      );
    }

    return (
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={styles.componentsStyles.button}
          disabled={!versions.length}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
        >
          <span className="truncate">
            {current?.label || "Select Version"}
          </span>
          <ChevronDown
            className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
          />
        </button>

        {isOpen && (
          <ul
            className={`absolute top-full left-0 mt-1 ${styles.componentsStyles.dropdown}`}
            role="listbox"
          >
            {versions.map(({ version, label }) => (
              <li key={version}>
                <button
                  onClick={() => handleSelect(version)}
                  className={`${styles.componentsStyles.dropdownItem} ${
                    version === currentVersion ? styles.componentsStyles.dropdownItemActive : ""
                  }`}
                  role="option"
                  aria-selected={version === currentVersion}
                >
                  {label}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  },
);

export default VersionSelector;
