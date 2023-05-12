import React from "react";
import ProductItem from "./product-item";
import { useProduct } from "../Context/product.context";

const ProductList: React.FC = () => {
  const { product } = useProduct();
  return (
    <section className="product-container">
      {product.products.map((product) => (
        <ProductItem key={product.id} product={product} />
      ))}
    </section>
  );
};

export default ProductList;
