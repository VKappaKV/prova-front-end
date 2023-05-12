import React from "react";
import ProductDetails from "./product-details";
import Product from "@/src/types/product";

interface Props {
  product: Product;
}
const ProductItem: React.FC<Props> = ({ product }) => {
  return (
    <div className="product-card">
      <ProductDetails product={product} />
    </div>
  );
};

export default ProductItem;
