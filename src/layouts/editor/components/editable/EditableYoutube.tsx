import { useEffect, useRef } from "react";
import YoutubeBlock from "../../../blocks/components/YoutubeBlock";
import type { StyleTheme } from "@shadow-shard-tools/docs-core/types/StyleTheme";
import type { YoutubeData } from "@shadow-shard-tools/docs-core/types/YoutubeData";

interface EditableYoutubeProps {
  data?: YoutubeData;
  styles: StyleTheme;
  onChange: (next: YoutubeData) => void;
}

export function EditableYoutube({
  data,
  styles,
  onChange,
}: EditableYoutubeProps) {
  const youtubeData: YoutubeData = {
    youtubeVideoId: "",
    caption: "",
    alignment: "center",
    scale: 1,
    ...data,
  };

  const idRef = useRef<HTMLInputElement>(null);
  const captionRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (
      idRef.current &&
      idRef.current.value !== (youtubeData.youtubeVideoId ?? "")
    ) {
      idRef.current.value = youtubeData.youtubeVideoId ?? "";
    }
    if (
      captionRef.current &&
      captionRef.current.value !== (youtubeData.caption ?? "")
    ) {
      captionRef.current.value = youtubeData.caption ?? "";
    }
  }, [youtubeData.youtubeVideoId, youtubeData.caption]);

  return (
    <div className="space-y-3">
      <label className="flex flex-col gap-1">
        <span className={`${styles.text.alternative}`}>YouTube URL or ID</span>
        <input
          ref={idRef}
          className={`${styles.input} px-2 py-1`}
          defaultValue={youtubeData.youtubeVideoId}
          onChange={(e) =>
            onChange({
              ...youtubeData,
              youtubeVideoId: e.target.value,
            })
          }
          placeholder="https://youtube.com/watch?v=..."
        />
      </label>
      <label className="flex flex-col gap-1">
        <span className={`${styles.text.alternative}`}>Caption (optional)</span>
        <input
          ref={captionRef}
          className={`${styles.input} px-2 py-1`}
          defaultValue={youtubeData.caption ?? ""}
          onChange={(e) =>
            onChange({
              ...youtubeData,
              caption: e.target.value,
            })
          }
          placeholder="Description"
        />
      </label>

      <YoutubeBlock styles={styles} youtubeData={youtubeData} />
    </div>
  );
}

export default EditableYoutube;
