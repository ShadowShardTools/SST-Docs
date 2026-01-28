import { useCallback, useState } from "react";
import type { DragEvent } from "react";
import type { Content } from "@shadow-shard-tools/docs-core";

export const useBlockDragState = (
  blocks: Content[],
  onChange: (updated: Content[]) => void,
) => {
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const moveBlock = useCallback(
    (from: number, to: number) => {
      if (to < 0 || to >= blocks.length) return;
      const next = [...blocks];
      const [item] = next.splice(from, 1);
      next.splice(to, 0, item);
      onChange(next);
    },
    [blocks, onChange],
  );

  const handleDragStart = useCallback(
    (event: DragEvent<HTMLElement>, index: number) => {
      setDragIndex(index);
      event.dataTransfer.effectAllowed = "move";
      event.dataTransfer.setData("text/plain", String(index));
    },
    [],
  );

  const handleDragOver = useCallback(
    (event: DragEvent<HTMLElement>, index: number) => {
      event.preventDefault();
      event.dataTransfer.dropEffect = "move";
      setDragOverIndex((prev) => (prev === index ? prev : index));
    },
    [],
  );

  const handleDragLeave = useCallback((index: number) => {
    setDragOverIndex((prev) => (prev === index ? null : prev));
  }, []);

  const handleDrop = useCallback(
    (event: DragEvent<HTMLElement>, index: number) => {
      event.preventDefault();
      const from =
        dragIndex !== null
          ? dragIndex
          : Number(event.dataTransfer.getData("text/plain"));
      if (!Number.isNaN(from)) {
        moveBlock(from, index);
      }
      setDragIndex(null);
      setDragOverIndex(null);
    },
    [dragIndex, moveBlock],
  );

  const resetDrag = useCallback(() => {
    setDragIndex(null);
    setDragOverIndex(null);
  }, []);

  return {
    dragIndex,
    dragOverIndex,
    handleDragStart,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    resetDrag,
  } as const;
};
