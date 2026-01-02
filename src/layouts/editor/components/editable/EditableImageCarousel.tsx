import ImageCarouselBlock from "../../../blocks/components/ImageCarouselBlock";
import type { StyleTheme } from "@shadow-shard-tools/docs-core/types/StyleTheme";
import type { ImageCarouselData } from "@shadow-shard-tools/docs-core/types/ImageCarouselData";

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

  const updateImage = (index: number, partial: { src?: string; alt?: string }) => {
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
    onChange({ ...carouselData, images: next.length ? next : [{ src: "", alt: "" }] });
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
        {(carouselData.images ?? []).map((img, idx) => (
          <div key={idx} className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
            <input
              className="border rounded px-2 py-1 bg-white dark:bg-slate-900"
              value={img.src ?? ""}
              onChange={(e) => updateImage(idx, { src: e.target.value })}
              placeholder={`Image ${idx + 1} URL`}
            />
            <div className="flex gap-2">
              <input
                className="border rounded px-2 py-1 flex-1 bg-white dark:bg-slate-900"
                value={img.alt ?? ""}
                onChange={(e) => updateImage(idx, { alt: e.target.value })}
                placeholder="Alt text"
              />
              {(carouselData.images?.length ?? 0) > 1 && (
                <button
                  type="button"
                  className="px-2 py-1 border rounded text-xs text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30"
                  onClick={() => removeImage(idx)}
                >
                  Delete
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="rounded border px-3 py-2">
        <ImageCarouselBlock index={0} styles={styles} imageCarouselData={carouselData} />
      </div>
    </div>
  );
}

export default EditableImageCarousel;
