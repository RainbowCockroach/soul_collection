import { Route } from "react-router-dom";
import { Routes } from "react-router-dom";
import "./App.css";
import Navbar from "./nav-bar/NavBar";
import PageOcList from "./page-oc-list/PageOcList";
import { baseUrl } from "./misc/constants";
import PageDetail from "./page-detail/PageDetail";

function App() {
  return (
    <>
      <div className="page-container debug">
        <div className="debug">
          <Navbar />
        </div>
        <div className="debug">
          <Routes>
            <Route path={`${baseUrl}/`} element={<div>Main Page</div>} />
            <Route path={`${baseUrl}/ocs`} element={<PageOcList />} />
            <Route path={`${baseUrl}/lore`} element={<div>Lore Page</div>} />
            <Route
              path={`${baseUrl}/search`}
              element={<div>Search Page</div>}
            />
            <Route path={`${baseUrl}/ocs/:ocSlug`} element={<PageDetail />} />
          </Routes>
        </div>
      </div>
    </>
  );
}

export default App;
