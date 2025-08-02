import React, { useRef, useState, useEffect, useCallback } from "react";
import { Play, Pause } from "lucide-react";
import type { StyleTheme } from "../../../../types/StyleTheme";
import type { AudioData } from "../../types";
import { formatTime } from "../../utilities";

interface AudioBlockProps {
  styles: StyleTheme;
  audioData: AudioData;
}

const AudioBlock: React.FC<AudioBlockProps> = ({ styles, audioData }) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onLoaded = () => setDuration(audio.duration);
    const onTime = () => setCurrent(audio.currentTime);
    const onEnded = () => setIsPlaying(false);

    audio.addEventListener("loadedmetadata", onLoaded);
    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("ended", onEnded);

    return () => {
      audio.removeEventListener("loadedmetadata", onLoaded);
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("ended", onEnded);
    };
  }, []);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.load();
      setIsPlaying(false);
      setCurrent(0);
      setDuration(0);
    }
  }, [audioData.src]);

  const togglePlay = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio) return;

    try {
      if (isPlaying) {
        audio.pause();
        setIsPlaying(false);
      } else {
        await audio.play();
        setIsPlaying(true);
      }
    } catch (err) {
      console.error("Cannot play audio:", err);
      setIsPlaying(false);
    }
  }, [isPlaying]);

  const handleSeek = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio) return;
    const t = Number(e.target.value);
    audio.currentTime = t;
    setCurrent(t);
  }, []);

  return (
    <div className="mb-6">
      <audio ref={audioRef} src={audioData.src} preload="metadata">
        <source src={audioData.src} type={audioData.mimeType} />
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
