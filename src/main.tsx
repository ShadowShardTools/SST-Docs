import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./application/App.tsx";
import { ThemeProvider } from "./application/hooks/useCurrentTheme";

// Polyfill for TouchEvent which is missing in some desktop environments
// and causes ReferenceError in react-compare-image
if (
  typeof window !== "undefined" &&
  typeof (window as any).TouchEvent === "undefined"
) {
  (window as any).TouchEvent = class TouchEvent extends UIEvent {};
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </StrictMode>,
);
