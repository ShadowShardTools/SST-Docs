// src/App.tsx
import { Routes, Route, HashRouter } from "react-router-dom";
import { MainRenderer } from "../layouts/render/components";
import { useMemo } from "react";
import {
  DEFAULT_THEME_PRESET,
  getThemePreset,
} from "@shadow-shard-tools/docs-core/themes/themeRegistry";
import { useCurrentTheme } from "./hooks";
import { EditorShell } from "../layouts/editor/EditorShell";

function App() {
  const [theme] = useCurrentTheme();
  const styles = useMemo(() => getThemePreset(DEFAULT_THEME_PRESET), [theme]);
  // Editor is intended for local development only.
  const editorEnabled =
    import.meta.env.DEV &&
    (import.meta.env.VITE_ENABLE_EDITOR ?? "true") !== "false";

  return (
    <HashRouter>
      <div className={theme === "dark" ? "dark" : ""}>
        <div className={`${styles.sections.siteBackground} transition-colors`}>
          <div className="min-h-screen max-w-7xl mx-auto px-0 lg:px-8 md:px-6">
            <div className={`${styles.sections.siteBorders}`}>
              <Routes>
                {editorEnabled ? (
                  <Route
                    path="/editor/:docId?"
                    element={<EditorShell styles={styles} />}
                  />
                ) : null}
                <Route
                  path="/:docId?"
                  element={<MainRenderer styles={styles} />}
                />
              </Routes>
            </div>
          </div>
        </div>
      </div>
    </HashRouter>
  );
}

export default App;
