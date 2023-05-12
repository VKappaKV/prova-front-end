import React, { createContext, useContext, useReducer } from "react";
import Product from "@/src/types/product";
import products from "@/src/constants/products";

type ProductData = {
  products: Product[];
  favorites: number[];
};

type ProductAction =
  | {
      type: "PRODUCTS";
      products: Product[];
    }
  | {
      type: "FAVORITES";
      favorites: number;
    };

const productReducer = (
  state: ProductData,
  action: ProductAction
): ProductData => {
  switch (action.type) {
    case "PRODUCTS":
      return { ...state, products: action.products };
    case "FAVORITES":
      let favorites = state.favorites;

      if (state.favorites.includes(action.favorites)) {
        favorites = favorites.filter((fav) => fav !== action.favorites);
      } else {
        favorites = [...state.favorites, action.favorites];
      }

      return { ...state, favorites };
    default:
      return state;
  }
};

const defaultValues: ProductData = {
  products,
  favorites: [],
};

const myProduct = {
  product: defaultValues,
  setProduct: (action: ProductAction): void => {},
};

const ProductContext = createContext<{
  product: ProductData;
  setProduct: React.Dispatch<ProductAction>;
}>(myProduct); //initialize context with default value

interface Props {
  children: React.ReactNode;
}

export const ProductProvider: React.FC<Props> = ({ children }) => {
  const [product, setProduct] = useReducer(productReducer, defaultValues);

  return (
    <ProductContext.Provider value={{ product, setProduct }}>
      {children}
    </ProductContext.Provider>
  );
};

export const useProduct = () => useContext(ProductContext);
