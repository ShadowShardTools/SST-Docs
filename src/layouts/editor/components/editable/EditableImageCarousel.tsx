import { Suspense, lazy, useMemo } from "react";
import { Image as ImageIcon, Plus, Trash2 } from "lucide-react";
import type { StyleTheme } from "@shadow-shard-tools/docs-core/types/StyleTheme";
import type { ImageCarouselData } from "@shadow-shard-tools/docs-core/types/ImageCarouselData";
import PathInput from "../../../common/components/PathInput";
import Button from "../../../common/components/Button";
import { list } from "../../api/client";
import { clientConfig } from "../../../../application/config/clientConfig";
import { LoadingSpinner } from "../../../dialog/components";

const ImageCarouselBlock = lazy(
  () => import("../../../blocks/components/ImageCarouselBlock"),
);

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
  const publicBasePath = useMemo(
    () => clientConfig.PUBLIC_DATA_PATH ?? "/",
    [],
  );
  const imageExtensions = useMemo(
    () => [".png", ".jpg", ".jpeg", ".gif", ".webp", ".svg", ".avif"],
    [],
  );

  return (
    <div className="space-y-3">
      <span className={`${styles.text.alternative}`}>Images</span>
      <div className="space-y-2">
        {(carouselData.images ?? []).map((img, idx) => (
          <div key={idx} className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <PathInput
              styles={styles}
              label={`Image ${idx + 1} URL`}
              value={img.src ?? ""}
              onChange={(next) => updateImage(idx, { src: next })}
              placeholder="https://example.com/image.jpg"
              listEntries={list}
              allowedExtensions={imageExtensions}
              publicBasePath={publicBasePath}
              requiredFolder="images"
              dialogTitle="Select image"
              dialogIcon={ImageIcon}
              fileIcon={ImageIcon}
            />
            <div className="flex flex-col gap-1">
              <span className={`${styles.text.alternative}`}>
                Image {idx + 1} caption
              </span>
              <div className="flex gap-2">
                <input
                  className={`${styles.input} px-2 py-1 flex-1`}
                  value={img.alt ?? ""}
                  onChange={(e) => updateImage(idx, { alt: e.target.value })}
                  placeholder="Caption"
                />
                {(carouselData.images?.length ?? 0) > 1 && (
                  <Button
                    type="button"
                    className="inline-flex items-center justify-center w-8 h-8"
                    styles={styles}
                    onClick={() => removeImage(idx)}
                    aria-label={`Delete image ${idx + 1}`}
                    title="Delete image"
                  >
                    <Trash2 className="w-5 h-5" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        ))}
        <Button
          type="button"
          className="inline-flex items-center justify-center w-7 h-7"
          styles={styles}
          onClick={addImage}
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>

      <Suspense fallback={<LoadingSpinner styles={styles} />}>
        <ImageCarouselBlock
          index={0}
          styles={styles}
          imageCarouselData={carouselData}
        />
      </Suspense>
    </div>
  );
}

export default EditableImageCarousel;
