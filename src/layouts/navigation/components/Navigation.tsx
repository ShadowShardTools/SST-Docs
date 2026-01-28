import React, { useMemo, useRef } from "react";
import {
  useNavigationState,
  useCursorSync,
  useKeyboardNavigation,
} from "../hooks";
import {
  buildEntries,
  filterTree,
  testString,
  createDocumentKey,
} from "../utilities";
import Branch from "./Branch";
import DocRow from "./DocRow";
import NavigationHints from "./NavigationHints";
import type {
  Category,
  DocItem,
  StyleTheme,
} from "@shadow-shard-tools/docs-core";

export interface Props {
  styles: StyleTheme;
  tree: Category[];
  standaloneDocs?: DocItem[];
  onSelect: (entry: DocItem | Category) => void;
  selectedItem?: DocItem | Category | null;
  isSearchOpen?: boolean;
}

export const Navigation: React.FC<Props> = ({
  styles,
  tree,
  standaloneDocs = [],
  onSelect,
  selectedItem,
  isSearchOpen,
}) => {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const { open, filter, cursor, setFilter, setCursor, toggle } =
    useNavigationState();

  const entries = useMemo(
    () => buildEntries(tree, standaloneDocs, open, filter),
    [tree, standaloneDocs, open, filter],
  );

  const currentKey = entries[cursor]?.key ?? null;

  const filteredTree = useMemo(() => filterTree(tree, filter), [tree, filter]);

  useCursorSync(cursor, entries, setCursor, currentKey);

  useKeyboardNavigation({
    entries,
    cursor,
    setCursor,
    open,
    toggle,
    onSelect,
    isSearchOpen,
    inputRef,
  });

  const lower = filter.toLowerCase();

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
                .filter((d) => testString(d.title, lower))
                .map((d) => (
                  <DocRow
                    key={d.id}
                    ref={null}
                    doc={d}
                    depth={0}
                    active={
                      selectedItem?.id === d.id && !("children" in selectedItem)
                    }
                    focused={currentKey === createDocumentKey(d.id)}
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
