import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./NavBar.css";
import { baseUrl } from "../helpers/constants";
import samLogoFull from "../assets/sam_logo_full.webp";
import { MusicPlayerControls } from "../music-player/MusicPlayerControls";
import ButtonWrapper from "../common-components/ButtonWrapper";
import BugReportDialog from "../bug-report/BugReportDialog";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBookSkull,
  faBug,
  faBars,
  faEyeLowVision,
  faPepperHot,
  faHouse,
} from "@fortawesome/free-solid-svg-icons";
import { useSafeMode } from "../safe-mode/SafeModeContext";
import buttonSoundHover from "/sound-effect/button_hover.mp3";
import buttonSound from "/sound-effect/button_oc_slot.mp3";

const Navbar = () => {
  const navigate = useNavigate();
  const { isSafeModeEnabled, toggleSafeMode } = useSafeMode();
  const [isHidden, setIsHidden] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isBugReportOpen, setIsBugReportOpen] = useState(false);
  const logoMobileRef = useRef<HTMLDivElement>(null);
  const navbarRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Only start hiding once the user has scrolled past the logo + navbar.
      // The mobile logo is non-sticky (scrolls away), so its height plus the
      // navbar height is the distance you must scroll before the bar hides.
      const logoHeight = logoMobileRef.current?.offsetHeight ?? 0;
      const navbarHeight = navbarRef.current?.offsetHeight ?? 0;
      const hideThreshold = logoHeight + navbarHeight;

      if (currentScrollY < hideThreshold) {
        // Still within the logo/navbar region - keep navbar visible
        setIsHidden(false);
      } else if (currentScrollY > lastScrollY) {
        // Scrolled past them and going down - hide navbar
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
      if (
        !target.closest(".mobile-menu-container") &&
        !target.closest(".more-button")
      ) {
        setIsMobileMenuOpen(false);
      }
    };

    const handleScroll = () => {
      if (isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
      }
    };

    // Close on Escape and return focus to the toggle button (keyboard users)
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
        const moreButton =
          document.querySelector<HTMLButtonElement>(".more-button");
        moreButton?.focus();
      }
    };

    if (isMobileMenuOpen) {
      document.addEventListener("click", handleClickOutside);
      window.addEventListener("scroll", handleScroll);
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("click", handleClickOutside);
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isMobileMenuOpen]);

  // Main nav items (always visible in navbar)
  const mainMenuItems = [
    {
      name: "Main",
      href: `${baseUrl}/`,
      disabled: false,
      icon: faHouse,
    },
    {
      name: "All",
      href: `${baseUrl}/ocs`,
      disabled: false,
    },
    {
      name: "Height chart",
      href: `${baseUrl}/height-chart`,
      disabled: false,
    },
    {
      name: "Guest book",
      href: `${baseUrl}/guest-book`,
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

  const handleSafeModeClick = () => {
    toggleSafeMode();
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
      <div className="nav-bar-logo-mobile" ref={logoMobileRef}>
        <ButtonWrapper
          onClick={() => (window.location.href = "https://itssammmm.carrd.co/")}
          hoverSoundFile={buttonSoundHover}
        >
          <img src={samLogoFull} alt="Logo" className="logo" />
        </ButtonWrapper>
      </div>

      <div className={`navbar-wrapper ${isHidden ? "navbar-hidden" : ""}`}>
        <nav className="navbar" ref={navbarRef}>
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

          {/* Main nav links - always inline */}
          <div className="nav-links">
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
                  title={item.name}
                >
                  {item.icon ? (
                    <FontAwesomeIcon icon={item.icon} aria-label={item.name} />
                  ) : (
                    item.name
                  )}
                </div>
              </ButtonWrapper>
            ))}
          </div>

          {/* More button + dropdown */}
          <div className="mobile-menu-container">
            <ButtonWrapper
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              hoverSoundFile={buttonSoundHover}
              soundFile={buttonSound}
              className="more-button"
              tooltip="More menu"
              ariaHasPopup="menu"
              ariaExpanded={isMobileMenuOpen}
              ariaControls="nav-more-menu"
            >
              <div className="glass-effect button-with-underline nav-button">
                <FontAwesomeIcon icon={faBars} />
              </div>
            </ButtonWrapper>

            {/* Dropdown menu */}
            <div
              id="nav-more-menu"
              className={`mobile-dropdown ${isMobileMenuOpen ? "open" : ""}`}
            >
              {/* More menu items */}
              {moreMenuItems.map((item) => (
                <ButtonWrapper
                  key={item.name}
                  onClick={() => handleMoreItemClick(item.href, item.disabled)}
                  hoverSoundFile={buttonSoundHover}
                  soundFile={buttonSound}
                  disabled={item.disabled}
                  tooltip={item.name}
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
              {/* Safe Mode toggle */}
              <ButtonWrapper
                onClick={handleSafeModeClick}
                hoverSoundFile={buttonSoundHover}
                soundFile={buttonSound}
                tooltip={
                  isSafeModeEnabled
                    ? "Safe Mode on — switch to Spicy Mode"
                    : "Spicy Mode on — switch to Safe Mode"
                }
              >
                <div
                  className="glass-effect nav-button mobile-dropdown-item"
                  style={{
                    background: isSafeModeEnabled ? "#5bc0de" : "#ff4444",
                  }}
                >
                  {isSafeModeEnabled ? (
                    <FontAwesomeIcon icon={faEyeLowVision} />
                  ) : (
                    <FontAwesomeIcon icon={faPepperHot} />
                  )}
                </div>
              </ButtonWrapper>
              {/* Bug Report */}
              <ButtonWrapper
                onClick={handleBugReportClick}
                hoverSoundFile={buttonSoundHover}
                soundFile={buttonSound}
                tooltip="Bug Report"
              >
                <div className="glass-effect nav-button mobile-dropdown-item">
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
