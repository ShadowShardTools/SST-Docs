import { memo, useMemo, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import LoadingSpinner from "../../dialog/LoadingSpinner";
import type { StyleTheme } from "../../../types/StyleTheme";
import type { Version } from "../../render/types";
import { useClickOutside, useEscapeKey } from "../utilities";

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

    useClickOutside(dropdownRef, () => setIsOpen(false));
    useEscapeKey(() => setIsOpen(false), isOpen);

    const current = useMemo(
      () => versions.find((v) => v.version === currentVersion),
      [versions, currentVersion],
    );

    const handleSelect = (version: string) => {
      onVersionChange(version);
      setIsOpen(false);
    };

    if (loading) return <LoadingSpinner />;

    return (
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`flex justify-between items-center w-full gap-2 p-2 cursor-pointer ${styles.buttons.common}`}
          disabled={!versions.length}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
        >
          <span className="truncate">{current?.label || "Select Version"}</span>
          <ChevronDown
            className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
          />
        </button>

        {isOpen && (
          <ul
            className={`absolute top-full left-0 mt-1 z-50 min-w-full max-h-60 overflow-y-auto ${styles.dropdown.container}`}
            role="listbox"
          >
            {versions.map(({ version, label }) => (
              <li key={version}>
                <button
                  onClick={() => handleSelect(version)}
                  className={`w-full px-3 py-2 cursor-pointer ${styles.dropdown.item} ${
                    version === currentVersion ? styles.dropdown.itemActive : ""
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
