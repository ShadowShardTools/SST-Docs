import { describe, it, expect } from "vitest";
import { renderHook } from "@testing-library/react";
import { useAudioPlayer } from "../useAudioPlayer";

describe("useAudioPlayer", () => {
  it("should initialize with default state", () => {
    const { result } = renderHook(() => useAudioPlayer("test.mp3"));

    expect(result.current.isPlaying).toBe(false);
    expect(result.current.duration).toBe(0);
    expect(result.current.current).toBe(0);
    expect(result.current.volume).toBe(1);
    expect(result.current.audioRef).toBeDefined();
  });

  it("should provide control functions", () => {
    const { result } = renderHook(() => useAudioPlayer("test.mp3"));

    expect(typeof result.current.togglePlay).toBe("function");
    expect(typeof result.current.handleSeek).toBe("function");
    expect(typeof result.current.handleVolumeChange).toBe("function");
  });

  it("should reset state when source changes", () => {
    const { result, rerender } = renderHook(({ src }) => useAudioPlayer(src), {
      initialProps: { src: "test1.mp3" },
    });

    const initialRef = result.current.audioRef;

    rerender({ src: "test2.mp3" });

    // State should reset
    expect(result.current.isPlaying).toBe(false);
    expect(result.current.current).toBe(0);
    expect(result.current.audioRef).toBe(initialRef);
  });
});
