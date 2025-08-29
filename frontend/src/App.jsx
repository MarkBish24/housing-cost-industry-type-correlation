import { useState, useEffect } from "react";
import Header from "./components/Header";
import CountyMap from "./components/CountyMap";
import MultiLineChart from "./components/MultiLineChart";

function App() {
  // Selections for filtering data

  const [industryMode, setIndustryMode] = useState("");
  const [mode, setMode] = useState("cost");
  const [year, setYear] = useState("2010");
  const [highlightedCounty, setHighlightedCounty] = useState(null);

  // Data

  const [geoData, setGeoData] = useState(null);
  const [housingData, setHousingData] = useState(null);
  const [industryWorkersData, setIndustryWorkersData] = useState(null);
  const [industryHousingData, setIndustryHousingData] = useState(null);

  // Fetches all the Data from the SQL data base so it will be cached so we don't have to do multiple pull requests
  // at most 30,000 rows

  useEffect(() => {
    fetch("/California_County_Boundaries.json")
      .then((res) => res.json())
      .then((data) => setGeoData(data))
      .catch((err) => console.error("Error loading GeoJSON:", err));

    async function fetchData() {
      try {
        const [housing, workers, housingWorkers] = await Promise.all([
          window.API.getViewData("housing_view"),
          window.API.getViewData("industry_workers_view"),
          window.API.getViewData("industry_housing_view"),
        ]);

        setHousingData(housing);
        setIndustryWorkersData(workers);
        setIndustryHousingData(housingWorkers);
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    }

    fetchData();
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
        housingData={housingData}
        industryWorkersData={industryWorkersData}
        highlightedCounty={highlightedCounty}
        setHighlightedCounty={setHighlightedCounty}
      />
      <MultiLineChart
        industryHousingData={industryHousingData}
        county={highlightedCounty}
        industryMode={industryMode}
      />
    </div>
  );
}

export default App;
