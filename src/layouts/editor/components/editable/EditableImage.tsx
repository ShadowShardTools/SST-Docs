import { useEffect, useRef } from "react";
import ImageBlock from "../../../blocks/components/ImageBlock";
import type { StyleTheme } from "@shadow-shard-tools/docs-core/types/StyleTheme";
import type { ImageData } from "@shadow-shard-tools/docs-core/types/ImageData";

interface EditableImageProps {
  data?: ImageData;
  styles: StyleTheme;
  onChange: (next: ImageData) => void;
}

export function EditableImage({ data, styles, onChange }: EditableImageProps) {
  const imageData: ImageData = {
    image: { src: "", alt: "" },
    alignment: "center",
    scale: 1,
    ...data,
  };

  const srcRef = useRef<HTMLInputElement>(null);
  const altRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (srcRef.current && srcRef.current.value !== (imageData.image?.src ?? "")) {
      srcRef.current.value = imageData.image?.src ?? "";
    }
    if (altRef.current && altRef.current.value !== (imageData.image?.alt ?? "")) {
      altRef.current.value = imageData.image?.alt ?? "";
    }
  }, [imageData.image?.src, imageData.image?.alt]);

  return (
    <div className="space-y-3">
      <label className="flex flex-col gap-1">
        <span className="text-xs text-slate-500">Image source URL</span>
        <input
          ref={srcRef}
          className="border rounded px-2 py-1 bg-white dark:bg-slate-900"
          defaultValue={imageData.image?.src ?? ""}
          onChange={(e) =>
            onChange({
              ...imageData,
              image: { ...(imageData.image ?? {}), src: e.target.value },
            })
          }
          placeholder="https://example.com/image.jpg"
        />
      </label>
      <label className="flex flex-col gap-1">
        <span className="text-xs text-slate-500">Alt text</span>
        <input
          ref={altRef}
          className="border rounded px-2 py-1 bg-white dark:bg-slate-900"
          defaultValue={imageData.image?.alt ?? ""}
          onChange={(e) =>
            onChange({
              ...imageData,
              image: { ...(imageData.image ?? {}), alt: e.target.value },
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

