import { Route } from "react-router-dom";
import { Routes } from "react-router-dom";
import { useEffect, useRef } from "react";
import "./App.css";
import Navbar from "./nav-bar/NavBar";
import PageOcList from "./page-oc-list/PageOcList";
import { baseUrl } from "./helpers/constants";
import PageDetail from "./page-detail/PageDetail";
import { Editor } from "./editor/Editor";
import "./background-sparkle/sparkles.css";
import { startContinuousSparkles } from "./background-sparkle/sparkles";

function App() {
  const frontElementsRef = useRef<HTMLDivElement>(null);
  const backgroundBlobRef = useRef<HTMLDivElement>(null);
  const decorativeLeftRef = useRef<HTMLDivElement>(null);
  const decorativeRightRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    startContinuousSparkles();
  }, []);

  useEffect(() => {
    console.log("Setting up scroll listener");
    
    const backgroundEls = [
      backgroundBlobRef.current,
      decorativeLeftRef.current,
      decorativeRightRef.current,
    ].filter(Boolean);

    console.log("Background elements found:", backgroundEls.length);
    backgroundEls.forEach((el, i) => {
      console.log(`Element ${i}:`, el?.className);
    });

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

    const handleScroll = () => {
      const scrollY = window.scrollY || document.documentElement.scrollTop;
      const scrollX = window.scrollX || document.documentElement.scrollLeft;
      
      console.log("Scroll event - Y:", scrollY, "X:", scrollX);

      backgroundEls.forEach((el, i) => {
        if (el) {
          const transform = `translate(${-scrollX * 0.5}px, ${-scrollY * 0.5}px)`;
          console.log(`Applying transform to element ${i}:`, transform);
          el.style.transform = transform;
        }
      });
    };

    // Initial setup
    updateBackgroundHeight();
    
    // Update height when content changes
    const resizeObserver = new ResizeObserver(() => {
      updateBackgroundHeight();
    });
    resizeObserver.observe(document.body);

    window.addEventListener("scroll", handleScroll, { passive: true });
    
    // Test initial call
    handleScroll();

    return () => {
      console.log("Removing scroll listener");
      window.removeEventListener("scroll", handleScroll);
      resizeObserver.disconnect();
    };
  }, []);

  return (
    <>
      <div>
        {/* Front elements */}
        <div ref={frontElementsRef}>
          <Navbar />
          <div className="page-container">
            <Routes>
              <Route path={`${baseUrl}/`} element={<div>Main Page</div>} />
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
        <div ref={backgroundBlobRef} className="background-blob debug"></div>
        <div ref={decorativeLeftRef} className="decorative-frame-left"></div>
        <div ref={decorativeRightRef} className="decorative-frame-right"></div>
      </div>
    </>
  );
}

export default App;
