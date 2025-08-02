import { useEffect, useState } from "react";

export function useCurrentTheme(): "light" | "dark" {
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    return document.documentElement.classList.contains("dark")
      ? "dark"
      : "light";
  });

  useEffect(() => {
    const target = document.documentElement;

    const updateTheme = () => {
      setTheme(target.classList.contains("dark") ? "dark" : "light");
    };

    const observer = new MutationObserver(updateTheme);

    observer.observe(target, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  return theme;
}

export default useCurrentTheme;
