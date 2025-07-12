import { useState } from "react";
import { List, Menu, X } from "lucide-react";
import Logo from "./Logo";
import MobileMenu from "./MobileMenu";
import GithubButtonLink from "../../components/GithubLink";
import VersionSelector from "../../components/VersionSelector";
import SearchBar from "../../components/SearchBar";
import type { Version } from "../../types/entities/Version";
import { type StyleTheme } from "../../siteConfig";
import ThemeButton from "../../components/ThemeButton";

interface HeaderProps {
  styles: StyleTheme;
  versions: Version[];
  currentVersion: string;
  onVersionChange: (version: string) => void;
  loading: boolean;
  onSearchOpen: () => void;
  isMobileNavOpen: boolean;
  onMobileNavToggle: () => void;
}

const Header: React.FC<HeaderProps> = ({
  styles,
  versions,
  currentVersion,
  onVersionChange,
  loading,
  onSearchOpen,
  isMobileNavOpen,
  onMobileNavToggle,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-colors ${styles.sections.headerBackground}`}
    >
      <div className="flex items-center justify-between h-16 px-4">
        {/* Left side: mobile navigation toggle */}
        <button
          type="button"
          onClick={onMobileNavToggle}
          aria-label="Toggle navigation"
          className="md:hidden p-2 text-gray-500 hover:text-gray-700"
        >
          {isMobileNavOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <List className="w-6 h-6" />
          )}
        </button>

        {/* Center: logo */}
        <div className="flex-1 flex justify-center md:justify-start">
          <Logo />
        </div>

        {/* Mobile menu toggle */}
        <div className="md:hidden">
          <button
            type="button"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
            className="p-2 text-gray-500 hover:text-gray-700"
          >
            {isMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Right side: desktop tools */}
        <div className="flex items-center space-x-4">
          <div className="hidden md:flex items-center space-x-4">
            <SearchBar styles={styles} onClick={onSearchOpen} />
            <VersionSelector
              styles={styles}
              versions={versions}
              currentVersion={currentVersion}
              onVersionChange={onVersionChange}
              loading={loading}
            />
            <ThemeButton />
            <GithubButtonLink styles={styles} />
          </div>
        </div>
      </div>

      {isMenuOpen && (
        <MobileMenu
          styles={styles}
          versions={versions}
          currentVersion={currentVersion}
          onVersionChange={onVersionChange}
          loading={loading}
          onSearchOpen={onSearchOpen}
        />
      )}
    </header>
  );
};

export default Header;
