import { useState, useEffect } from "react";
import Header from "./components/Header";
import ChartSelection from "./components/ChartSelection.jsx";
import Loading from "./components/LoadingScreen.jsx";

// charts
import CountyMap from "./components/Charts/CountyMap.jsx";
import MultiLineChart from "./components/Charts/MultiLineChart.jsx";
import IndustryBarChart from "./components/Charts/IndustryBarCharts.jsx";
import ScatterPlot from "./components/Charts/ScatterPlot.jsx";
import BubbleChart from "./components/Charts/BubbleChart.jsx";

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

  //chart selection

  const [selectedCharts, setSelectedCharts] = useState([
    "Line Chart",
    "Line Chart",
  ]);

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

  // side squares sizes
  const width = 500;
  const height = 275;

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
      <div className="flex flex-row gap-4 items-center justify-between">
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
        <div className="flex flex-col gap-4 items-center justify-between">
          <div>
            <ChartSelection
              slotIndex={0}
              selectedCharts={selectedCharts}
              setSelectedCharts={setSelectedCharts}
            />
            {renderChart(selectedCharts[0], {
              industryHousingData,
              industryWorkersData,
              housingData,
              county: highlightedCounty,
              industryMode,
              width,
              height,
              year,
            })}
          </div>
          <div>
            <ChartSelection
              slotIndex={1}
              selectedCharts={selectedCharts}
              setSelectedCharts={setSelectedCharts}
            />
            {renderChart(selectedCharts[1], {
              industryHousingData,
              industryWorkersData,
              housingData,
              county: highlightedCounty,
              industryMode,
              width,
              height,
              year,
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function renderChart(type, props) {
  switch (type) {
    case "Line Chart":
      return <MultiLineChart {...props} />;
    case "Bar Chart":
      return <IndustryBarChart {...props} />;
    case "Scatter Plot":
      return <ScatterPlot {...props} />;
    case "Bubble Chart":
      return <BubbleChart {...props} />;
    case "Box Plot":
      return <div>TODO: BoxPlot Component</div>;
    case "Violin Plot":
      return <div>TODO: ViolinPlot Component</div>;
    default:
      return <Loading width={width} height={height} />;
  }
}

export default App;
