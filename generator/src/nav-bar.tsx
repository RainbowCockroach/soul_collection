import { useState } from "react";
import "./nav-bar.css";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuItems = [
    {
      name: "Main",
      href: "/",
    },
    {
      name: "All",
      href: "/ocs",
    },
    {
      name: "Lore",
      href: "/lore",
    },
    {
      name: "Search",
      href: "/search",
    },
  ];

  return (
    <div className="page-container">
      {/* Navigation Bar */}
      <nav className="navbar">
        <div className="navbar-container">
          <div className="navbar-content">
            {/* Logo */}
            <div className="logo-container">
              <button className="logo">Logo</button>
            </div>

            {/* Desktop Navigation Links */}
            <div className="nav-links-desktop">
              {menuItems.map((item) => (
                <button className="nav-button" key={item.name}>
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
                <svg className="menu-icon" fill="none" viewBox="0 0 24 24">
                  {isMenuOpen ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  ) : (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  )}
                </svg>
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="mobile-menu">
              <div className="mobile-menu-content">
                {menuItems.map((item) => (
                  <button className="mobile-nav-button" key={item.name}>
                    {item.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </nav>
    </div>
  );
};

export default Navbar;
