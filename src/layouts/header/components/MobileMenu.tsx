import type {
  Product,
  StyleTheme,
  Version,
} from "@shadow-shard-tools/docs-core";
import {
  SearchBar,
  VersionSelector,
  ThemeButton,
  GithubButtonLink,
  DownloadStaticButton,
  ProductSelector,
} from "../../cta/components";
interface Props {
  styles: StyleTheme;
  productVersioning: boolean;
  products: Product[];
  currentProduct: string;
  onProductChange: (product: string) => void;
  versions: Version[];
  currentVersion: string;
  onVersionChange: (version: string) => void;
  loading: boolean;
  onSearchOpen: () => void;
}

export const MobileMenu: React.FC<Props> = ({
  styles,
  productVersioning,
  products,
  currentProduct,
  onProductChange,
  versions,
  currentVersion,
  onVersionChange,
  loading,
  onSearchOpen,
}) => (
  <div
    className={`absolute top-16 left-0 w-full z-40 p-4 md:hidden space-y-4 ${styles.sections.headerMobileBackground}`}
  >
    {productVersioning && (
      <ProductSelector
        styles={styles}
        products={products}
        currentProduct={currentProduct}
        onProductChange={onProductChange}
        loading={loading}
      />
    )}
    <VersionSelector
      styles={styles}
      versions={versions}
      currentVersion={currentVersion}
      onVersionChange={onVersionChange}
      loading={loading}
    />
    <SearchBar styles={styles} onClick={onSearchOpen} />
    <DownloadStaticButton
      styles={styles}
      showText={true}
      productVersioning={productVersioning}
      currentProduct={currentProduct}
      currentVersion={currentVersion}
    />
    <ThemeButton styles={styles} />
    <GithubButtonLink styles={styles} />
  </div>
);

export default MobileMenu;
