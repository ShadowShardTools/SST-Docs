import type { StyleTheme, Version } from "@shadow-shard-tools/docs-core";
import {
  SearchBar,
  VersionSelector,
  ThemeButton,
  GithubButtonLink,
  PrintPdfButton,
  DownloadStaticButton,
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
    <PrintPdfButton
      styles={styles}
      showText={true}
      currentVersion={currentVersion}
    />
    <DownloadStaticButton
      styles={styles}
      showText={true}
      currentVersion={currentVersion}
    />
    <ThemeButton styles={styles} />
    <GithubButtonLink styles={styles} />
  </div>
);

export default MobileMenu;
