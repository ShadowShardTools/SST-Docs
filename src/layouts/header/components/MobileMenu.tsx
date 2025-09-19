import type { StyleTheme } from "../../../application/types/StyleTheme";
import type { Version } from "../../render/types/Version";
import {
  SearchBar,
  VersionSelector,
  ThemeButton,
  GithubButtonLink,
} from "../../cta/components";
interface Props {
  styles: StyleTheme;
  versions: Version[];
  currentVersion: string;
  onVersionChange: (version: string) => void;
  loading: boolean;
  onSearchOpen: () => void;
}

export const MobileMenu: React.FC<Props> = ({
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
    <ThemeButton styles={styles} />
    <GithubButtonLink styles={styles} />
  </div>
);

export default MobileMenu;
