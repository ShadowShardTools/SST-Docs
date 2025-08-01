import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import Branch from "./Branch";
import DocRow from "./DocRow";
import NavigationHints from "./NavigationHints";
import type { Category } from "../../../types/entities/Category";
import type { DocItem } from "../../../types/entities/DocItem";
import type { StyleTheme } from "../../../types/entities/StyleTheme";
import { buildEntries, branchMatches, testString } from "../utilities";

/* -------------------------------------------------------------------------- */
/*                                Navigation                                  */
/* -------------------------------------------------------------------------- */

export interface NavigationProps {
  styles: StyleTheme;
  tree: Category[];
  standaloneDocs?: DocItem[];
  onSelect: (entry: DocItem | Category) => void;
  selectedItem?: DocItem | Category | null;
  isSearchOpen?: boolean;
}

const Navigation: React.FC<NavigationProps> = ({
  styles,
  tree,
  standaloneDocs = [],
  onSelect,
  selectedItem,
  isSearchOpen,
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

  const filteredTree = useMemo(() => {
    const lower = filter.toLowerCase();

    const filterBranch = (node: Category): Category | null => {
      if (!branchMatches(node, lower)) return null;
      return {
        ...node,
        children: node.children
          ?.map(filterBranch)
          .filter((c): c is Category => c !== null),
        docs: node.docs?.filter((d) => testString(d.title, lower)),
      };
    };

    return tree.map(filterBranch).filter((c): c is Category => c !== null);
  }, [tree, filter]);

  // keep cursor in range when list shrinks
  useEffect(() => {
    if (cursor >= entries.length) setCursor(entries.length ? 0 : 0);
  }, [entries.length, cursor]);

  // scroll focused row into view
  useEffect(() => {
    if (!currentKey) return;
    const el = document.querySelector<HTMLElement>(
      `[data-key="${currentKey}"]`,
    );
    el?.scrollIntoView({ block: "nearest" });
  }, [currentKey]);

  /* -------------------------- keyboard shortcuts ------------------------- */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (isSearchOpen) return;

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
          if (!e.ctrlKey) break;
          const entry = entries[cursor];
          if (!entry) return;
          e.preventDefault();

          if (entry.type === "doc") {
            onSelect(entry.item);
          } else if (entry.type === "category") {
            onSelect(entry.node);
            if (!open[entry.id]) toggle(entry.id); // only expand
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
        <input
          ref={inputRef}
          type="text"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="Enter here to filter…"
          className={`${styles.input} w-full px-2 py-1.5 border`}
        />
        <kbd
          className={`px-1.5 py-0.5 pointer-events-none ${styles.hints.key} absolute right-2.5 top-1/2 -translate-y-1/2`}
        >
          F
        </kbd>
      </div>

      {/* Hints */}
      <NavigationHints styles={styles} />

      {/* Navigation tree */}
      <nav
        role="tree"
        aria-label="Documentation navigation"
        className="space-y-4"
      >
        {/* Stand-alone docs */}
        {standaloneDocs.length > 0 && (
          <section>
            <ul className="space-y-1">
              {standaloneDocs
                .filter((d) => d.title.toLowerCase().includes(lower))
                .map((d) => (
                  <DocRow
                    key={d.id}
                    ref={null}
                    doc={d}
                    depth={0}
                    active={
                      selectedItem?.id === d.id && !("children" in selectedItem)
                    }
                    focused={currentKey === `doc-${d.id}`}
                    select={onSelect}
                    styles={styles}
                  />
                ))}
            </ul>
          </section>
        )}

        {/* Category tree */}
        {filteredTree.map((node) => (
          <Branch
            key={node.id}
            node={node}
            depth={0}
            open={open}
            toggle={toggle}
            filter={lower} // optional, can remove in next step
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
