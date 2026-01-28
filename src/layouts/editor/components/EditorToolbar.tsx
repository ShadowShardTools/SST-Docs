import type {
  Category,
  DocItem,
  StyleTheme,
} from "@shadow-shard-tools/docs-core";
import {
  Check,
  Copy,
  DatabaseBackup,
  Eye,
  FileDown,
  PencilRuler,
  Save,
  SquarePen,
  Trash2,
} from "lucide-react";
import Button from "../../common/components/Button";

type PanelMode = "preview" | "blocks";

interface EditorToolbarProps {
  styles: StyleTheme;
  panelMode: PanelMode;
  onPanelModeChange: (mode: PanelMode) => void;
  backupOnSave: boolean;
  onToggleBackup: () => void;
  onSave: () => void;
  canSave: boolean;
  fileStatus: "idle" | "loading" | "saving" | "error";
  showSavedIndicator: boolean;
  savedIndicatorTick: number;
  selected: DocItem | Category | null;
  onEditSelectedMeta: () => void;
  onDuplicateSelected: () => void;
  onDeleteSelected: () => void;
}

export const EditorToolbar: React.FC<EditorToolbarProps> = ({
  styles,
  panelMode,
  onPanelModeChange,
  backupOnSave,
  onToggleBackup,
  onSave,
  canSave,
  fileStatus,
  showSavedIndicator,
  savedIndicatorTick,
  selected,
  onEditSelectedMeta,
  onDuplicateSelected,
  onDeleteSelected,
}) => {
  const showSaved = showSavedIndicator && fileStatus === "idle";
  const isSaving = fileStatus === "saving";

  return (
    <div
      className={`fixed bottom-6 right-6 z-50 flex flex-col items-center gap-1.5 p-1.5 rounded-md border ${styles.modal.borders} ${styles.modal.content}`}
    >
      <div className="flex items-center gap-1">
        <Button
          className="flex justify-center items-center w-9 h-9"
          styles={styles}
          variant={panelMode === "preview" ? "tabActive" : "tab"}
          onClick={() => onPanelModeChange("preview")}
          type="button"
          title="Preview Mode"
        >
          <Eye className="w-5 h-5" />
        </Button>
        <Button
          className="flex justify-center items-center w-9 h-9"
          styles={styles}
          variant={panelMode === "blocks" ? "tabActive" : "tab"}
          onClick={() => onPanelModeChange("blocks")}
          type="button"
          title="Edit Blocks"
        >
          <PencilRuler className="w-5 h-5" />
        </Button>
      </div>
      <div className="w-full h-px bg-slate-700/50 mx-0.5" />

      <div className="flex items-center gap-1">
        <Button
          type="button"
          className="flex justify-center items-center w-9 h-9"
          styles={styles}
          variant={backupOnSave ? "tabActive" : "tab"}
          onClick={onToggleBackup}
          aria-pressed={backupOnSave}
          title="Backup on save"
        >
          <DatabaseBackup className="w-5 h-5" />
        </Button>
        <Button
          className="flex items-center justify-center w-9 h-9"
          styles={styles}
          onClick={onSave}
          disabled={!canSave || isSaving}
          title={showSaved ? "Saved" : isSaving ? "Saving..." : "Save"}
        >
          {isSaving ? (
            <FileDown className="w-5 h-5 animate-pulse" />
          ) : showSaved ? (
            <Check
              key={savedIndicatorTick}
              className="w-5 h-5 text-emerald-400 animate-bounce"
            />
          ) : (
            <Save className="w-5 h-5" />
          )}
        </Button>
        {selected && (
          <Button
            className="flex items-center justify-center w-9 h-9"
            styles={styles}
            onClick={onEditSelectedMeta}
            type="button"
            title="Edit metadata"
          >
            <SquarePen className="w-5 h-5" />
          </Button>
        )}
        {selected && (
          <Button
            className="flex items-center justify-center w-9 h-9"
            styles={styles}
            onClick={onDuplicateSelected}
            type="button"
            title="Duplicate item"
            aria-label="Duplicate item"
          >
            <Copy className="w-5 h-5" />
          </Button>
        )}
        {selected && (
          <Button
            className="flex items-center justify-center w-9 h-9"
            styles={styles}
            onClick={onDeleteSelected}
            type="button"
            title="Delete item"
          >
            <Trash2 className="w-5 h-5" />
          </Button>
        )}
      </div>
    </div>
  );
};

export default EditorToolbar;
