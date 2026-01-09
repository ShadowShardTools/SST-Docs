import { useMemo, useState, useCallback, useEffect, useRef } from "react";
import {
  Folder,
  FileText,
  ChevronDown,
  ChevronRight,
  Plus,
  FolderPlus,
} from "lucide-react";
import type {
  Category,
  DocItem,
  StyleTheme,
} from "@shadow-shard-tools/docs-core";
import { read, write } from "../api";
import { rowClasses } from "../../navigation/utilities";

type DragItem =
  | { type: "category"; id: string; parentId: string | null }
  | { type: "doc"; id: string; parentId: string | null };

interface EditorNavigationProps {
  styles: StyleTheme;
  tree: Category[];
  standaloneDocs?: DocItem[];
  currentProduct: string;
  currentVersion: string;
  onSelect: (entry: DocItem | Category) => void;
  selectedItem?: DocItem | Category | null;
  onReload: (product?: string, version?: string) => Promise<void>;
}

const buildParentMaps = (tree: Category[], standalone: DocItem[]) => {
  const categoryParent = new Map<string, string | null>();
  const docParent = new Map<string, string | null>();
  const categoryLookup = new Map<string, Category>();
  const childrenOrder = new Map<string | null, string[]>();

  const walk = (node: Category, parent: string | null) => {
    categoryParent.set(node.id, parent);
    categoryLookup.set(node.id, node);
    childrenOrder.set(node.id, node.children?.map((c) => c.id) ?? []);
    node.docs?.forEach((doc) => docParent.set(doc.id, node.id));
    node.children?.forEach((child) => walk(child, node.id));
  };

  tree.forEach((node) => walk(node, null));
  childrenOrder.set(
    null,
    tree.map((n) => n.id),
  );
  standalone.forEach((doc) => docParent.set(doc.id, null));
  return { categoryParent, docParent, categoryLookup, childrenOrder };
};

