import { useState, useEffect } from "react";

// const countyData = await window.API.getAllUsers("county");

export default function Header({
  industryMode,
  setIndustryMode,
  mode,
  setMode,
}) {
  const [industries, setIndustries] = useState([]);

  useEffect(() => {
    async function getIndustryData() {
      try {
        const industryData = await window.API.getAllUsers("industry");
        setIndustries(industryData);
      } catch (err) {
        console.log("Error collecting Industry data: ", err);
      }
    }
    getIndustryData();
  }, []);

  function handleClick(industry) {
    setIndustryMode(industry);
    console.log("Selected industry:", industry);
  }

  return (
    <header className="w-full bg-base-100 shadow-md fixed top-0 left-0 z-50 h-24 ">
      <div className="flex flex-row space-x-3 mx-8">
        <button className=" btn bg-white hover:bg-primary hover:text-base-100 px-8 py-4 rounded-md">
          HOUSING COST
        </button>
        <button className="btn bg-white hover:bg-primary hover:text-base-100 px-8 py-4 rounded-md">
          INDUSTRY
        </button>
      </div>

      <div className="dropdown w-52">
        <button
          tabIndex={0}
          role="button"
          className="btn bg-white hover:bg-primary hover:text-base-100 w-full"
        >
          {!industryMode ? "Select Industry" : industryMode}
        </button>
        <ul
          tabIndex={0}
          className="dropdown-content menu bg-base-100 z-[1] w-52 p-2 shadow max-h-100"
        >
          {industries.map((item, index) => (
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
    </header>
  );
}
