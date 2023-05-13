import React from "react";
import Product from "@/src/types/product";
import { useProduct } from "../Context/ProductContext";
import AddShoppingCart from "@mui/icons-material/AddShoppingCart";
import RemoveShoppingCart from "@mui/icons-material/RemoveShoppingCart";
import { Button } from "@mui/material";

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
        {isFavorite ? (
          <Button
            variant="outlined"
            color="error"
            onClick={() => handleFavorite(product.id)}
          >
            <RemoveShoppingCart /> Remove from cart{" "}
          </Button>
        ) : (
          <Button
            variant="contained"
            onClick={() => handleFavorite(product.id)}
          >
            <AddShoppingCart /> Add to cart{" "}
          </Button>
        )}
      </div>
    </div>
  );
};

export default ProductDetails;
