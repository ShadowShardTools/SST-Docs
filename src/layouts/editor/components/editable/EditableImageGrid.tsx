import { useMemo } from "react";
import ImageGridBlock from "../../../blocks/components/ImageGridBlock";
import type { StyleTheme } from "@shadow-shard-tools/docs-core/types/StyleTheme";
import type { ImageGridData } from "@shadow-shard-tools/docs-core/types/ImageGridData";
import { Trash2 } from "lucide-react";

interface EditableImageGridProps {
  data?: ImageGridData;
  styles: StyleTheme;
  onChange: (next: ImageGridData) => void;
}

export function EditableImageGrid({
  data,
  styles,
  onChange,
}: EditableImageGridProps) {
  const imageGridData: ImageGridData = useMemo(
    () => ({
      images: [{ src: "", alt: "" }],
      alignment: "center",
      scale: 1,
      ...data,
    }),
    [data],
  );

  const updateImage = (
    index: number,
    partial: { src?: string; alt?: string },
  ) => {
    const next = [...(imageGridData.images ?? [])];
    next[index] = { ...(next[index] ?? {}), ...partial };
    onChange({ ...imageGridData, images: next });
  };

  const addImage = () => {
    const next = [...(imageGridData.images ?? []), { src: "", alt: "" }];
    onChange({ ...imageGridData, images: next });
  };

  const removeImage = (index: number) => {
    const next = (imageGridData.images ?? []).filter((_, i) => i !== index);
    onChange({
      ...imageGridData,
      images: next.length ? next : [{ src: "", alt: "" }],
    });
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-xs">
        <span>Images</span>
        <button
          type="button"
          className="px-2 py-1 border rounded text-xs hover:bg-slate-100 dark:hover:bg-slate-800"
          onClick={addImage}
        >
          + Image
        </button>
      </div>
      <div className="space-y-2">
        {(imageGridData.images ?? []).map((img, idx) => (
          <div
            key={idx}
            className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm"
          >
            <input
              className={`${styles.input} px-2 py-1`}
              value={img.src ?? ""}
              onChange={(e) => updateImage(idx, { src: e.target.value })}
              placeholder={`Image ${idx + 1} URL`}
            />
            <div className="flex gap-2">
              <input
                className={`${styles.input} px-2 py-1 flex-1`}
                value={img.alt ?? ""}
                onChange={(e) => updateImage(idx, { alt: e.target.value })}
                placeholder="Alt text"
              />
              {(imageGridData.images?.length ?? 0) > 1 && (
                <button
                  type="button"
                  className={`${styles.buttons.small} text-red-600`}
                  onClick={() => removeImage(idx)}
                  aria-label={`Delete image ${idx + 1}`}
                  title="Delete image"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="rounded border px-3 py-2">
        <ImageGridBlock
          index={0}
          styles={styles}
          imageGridData={imageGridData}
        />
      </div>
    </div>
  );
}

export default EditableImageGrid;
