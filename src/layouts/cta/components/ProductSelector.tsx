import { memo } from "react";
import { Package } from "lucide-react";
import LoadingSpinner from "../../dialog/components/LoadingSpinner";
import type { StyleTheme, Product } from "@shadow-shard-tools/docs-core";
import Dropdown from "../../common/components/Dropdown";

interface ProductSelectorProps {
  styles: StyleTheme;
  products: Product[];
  currentProduct: string;
  onProductChange: (product: string) => void;
  loading: boolean;
}

export const ProductSelector = memo<ProductSelectorProps>(
  ({ styles, products, currentProduct, onProductChange, loading }) => {
    if (loading) return <LoadingSpinner styles={styles} />;

    return (
      <Dropdown
        styles={styles}
        items={products.map(({ product, label }) => ({
          value: product,
          label,
          icon: <Package className="w-4 h-4" />,
        }))}
        selectedValue={currentProduct}
        onSelect={onProductChange}
        placeholder="Select Product"
        disabled={!products.length}
        className="min-w-[160px]"
      />
    );
  },
);

export default ProductSelector;
