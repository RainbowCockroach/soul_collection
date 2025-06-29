import "./App.css";
import { Routes, Route } from "react-router-dom";
import Navbar from "./nav-bar/nav-bar";
import PageOcList from "./page-all/page-all";

function App() {
  return (
    <>
      <div className="page-container debug">
        <div className="debug">
          <Navbar />
        </div>
        <div className="debug">
          <Routes>
            <Route path="/" element={<div>Main Page</div>} />
            <Route path="/ocs" element={<PageOcList />} />
            <Route path="/lore" element={<div>Lore Page</div>} />
            <Route path="/search" element={<div>Search Page</div>} />
          </Routes>
        </div>
      </div>
    </>
  );
}

export default App;
