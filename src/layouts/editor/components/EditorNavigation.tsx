import { useMemo, useState, useCallback } from "react";
import type {
  Category,
  DocItem,
  StyleTheme,
} from "@shadow-shard-tools/docs-core";
import { read, write } from "../api";
import { useEditorNavigationDnd } from "../hooks/useEditorNavigationDnd";
import { resolveVersionBasePath } from "../utilities/editorPaths";
import { useEditorNavigationActions } from "../hooks/useEditorNavigationActions";
import { EditorNavigationAddMenu } from "./EditorNavigationAddMenu";
import { EditorNavigationDocList } from "./EditorNavigationDocList";
import { EditorNavigationCategoryNode } from "./EditorNavigationCategoryNode";

interface EditorNavigationProps {
  styles: StyleTheme;
  tree: Category[];
  standaloneDocs?: DocItem[];
  currentProduct: string;
  currentVersion: string;
  productVersioning: boolean;
  onSelect: (entry: DocItem | Category) => void;
  selectedItem?: DocItem | Category | null;
  onReload: (product?: string, version?: string) => Promise<boolean>;
}

const EditorNavigation: React.FC<EditorNavigationProps> = ({
  styles,
  tree,
  standaloneDocs = [],
  currentProduct,
  currentVersion,
  productVersioning,
  onSelect,
  selectedItem,
  onReload,
}) => {
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const [addMenuFor, setAddMenuFor] = useState<string | null>(null);

  const basePath =
    resolveVersionBasePath(productVersioning, currentProduct, currentVersion) ??
    "";
  const filteredTree = tree;
  const filteredStandalone = standaloneDocs;

  const readJson = useCallback(async (path: string) => {
    const res = await read(path);
    return JSON.parse(res.content);
  }, []);

  const writeJson = useCallback(async (path: string, data: unknown) => {
    await write(path, JSON.stringify(data, null, 2), "utf8");
  }, []);

  const {
    dragItem,
    dragOverKey,
    setDragOverKey,
    startDragCategory,
    startDragDoc,
    handleRootDrop,
    handleCategoryDrop,
    handleDropDoc,
    handleDropIntoCategory,
    handleStandaloneDrop: handleStandaloneDropBase,
    categoryParent,
    docParent,
  } = useEditorNavigationDnd({
    tree: filteredTree,
    standaloneDocs: filteredStandalone,
    basePath,
    currentProduct,
    currentVersion,
    productVersioning,
    onReload,
    readJson,
    writeJson,
  });

  const existingIds = useMemo(
    () => new Set<string>([...categoryParent.keys(), ...docParent.keys()]),
    [categoryParent, docParent],
  );

  const { createCategory, createDoc } = useEditorNavigationActions({
    productVersioning,
    currentProduct,
    currentVersion,
    existingIds,
    readJson,
    writeJson,
    onReload,
  });

  const handleStandaloneDrop = useCallback(
    (_parentId: string | null, index: number) =>
      handleStandaloneDropBase(index),
    [handleStandaloneDropBase],
  );

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
            onDrop={handleStandaloneDropBase(filteredStandalone.length)}
          >
            <EditorNavigationAddMenu
              label="Item"
              activeKey="standalone-add"
              addMenuFor={addMenuFor}
              setAddMenuFor={setAddMenuFor}
              onCreateCategory={() => createCategory(null)}
              onCreateDoc={() => createDoc(null)}
              styles={styles}
              highlight={dragOverKey === "standalone-add"}
              docOnly
            />
          </div>
          <EditorNavigationDocList
            docs={filteredStandalone}
            parentId={null}
            styles={styles}
            selectedItem={selectedItem}
            dragItem={dragItem}
            dragOverKey={dragOverKey}
            setDragOverKey={setDragOverKey}
            startDragDoc={startDragDoc}
            onDropDoc={handleStandaloneDrop}
            onSelect={onSelect}
            depth={0}
            wrapperClassName="space-y-1"
            highlightClassName="!border-2 !border-sky-500 !bg-sky-500/10 !rounded"
          />
        </div>

        <div className="text-xs uppercase text-slate-500">Categories</div>
        <div
          className="mb-2"
          onDragOver={(e) => {
            e.preventDefault();
            setDragOverKey("categories-add");
          }}
          onDragLeave={() => setDragOverKey(null)}
          onDrop={handleRootDrop}
        >
          <EditorNavigationAddMenu
            label="Item"
            activeKey="categories-add"
            addMenuFor={addMenuFor}
            setAddMenuFor={setAddMenuFor}
            onCreateCategory={() => createCategory(null)}
            onCreateDoc={() => createDoc(null)}
            styles={styles}
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
        >
          {filteredTree.map((node) => (
            <EditorNavigationCategoryNode
              key={node.id}
              node={node}
              depth={0}
              styles={styles}
              selectedItem={selectedItem}
              openMap={open}
              setOpenMap={setOpen}
              addMenuFor={addMenuFor}
              setAddMenuFor={setAddMenuFor}
              onCreateCategory={createCategory}
              onCreateDoc={createDoc}
              onSelect={onSelect}
              dragItem={dragItem}
              dragOverKey={dragOverKey}
              setDragOverKey={setDragOverKey}
              startDragCategory={startDragCategory}
              startDragDoc={startDragDoc}
              handleCategoryDrop={handleCategoryDrop}
              handleDropIntoCategory={handleDropIntoCategory}
              handleDropDoc={handleDropDoc}
              categoryParent={categoryParent}
            />
          ))}
        </div>
      </nav>
    </aside>
  );
};

export default EditorNavigation;
