import { useState, useEffect } from "react";
import Header from "./components/Header";

function App() {
  const [industryMode, setIndustryMode] = useState("");
  const [mode, setMode] = useState("cost");
  return (
    <div data-theme="autumn" className="bg-white min-h-screen">
      <Header
        industryMode={industryMode}
        setIndustryMode={setIndustryMode}
        mode={mode}
        setMode={setMode}
      />
    </div>
  );
}

export default App;
