import { useEffect, useRef } from "react";
import ImageCompareBlock from "../../../blocks/components/ImageCompareBlock";
import type { StyleTheme } from "@shadow-shard-tools/docs-core/types/StyleTheme";
import type { ImageCompareData } from "@shadow-shard-tools/docs-core/types/ImageCompareData";
import type { BaseImage } from "@shadow-shard-tools/docs-core/types/BaseImage";

interface EditableImageCompareProps {
  data?: ImageCompareData;
  styles: StyleTheme;
  onChange: (next: ImageCompareData) => void;
}

export function EditableImageCompare({
  data,
  styles,
  onChange,
}: EditableImageCompareProps) {
  const ensureImage = (img?: Partial<BaseImage> | null): BaseImage => ({
    src: img?.src ?? "",
    alt: img?.alt ?? "",
  });

  const imageCompareData: ImageCompareData = {
    type: "slider",
    alignment: "center",
    scale: 1,
    sliderColor: "#ffffff",
    beforeImage: ensureImage((data as any)?.beforeImage),
    afterImage: ensureImage((data as any)?.afterImage),
    ...data,
  };

  const beforeSrcRef = useRef<HTMLInputElement>(null);
  const beforeAltRef = useRef<HTMLInputElement>(null);
  const afterSrcRef = useRef<HTMLInputElement>(null);
  const afterAltRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (beforeSrcRef.current && beforeSrcRef.current.value !== (imageCompareData.beforeImage?.src ?? "")) {
      beforeSrcRef.current.value = imageCompareData.beforeImage?.src ?? "";
    }
    if (beforeAltRef.current && beforeAltRef.current.value !== (imageCompareData.beforeImage?.alt ?? "")) {
      beforeAltRef.current.value = imageCompareData.beforeImage?.alt ?? "";
    }
    if (afterSrcRef.current && afterSrcRef.current.value !== (imageCompareData.afterImage?.src ?? "")) {
      afterSrcRef.current.value = imageCompareData.afterImage?.src ?? "";
    }
    if (afterAltRef.current && afterAltRef.current.value !== (imageCompareData.afterImage?.alt ?? "")) {
      afterAltRef.current.value = imageCompareData.afterImage?.alt ?? "";
    }
  }, [
    imageCompareData.beforeImage?.src,
    imageCompareData.beforeImage?.alt,
    imageCompareData.afterImage?.src,
    imageCompareData.afterImage?.alt,
  ]);

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <label className="flex flex-col gap-1">
          <span className="text-xs text-slate-500">Before image URL</span>
          <input
            ref={beforeSrcRef}
            className={`${styles.input} px-2 py-1`}
            defaultValue={imageCompareData.beforeImage?.src ?? ""}
            onChange={(e) =>
              onChange({
                ...imageCompareData,
                beforeImage: ensureImage({ ...(imageCompareData.beforeImage ?? {}), src: e.target.value }),
              })
            }
            placeholder="https://example.com/before.jpg"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs text-slate-500">After image URL</span>
          <input
            ref={afterSrcRef}
            className={`${styles.input} px-2 py-1`}
            defaultValue={imageCompareData.afterImage?.src ?? ""}
            onChange={(e) =>
              onChange({
                ...imageCompareData,
                afterImage: ensureImage({ ...(imageCompareData.afterImage ?? {}), src: e.target.value }),
              })
            }
            placeholder="https://example.com/after.jpg"
          />
        </label>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <label className="flex flex-col gap-1">
          <span className="text-xs text-slate-500">Before alt text</span>
          <input
            ref={beforeAltRef}
            className={`${styles.input} px-2 py-1`}
            defaultValue={imageCompareData.beforeImage?.alt ?? ""}
            onChange={(e) =>
              onChange({
                ...imageCompareData,
                beforeImage: ensureImage({ ...(imageCompareData.beforeImage ?? {}), alt: e.target.value }),
              })
            }
            placeholder="Before description"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs text-slate-500">After alt text</span>
          <input
            ref={afterAltRef}
            className={`${styles.input} px-2 py-1`}
            defaultValue={imageCompareData.afterImage?.alt ?? ""}
            onChange={(e) =>
              onChange({
                ...imageCompareData,
                afterImage: ensureImage({ ...(imageCompareData.afterImage ?? {}), alt: e.target.value }),
              })
            }
            placeholder="After description"
          />
        </label>
      </div>

      <div className="rounded border px-3 py-2">
        <ImageCompareBlock index={0} styles={styles} imageCompareData={imageCompareData} />
      </div>
    </div>
  );
}

export default EditableImageCompare;
