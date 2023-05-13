import Product from "@/src/types/product";
import { useProduct } from "../Context/ProductContext";
import ShoppingBag from "@mui/icons-material/ShoppingBag";
import PaymentsTwoTone from "@mui/icons-material/PaymentsTwoTone";
import { Button } from "@mui/material";

const Favorites: React.FC = () => {
  const { product } = useProduct();
  const myFavorites: Product[] = [];

  product.favorites.forEach((fav) => {
    const favorite = product.products.find((product) => product.id === fav);
    if (favorite) {
      myFavorites.push(favorite);
    }
  });

  return (
    <section className="favorites">
      <h2>My Favorite products</h2>
      {myFavorites.length ? (
        <div>
          <ul>
            {myFavorites.map((favorite) => (
              <li key={favorite.id}>{favorite.title}</li>
            ))}
          </ul>
          <Button variant="outlined">
            <div>
              <PaymentsTwoTone /> Buy & Donate
            </div>
          </Button>
        </div>
      ) : (
        <div>
          Pick a product to donate!
          <ShoppingBag />{" "}
        </div>
      )}
    </section>
  );
};

export default Favorites;
