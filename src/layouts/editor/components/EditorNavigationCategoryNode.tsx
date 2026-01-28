import type { Dispatch, DragEvent, SetStateAction } from "react";
import type {
  Category,
  DocItem,
  StyleTheme,
} from "@shadow-shard-tools/docs-core";
import { ChevronDown, ChevronRight, Folder } from "lucide-react";
import { rowClasses } from "../../navigation/utilities";
import type { DragItem } from "../hooks/useEditorNavigationDnd";
import { EditorNavigationAddMenu } from "./EditorNavigationAddMenu";
import { EditorNavigationDocList } from "./EditorNavigationDocList";

interface EditorNavigationCategoryNodeProps {
  node: Category;
  depth: number;
  styles: StyleTheme;
  selectedItem?: DocItem | Category | null;
  openMap: Record<string, boolean>;
  setOpenMap: Dispatch<SetStateAction<Record<string, boolean>>>;
  addMenuFor: string | null;
  setAddMenuFor: (key: string | null) => void;
  onCreateCategory: (parentId: string | null) => void;
  onCreateDoc: (parentId: string | null) => void;
  onSelect: (entry: DocItem | Category) => void;
  dragItem: DragItem | null;
  dragOverKey: string | null;
  setDragOverKey: (key: string | null) => void;
  startDragCategory: (id: string, parentId: string | null) => void;
  startDragDoc: (id: string, parentId: string | null) => void;
  handleCategoryDrop: (node: Category) => (event: DragEvent) => void;
  handleDropIntoCategory: (node: Category) => (event: DragEvent) => void;
  handleDropDoc: (
    parentId: string | null,
    index: number,
  ) => (event: DragEvent) => void;
  categoryParent: Map<string, string | null>;
}

export function EditorNavigationCategoryNode({
  node,
  depth,
  styles,
  selectedItem,
  openMap,
  setOpenMap,
  addMenuFor,
  setAddMenuFor,
  onCreateCategory,
  onCreateDoc,
  onSelect,
  dragItem,
  dragOverKey,
  setDragOverKey,
  startDragCategory,
  startDragDoc,
  handleCategoryDrop,
  handleDropIntoCategory,
  handleDropDoc,
  categoryParent,
}: EditorNavigationCategoryNodeProps) {
  const docs = (node.docs ?? []) as DocItem[];
  const active = selectedItem?.id === node.id;
  const cls = rowClasses(styles, active, false, depth);
  const expanded = openMap[node.id] ?? true;
  const over = dragOverKey === `cat-${node.id}`;

  return (
    <div className="space-y-1">
      <div
        className={`${cls} flex items-center gap-2 ${
          over ? "!border-2 !border-sky-500 !bg-sky-500/10 !rounded-md" : ""
        }`}
        draggable
        onDragStart={() =>
          startDragCategory(node.id, categoryParent.get(node.id) ?? null)
        }
        onDragOver={(event) => {
          event.preventDefault();
          event.stopPropagation();
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
          onClick={(event) => {
            event.stopPropagation();
            setOpenMap((prev) => ({ ...prev, [node.id]: !expanded }));
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
            onDragOver={(event) => {
              event.preventDefault();
              event.stopPropagation();
              setDragOverKey(`cat-${node.id}-add`);
            }}
            onDragLeave={(event) => {
              event.stopPropagation();
              setDragOverKey(null);
            }}
            onDrop={handleDropIntoCategory(node)}
          >
            <EditorNavigationAddMenu
              label="Item"
              activeKey={`cat-${node.id}-add`}
              addMenuFor={addMenuFor}
              setAddMenuFor={setAddMenuFor}
              onCreateCategory={() => onCreateCategory(node.id)}
              onCreateDoc={() => onCreateDoc(node.id)}
              styles={styles}
              highlight={dragOverKey === `cat-${node.id}-add`}
            />
          </div>
          {docs.length > 0 && (
            <EditorNavigationDocList
              docs={docs}
              parentId={node.id}
              styles={styles}
              selectedItem={selectedItem}
              dragItem={dragItem}
              dragOverKey={dragOverKey}
              setDragOverKey={setDragOverKey}
              startDragDoc={startDragDoc}
              onDropDoc={handleDropDoc}
              onSelect={onSelect}
              depth={1}
              wrapperClassName="ml-5 space-y-1"
            />
          )}
          {node.children?.map((child) => (
            <div key={child.id} className="ml-4">
              <EditorNavigationCategoryNode
                node={child}
                depth={depth + 1}
                styles={styles}
                selectedItem={selectedItem}
                openMap={openMap}
                setOpenMap={setOpenMap}
                addMenuFor={addMenuFor}
                setAddMenuFor={setAddMenuFor}
                onCreateCategory={onCreateCategory}
                onCreateDoc={onCreateDoc}
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
            </div>
          ))}
        </>
      )}
    </div>
  );
}
