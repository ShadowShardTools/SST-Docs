import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./application/App.tsx";
import { ThemeProvider } from "./application/hooks/useCurrentTheme";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </StrictMode>,
);
