import { useEffect, useRef } from "react";
import ImageBlock from "../../../blocks/components/ImageBlock";
import type { StyleTheme } from "@shadow-shard-tools/docs-core/types/StyleTheme";
import type { ImageData } from "@shadow-shard-tools/docs-core/types/ImageData";
import type { BaseImage } from "@shadow-shard-tools/docs-core/types/BaseImage";

interface EditableImageProps {
  data?: ImageData;
  styles: StyleTheme;
  onChange: (next: ImageData) => void;
}

export function EditableImage({ data, styles, onChange }: EditableImageProps) {
  const ensureImage = (img?: Partial<BaseImage> | null): BaseImage => ({
    src: img?.src ?? "",
    alt: img?.alt ?? "",
  });

  const imageData: ImageData = {
    image: ensureImage((data as any)?.image),
    alignment: "center",
    scale: 1,
    ...data,
  };

  const srcRef = useRef<HTMLInputElement>(null);
  const altRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (
      srcRef.current &&
      srcRef.current.value !== (imageData.image?.src ?? "")
    ) {
      srcRef.current.value = imageData.image?.src ?? "";
    }
    if (
      altRef.current &&
      altRef.current.value !== (imageData.image?.alt ?? "")
    ) {
      altRef.current.value = imageData.image?.alt ?? "";
    }
  }, [imageData.image?.src, imageData.image?.alt]);

  return (
    <div className="space-y-3">
      <label className="flex flex-col gap-1">
        <span className="text-xs text-slate-500">Image source URL</span>
        <input
          ref={srcRef}
          className={`${styles.input} px-2 py-1`}
          defaultValue={imageData.image?.src ?? ""}
          onChange={(e) =>
            onChange({
              ...imageData,
              image: ensureImage({
                ...(imageData.image ?? {}),
                src: e.target.value,
              }),
            })
          }
          placeholder="https://example.com/image.jpg"
        />
      </label>
      <label className="flex flex-col gap-1">
        <span className="text-xs text-slate-500">Alt text</span>
        <input
          ref={altRef}
          className={`${styles.input} px-2 py-1`}
          defaultValue={imageData.image?.alt ?? ""}
          onChange={(e) =>
            onChange({
              ...imageData,
              image: ensureImage({
                ...(imageData.image ?? {}),
                alt: e.target.value,
              }),
            })
          }
          placeholder="Description for accessibility"
        />
      </label>
      <div className="rounded border px-3 py-2">
        <ImageBlock index={0} styles={styles} imageData={imageData} />
      </div>
    </div>
  );
}

export default EditableImage;
