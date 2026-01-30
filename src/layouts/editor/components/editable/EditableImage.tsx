import { useEffect, useMemo, useRef } from "react";
import ImageBlock from "../../../blocks/components/ImageBlock";
import type { StyleTheme } from "@shadow-shard-tools/docs-core/types/StyleTheme";
import type { ImageData } from "@shadow-shard-tools/docs-core/types/ImageData";
import type { BaseImage } from "@shadow-shard-tools/docs-core/types/BaseImage";
import MediaPathInput from "./MediaPathInput";

interface EditableImageProps {
  data?: ImageData;
  styles: StyleTheme;
  onChange: (next: ImageData) => void;
  versionBasePath?: string | null;
}

export function EditableImage({
  data,
  styles,
  onChange,
  versionBasePath,
}: EditableImageProps) {
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

  const altRef = useRef<HTMLInputElement>(null);
  const imageExtensions = useMemo(
    () => [".png", ".jpg", ".jpeg", ".gif", ".webp", ".svg", ".avif"],
    [],
  );

  useEffect(() => {
    if (
      altRef.current &&
      altRef.current.value !== (imageData.image?.alt ?? "")
    ) {
      altRef.current.value = imageData.image?.alt ?? "";
    }
  }, [imageData.image?.alt]);

  return (
    <div className="space-y-3">
      <MediaPathInput
        styles={styles}
        label="Image"
        value={imageData.image?.src ?? ""}
        onChange={(next) =>
          onChange({
            ...imageData,
            image: ensureImage({
              ...(imageData.image ?? {}),
              src: next,
            }),
          })
        }
        placeholder="images/example.png"
        allowedExtensions={imageExtensions}
        requiredFolder="images"
        versionBasePath={versionBasePath}
      />
      <label className="flex flex-col gap-1">
        <span className={`${styles.text.alternative}`}>Alt text</span>
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
      <ImageBlock index={0} styles={styles} imageData={imageData} />
    </div>
  );
}

export default EditableImage;
