import type { DragEvent } from "react";
import type {
  Category,
  DocItem,
  StyleTheme,
} from "@shadow-shard-tools/docs-core";
import { FileText } from "lucide-react";
import { rowClasses } from "../../navigation/utilities";
import type { DragItem } from "../hooks/useEditorNavigationDnd";

interface EditorNavigationDocListProps {
  docs: DocItem[];
  parentId: string | null;
  styles: StyleTheme;
  selectedItem?: DocItem | Category | null;
  dragItem: DragItem | null;
  dragOverKey: string | null;
  setDragOverKey: (key: string | null) => void;
  startDragDoc: (id: string, parentId: string | null) => void;
  onDropDoc: (
    parentId: string | null,
    index: number,
  ) => (event: DragEvent) => void;
  onSelect: (entry: DocItem | Category) => void;
  depth: number;
  wrapperClassName?: string;
  highlightClassName?: string;
}

export function EditorNavigationDocList({
  docs,
  parentId,
  styles,
  selectedItem,
  dragItem,
  dragOverKey,
  setDragOverKey,
  startDragDoc,
  onDropDoc,
  onSelect,
  depth,
  wrapperClassName = "space-y-1",
  highlightClassName = "!border-2 !border-sky-500 !bg-sky-500/10 !rounded-md",
}: EditorNavigationDocListProps) {
  return (
    <ul className={wrapperClassName}>
      {docs.map((doc, idx) => {
        const active = selectedItem?.id === doc.id;
        const cls = rowClasses(styles, active, false, depth);
        const dragKey = `doc-${doc.id}`;
        const over = dragOverKey === dragKey && dragItem?.type === "doc";

        return (
          <li
            key={doc.id}
            draggable
            onDragStart={() => startDragDoc(doc.id, parentId)}
            onDragOver={(event) => {
              event.preventDefault();
              event.stopPropagation();
              setDragOverKey(dragKey);
            }}
            onDragLeave={(event) => {
              event.stopPropagation();
              setDragOverKey(null);
            }}
            onDrop={onDropDoc(parentId, idx)}
            className={`${cls} ${over ? highlightClassName : ""}`}
            onClick={() => onSelect(doc)}
          >
            <FileText className="w-4 h-4 shrink-0" />
            <span className="truncate">{doc.title}</span>
          </li>
        );
      })}
    </ul>
  );
}
