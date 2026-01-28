import { useState } from "react";
import { Copy, List, Menu, Pencil, Plus, Trash2 } from "lucide-react";
import Logo from "../../header/components/Logo";
import {
  ProductSelector,
  VersionSelector,
  ThemeButton,
  GithubButtonLink,
} from "../../cta/components";
import Button from "../../common/components/Button";
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
                <Button
                  type="button"
                  className="min-w-4"
                  styles={styles}
                  onClick={onCreateProduct}
                  title="Add product"
                >
                  <Plus className="w-4 h-4" />
                </Button>
                <Button
                  type="button"
                  className="min-w-4"
                  styles={styles}
                  onClick={onDuplicateProduct}
                  title="Duplicate product"
                  disabled={!currentProduct}
                >
                  <Copy className="w-4 h-4" />
                </Button>
                <Button
                  type="button"
                  className="min-w-4"
                  styles={styles}
                  onClick={onEditProduct}
                  title="Edit product label"
                  disabled={!currentProduct}
                >
                  <Pencil className="w-4 h-4" />
                </Button>
                <Button
                  type="button"
                  className="min-w-4"
                  styles={styles}
                  onClick={onDeleteProduct}
                  title="Delete product"
                  disabled={!currentProduct}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
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
              <Button
                type="button"
                className="min-w-4"
                styles={styles}
                onClick={onCreateVersion}
                title="Add version"
                disabled={productVersioning && !currentProduct}
              >
                <Plus className="w-4 h-4" />
              </Button>
              <Button
                type="button"
                className="min-w-4"
                styles={styles}
                onClick={onDuplicateVersion}
                title="Duplicate version"
                disabled={
                  (productVersioning && !currentProduct) || !currentVersion
                }
              >
                <Copy className="w-4 h-4" />
              </Button>
              <Button
                type="button"
                className="min-w-4"
                styles={styles}
                onClick={onEditVersion}
                title="Edit version label"
                disabled={
                  (productVersioning && !currentProduct) || !currentVersion
                }
              >
                <Pencil className="w-4 h-4" />
              </Button>
              <Button
                type="button"
                className="min-w-4"
                styles={styles}
                onClick={onDeleteVersion}
                title="Delete version"
                disabled={
                  (productVersioning && !currentProduct) || !currentVersion
                }
              >
                <Trash2 className="w-4 h-4" />
              </Button>
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
                <Button
                  type="button"
                  styles={styles}
                  onClick={onCreateProduct}
                  title="Add product"
                >
                  <Plus className="w-4 h-4" />
                </Button>
                <Button
                  type="button"
                  styles={styles}
                  onClick={onDuplicateProduct}
                  title="Duplicate product"
                >
                  <Copy className="w-4 h-4" />
                </Button>
                <Button
                  type="button"
                  styles={styles}
                  onClick={onEditProduct}
                  title="Edit product label"
                  disabled={!currentProduct}
                >
                  <Pencil className="w-4 h-4" />
                </Button>
                <Button
                  type="button"
                  className="min-w-[2rem]"
                  styles={styles}
                  onClick={onDeleteProduct}
                  title="Delete product"
                  disabled={!currentProduct}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
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
              <Button
                type="button"
                className="min-w-4"
                styles={styles}
                onClick={onCreateVersion}
                title="Add version"
                disabled={productVersioning && !currentProduct}
              >
                <Plus className="w-4 h-4" />
              </Button>
              <Button
                type="button"
                className="min-w-4"
                styles={styles}
                onClick={onDuplicateVersion}
                title="Duplicate version"
                disabled={
                  (productVersioning && !currentProduct) || !currentVersion
                }
              >
                <Copy className="w-4 h-4" />
              </Button>
              <Button
                type="button"
                className="min-w-4"
                styles={styles}
                onClick={onEditVersion}
                title="Edit version label"
                disabled={
                  (productVersioning && !currentProduct) || !currentVersion
                }
              >
                <Pencil className="w-4 h-4" />
              </Button>
              <Button
                type="button"
                className="min-w-4"
                styles={styles}
                onClick={onDeleteVersion}
                title="Delete version"
                disabled={
                  (productVersioning && !currentProduct) || !currentVersion
                }
              >
                <Trash2 className="w-4 h-4" />
              </Button>
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
