import { Suspense, lazy, useEffect, useMemo, useRef } from "react";
import type { StyleTheme } from "@shadow-shard-tools/docs-core/types/StyleTheme";
import type { ImageCompareData } from "@shadow-shard-tools/docs-core/types/ImageCompareData";
import type { BaseImage } from "@shadow-shard-tools/docs-core/types/BaseImage";
import MediaPathInput from "./MediaPathInput";
import { LoadingSpinner } from "../../../dialog/components";

const ImageCompareBlock = lazy(
  () => import("../../../blocks/components/ImageCompareBlock"),
);

interface EditableImageCompareProps {
  data?: ImageCompareData;
  styles: StyleTheme;
  onChange: (next: ImageCompareData) => void;
  versionBasePath?: string | null;
}

export function EditableImageCompare({
  data,
  styles,
  onChange,
  versionBasePath,
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

  const beforeAltRef = useRef<HTMLInputElement>(null);
  const afterAltRef = useRef<HTMLInputElement>(null);
  const imageExtensions = useMemo(
    () => [".png", ".jpg", ".jpeg", ".gif", ".webp", ".svg", ".avif"],
    [],
  );

  useEffect(() => {
    if (
      beforeAltRef.current &&
      beforeAltRef.current.value !== (imageCompareData.beforeImage?.alt ?? "")
    ) {
      beforeAltRef.current.value = imageCompareData.beforeImage?.alt ?? "";
    }
    if (
      afterAltRef.current &&
      afterAltRef.current.value !== (imageCompareData.afterImage?.alt ?? "")
    ) {
      afterAltRef.current.value = imageCompareData.afterImage?.alt ?? "";
    }
  }, [imageCompareData.beforeImage?.alt, imageCompareData.afterImage?.alt]);

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <MediaPathInput
          styles={styles}
          label="Before image"
          value={imageCompareData.beforeImage?.src ?? ""}
          onChange={(next) =>
            onChange({
              ...imageCompareData,
              beforeImage: ensureImage({
                ...(imageCompareData.beforeImage ?? {}),
                src: next,
              }),
            })
          }
          placeholder="images/before.png"
          allowedExtensions={imageExtensions}
          requiredFolder="images"
          versionBasePath={versionBasePath}
        />
        <MediaPathInput
          styles={styles}
          label="After image"
          value={imageCompareData.afterImage?.src ?? ""}
          onChange={(next) =>
            onChange({
              ...imageCompareData,
              afterImage: ensureImage({
                ...(imageCompareData.afterImage ?? {}),
                src: next,
              }),
            })
          }
          placeholder="images/after.png"
          allowedExtensions={imageExtensions}
          requiredFolder="images"
          versionBasePath={versionBasePath}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <label className="flex flex-col gap-1">
          <span className={`${styles.text.alternative}`}>Before alt text</span>
          <input
            ref={beforeAltRef}
            className={`${styles.input} px-2 py-1`}
            defaultValue={imageCompareData.beforeImage?.alt ?? ""}
            onChange={(e) =>
              onChange({
                ...imageCompareData,
                beforeImage: ensureImage({
                  ...(imageCompareData.beforeImage ?? {}),
                  alt: e.target.value,
                }),
              })
            }
            placeholder="Before description"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className={`${styles.text.alternative}`}>After alt text</span>
          <input
            ref={afterAltRef}
            className={`${styles.input} px-2 py-1`}
            defaultValue={imageCompareData.afterImage?.alt ?? ""}
            onChange={(e) =>
              onChange({
                ...imageCompareData,
                afterImage: ensureImage({
                  ...(imageCompareData.afterImage ?? {}),
                  alt: e.target.value,
                }),
              })
            }
            placeholder="After description"
          />
        </label>
      </div>

      <Suspense fallback={<LoadingSpinner styles={styles} />}>
        <ImageCompareBlock
          index={0}
          styles={styles}
          imageCompareData={imageCompareData}
        />
      </Suspense>
    </div>
  );
}

export default EditableImageCompare;
