import VersionSelector from "./VersionSelector";
import type { StyleTheme } from "../../types/StyleTheme";
import type { Version } from "../render/types/Version";
import GithubButtonLink from "../cta/GithubLink";
import SearchBar from "./SearchBar";
import ThemeButton from "./ThemeButton";

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
