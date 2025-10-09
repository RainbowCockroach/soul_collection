import { useNavigate } from "react-router-dom";
import "./NavBar.css";
import { baseUrl } from "../helpers/constants";
import samLogo from "../assets/sam_logo.png";
import { MusicPlayerControls } from "../music-player/MusicPlayerControls";
import ButtonWrapper from "../common-components/ButtonWrapper";

const Navbar = () => {
  const navigate = useNavigate();
  const menuItems = [
    {
      name: "Main",
      href: `${baseUrl}/`,
    },
    {
      name: "All",
      href: `${baseUrl}/ocs`,
    },
    {
      name: "Lore",
      href: `${baseUrl}/lore`,
    },
    {
      name: "Search",
      href: `${baseUrl}/search`,
    },
  ];

  return (
    <div>
      <nav className="navbar">
        <div className="nav-bar-logo">
          <ButtonWrapper
            onClick={() =>
              (window.location.href = "https://itssammmm.carrd.co/")
            }
          >
            <img src={samLogo} alt="Logo" className="logo" />
          </ButtonWrapper>
        </div>

        <div className="nav-links-desktop">
          {menuItems.map((item) => (
            <ButtonWrapper
              key={item.name}
              onClick={() => navigate(item.href)}
            >
              <div className="button-with-underline nav-button">
                {item.name}
              </div>
            </ButtonWrapper>
          ))}
        </div>

        <div className="navbar-music-player">
          <MusicPlayerControls />
        </div>
      </nav>
    </div>
  );
};

export default Navbar;
