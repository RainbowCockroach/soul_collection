import React from "react";
import RandomOcButton from "./RandomOcButton";
import bushAvatar from "../assets/fav_bush.png";
import cupcakeAvatar from "../assets/fav_cupcake.png";
import hecAvatar from "../assets/fav_hec.png";
import naameAvatar from "../assets/fav_naame.png";
import nonAvatar from "../assets/fav_non.png";
import rilorLivAvatar from "../assets/fav_rilor_liv.png";
import FavouriteCharacter from "./FavouriteCharacter";

const PageMain: React.FC = () => {
  const favourites = [
    { slug: "bush", name: "Bush", avatar: bushAvatar },
    { slug: "cupcake", name: "Cupcake", avatar: cupcakeAvatar },
    { slug: "hec", name: "Hec", avatar: hecAvatar },
    { slug: "naame", name: "Naame", avatar: naameAvatar },
    { slug: "non", name: "Non", avatar: nonAvatar },
    { slug: "rilor", name: "Rilor and Liv", avatar: rilorLivAvatar },
  ];
  return (
    <div>
      <RandomOcButton />
      <section className="favourites-section">
        {favourites.map((fav) => (
          <FavouriteCharacter
            key={fav.slug}
            slug={fav.slug}
            name={fav.name}
            avatar={fav.avatar}
          />
        ))}
      </section>
    </div>
  );
};

export default PageMain;
