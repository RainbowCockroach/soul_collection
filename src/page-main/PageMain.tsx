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
import { loadOCs, loadAds, loadVNBioData } from "../helpers/data-load";
import type { AdItem, VNBioData } from "../helpers/objects";
import AdSlideshow from "../common-components/AdSlideshow";
import VisualNovelBio from "./VisualNovelBio";
import "./PageMain.css";
import Divider from "../common-components/Divider";
import titleMobile from "../assets/title_mobile.webp";
import titleDesktop from "../assets/title_desktop.webp";

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
  const [vnBioData, setVnBioData] = useState<VNBioData | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const allOcs = await loadOCs();
      const filteredOcs = allOcs.filter((oc) => protagonists.includes(oc.slug));
      setProtagonistOcs(filteredOcs);

      const adsData = await loadAds();
      setSidebarAds(adsData["main-sidebar"] || []);
      setFooterAds(adsData["main-footer"] || []);

      const bioData = await loadVNBioData();
      setVnBioData(bioData);
    };

    fetchData();
  }, []);

  return (
    <div>
      <div style={{ marginBottom: "20px" }}>
        <div className="main-section space-below space-above">
          <picture className="title-image-container">
            <source media="(max-width: 768px)" srcSet={titleMobile} />
            <img
              src={titleDesktop}
              alt="Welcome to Soul Collection"
              className="title-image"
            />
          </picture>
        </div>
      </div>

      <Divider />

      <div style={{ marginTop: "20px", marginBottom: "20px" }}>
        {vnBioData && (
          <VisualNovelBio
            dialogs={vnBioData.dialogs}
            backgroundUrl={vnBioData.backgroundUrl}
          />
        )}
      </div>

      <Divider />

      <div style={{ marginTop: "20px", marginBottom: "20px" }}>
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
      </div>

      <Divider />

      <div style={{ marginTop: "20px", marginBottom: "20px" }}>
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
          <div className="main-section footer-ads-section">
            <div className="footer-ads-container">
              <AdSlideshow ads={footerAds} className="footer-ad" />
            </div>
          </div>
        )}
      </div>

      <Divider />
    </div>
  );
};

export default PageMain;