const EditorNavigation: React.FC<EditorNavigationProps> = ({
  styles,
  tree,
  standaloneDocs = [],
  currentProduct,
  currentVersion,
  onSelect,
  selectedItem,
  onReload,
}) => {
  const { categoryParent, docParent, childrenOrder } = useMemo(
    () => buildParentMaps(tree, standaloneDocs),
    [tree, standaloneDocs],
  );
  const [dragItem, setDragItem] = useState<DragItem | null>(null);
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const [dragOverKey, setDragOverKey] = useState<string | null>(null);
  const [addMenuFor, setAddMenuFor] = useState<string | null>(null);

  const basePath = `${currentProduct}/${currentVersion}`;
  const filteredTree = tree;
  const filteredStandalone = standaloneDocs;

  const readJson = useCallback(async (path: string) => {
    const res = await read(path);
    return JSON.parse(res.content);
  }, []);

  const AddMenuTrigger: React.FC<{
    label: string;
    activeKey: string;
    addMenuFor: string | null;
    setAddMenuFor: (key: string | null) => void;
    onCreateCategory: () => void;
    onCreateDoc: () => void;
    highlight?: boolean;
    docOnly?: boolean;
    categoryOnly?: boolean;
  }> = ({
    label,
    activeKey,
    addMenuFor,
    setAddMenuFor,
    onCreateCategory,
    onCreateDoc,
    highlight = false,
    docOnly = false,
    categoryOnly = false,
  }) => {
    const open = addMenuFor === activeKey;
    const ref = useRef<HTMLDivElement>(null);
    const handleClick = () => {
      if (docOnly) {
        onCreateDoc();
        return;
      }
      if (categoryOnly) {
        onCreateCategory();
        return;
      }
      setAddMenuFor(open ? null : activeKey);
    };

    useEffect(() => {
      if (!open) return;
      const handleOutsideClick = (event: MouseEvent) => {
        const target = event.target as Node;
        if (ref.current && !ref.current.contains(target)) {
          setAddMenuFor(null);
        }
      };
      document.addEventListener("mousedown", handleOutsideClick);
      return () =>
        document.removeEventListener("mousedown", handleOutsideClick);
    }, [open, setAddMenuFor]);

    return (
      <div className="relative w-full" ref={ref}>
        <button
          type="button"
          aria-label={label}
          className="group relative w-full h-4 flex items-center justify-center"
          onClick={handleClick}
        >
          <span
            className={`absolute left-0 right-0 top-1/2 h-px -translate-y-1/2 transition-colors ${
              highlight ? "bg-sky-400" : "bg-slate-500/30 dark:bg-slate-400/20"
            }`}
          />
          <span
            className={`relative z-10 inline-flex items-center justify-center w-12 h-6 rounded-full border transition-all ${
              styles.buttons.common
            } ${highlight ? "!border-sky-400 !text-sky-200" : ""} ${
              open
                ? "opacity-100 scale-100"
                : "opacity-0 scale-75 group-hover:opacity-100 group-hover:scale-100"
            }`}
          >
            <Plus className="w-4 h-4" />
          </span>
        </button>
        {!docOnly && !categoryOnly && open && (
          <div
            className={`absolute left-1/2 -translate-x-1/2 z-20 mt-2 min-w-[160px] ${styles.dropdown.container}`}
          >
            <button
              type="button"
              className={`w-full text-left px-3 py-2 flex items-center gap-2 ${styles.dropdown.item}`}
              onClick={() => {
                setAddMenuFor(null);
                onCreateCategory();
              }}
            >
              <FolderPlus className="w-4 h-4" />
              Category
            </button>
            <button
              type="button"
              className={`w-full text-left px-3 py-2 flex items-center gap-2 ${styles.dropdown.item}`}
              onClick={() => {
                setAddMenuFor(null);
                onCreateDoc();
              }}
            >
              <FileText className="w-4 h-4" />
              Document
            </button>
          </div>
        )}
      </div>
    );
  };

  const writeJson = useCallback(async (path: string, data: unknown) => {
    await write(path, JSON.stringify(data, null, 2), "utf8");
  }, []);

  const generateUniqueId = (prefix: string) => {
    const existing = new Set<string>([
      ...categoryParent.keys(),
      ...docParent.keys(),
    ]);
    let candidate = "";
    do {
      const rand =
        typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : Math.random().toString(36).slice(2, 10);
      candidate = `${prefix}-${rand}`;
    } while (existing.has(candidate));
    return candidate;
  };

  const createCategory = async (parentId: string | null = null) => {
    const title = window.prompt("Category title");
    if (!title) return;
    const id = generateUniqueId("cat");

    const indexPath = `${basePath}/index.json`;
    const catPath = `${basePath}/categories/${id}.json`;
    try {
      const index = await readJson(indexPath);
      const newCategory = {
        id,
        title,
        description: "",
        docs: [],
        children: [],
      };
      await writeJson(catPath, newCategory);

      const categories = Array.isArray(index.categories)
        ? [...index.categories]
        : [];
      if (!categories.includes(id)) categories.push(id);
      index.categories = categories;

      if (parentId) {
        const parentPath = `${basePath}/categories/${parentId}.json`;
        const parent = await readJson(parentPath);
        const children = Array.isArray(parent.children) ? parent.children : [];
        if (!children.includes(id)) children.push(id);
        parent.children = children;
        await writeJson(parentPath, parent);
      }

      await writeJson(indexPath, index);
      await onReload(currentProduct, currentVersion);
    } catch (err) {
      alert(
        `Failed to create category: ${err instanceof Error ? err.message : String(err)}`,
      );
    }
  };

  const createDoc = async (parentId: string | null) => {
    const title = window.prompt("Document title");
    if (!title) return;
    const id = generateUniqueId("doc");

    const indexPath = `${basePath}/index.json`;
    const docPath = `${basePath}/items/${id}.json`;
    try {
      const index = await readJson(indexPath);
      const newDoc = {
        id,
        title,
        content: [],
      };
      await writeJson(docPath, newDoc);
      const items = Array.isArray(index.items) ? index.items : [];
      if (!items.includes(id)) items.push(id);
      index.items = items;
      if (parentId) {
        const catPath = `${basePath}/categories/${parentId}.json`;
        const category = await readJson(catPath);
        const docs = Array.isArray(category.docs) ? category.docs : [];
        if (!docs.includes(id)) docs.push(id);
        category.docs = docs;
        await writeJson(catPath, category);
      }
      await writeJson(indexPath, index);
      await onReload(currentProduct, currentVersion);
    } catch (err) {
      alert(
        `Failed to create document: ${err instanceof Error ? err.message : String(err)}`,
      );
    }
  };

  const moveCategory = async (
    categoryId: string,
    targetParent: string | null,
    targetIndex: number,
  ) => {
    // prevent moving into its own subtree
    let cursor = targetParent;
    while (cursor) {
      if (cursor === categoryId) return;
      cursor = categoryParent.get(cursor) ?? null;
    }
    const indexPath = `${basePath}/index.json`;
    try {
      const index = await readJson(indexPath);
      const removeFromParent = async (parentId: string | null) => {
        if (!parentId) {
          index.categories = (index.categories as string[]).filter(
            (c) => c !== categoryId,
          );
        } else {
          const parentPath = `${basePath}/categories/${parentId}.json`;
          const parent = await readJson(parentPath);
          parent.children = (parent.children ?? []).filter(
            (c: string) => c !== categoryId,
          );
          await writeJson(parentPath, parent);
        }
      };
      const addToParent = async (parentId: string | null) => {
        if (!parentId) {
          const cats = Array.isArray(index.categories)
            ? [...index.categories]
            : [];
          cats.splice(targetIndex, 0, categoryId);
          index.categories = cats;
        } else {
          const parentPath = `${basePath}/categories/${parentId}.json`;
          const parent = await readJson(parentPath);
          const children = Array.isArray(parent.children)
            ? [...parent.children]
            : [];
          children.splice(targetIndex, 0, categoryId);
          parent.children = children;
          await writeJson(parentPath, parent);
        }
      };

      await removeFromParent(categoryParent.get(categoryId) ?? null);
      await addToParent(targetParent);
      await writeJson(indexPath, index);
      await onReload(currentProduct, currentVersion);
    } catch (err) {
      alert(
        `Failed to move category: ${err instanceof Error ? err.message : String(err)}`,
      );
    }
  };

  const moveDoc = async (
    docId: string,
    sourceCat: string | null,
    targetCat: string | null,
    targetIndex: number,
  ) => {
    try {
      const indexPath = `${basePath}/index.json`;
      const index = await readJson(indexPath);

      if (sourceCat) {
        const sourcePath = `${basePath}/categories/${sourceCat}.json`;
        const source = await readJson(sourcePath);
        source.docs = (source.docs ?? []).filter((d: string) => d !== docId);
        await writeJson(sourcePath, source);
      }

      if (targetCat) {
        const targetPath = `${basePath}/categories/${targetCat}.json`;
        const target =
          sourceCat === targetCat
            ? await readJson(targetPath)
            : await readJson(targetPath);
        const docs = Array.isArray(target.docs) ? [...target.docs] : [];
        docs.splice(targetIndex, 0, docId);
        target.docs = docs;
        await writeJson(targetPath, target);
      } else {
        // reorder standalone docs by updating index.items order
        const items = Array.isArray(index.items) ? [...index.items] : [];
        const filtered = items.filter((d: string) => d !== docId);
        filtered.splice(targetIndex, 0, docId);
        index.items = filtered;
        await writeJson(indexPath, index);
      }

      await onReload(currentProduct, currentVersion);
    } catch (err) {
      alert(
        `Failed to move document: ${err instanceof Error ? err.message : String(err)}`,
      );
    }
  };

  const handleRootDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!dragItem || dragItem.type !== "category") return;
    await moveCategory(dragItem.id, null, tree.length);
    setDragItem(null);
    setDragOverKey(null);
  };

  const handleCategoryDrop = (node: Category) => {
    return async (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (!dragItem) return;
      if (dragItem.type === "category") {
        const targetParent = categoryParent.get(node.id) ?? null;
        const siblings = childrenOrder.get(targetParent) ?? [];
        const targetIndex = siblings.indexOf(node.id);
        await moveCategory(dragItem.id, targetParent, targetIndex);
      } else if (dragItem.type === "doc") {
        const targetIndex = node.docs?.length ?? 0;
        await moveDoc(dragItem.id, dragItem.parentId, node.id, targetIndex);
      }
      setDragItem(null);
      setDragOverKey(null);
    };
  };

  const handleDropDoc = (targetCat: string, targetIdx: number) => {
    return async (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (!dragItem || dragItem.type !== "doc") return;
      await moveDoc(dragItem.id, dragItem.parentId, targetCat, targetIdx);
      setDragItem(null);
      setDragOverKey(null);
    };
  };

  const handleStandaloneDrop = (targetIdx: number) => {
    return async (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (!dragItem || dragItem.type !== "doc") return;
      await moveDoc(dragItem.id, dragItem.parentId, null, targetIdx);
      setDragItem(null);
      setDragOverKey(null);
    };
  };

  const renderDocs = (docs: DocItem[], parentId: string) => (
    <ul className="ml-5 space-y-1">
      {docs.map((doc, idx) => {
        const active = selectedItem?.id === doc.id;
        const cls = rowClasses(styles, active, false, 1);
        const dragKey = `doc-${doc.id}`;
        const over = dragOverKey === dragKey && dragItem?.type === "doc";

        return (
          <li
            key={doc.id}
            draggable
            onDragStart={() =>
              setDragItem({ type: "doc", id: doc.id, parentId })
            }
            onDragOver={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setDragOverKey(dragKey);
            }}
            onDragLeave={(e) => {
              e.stopPropagation();
              setDragOverKey(null);
            }}
            onDrop={handleDropDoc(parentId, idx)}
            className={`${cls} ${
              over ? "!border-2 !border-sky-500 !bg-sky-500/10 !rounded-md" : ""
            }`}
            onClick={() => onSelect(doc)}
          >
            <FileText className="w-4 h-4 shrink-0" />
            <span className="truncate">{doc.title}</span>
          </li>
        );
      })}
    </ul>
  );

  const renderCategory = (node: Category, depth = 0) => {
    const docs = node.docs ?? [];
    const active = selectedItem?.id === node.id;
    const cls = rowClasses(styles, active, false, depth);
    const expanded = open[node.id] ?? true;
    const over = dragOverKey === `cat-${node.id}`;
    return (
      <div key={node.id} className="space-y-1">
        <div
          className={`${cls} flex items-center gap-2 ${
            over ? "!border-2 !border-sky-500 !bg-sky-500/10 !rounded-md" : ""
          }`}
          draggable
          onDragStart={() =>
            setDragItem({
              type: "category",
              id: node.id,
              parentId: categoryParent.get(node.id) ?? null,
            })
          }
          onDragOver={(e) => {
            e.preventDefault();
            setDragOverKey(`cat-${node.id}`);
          }}
          onDragLeave={() => setDragOverKey(null)}
          onDrop={handleCategoryDrop(node)}
          onClick={() => onSelect(node)}
        >
          <Folder className="w-4 h-4 shrink-0" />
          <span className="truncate">{node.title}</span>
          <button
            type="button"
            className="p-1 ml-auto"
            onClick={(e) => {
              e.stopPropagation();
              setOpen((prev) => ({ ...prev, [node.id]: !expanded }));
            }}
          >
            {expanded ? (
              <ChevronDown className="w-4 h-4 shrink-0" />
            ) : (
              <ChevronRight className="w-4 h-4 shrink-0" />
            )}
          </button>
        </div>
        {expanded && (
          <>
            <div
              className="ml-5"
              onDragOver={(e) => {
                e.preventDefault();
                setDragOverKey(`cat-${node.id}-add`);
              }}
              onDragLeave={() => setDragOverKey(null)}
              onDrop={handleDropDoc(node.id, docs.length)}
            >
              <AddMenuTrigger
                label="Item"
                activeKey={`cat-${node.id}-add`}
                addMenuFor={addMenuFor}
                setAddMenuFor={setAddMenuFor}
                onCreateCategory={() => createCategory(node.id)}
                onCreateDoc={() => createDoc(node.id)}
                highlight={dragOverKey === `cat-${node.id}-add`}
              />
            </div>
            {docs.length > 0 && renderDocs(docs, node.id)}
            {node.children?.map((child) => (
              <div key={child.id} className="ml-4">
                {renderCategory(child, depth + 1)}
              </div>
            ))}
          </>
        )}
      </div>
    );
  };

  return (
    <aside
      className={`hidden md:block fixed md:sticky top-16 bottom-0 md:top-16 md:h-[calc(100vh-4rem)] w-64 shrink-0 p-4 overflow-y-auto custom-scrollbar z-40 ${styles.sections.sidebarBackground} transition-colors`}
    >
      <nav className="space-y-3">
        <div>
          <div className="text-xs uppercase text-slate-500 mb-1">
            Standalone
          </div>
          <div
            className="mb-2"
            onDragOver={(e) => {
              e.preventDefault();
              setDragOverKey("standalone-add");
            }}
            onDragLeave={() => setDragOverKey(null)}
            onDrop={handleStandaloneDrop(filteredStandalone.length)}
          >
            <AddMenuTrigger
              label="Item"
              activeKey="standalone-add"
              addMenuFor={addMenuFor}
              setAddMenuFor={setAddMenuFor}
              onCreateCategory={() => createCategory(null)}
              onCreateDoc={() => createDoc(null)}
              highlight={dragOverKey === "standalone-add"}
              docOnly
            />
          </div>
          <ul className="space-y-1">
            {filteredStandalone.map((doc, idx) => {
              const active = selectedItem?.id === doc.id;
              const cls = rowClasses(styles, active, false, 0);
              const dragKey = `doc-${doc.id}`;
              const over = dragOverKey === dragKey && dragItem?.type === "doc";

              return (
                <li
                  key={doc.id}
                  draggable
                  onDragStart={() =>
                    setDragItem({ type: "doc", id: doc.id, parentId: null })
                  }
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setDragOverKey(dragKey);
                  }}
                  onDragLeave={(e) => {
                    e.stopPropagation();
                    setDragOverKey(null);
                  }}
                  onDrop={handleStandaloneDrop(idx)}
                  className={`${cls} ${
                    over
                      ? "!border-2 !border-sky-500 !bg-sky-500/10 !rounded"
                      : ""
                  }`}
                  onClick={() => onSelect(doc)}
                >
                  <FileText className="w-4 h-4 shrink-0" />
                  <span className="truncate">{doc.title}</span>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="text-xs uppercase text-slate-500">Categories</div>
        <div
          className="mb-2"
          onDragOver={(e) => {
            e.preventDefault();
            setDragOverKey("categories-add");
          }}
          onDragLeave={() => setDragOverKey(null)}
          onDrop={(e) => {
            e.preventDefault();
            if (dragItem?.type === "category") {
              moveCategory(dragItem.id, null, filteredTree.length);
            }
            setDragItem(null);
            setDragOverKey(null);
          }}
        >
          <AddMenuTrigger
            label="Item"
            activeKey="categories-add"
            addMenuFor={addMenuFor}
            setAddMenuFor={setAddMenuFor}
            onCreateCategory={() => createCategory(null)}
            onCreateDoc={() => createDoc(null)}
            highlight={dragOverKey === "categories-add"}
            categoryOnly
          />
        </div>
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOverKey("root");
          }}
          onDragLeave={() => setDragOverKey(null)}
          onDrop={handleRootDrop}
          className={
            dragOverKey === "root" && dragItem?.type === "category"
              ? "border-t-2 border-sky-500 rounded"
              : ""
          }
        >
          {filteredTree.map((node) => renderCategory(node))}
        </div>
      </nav>
    </aside>
  );
};

export default EditorNavigation;
