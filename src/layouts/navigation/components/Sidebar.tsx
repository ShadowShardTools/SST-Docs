import React from "react";
import Navigation from "./Navigation";
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

export const Sidebar: React.FC<Props> = ({
  styles,
  tree,
  standaloneDocs = [],
  onSelect,
  selectedItem,
  isSearchOpen,
}) => {
  return (
    <aside
      className={`hidden md:block fixed md:sticky top-16 bottom-0 md:top-16 md:h-[calc(100vh-4rem)] w-64 shrink-0 p-4 overflow-y-auto custom-scrollbar z-40 ${styles.sections.sidebarBackground} transition-colors`}
    >
      <Navigation
        styles={styles}
        tree={tree}
        standaloneDocs={standaloneDocs}
        onSelect={onSelect}
        selectedItem={selectedItem}
        isSearchOpen={isSearchOpen}
      />
    </aside>
  );
};

export default Sidebar;
