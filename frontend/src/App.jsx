import { useState, useEffect } from "react";
import Header from "./components/Header";
import CountyMap from "./components/CountyMap";

function App() {
  const [industryMode, setIndustryMode] = useState("");
  const [mode, setMode] = useState("cost");
  const [year, setYear] = useState(2010);
  const [geoData, setGeoData] = useState(null);

  useEffect(() => {
    fetch("/California_County_Boundaries.json")
      .then((res) => res.json())
      .then((data) => setGeoData(data))
      .catch((err) => console.error("Error loading GeoJSON:", err));
  }, []);

  return (
    <div data-theme="autumn" className="bg-white min-h-screen px-6 pt-32">
      <Header
        industryMode={industryMode}
        setIndustryMode={setIndustryMode}
        mode={mode}
        setMode={setMode}
        year={year}
        setYear={setYear}
      />
      <CountyMap
        geoData={geoData}
        year={year}
        mode={mode}
        industryMode={industryMode}
      />
    </div>
  );
}

export default App;
