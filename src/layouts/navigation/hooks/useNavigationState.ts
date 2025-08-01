import { useState, useCallback } from "react";

export const useNavigationState = () => {
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const [filter, setFilter] = useState("");
  const [cursor, setCursor] = useState(0);

  const toggle = useCallback(
    (id: string) => setOpen((prev) => ({ ...prev, [id]: !prev[id] })),
    [],
  );

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
