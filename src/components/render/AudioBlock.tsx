import React, { useEffect, useRef, useState } from "react";
import { Play, Pause } from "lucide-react";
import type { StyleTheme } from "../../siteConfig";

interface AudioBlockProps {
  styles: StyleTheme;
  audioSrc?: string;
  audioCaption?: string;
  audioMimeType?: string;
}

const formatTime = (sec: number) => {
  if (isNaN(sec)) return "0:00";
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60)
    .toString()
    .padStart(2, "0");
  return `${m}:${s}`;
};

const AudioBlock: React.FC<AudioBlockProps> = ({
  styles,
  audioSrc = "",
  audioCaption,
  audioMimeType = "audio/mpeg",
}) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [current, setCurrent] = useState(0);

  /* ---------- sync state with <audio> ---------- */
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

  /* ---------- reload media when `audioSrc` changes ---------- */
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.load(); // <—— forces the browser to re-evaluate sources
      setIsPlaying(false);
      setCurrent(0);
      setDuration(0);
    }
  }, [audioSrc]);

  /* ---------- controls ---------- */
  const togglePlay = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    try {
      if (isPlaying) {
        audio.pause();
        setIsPlaying(false);
      } else {
        await audio.play(); // wait for browser approval / decoding
        setIsPlaying(true);
      }
    } catch (err) {
      // Most failures are autoplay / decoding issues
      console.error("Cannot play audio:", err);
      setIsPlaying(false);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio) return;
    const t = Number(e.target.value);
    audio.currentTime = t;
    setCurrent(t);
  };

  /* ---------- UI ---------- */
  return (
    <div className="mb-6">
      {/* Hidden audio element – use `src` attr instead of nested <source> */}
      <audio ref={audioRef} src={audioSrc} preload="metadata">
        {/* fallback for archaic browsers */}
        <source src={audioSrc} type={audioMimeType} />
        Your browser does not support the audio element.
      </audio>

      {/* Custom controls */}
      <div
        className={`flex items-center gap-3 rounded-md px-4 py-3 ${styles.componentsStyles.audioContainer}`}
      >
        {/* Play / Pause */}
        <button
          onClick={togglePlay}
          className={`p-2 rounded-full cursor-pointer ${styles.componentsStyles.audioPlayButton}`}
        >
          {isPlaying ? (
            <Pause className="w-5 h-5" />
          ) : (
            <Play className="w-5 h-5" />
          )}
        </button>

        {/* Time – current */}
        <span
          className={`w-12 select-none ${styles.componentsStyles.audioTime}`}
        >
          {formatTime(current)}
        </span>

        {/* Progress bar */}
        <input
          type="range"
          min={0}
          max={duration || 0}
          step={0.1}
          value={current}
          onChange={handleSeek}
          className={`flex-1 h-1 rounded-lg appearance-none cursor-pointer ${styles.componentsStyles.audioSlider}
            [&::-webkit-slider-thumb]:appearance-none
            [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3
            [&::-webkit-slider-thumb]:rounded-full
            [&::-moz-range-thumb]:h-3 [&::-moz-range-thumb]:w-3
            [&::-moz-range-thumb]:rounded-full 
            ${styles.componentsStyles.audioSliderThumb}`}
        />

        {/* Time – duration */}
        <span
          className={`w-12 select-none ${styles.componentsStyles.audioTime}`}
        >
          {formatTime(duration)}
        </span>
      </div>

      {audioCaption && (
        <p className={styles.textStyles.alternativeText}>{audioCaption}</p>
      )}
    </div>
  );
};

export default AudioBlock;
