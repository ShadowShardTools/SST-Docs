import { useEffect, useMemo, useRef } from "react";
import { Image as ImageIcon } from "lucide-react";
import ImageBlock from "../../../blocks/components/ImageBlock";
import type { StyleTheme } from "@shadow-shard-tools/docs-core/types/StyleTheme";
import type { ImageData } from "@shadow-shard-tools/docs-core/types/ImageData";
import type { BaseImage } from "@shadow-shard-tools/docs-core/types/BaseImage";
import PathInput from "../../../common/components/PathInput";
import { list } from "../../api/client";
import { clientConfig } from "../../../../application/config/clientConfig";

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

  const altRef = useRef<HTMLInputElement>(null);
  const publicBasePath = useMemo(
    () => clientConfig.PUBLIC_DATA_PATH ?? "/",
    [],
  );
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
      <PathInput
        styles={styles}
        label="Image source URL"
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
        placeholder="https://example.com/image.jpg"
        listEntries={list}
        allowedExtensions={imageExtensions}
        publicBasePath={publicBasePath}
        requiredFolder="images"
        dialogTitle="Select image"
        dialogIcon={ImageIcon}
        fileIcon={ImageIcon}
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
