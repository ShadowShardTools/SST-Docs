import { useEffect, useMemo, useRef } from "react";
import { Music2 } from "lucide-react";
import AudioBlock from "../../../blocks/components/AudioBlock";
import type { StyleTheme } from "@shadow-shard-tools/docs-core/types/StyleTheme";
import type { AudioData } from "@shadow-shard-tools/docs-core/types/AudioData";
import PathInput from "../../../common/components/PathInput";
import { list } from "../../api/client";
import { clientConfig } from "../../../../application/config/clientConfig";

interface EditableAudioProps {
  data?: AudioData;
  styles: StyleTheme;
  onChange: (next: AudioData) => void;
}

export function EditableAudio({ data, styles, onChange }: EditableAudioProps) {
  const audioData: AudioData = {
    src: "",
    mimeType: "audio/mpeg",
    caption: "",
    ...data,
  };

  const guessMimeType = (src?: string) => {
    if (!src) return "audio/mpeg";
    const lower = src.split("?")[0]?.toLowerCase() ?? "";
    if (lower.endsWith(".mp3")) return "audio/mpeg";
    if (lower.endsWith(".ogg")) return "audio/ogg";
    if (lower.endsWith(".wav")) return "audio/wav";
    if (lower.endsWith(".m4a")) return "audio/mp4";
    if (lower.endsWith(".flac")) return "audio/flac";
    if (lower.endsWith(".webm")) return "audio/webm";
    return "audio/mpeg";
  };

  const captionRef = useRef<HTMLInputElement>(null);
  const publicBasePath = useMemo(
    () => clientConfig.PUBLIC_DATA_PATH ?? "/",
    [],
  );
  const audioExtensions = useMemo(
    () => [".mp3", ".ogg", ".wav", ".m4a", ".flac", ".webm"],
    [],
  );

  useEffect(() => {
    if (
      captionRef.current &&
      captionRef.current.value !== (audioData.caption ?? "")
    ) {
      captionRef.current.value = audioData.caption ?? "";
    }
  }, [audioData.caption]);

  return (
    <div className="space-y-3">
      <PathInput
        styles={styles}
        label="Audio source URL"
        value={audioData.src ?? ""}
        onChange={(next) =>
          onChange({
            ...audioData,
            src: next,
            mimeType: audioData.mimeType || guessMimeType(next),
          })
        }
        placeholder="https://example.com/audio.mp3"
        listEntries={list}
        allowedExtensions={audioExtensions}
        publicBasePath={publicBasePath}
        requiredFolder="audio"
        dialogTitle="Select audio"
        dialogIcon={Music2}
        fileIcon={Music2}
      />
      <label className="flex flex-col gap-1">
        <span className={`${styles.text.alternative}`}>Caption (optional)</span>
        <input
          ref={captionRef}
          className={`${styles.input} px-2 py-1`}
          defaultValue={audioData.caption ?? ""}
          onChange={(e) =>
            onChange({
              ...audioData,
              caption: e.target.value,
            })
          }
          placeholder="Description"
        />
      </label>

      <AudioBlock styles={styles} audioData={audioData} />
    </div>
  );
}

export default EditableAudio;
