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

function App() {
  useEffect(() => {
    startContinuousSparkles();
  }, []);

  return (
    <>
      <div>
        <Navbar />
      </div>
      <div className="page-container">
        <Routes>
          <Route path={`${baseUrl}/`} element={<div>Main Page</div>} />
          <Route path={`${baseUrl}/ocs`} element={<PageOcList />} />
          <Route path={`${baseUrl}/lore`} element={<div>Lore Page</div>} />
          <Route path={`${baseUrl}/search`} element={<div>Search Page</div>} />
          <Route path={`${baseUrl}/ocs/:slug`} element={<PageDetail />} />
          <Route path={`${baseUrl}/editor`} element={<Editor />} />
        </Routes>
      </div>
      <div className="sparkle-background"></div>
      <div className="background-blob"></div>
      <div className="decorative-frame-left"></div>
      <div className="decorative-frame-right"></div>
    </>
  );
}

export default App;
