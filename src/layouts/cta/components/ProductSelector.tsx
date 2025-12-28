import { memo, useMemo, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import LoadingSpinner from "../../dialog/components/LoadingSpinner";
import { useClickOutside, useEscapeKey } from "../utilities";
import type { StyleTheme, Product } from "@shadow-shard-tools/docs-core";

interface ProductSelectorProps {
  styles: StyleTheme;
  products: Product[];
  currentProduct: string;
  onProductChange: (product: string) => void;
  loading: boolean;
}

export const ProductSelector = memo<ProductSelectorProps>(
  ({ styles, products, currentProduct, onProductChange, loading }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useClickOutside(dropdownRef, () => setIsOpen(false));
    useEscapeKey(() => setIsOpen(false), isOpen);

    const current = useMemo(
      () => products.find((v) => v.product === currentProduct),
      [products, currentProduct],
    );

    const handleSelect = (product: string) => {
      onProductChange(product);
      setIsOpen(false);
    };

    if (loading) return <LoadingSpinner styles={styles} />;

    return (
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`flex justify-between items-center w-full gap-2 p-2 cursor-pointer ${styles.buttons.common}`}
          disabled={!products.length}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
        >
          <span className="truncate">{current?.label || "Select Product"}</span>
          <ChevronDown
            className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
          />
        </button>

        {isOpen && (
          <ul
            className={`absolute top-full left-0 mt-1 z-50 min-w-full max-h-60 overflow-y-auto ${styles.dropdown.container}`}
            role="listbox"
          >
            {products.map(({ product, label }) => (
              <li key={product}>
                <button
                  onClick={() => handleSelect(product)}
                  className={`w-full px-3 py-2 cursor-pointer ${styles.dropdown.item} ${
                    product === currentProduct ? styles.dropdown.itemActive : ""
                  }`}
                  role="option"
                  aria-selected={product === currentProduct}
                >
                  {label}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  },
);

export default ProductSelector;
