import { useNavigate } from "react-router-dom";
import "./NavBar.css";
import { baseUrl } from "../helpers/constants";
import samLogo from "../assets/sam_logo.png";
import { MusicPlayerControls } from "../music-player/MusicPlayerControls";

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
          <button className="logo">
            <img
              src={samLogo}
              alt="Logo"
              className="logo"
              onClick={() =>
                (window.location.href = "https://itssammmm.carrd.co/")
              }
            />
          </button>
        </div>

        <div className="nav-links-desktop">
          {menuItems.map((item) => (
            <button
              className="button-with-underline nav-button"
              key={item.name}
              onClick={() => navigate(item.href)}
            >
              {item.name}
            </button>
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
