import { Route } from "react-router-dom";
import { Routes } from "react-router-dom";
import { useEffect } from "react";
import "./App.css";
import Navbar from "./nav-bar/NavBar";
import PageOcList from "./page-oc-list/PageOcList";
import { baseUrl } from "./helpers/constants";
import PageDetail from "./page-detail/PageDetail";
import { Editor } from "./editor/Editor";
import "./background-sparkle/sparkles.css";
import { startContinuousSparkles } from "./background-sparkle/sparkles";
import ParallaxBlobBackground from "./background-parallax/parallax-blob-background";

function App() {
  useEffect(() => {
    startContinuousSparkles();
  }, []);

  return (
    <>
      <div className="parallax">
        <div className="parallax__layer parallax__layer--back">
          {/* Parallax background */}
          <ParallaxBlobBackground />
        </div>
        <div
          className="parallax__layer parallax__layer--sparkle debug"
          style={{ transform: "translateZ(-0.5px) scale(1.5)" }}
        >
          {/* Sparkles layer - between back and base */}
          <div id="sparkles-container"></div>
        </div>
        <div className="parallax__layer parallax__layer--base">
          <div>
            <Navbar />
          </div>
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
      </div>
    </>
  );
}

export default App;
