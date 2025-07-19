import { Route } from "react-router-dom";
import { Routes } from "react-router-dom";
import "./App.css";
import Navbar from "./nav-bar/NavBar";
import PageOcList from "./page-oc-list/PageOcList";
import { baseUrl } from "./helpers/constants";
import PageDetail from "./page-detail/PageDetail";
import { Editor } from "./editor/Editor";
import Sparkle from "react-sparkle";

function App() {
  return (
    <>
      <div
        className="page-container"
        style={{ position: "absolute", zIndex: 1000 }}
      >
        <Sparkle
          color="#f3e9ff"
          count={300}
          minSize={3}
          maxSize={20}
          overflowPx={50}
          fadeOutSpeed={8}
          flicker={false}
          flickerSpeed="slow"
        />
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
    </>
  );
}

export default App;
