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
import { loadOCs, loadAds } from "../helpers/data-load";
import type { AdItem } from "../helpers/objects";
import AdSlideshow from "../common-components/AdSlideshow";
import samLogo from "../assets/sam_logo.webp";
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
  const [sidebarAds, setSidebarAds] = useState<AdItem[]>([]);
  const [footerAds, setFooterAds] = useState<AdItem[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const allOcs = await loadOCs();
      const filteredOcs = allOcs.filter((oc) => protagonists.includes(oc.slug));
      setProtagonistOcs(filteredOcs);

      const adsData = await loadAds();
      setSidebarAds(adsData["main-sidebar"] || []);
      setFooterAds(adsData["main-footer"] || []);
    };

    fetchData();
  }, []);

  return (
    <div>
      <div className="main-section">
        <img src={samLogo} alt="Sam Logo" className="main-logo" />
        <h1 className="big-text-shadow">Welcome to my soul collection</h1>
      </div>
      <div className="main-section">
        <h2 className="big-text-shadow">My favourites!</h2>
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
        <p className="small-text-shadow">♡ Cutest / dearest to me! ♡</p>
      </div>
      {/* For mobile and vertical tablet */}
      <div className="random-oc-button-section random-button-mobile">
        <p className="small-text-shadow">Click button for random character</p>
        <RandomOcButton />
      </div>
      {/* Protagonist and Sidebar section */}
      <div className="main-section">
        <div className="protagonist-sidebar-grid">
          {/* Row 1, Col 1: Protagonist text box */}
          <div className="protagonist-text-box-cell">
            <div className="shadow-3d protagonist-text-box">
              <h2>Protagonists</h2>
            </div>
            <p className="small-text-shadow">For my in-planning games</p>
          </div>

          {/* Row 1, Col 2: Random button */}
          {/* For desktop and horizontal tablet */}
          <div className="random-button-cell">
            <div className="random-oc-button-section">
              <p className="small-text-shadow">
                Click button for random character
              </p>
              <RandomOcButton />
            </div>
          </div>

          {/* Row 2, Col 1: Protagonist grid */}
          <div className="protagonist-grid-cell">
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

          {/* Row 2, Col 2: Ad */}
          <div className="ad-cell">
            {sidebarAds.length > 0 && (
              <div className="sidebar-ads-container">
                <AdSlideshow ads={sidebarAds} className="sidebar-ad" />
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Footer Ads section */}
      {footerAds.length > 0 && (
        <div className="main-section">
          <div className="footer-ads-container">
            <AdSlideshow ads={footerAds} className="footer-ad" />
          </div>
        </div>
      )}
    </div>
  );
};

export default PageMain;
