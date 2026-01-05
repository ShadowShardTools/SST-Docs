import { useState } from "react";
import { Copy, List, Menu, Pencil, Plus, Trash2 } from "lucide-react";
import Logo from "../../header/components/Logo";
import {
  ProductSelector,
  VersionSelector,
  ThemeButton,
  GithubButtonLink,
} from "../../cta/components";
import type {
  Product,
  StyleTheme,
  Version,
} from "@shadow-shard-tools/docs-core";

interface EditorHeaderProps {
  styles: StyleTheme;
  productVersioning: boolean;
  products: Product[];
  currentProduct: string;
  onProductChange: (product: string) => void;
  versions: Version[];
  currentVersion: string;
  onVersionChange: (version: string) => void;
  loading: boolean;
  isMobileNavOpen: boolean;
  onMobileNavToggle: () => void;
  onCreateProduct: () => void;
  onDeleteProduct: () => void;
  onEditProduct: () => void;
  onDuplicateProduct: () => void;
  onCreateVersion: () => void;
  onDeleteVersion: () => void;
  onEditVersion: () => void;
  onDuplicateVersion: () => void;
}

export const EditorHeader: React.FC<EditorHeaderProps> = ({
  styles,
  productVersioning,
  products,
  currentProduct,
  onProductChange,
  versions,
  currentVersion,
  onVersionChange,
  loading,
  isMobileNavOpen,
  onMobileNavToggle,
  onCreateProduct,
  onDeleteProduct,
  onEditProduct,
  onDuplicateProduct,
  onCreateVersion,
  onDeleteVersion,
  onEditVersion,
  onDuplicateVersion,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-colors ${styles.sections.headerBackground}`}
    >
      <div className="flex items-center justify-between h-16 px-4 gap-3">
        <button
          type="button"
          onClick={onMobileNavToggle}
          aria-label="Toggle navigation"
          className={`md:hidden p-2 ${styles.header.mobileNavigationToggle}`}
        >
          {isMobileNavOpen ? (
            <Menu className="w-6 h-6" />
          ) : (
            <List className="w-6 h-6" />
          )}
        </button>

        <div className="flex-1 flex items-center gap-3 min-w-0">
          <Logo styles={styles} />
        </div>

        <div className="hidden md:flex items-center space-x-3">
          {productVersioning && (
            <div className="flex items-center gap-1">
              <ProductSelector
                styles={styles}
                products={products}
                currentProduct={currentProduct}
                onProductChange={onProductChange}
                loading={loading}
              />
              <div className="flex flex-wrap gap-1 w-10">
                <button
                  type="button"
                  className={`${styles.buttons.common} min-w-4`}
                  onClick={onCreateProduct}
                  title="Add product"
                >
                  <Plus className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  className={`${styles.buttons.common} min-w-4`}
                  onClick={onDuplicateProduct}
                  title="Duplicate product"
                  disabled={!currentProduct}
                >
                  <Copy className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  className={`${styles.buttons.common} min-w-4`}
                  onClick={onEditProduct}
                  title="Edit product label"
                  disabled={!currentProduct}
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  className={`${styles.buttons.common} min-w-4`}
                  onClick={onDeleteProduct}
                  title="Delete product"
                  disabled={!currentProduct}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
          <div className="flex items-center gap-1">
            <VersionSelector
              styles={styles}
              versions={versions}
              currentVersion={currentVersion}
              onVersionChange={onVersionChange}
              loading={loading}
            />
            <div className="flex flex-wrap gap-1 w-10">
              <button
                type="button"
                className={`${styles.buttons.common} min-w-4`}
                onClick={onCreateVersion}
                title="Add version"
                disabled={!currentProduct}
              >
                <Plus className="w-4 h-4" />
              </button>
              <button
                type="button"
                className={`${styles.buttons.common} min-w-4`}
                onClick={onDuplicateVersion}
                title="Duplicate version"
                disabled={!currentProduct || !currentVersion}
              >
                <Copy className="w-4 h-4" />
              </button>
              <button
                type="button"
                className={`${styles.buttons.common} min-w-4`}
                onClick={onEditVersion}
                title="Edit version label"
                disabled={!currentProduct || !currentVersion}
              >
                <Pencil className="w-4 h-4" />
              </button>
              <button
                type="button"
                className={`${styles.buttons.common} min-w-4`}
                onClick={onDeleteVersion}
                title="Delete version"
                disabled={!currentProduct || !currentVersion}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
          <ThemeButton styles={styles} />
          <GithubButtonLink styles={styles} />
        </div>

        <div className="md:hidden">
          <button
            type="button"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
            className={`p-2 ${styles.header.mobileMenuToggle}`}
          >
            {isMenuOpen ? (
              <Menu className="w-6 h-6" />
            ) : (
              <List className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>

      {isMenuOpen && (
        <div className="md:hidden px-4 pb-3 space-y-2">
          {productVersioning && (
            <div className="flex items-center gap-1">
              <ProductSelector
                styles={styles}
                products={products}
                currentProduct={currentProduct}
                onProductChange={onProductChange}
                loading={loading}
              />
              <div className="flex flex-wrap gap-1 w-10">
                <button
                  type="button"
                  className={styles.buttons.common}
                  onClick={onCreateProduct}
                  title="Add product"
                >
                  <Plus className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  className={styles.buttons.common}
                  onClick={onDuplicateProduct}
                  title="Duplicate product"
                >
                  <Copy className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  className={styles.buttons.common}
                  onClick={onEditProduct}
                  title="Edit product label"
                  disabled={!currentProduct}
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  className={`${styles.buttons.common} min-w-[2rem]`}
                  onClick={onDeleteProduct}
                  title="Delete product"
                  disabled={!currentProduct}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
          <div className="flex items-center gap-1">
            <VersionSelector
              styles={styles}
              versions={versions}
              currentVersion={currentVersion}
              onVersionChange={onVersionChange}
              loading={loading}
            />
            <div className="flex flex-wrap gap-1 w-10">
              <button
                type="button"
                className={`${styles.buttons.common} min-w-4`}
                onClick={onCreateVersion}
                title="Add version"
                disabled={!currentProduct}
              >
                <Plus className="w-4 h-4" />
              </button>
              <button
                type="button"
                className={`${styles.buttons.common} min-w-4`}
                onClick={onDuplicateVersion}
                title="Duplicate version"
                disabled={!currentProduct || !currentVersion}
              >
                <Copy className="w-4 h-4" />
              </button>
              <button
                type="button"
                className={`${styles.buttons.common} min-w-4`}
                onClick={onEditVersion}
                title="Edit version label"
                disabled={!currentProduct || !currentVersion}
              >
                <Pencil className="w-4 h-4" />
              </button>
              <button
                type="button"
                className={`${styles.buttons.common} min-w-4`}
                onClick={onDeleteVersion}
                title="Delete version"
                disabled={!currentProduct || !currentVersion}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ThemeButton styles={styles} />
            <GithubButtonLink styles={styles} />
          </div>
        </div>
      )}
    </header>
  );
};

export default EditorHeader;
