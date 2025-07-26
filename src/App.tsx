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
import "./background-sparkle/blobs.css";
import { startContinuousSparkles } from "./background-sparkle/sparkles";
import { addBlobs } from "./background-sparkle/blobs";

function App() {
  useEffect(() => {
    // startCon tinuousSparkles();
    addBlobs();
  }, []);

  return (
    <>
      <div>
        <Navbar />
      </div>
      <div className="page-container spark-background">
        <Routes>
          <Route path={`${baseUrl}/`} element={<div>Main Page</div>} />
          <Route path={`${baseUrl}/ocs`} element={<PageOcList />} />
          <Route path={`${baseUrl}/lore`} element={<div>Lore Page</div>} />
          <Route path={`${baseUrl}/search`} element={<div>Search Page</div>} />
          <Route path={`${baseUrl}/ocs/:slug`} element={<PageDetail />} />
          <Route path={`${baseUrl}/editor`} element={<Editor />} />
        </Routes>
      </div>
    </>
  );
}

export default App;
