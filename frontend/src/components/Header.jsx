import { useState, useEffect } from "react";

// const countyData = await window.API.getAllUsers("county");

export default function Header({
  industryMode,
  setIndustryMode,
  mode,
  setMode,
  year,
  setYear,
}) {
  const [industryTitles, setIndustryTitles] = useState([]);

  //Used only to get the titles of the Industry data, doesn't actually have any data associated with it

  useEffect(() => {
    async function getIndustryData() {
      try {
        const industryData = await window.API.getAllUsers("industry");
        setIndustryTitles(industryData);
      } catch (err) {
        console.log("Error collecting Industry data: ", err);
      }
    }
    getIndustryData();
  }, []);

  // Changes the industryMode/ type of industry for example (Total Farm)

  function handleClick(industry) {
    setIndustryMode(industry);
    console.log("Selected industry:", industry);
  }

  const inactiveButton =
    "btn bg-white hover:bg-primary hover:text-base-100 px-8 py-4 rounded-md";
  const activeButton = "btn bg-primary text-base-100 px-8 py-4 rounded-md";

  return (
    <header className="w-full bg-base-100/75 backdrop-blur-md shadow-md fixed top-0 left-0 z-50 h-24 ">
      {/* Button that switches from house mode to industry mode */}
      <div className="h-full flex flex-row justify-between items-center px-16">
        <div className="flex flex-row space-x-3 mx-8">
          <button
            className={mode === "cost" ? activeButton : inactiveButton}
            onClick={() => setMode("cost")}
          >
            HOUSING COST
          </button>
          <button
            className={mode === "industry" ? activeButton : inactiveButton}
            onClick={() => setMode("industry")}
          >
            INDUSTRY
          </button>
        </div>

        {/* Set's a Year slider to change the years */}

        <div className="w-1/3 flex flex-col items-center space-y-4">
          <label className="text-xl font-semibold">{year}</label>
          <input
            type="range"
            min={2010}
            max={2024}
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="range range-primary w-3/4"
          />
        </div>

        {/* Drop down menu to change the industry type from a list of options */}

        <div
          className={`dropdown w-52 ${
            mode === "cost" ? "pointer-events-none opacity-50" : ""
          }`}
        >
          <button
            tabIndex={0}
            role="button"
            className="btn bg-white hover:bg-primary hover:text-base-100 w-full"
          >
            {!industryMode ? "Select Industry" : industryMode}
          </button>
          <ul
            tabIndex={0}
            className="dropdown-content menu bg-base-100 z-[1] w-52 p-2 shadow max-h-64 overflow-y-auto"
          >
            {industryTitles.map((item, index) => (
              <li
                key={item.industry_id}
                className="text-secondary hover:text-primary p-2"
              >
                <button onClick={() => handleClick(item.industry_name)}>
                  {item.industry_name}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </header>
  );
}
