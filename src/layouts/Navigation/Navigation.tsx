import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Search } from "lucide-react";

import Branch from "./Branch";
import DocRow from "./DocRow";
import { buildEntries } from "./navigationUtils";
import SidebarNavigationHints from "../../components/dialog/SidebarNavigationHints";
import type { StyleTheme } from "../../siteConfig";
import type { Category } from "../../types/entities/Category";
import type { DocItem } from "../../types/entities/DocItem";

/* -------------------------------------------------------------------------- */
/*                                Navigation                                  */
/* -------------------------------------------------------------------------- */

export interface NavigationProps {
  styles: StyleTheme;
  tree: Category[];
  standaloneDocs?: DocItem[];
  onSelect: (doc: DocItem) => void;
  selectedItem?: DocItem | null;
  isSearchOpen?: boolean; // if external search modal is open – skip nav hotkeys
}

const Navigation: React.FC<NavigationProps> = ({
  styles,
  tree,
  standaloneDocs = [],
  onSelect,
  selectedItem,
  isSearchOpen = false,
}) => {
  /* ----------------------------- state helpers --------------------------- */
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const toggle = useCallback(
    (id: string) => setOpen((prev) => ({ ...prev, [id]: !prev[id] })),
    [],
  );

  const [filter, setFilter] = useState("");
  const inputRef = useRef<HTMLInputElement | null>(null);

  /* --------------------------- flat list & cursor ------------------------ */
  const entries = useMemo(
    () => buildEntries(tree, standaloneDocs, open, filter),
    [tree, standaloneDocs, open, filter],
  );

  const [cursor, setCursor] = useState(0);
  const currentKey = entries[cursor]?.key ?? null;

  // keep cursor in range when list shrinks
  useEffect(() => {
    if (cursor >= entries.length) setCursor(entries.length ? 0 : 0);
  }, [entries.length, cursor]);

  // scroll focused row into view
  useEffect(() => {
    if (!currentKey) return;
    const el = document.querySelector<HTMLElement>(`[data-key="${currentKey}"]`);
    el?.scrollIntoView({ block: "nearest" });
  }, [currentKey]);

  /* -------------------------- keyboard shortcuts ------------------------- */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (isSearchOpen) return; // external modal overrides nav hotkeys

      const activeElement = document.activeElement as HTMLElement | null;
      const isTyping =
        activeElement && ["INPUT", "TEXTAREA"].includes(activeElement.tagName);

      // ESC unfocuses the filter
      if (e.key === "Escape" && activeElement === inputRef.current) {
        e.preventDefault();
        inputRef.current?.blur();
        return;
      }

      if (isTyping && activeElement !== inputRef.current) return;

      /* ------- all hotkeys require Ctrl, so we can switch on plain key ----- */
      switch (e.key) {
        case "ArrowDown":
          if (e.ctrlKey) {
            e.preventDefault();
            setCursor((i) => Math.min(entries.length - 1, i + 1));
          }
          break;
        case "ArrowUp":
          if (e.ctrlKey) {
            e.preventDefault();
            setCursor((i) => Math.max(0, i - 1));
          }
          break;
        case "ArrowRight": {
          if (!e.ctrlKey) break;
          const entry = entries[cursor];
          if (entry?.type === "category" && !open[entry.id]) {
            e.preventDefault();
            toggle(entry.id);
          }
          break;
        }
        case "ArrowLeft": {
          if (!e.ctrlKey) break;
          const entry = entries[cursor];
          if (entry?.type === "category" && open[entry.id]) {
            e.preventDefault();
            toggle(entry.id);
          }
          break;
        }
        case "Enter": {
          const entry = entries[cursor];
          if (!entry) return;
          e.preventDefault();
          if (entry.type === "doc") {
            onSelect(entry.item);
          } else {
            toggle(entry.id);
          }
          break;
        }
        case "f":
        case "F":
          if (!isTyping) {
            e.preventDefault();
            inputRef.current?.focus();
          }
          break;
        default:
          break;
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [entries, cursor, toggle, open, onSelect, isSearchOpen]);

  const lower = filter.toLowerCase();

  /* ---------------------------------------------------------------------- */
  return (
    <>
      {/* Filter input */}
      <div className="mb-3 relative">
        <Search className="absolute left-2.5 top-2.5 w-4 h-4 text-gray-400" />
        <input
          ref={inputRef}
          type="text"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="Enter here to filter…"
          className={`${styles.componentsStyles.input} w-full pl-8 pr-2 py-1.5 border`}
        />
        <kbd
          className={`px-1.5 py-0.5 pointer-events-none ${styles.componentsStyles.keyHints} absolute right-2.5 top-1/2 -translate-y-1/2`}
        >
          F
        </kbd>
      </div>

      {/* Hints */}
      <SidebarNavigationHints styles={styles} className="mb-4" />

      {/* Navigation tree */}
      <nav role="tree" aria-label="Documentation navigation" className="space-y-4">
        {/* Stand-alone docs */}
        {standaloneDocs.length > 0 && (
          <section>
            <h2 className="text-sm font-semibold text-gray-500 uppercase mb-2">
              General
            </h2>
            <ul className="space-y-1">
              {standaloneDocs
                .filter((d) => d.title.toLowerCase().includes(lower))
                .map((d) => (
                  <DocRow
                    key={d.id}
                    ref={null}
                    doc={d}
                    depth={0}
                    active={selectedItem?.id === d.id}
                    focused={currentKey === `doc-${d.id}`}
                    select={onSelect}
                    styles={styles}
                  />
                ))}
            </ul>
          </section>
        )}

        {/* Category tree */}
        {tree.map((node) => (
          <Branch
            key={node.id}
            node={node}
            depth={0}
            open={open}
            toggle={toggle}
            filter={lower}
            current={selectedItem}
            focusedKey={currentKey}
            select={onSelect}
            styles={styles}
          />
        ))}
      </nav>
    </>
  );
};

export default Navigation;
