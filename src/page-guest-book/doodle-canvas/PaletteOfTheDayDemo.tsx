import type React from "react";
import { DoodleCanvas } from "./DoodleCanvas";

const PaletteOfTheDayDemo: React.FC = () => (
  <div style={{ padding: "24px" }}>
    <h1>Doodle Canvas POC</h1>
    <DoodleCanvas />
  </div>
);

export default PaletteOfTheDayDemo;
