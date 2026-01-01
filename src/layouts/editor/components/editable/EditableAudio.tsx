import { useEffect, useRef } from "react";
import AudioBlock from "../../../blocks/components/AudioBlock";
import type { StyleTheme } from "@shadow-shard-tools/docs-core/types/StyleTheme";
import type { AudioData } from "@shadow-shard-tools/docs-core/types/AudioData";

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

  const srcRef = useRef<HTMLInputElement>(null);
  const captionRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (srcRef.current && srcRef.current.value !== (audioData.src ?? "")) {
      srcRef.current.value = audioData.src ?? "";
    }
    if (captionRef.current && captionRef.current.value !== (audioData.caption ?? "")) {
      captionRef.current.value = audioData.caption ?? "";
    }
  }, [audioData.src, audioData.caption]);

  return (
    <div className="space-y-3">
      <label className="flex flex-col gap-1">
        <span className="text-xs text-slate-500">Audio source URL</span>
        <input
          ref={srcRef}
          className="border rounded px-2 py-1 bg-white dark:bg-slate-900"
          defaultValue={audioData.src}
          onChange={(e) =>
            onChange({
              ...audioData,
              src: e.target.value,
              mimeType: audioData.mimeType || guessMimeType(e.target.value),
            })
          }
          placeholder="https://example.com/audio.mp3"
        />
      </label>
      <label className="flex flex-col gap-1">
        <span className="text-xs text-slate-500">Caption (optional)</span>
        <input
          ref={captionRef}
          className="border rounded px-2 py-1 bg-white dark:bg-slate-900"
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

      <div className="rounded border px-3 py-2">
        <AudioBlock styles={styles} audioData={audioData} />
      </div>
    </div>
  );
}

export default EditableAudio;
