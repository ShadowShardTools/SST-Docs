// src/App.tsx
import { Routes, Route, HashRouter } from "react-router-dom";
import { useThemeStyles } from "./hooks";
import { MainRenderer } from "../layouts/render/components";

function App() {
  const styles = useThemeStyles();

  return (
    <HashRouter>
      <div className={`${styles.sections.siteBackground} transition-colors`}>
        <div className="min-h-screen max-w-7xl mx-auto px-0 lg:px-8 md:px-6">
          <div className={`${styles.sections.siteBorders}`}>
            <Routes>
              <Route
                path="/:docId?"
                element={<MainRenderer styles={styles} />}
              />
            </Routes>
          </div>
        </div>
      </div>
    </HashRouter>
  );
}

export default App;
