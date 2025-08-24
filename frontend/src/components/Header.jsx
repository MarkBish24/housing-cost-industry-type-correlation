import { useState, useEffect } from "react";

// const countyData = await window.API.getAllUsers("county");

export default function Header({ industryMode, setIndustryMode }) {
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
    <header className="w-full shadow-md fixed top-0 left-0 z-50 h-24">
      <div className="dropdown">
        <button tabIndex={0} role="button" className="btn ">
          {!industryMode ? "Select Industry" : industryMode}
        </button>
        <ul
          tabIndex={0}
          className="dropdown-content menu bg-base-100 rounded-box z-[1] w-52 p-2 shadow max-h-100"
        >
          {industries.map((item, index) => (
            <li key={item.industry_id} className="p-2">
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
