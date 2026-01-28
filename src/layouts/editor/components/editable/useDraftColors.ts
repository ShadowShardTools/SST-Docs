import { useState } from "react";

export type DraftColorState = {
  getDraftColor: (key: string, fallback: string) => string;
  getPickerColor: (key: string, fallback: string) => string;
  setDraftColor: (key: string, value: string) => void;
  commitDraftColor: (key: string, commit: (value: string) => void) => void;
};

const isValidHex = (value: string) => /^#([0-9a-fA-F]{6})$/.test(value);

export const useDraftColors = (): DraftColorState => {
  const [draftColors, setDraftColors] = useState<Record<string, string>>({});

  const getDraftColor = (key: string, fallback: string) =>
    draftColors[key] ?? fallback;

  const getPickerColor = (key: string, fallback: string) => {
    const candidate = draftColors[key];
    if (candidate && isValidHex(candidate)) return candidate;
    return fallback;
  };

  const setDraftColor = (key: string, value: string) =>
    setDraftColors((prev) => ({ ...prev, [key]: value }));

  const commitDraftColor = (key: string, commit: (value: string) => void) => {
    const value = draftColors[key];
    if (value && isValidHex(value)) commit(value);
    setDraftColors((prev) => {
      if (!(key in prev)) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  return {
    getDraftColor,
    getPickerColor,
    setDraftColor,
    commitDraftColor,
  };
};
