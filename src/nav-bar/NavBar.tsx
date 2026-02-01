import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./NavBar.css";
import { baseUrl } from "../helpers/constants";
import samLogoFull from "../assets/sam_logo_full.webp";
import { MusicPlayerControls } from "../music-player/MusicPlayerControls";
import ButtonWrapper from "../common-components/ButtonWrapper";
import BugReportDialog from "../bug-report/BugReportDialog";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBookSkull, faBug } from "@fortawesome/free-solid-svg-icons";
import buttonSoundHover from "/sound-effect/button_hover.mp3";
import buttonSound from "/sound-effect/button_oc_slot.mp3";

const Navbar = () => {
  const navigate = useNavigate();
  const [isHidden, setIsHidden] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isBugReportOpen, setIsBugReportOpen] = useState(false);

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
  // Close mobile menu when clicking outside or scrolling
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest(".mobile-menu-container") && !target.closest(".more-button")) {
        setIsMobileMenuOpen(false);
      }
    };

    const handleScroll = () => {
      if (isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
      }
    };

    if (isMobileMenuOpen) {
      document.addEventListener("click", handleClickOutside);
      window.addEventListener("scroll", handleScroll);
    }

    return () => {
      document.removeEventListener("click", handleClickOutside);
      window.removeEventListener("scroll", handleScroll);
    };
  }, [isMobileMenuOpen]);

  // Main nav items (always visible in navbar)
  const mainMenuItems = [
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
      name: "Guest book",
      href: `${baseUrl}/guest-book`,
      disabled: false,
    },
    {
      name: "Height chart",
      href: `${baseUrl}/height-chart`,
      disabled: false,
    },
  ];

  // Items that go in the "More" dropdown
  const moreMenuItems = [
    {
      name: "Lore",
      href: `${baseUrl}/lore`,
      disabled: true,
      icon: faBookSkull,
    },
  ];

  const handleBugReportClick = () => {
    setIsBugReportOpen(true);
    setIsMobileMenuOpen(false);
  };

  const handleMoreItemClick = (href: string, disabled: boolean) => {
    if (!disabled) {
      navigate(href);
      setIsMobileMenuOpen(false);
    }
  };

  return (
    <>
      {/* Mobile-only logo at top (non-sticky) */}
      <div className="nav-bar-logo-mobile">
        <ButtonWrapper
          onClick={() =>
            (window.location.href = "https://itssammmm.carrd.co/")
          }
          hoverSoundFile={buttonSoundHover}
        >
          <img src={samLogoFull} alt="Logo" className="logo" />
        </ButtonWrapper>
      </div>

      <div className={`navbar-wrapper ${isHidden ? "navbar-hidden" : ""}`}>
        <nav className="navbar">
          {/* Desktop-only logo inside navbar */}
          <div className="nav-bar-logo nav-bar-logo-desktop">
            <ButtonWrapper
              onClick={() =>
                (window.location.href = "https://itssammmm.carrd.co/")
              }
              hoverSoundFile={buttonSoundHover}
            >
              <img src={samLogoFull} alt="Logo" className="logo" />
            </ButtonWrapper>
          </div>

          {/* Desktop nav links */}
          <div className="nav-links-desktop">
            {mainMenuItems.map((item) => (
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
            {/* More menu items - desktop only */}
            {moreMenuItems.map((item) => (
              <ButtonWrapper
                key={item.name}
                onClick={() => !item.disabled && navigate(item.href)}
                hoverSoundFile={buttonSoundHover}
                soundFile={buttonSound}
                disabled={item.disabled}
                className="more-menu-item-desktop"
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
            {/* Bug Report button - desktop only */}
            <ButtonWrapper
              onClick={handleBugReportClick}
              hoverSoundFile={buttonSoundHover}
              soundFile={buttonSound}
              className="bug-report-nav-button-desktop"
            >
              <div className="glass-effect button-with-underline nav-button">
                Bug Report
              </div>
            </ButtonWrapper>
          </div>

          {/* Mobile: More button */}
          <div className="mobile-menu-container">
            <ButtonWrapper
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              hoverSoundFile={buttonSoundHover}
              soundFile={buttonSound}
              className="more-button"
            >
              <div className="glass-effect button-with-underline nav-button">
                More
              </div>
            </ButtonWrapper>

            {/* Mobile dropdown menu */}
            <div className={`mobile-dropdown ${isMobileMenuOpen ? "open" : ""}`}>
              {/* More menu items */}
              {moreMenuItems.map((item) => (
                <ButtonWrapper
                  key={item.name}
                  onClick={() => handleMoreItemClick(item.href, item.disabled)}
                  hoverSoundFile={buttonSoundHover}
                  soundFile={buttonSound}
                  disabled={item.disabled}
                >
                  <div
                    className="glass-effect nav-button mobile-dropdown-item"
                    style={{
                      opacity: item.disabled ? 0.5 : 1,
                      cursor: item.disabled ? "not-allowed" : "pointer",
                    }}
                    title={item.name}
                  >
                    <FontAwesomeIcon icon={item.icon} />
                  </div>
                </ButtonWrapper>
              ))}
              {/* Bug Report */}
              <ButtonWrapper
                onClick={handleBugReportClick}
                hoverSoundFile={buttonSoundHover}
                soundFile={buttonSound}
              >
                <div className="glass-effect nav-button mobile-dropdown-item" title="Bug Report">
                  <FontAwesomeIcon icon={faBug} />
                </div>
              </ButtonWrapper>
            </div>
          </div>
        </nav>
      </div>
      <MusicPlayerControls />

      {/* Bug Report Dialog */}
      <BugReportDialog
        isOpen={isBugReportOpen}
        onClose={() => setIsBugReportOpen(false)}
      />
    </>
  );
};

export default Navbar;
