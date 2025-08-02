import { useEffect, useCallback, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import type { DocItem, Category } from "../types";
import isCategory from "../utilities/isCategory";

export const useDocNavigation = (
  items: DocItem[],
  tree: Category[],
  standaloneDocs: DocItem[],
) => {
  const navigate = useNavigate();
  const { docId } = useParams();
  const [selectedItem, setSelectedItem] = useState<DocItem | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null,
  );

  const navigateToEntry = useCallback(
    (entry: DocItem | Category) => {
      if (isCategory(entry)) {
        setSelectedCategory(entry);
        setSelectedItem(null);
      } else {
        setSelectedItem(entry);
        setSelectedCategory(null);
      }
      navigate(`/${entry.id}`, { replace: true });
    },
    [navigate],
  );

  useEffect(() => {
    if (!items.length && !tree.length && !standaloneDocs.length) return;

    const findEntry = (id: string | undefined): DocItem | Category | null => {
      if (!id) return null;

      const allItems = [...items, ...standaloneDocs];
      const foundDoc = allItems.find((i) => i.id === id);
      if (foundDoc) return foundDoc;

      const findCategory = (nodes: Category[]): Category | null => {
        for (const cat of nodes) {
          if (cat.id === id) return cat;
          const child = findCategory(cat.children ?? []);
          if (child) return child;
        }
        return null;
      };
      return findCategory(tree);
    };

    const entry = findEntry(docId);
    if (entry) {
      if (isCategory(entry)) {
        setSelectedCategory(entry);
        setSelectedItem(null);
      } else {
        setSelectedItem(entry);
        setSelectedCategory(null);
      }
      return;
    }

    // Fallback to the first available item if nothing is found
    const firstItem = standaloneDocs[0] || items[0];
    if (firstItem) {
      navigateToEntry(firstItem);
    }
  }, [docId, items, tree, standaloneDocs, navigateToEntry]);

  return { selectedItem, selectedCategory, navigateToEntry };
};

export default useDocNavigation;
