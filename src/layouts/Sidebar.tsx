import React from "react";
import type { Category } from "../types/entities/Category";
import type { DocItem } from "../types/entities/DocItem";
import Navigation from "./Navigation/Navigation";
import { type StyleTheme } from "../siteConfig";

export interface SidebarProps {
  styles: StyleTheme;
  tree: Category[];
  standaloneDocs?: DocItem[];
  onSelect: (doc: DocItem) => void;
  selectedItem?: DocItem | null;
  isSearchOpen?: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({
  styles,
  tree,
  standaloneDocs = [],
  onSelect,
  selectedItem,
  isSearchOpen = false,
}) => {
  return (
    <aside
      className={`hidden md:block fixed md:sticky top-16 bottom-0 md:top-16 md:h-[calc(100vh-4rem)] w-64 shrink-0 p-4 overflow-y-auto custom-scrollbar z-40 ${styles.sections.navigationBackground} transition-colors`}
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
