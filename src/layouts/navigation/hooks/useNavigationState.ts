import { useState, useCallback, useEffect } from "react";

const OPEN_STATE_KEY = "navigation-open-state";

const getStoredOpenState = (): Record<string, boolean> => {
  if (typeof window === "undefined") return {};
  const raw = window.localStorage.getItem(OPEN_STATE_KEY);
  if (!raw) return {};

  try {
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object") {
      return Object.entries(parsed).reduce(
        (acc, [key, value]) => ({
          ...acc,
          [key]: Boolean(value),
        }),
        {} as Record<string, boolean>,
      );
    }
  } catch {
    // ignore malformed storage values
  }

  return {};
};

export const useNavigationState = () => {
  const [open, setOpen] = useState<Record<string, boolean>>(getStoredOpenState);
  const [filter, setFilter] = useState("");
  const [cursor, setCursor] = useState(0);

  const toggle = useCallback(
    (id: string) => setOpen((prev) => ({ ...prev, [id]: !prev[id] })),
    [],
  );

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(OPEN_STATE_KEY, JSON.stringify(open));
  }, [open]);

  const resetCursor = useCallback(() => setCursor(0), []);

  return {
    open,
    filter,
    cursor,
    setFilter,
    setCursor,
    toggle,
    resetCursor,
  };
};
