import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./NavBar.css";
import { baseUrl } from "../helpers/constants";
import samLogo from "../assets/sam_logo.png";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
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
      {/* Navigation Bar */}
      <nav className="navbar">
        <div className="navbar-content">
          {/* Logo */}
          <div className="nav-bar-logo">
            <button className="logo">
              <img
                src={samLogo}
                alt="Logo"
                className="logo"
                onClick={() => navigate(`${baseUrl}/`)}
              />
            </button>
          </div>

          {/* Desktop Navigation Links */}
          <div className="nav-links-desktop">
            {menuItems.map((item) => (
              <button
                className="nav-button button-with-underline"
                key={item.name}
                onClick={() => navigate(item.href)}
              >
                {item.name}
              </button>
            ))}
          </div>

          {/* Mobile Menu Button */}
          <div className="mobile-menu-button">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="menu-toggle"
            >
              {isMenuOpen ? <span>👁</span> : <span>—</span>}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="mobile-menu">
            <div className="mobile-menu-content">
              {menuItems.map((item) => (
                <button
                  className="mobile-nav-button"
                  key={item.name}
                  onClick={() => {
                    navigate(item.href);
                    setIsMenuOpen(false);
                  }}
                >
                  {item.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </nav>
    </div>
  );
};

export default Navbar;
