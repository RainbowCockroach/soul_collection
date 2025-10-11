import React, { useEffect, useState } from "react";
import RandomOcButton from "./RandomOcButton";
import bushAvatar from "../assets/fav_bush.webp";
import cupcakeAvatar from "../assets/fav_cupcake.webp";
import hecAvatar from "../assets/fav_hec.webp";
import naameAvatar from "../assets/fav_naame.webp";
import nonAvatar from "../assets/fav_non.webp";
import rilorLivAvatar from "../assets/fav_rilor_liv.webp";
import FavouriteCharacter from "./FavouriteCharacter";
import OcSlot from "../page-oc-list/OcSlot";
import type { OC } from "../page-oc-list/OcSlot";
import { loadOCs } from "../helpers/data-load";
import "./PageMain.css";

const PageMain: React.FC = () => {
  const favourites = [
    { slug: "bush", name: "Bush", avatar: bushAvatar },
    { slug: "echo", name: "Cupcake", avatar: cupcakeAvatar },
    { slug: "rilor", name: "Rilor and Liv", avatar: rilorLivAvatar },
    { slug: "heix-li", name: "Heix", avatar: hecAvatar },
    { slug: "non-li", name: "Non", avatar: nonAvatar },
    { slug: "naame", name: "Naame", avatar: naameAvatar },
  ];
  const protagonists = ["sammy-sa", "rilor", "liv", "leeo", "bush", "naame"];
  const [protagonistOcs, setProtagonistOcs] = useState<OC[]>([]);

  useEffect(() => {
    const fetchProtagonists = async () => {
      const allOcs = await loadOCs();
      const filteredOcs = allOcs.filter((oc) => protagonists.includes(oc.slug));
      setProtagonistOcs(filteredOcs);
    };

    fetchProtagonists();
  }, []);

  return (
    <div>
      <h1 className="favourite-text">Welcome to my soul collection</h1>
      <div>
        <h2 className="favourite-text">My favourites!</h2>
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
        <p className="favourite-text">♡ Cutest / dearest to me! ♡</p>
      </div>
      <div>
        <h2 className="favourite-text">Protagonists</h2>
        <p className="favourite-text">For my in-planning games</p>
        <div className="protagonists-grid">
          {protagonistOcs.map((oc) => (
            <OcSlot
              key={oc.slug}
              oc={oc}
              frameColour="#44fcc2ff"
              textColour="#03291dff"
            />
          ))}
        </div>
      </div>
      <div>
        <p className="favourite-text">And many others</p>
        <RandomOcButton />
      </div>
    </div>
  );
};

export default PageMain;
