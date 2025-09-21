import { Route, Routes, useLocation } from "react-router-dom";
import { useEffect, useRef } from "react";
import "./App.css";
import Navbar from "./nav-bar/NavBar";
import PageOcList from "./page-oc-list/PageOcList";
import { baseUrl } from "./helpers/constants";
import PageDetail from "./page-detail/PageDetail";
import { Editor } from "./editor/Editor";
import "./background-sparkle/sparkles.css";
import { startContinuousSparkles } from "./background-sparkle/sparkles";
import PageMain from "./page-main/PageMain";
import SamPopup from "./page-main/SamPopUp";
import { MusicPlayerProvider } from "./music-player/MusicPlayerContext";
import StarryTrail from "./common-components/StarryTrail";

function App() {
  const location = useLocation();
  const frontElementsRef = useRef<HTMLDivElement>(null);
  const backgroundBlobRef = useRef<HTMLDivElement>(null);
  const decorativeLeftRef = useRef<HTMLDivElement>(null);
  const decorativeRightRef = useRef<HTMLDivElement>(null);
  const pageContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    startContinuousSparkles();
  }, []);

  // Update background height after Routes render
  useEffect(() => {
    const backgroundEls = [
      backgroundBlobRef.current,
      decorativeLeftRef.current,
      decorativeRightRef.current,
    ].filter(Boolean);

    if (backgroundEls.length === 0) return;

    const updateBackgroundHeight = () => {
      const documentHeight = Math.max(
        document.body.scrollHeight,
        document.documentElement.scrollHeight,
        document.body.offsetHeight,
        document.documentElement.offsetHeight
      );

      backgroundEls.forEach((el) => {
        if (el) {
          el.style.height = `${documentHeight}px`;
        }
      });
    };

    // Initial update with double RAF for DOM updates
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        updateBackgroundHeight();
      });
    });

    // Set up ResizeObserver to watch for content changes
    const resizeObserver = new ResizeObserver(() => {
      requestAnimationFrame(updateBackgroundHeight);
    });

    // Observe the document body for size changes
    resizeObserver.observe(document.body);

    // Also listen for window resize
    const handleResize = () => {
      requestAnimationFrame(updateBackgroundHeight);
    };
    window.addEventListener("resize", handleResize);

    // Cleanup function
    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", handleResize);
    };
  }, [location.pathname]); // Re-run when route changes

  useEffect(() => {
    const backgroundEls = [
      backgroundBlobRef.current,
      decorativeLeftRef.current,
      decorativeRightRef.current,
    ].filter(Boolean);

    if (backgroundEls.length === 0) return;

    const handleScroll = () => {
      const scrollY = window.scrollY || document.documentElement.scrollTop;
      const scrollX = window.scrollX || document.documentElement.scrollLeft;

      backgroundEls.forEach((el) => {
        if (el) {
          const transform = `translate(${-scrollX * 0.5}px, ${
            -scrollY * 0.5
          }px)`;
          el.style.transform = transform;
        }
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    // Test initial call
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <MusicPlayerProvider>
      <div>
        {/* Front elements */}
        <div ref={frontElementsRef}>
          <Navbar />
          <div id="page-container" ref={pageContainerRef}>
            <Routes>
              <Route path={`${baseUrl}/`} element={<PageMain />} />
              <Route path={`${baseUrl}/ocs`} element={<PageOcList />} />
              <Route path={`${baseUrl}/lore`} element={<div>Lore Page</div>} />
              <Route
                path={`${baseUrl}/search`}
                element={<div>Search Page</div>}
              />
              <Route path={`${baseUrl}/ocs/:slug`} element={<PageDetail />} />
              <Route path={`${baseUrl}/editor`} element={<Editor />} />
            </Routes>
          </div>
        </div>
        {/* Keep this div untouched */}
        <div className="sparkle-background"></div>
        {/* Background elements that needs scrolling */}
        <div ref={backgroundBlobRef} className="background-blob"></div>
        <div ref={decorativeLeftRef} className="decorative-frame-left"></div>
        <div ref={decorativeRightRef} className="decorative-frame-right"></div>
      </div>

      <StarryTrail />
      <SamPopup />
    </MusicPlayerProvider>
  );
}

export default App;
