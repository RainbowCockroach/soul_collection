import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./NavBar.css";
import { baseUrl } from "../helpers/constants";
import samLogoFull from "../assets/sam_logo_full.webp";
import { MusicPlayerControls } from "../music-player/MusicPlayerControls";
import ButtonWrapper from "../common-components/ButtonWrapper";
import buttonSoundHover from "/sound-effect/button_hover.mp3";
import buttonSound from "/sound-effect/button_oc_slot.mp3";

const Navbar = () => {
  const navigate = useNavigate();
  const [isHidden, setIsHidden] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Always show navbar when at top
      if (currentScrollY < 10) {
        setIsHidden(false);
      } else if (currentScrollY > lastScrollY) {
        // Scrolling down - hide navbar
        setIsHidden(true);
      } else {
        // Scrolling up - show navbar
        setIsHidden(false);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);
  const menuItems = [
    {
      name: "Main",
      href: `${baseUrl}/`,
      disabled: false,
    },
    {
      name: "All",
      href: `${baseUrl}/ocs`,
      disabled: false,
    },
    {
      name: "Lore",
      href: `${baseUrl}/lore`,
      disabled: true,
    },
    {
      name: "Guest book",
      href: `${baseUrl}/guest-book`,
      disabled: false,
    },
  ];

  return (
    <div className={`navbar-wrapper ${isHidden ? "navbar-hidden" : ""}`}>
      <nav className="navbar">
        <div className="nav-bar-logo">
          <ButtonWrapper
            onClick={() =>
              (window.location.href = "https://itssammmm.carrd.co/")
            }
            hoverSoundFile={buttonSoundHover}
          >
            <img src={samLogoFull} alt="Logo" className="logo" />
          </ButtonWrapper>
        </div>

        <div className="nav-links-desktop">
          {menuItems.map((item) => (
            <ButtonWrapper
              key={item.name}
              onClick={() => !item.disabled && navigate(item.href)}
              hoverSoundFile={buttonSoundHover}
              soundFile={buttonSound}
              disabled={item.disabled}
            >
              <div
                className="glass-effect button-with-underline nav-button"
                style={{
                  opacity: item.disabled ? 0.5 : 1,
                  cursor: item.disabled ? "not-allowed" : "pointer",
                }}
              >
                {item.name}
              </div>
            </ButtonWrapper>
          ))}
        </div>
      </nav>
      <MusicPlayerControls />
    </div>
  );
};

export default Navbar;
