// src/App.tsx
import { Routes, Route, HashRouter } from "react-router-dom";
import MainPage from "./pages/MainPage";
import { siteConfig } from "./siteConfig";
import { useTheme } from "./hooks/useTheme";

function App() {
  const theme = useTheme();
  const styles = siteConfig.themes[theme];

  return (
    <HashRouter>
      <div className={`${styles.sections.siteBackground} transition-colors`}>
        <div className="min-h-screen max-w-7xl mx-auto px-0 lg:px-8 md:px-6">
          <div className={`${styles.sections.siteBorders}`}>
            <Routes>
              <Route path="/:docId?" element={<MainPage />} />
            </Routes>
          </div>
        </div>
      </div>
    </HashRouter>
  );
}

export default App;
