import GithubButtonLink from "../../components/GithubLink";
import SearchBar from "../../components/SearchBar";
import ThemeButton from "../../components/ThemeButton";
import VersionSelector from "../../components/VersionSelector";
import type { StyleTheme } from "../../siteConfig";
import type { Version } from "../../types/entities/Version";

interface MobileMenuProps {
  styles: StyleTheme;
  versions: Version[];
  currentVersion: string;
  onVersionChange: (version: string) => void;
  loading: boolean;
  onSearchOpen: () => void;
}

const MobileMenu: React.FC<MobileMenuProps> = ({
  styles,
  versions,
  currentVersion,
  onVersionChange,
  loading,
  onSearchOpen,
}) => (
  <div
    className={`absolute top-16 left-0 w-full z-40 p-4 md:hidden space-y-4 ${styles.sections.headerMobileBackground}`}
  >
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
);

export default MobileMenu;
