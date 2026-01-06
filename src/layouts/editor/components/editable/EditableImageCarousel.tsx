import ImageCarouselBlock from "../../../blocks/components/ImageCarouselBlock";
import type { StyleTheme } from "@shadow-shard-tools/docs-core/types/StyleTheme";
import type { ImageCarouselData } from "@shadow-shard-tools/docs-core/types/ImageCarouselData";
import { Plus, Trash2 } from "lucide-react";

interface EditableImageCarouselProps {
  data?: ImageCarouselData;
  styles: StyleTheme;
  onChange: (next: ImageCarouselData) => void;
}

export function EditableImageCarousel({
  data,
  styles,
  onChange,
}: EditableImageCarouselProps) {
  const carouselData: ImageCarouselData = {
    images: [{ src: "", alt: "" }],
    alignment: "center",
    scale: 1,
    carouselOptions: { pagination: true, arrows: true },
    ...data,
  };

  const updateImage = (
    index: number,
    partial: { src?: string; alt?: string },
  ) => {
    const next = [...(carouselData.images ?? [])];
    next[index] = { ...(next[index] ?? {}), ...partial };
    onChange({ ...carouselData, images: next });
  };

  const addImage = () => {
    const next = [...(carouselData.images ?? []), { src: "", alt: "" }];
    onChange({ ...carouselData, images: next });
  };

  const removeImage = (index: number) => {
    const next = (carouselData.images ?? []).filter((_, i) => i !== index);
    onChange({
      ...carouselData,
      images: next.length ? next : [{ src: "", alt: "" }],
    });
  };

  return (
    <div className="space-y-3">
      <span>Images</span>
      <div className="space-y-2">
        {(carouselData.images ?? []).map((img, idx) => (
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
              {(carouselData.images?.length ?? 0) > 1 && (
                <button
                  type="button"
                  className={`inline-flex items-center justify-center w-8 h-8 ${styles.buttons.common}`}
                  onClick={() => removeImage(idx)}
                  aria-label={`Delete image ${idx + 1}`}
                  title="Delete image"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
        ))}
        <button
          type="button"
          className={`inline-flex items-center justify-center w-7 h-7 ${styles.buttons.common}`}
          onClick={addImage}
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      <ImageCarouselBlock
        index={0}
        styles={styles}
        imageCarouselData={carouselData}
      />
    </div>
  );
}

export default EditableImageCarousel;
