import React from "react";
import { Play, Pause } from "lucide-react";
import type { StyleTheme } from "../../../application/types/StyleTheme";
import { formatTime, withBasePath } from "../utilities";
import type { AudioData } from "../types";
import { useAudioPlayer } from "../hooks";

interface Props {
  styles: StyleTheme;
  audioData: AudioData;
}

export const AudioBlock: React.FC<Props> = ({ styles, audioData }) => {
  const src = audioData ? withBasePath(audioData.src) : "";

  const { audioRef, isPlaying, duration, current, togglePlay, handleSeek } =
    useAudioPlayer(src);

  return (
    <div className="mb-6">
      <audio ref={audioRef} src={src} preload="metadata">
        <source src={src} type={audioData.mimeType} />
        Your browser does not support the audio element.
      </audio>

      <div
        className={`flex items-center gap-3 rounded-md px-4 py-3 ${styles.audioPlayer.container}`}
      >
        <button
          onClick={togglePlay}
          className={`p-2 rounded-full cursor-pointer ${styles.audioPlayer.playButton}`}
        >
          {isPlaying ? (
            <Pause className="w-5 h-5" />
          ) : (
            <Play className="w-5 h-5" />
          )}
        </button>

        <span className={`w-12 select-none ${styles.audioPlayer.time}`}>
          {formatTime(current)}
        </span>

        <input
          type="range"
          min={0}
          max={duration || 0}
          step={0.1}
          value={current}
          onChange={handleSeek}
          className={`flex-1 h-1 rounded-lg appearance-none cursor-pointer ${styles.audioPlayer.slider}
            [&::-webkit-slider-thumb]:appearance-none
            [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3
            [&::-webkit-slider-thumb]:rounded-full
            [&::-moz-range-thumb]:h-3 [&::-moz-range-thumb]:w-3
            [&::-moz-range-thumb]:rounded-full 
            ${styles.audioPlayer.sliderThumb}`}
        />

        <span className={`w-12 select-none ${styles.audioPlayer.time}`}>
          {formatTime(duration)}
        </span>
      </div>

      {audioData.caption && (
        <p className={styles.text.alternative}>{audioData.caption}</p>
      )}
    </div>
  );
};

export default AudioBlock;
