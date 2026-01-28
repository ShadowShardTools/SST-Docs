import { useState } from "react";
import { List, Menu, X } from "lucide-react";
import Logo from "./Logo";
import MobileMenu from "./MobileMenu";
import {
  DownloadStaticButton,
  ProductSelector,
  SearchBar,
  VersionSelector,
  ThemeButton,
  GithubButtonLink,
} from "../../cta/components";
import type {
  Product,
  StyleTheme,
  Version,
} from "@shadow-shard-tools/docs-core";

interface HeaderProps {
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
  isMobileNavOpen: boolean;
  onMobileNavToggle: () => void;
}

export const Header: React.FC<HeaderProps> = ({
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
          className={`md:hidden p-2 ${styles.header.mobileNavigationToggle}`}
        >
          {isMobileNavOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <List className="w-6 h-6" />
          )}
        </button>

        {/* Center: logo */}
        <div className="flex-1 flex justify-center md:justify-start">
          <Logo styles={styles} />
        </div>

        {/* Mobile menu toggle */}
        <div className="md:hidden">
          <button
            type="button"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
            className={`p-2 ${styles.header.mobileMenuToggle}`}
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
              showText={false}
              productVersioning={productVersioning}
              currentProduct={currentProduct}
              currentVersion={currentVersion}
            />
            <ThemeButton styles={styles} />
            <GithubButtonLink styles={styles} />
          </div>
        </div>
      </div>

      {isMenuOpen && (
        <MobileMenu
          styles={styles}
          productVersioning={productVersioning}
          products={products}
          currentProduct={currentProduct}
          onProductChange={onProductChange}
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
