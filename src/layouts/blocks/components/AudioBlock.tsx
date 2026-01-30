import React from "react";
import { Play, Pause, Volume2, Volume1, VolumeX } from "lucide-react";
import { formatTime } from "@shadow-shard-tools/docs-core/utilities/system/formatTime";
import type { AudioData } from "@shadow-shard-tools/docs-core/types/AudioData";
import type { StyleTheme } from "@shadow-shard-tools/docs-core/types/StyleTheme";
import { useAudioPlayer } from "../hooks";
import { resolveMediaPath } from "../../common/utils/mediaPath";
import { useCurrentTheme } from "../../../application/hooks";

interface Props {
  styles: StyleTheme;
  audioData: AudioData;
}

const detectMimeType = (src?: string, fallback = "audio/mpeg") => {
  if (!src) return fallback;
  const lower = src.split("?")[0]?.toLowerCase() ?? "";
  if (lower.endsWith(".mp3")) return "audio/mpeg";
  if (lower.endsWith(".ogg")) return "audio/ogg";
  if (lower.endsWith(".wav")) return "audio/wav";
  if (lower.endsWith(".m4a")) return "audio/mp4";
  if (lower.endsWith(".flac")) return "audio/flac";
  if (lower.endsWith(".webm")) return "audio/webm";
  return fallback;
};

export const AudioBlock: React.FC<Props> = ({ styles, audioData }) => {
  const [theme] = useCurrentTheme();
  const src = audioData ? resolveMediaPath(audioData.src) : "";
  const mimeType = audioData.mimeType || detectMimeType(audioData.src);

  const {
    audioRef,
    isPlaying,
    duration,
    current,
    togglePlay,
    handleSeek,
    volume,
    handleVolumeChange,
  } = useAudioPlayer(src);

  const isDarkTheme = theme === "dark";
  const VolumeIcon = volume === 0 ? VolumeX : volume < 0.5 ? Volume1 : Volume2;
  const sliderTrackColor =
    (isDarkTheme
      ? (styles.audioPlayer.sliderTrackColorDark ??
        styles.audioPlayer.sliderTrackColor)
      : styles.audioPlayer.sliderTrackColor) ?? "rgba(148, 163, 184, 0.35)";
  const sliderFillColor =
    (isDarkTheme
      ? (styles.audioPlayer.sliderFillColorDark ??
        styles.audioPlayer.sliderFillColor)
      : styles.audioPlayer.sliderFillColor) ?? "rgba(41, 37, 36, 0.9)";
  const seekPercent =
    duration > 0 ? Math.min(100, Math.max(0, (current / duration) * 100)) : 0;
  const volumePercent = Math.min(100, Math.max(0, volume * 100));
  const commonSliderStyle = {
    background: `linear-gradient(to right, ${sliderFillColor} 0%, ${sliderFillColor} ${
      volumePercent
    }%, ${sliderTrackColor} ${volumePercent}%, ${sliderTrackColor} 100%)`,
  };
  const seekSliderStyle = {
    background: `linear-gradient(to right, ${sliderFillColor} 0%, ${sliderFillColor} ${seekPercent}%, ${sliderTrackColor} ${seekPercent}%, ${sliderTrackColor} 100%)`,
  };

  return (
    <div className="mb-6">
      <audio ref={audioRef} src={src} preload="metadata">
        <source src={src} type={mimeType} />
        Your browser does not support the audio element.
      </audio>

      <div
        className={`flex flex-wrap md:flex-nowrap items-center gap-3 rounded-md px-4 py-3 ${styles.audioPlayer.container}`}
      >
        <button
          onClick={togglePlay}
          className={`p-2 rounded-full cursor-pointer ${styles.audioPlayer.playButton}`}
          aria-label={isPlaying ? "Pause audio" : "Play audio"}
        >
          {isPlaying ? (
            <Pause className="w-5 h-5" />
          ) : (
            <Play className="w-5 h-5" />
          )}
        </button>

        <span
          className={`${styles.audioPlayer.time} w-12 select-none text-center`}
        >
          {formatTime(current)}
        </span>

        <input
          type="range"
          min={0}
          max={duration || 0}
          step={0.1}
          value={current}
          onChange={handleSeek}
          className={`flex-1 min-w-[160px] h-1 rounded-lg appearance-none cursor-pointer ${styles.audioPlayer.slider}
            [&::-webkit-slider-thumb]:appearance-none
            [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3
            [&::-webkit-slider-thumb]:rounded-full
            [&::-moz-range-thumb]:h-3 [&::-moz-range-thumb]:w-3
            [&::-moz-range-thumb]:rounded-full 
            ${styles.audioPlayer.sliderThumb}`}
          aria-label="Seek within audio"
          style={seekSliderStyle}
        />

        <span
          className={`${styles.audioPlayer.time} w-12 select-none text-center`}
        >
          {formatTime(duration)}
        </span>

        <div className="flex items-center gap-2 w-28 shrink-0">
          <VolumeIcon className={`w-4 h-4 ${styles.audioPlayer.time}`} />
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={volume}
            onChange={handleVolumeChange}
            aria-label="Adjust volume"
            className={`w-full h-1 rounded-lg appearance-none cursor-pointer ${styles.audioPlayer.slider}
              [&::-webkit-slider-thumb]:appearance-none
              [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3
              [&::-webkit-slider-thumb]:rounded-full
              [&::-moz-range-thumb]:h-3 [&::-moz-range-thumb]:w-3
              [&::-moz-range-thumb]:rounded-full 
              ${styles.audioPlayer.sliderThumb}`}
            style={commonSliderStyle}
          />
        </div>
      </div>

      {audioData.caption && (
        <p className={`${styles.text.caption} text-center`}>
          {audioData.caption}
        </p>
      )}
    </div>
  );
};

export default AudioBlock;
