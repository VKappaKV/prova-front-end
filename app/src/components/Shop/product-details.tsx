import React from "react";
import Product from "@/src/types/product";
import { useProduct } from "../Context/product.context";

interface Props {
  product: Product;
}

const ProductDetails: React.FC<Props> = ({ product }) => {
  const { product: productData, setProduct } = useProduct();

  const handleFavorite = (productId: number) => {
    setProduct({ type: "FAVORITES", favorites: productId });
  };

  const isFavorite = productData.favorites.includes(product.id);

  return (
    <div className="product-details-container">
      <div className="product-details">
        <div className="product-image">
          {product.title} - {product.price} - Euro
        </div>
      </div>
      <div className="add-to-cart">
        <button
          type="button"
          className="button"
          onClick={() => handleFavorite(product.id)}
        >
          Add to cart
          <span>{isFavorite ? "❤️" : "❤︎"}</span>
        </button>
      </div>
    </div>
  );
};

export default ProductDetails;
