import { useState, useEffect } from "react";

function App() {
  const [counties, setCounties] = useState([]);

  useEffect(() => {
    const fetchCountyData = async () => {
      try {
        const countyData = await window.API.getAllUsers("county");
        setCounties(countyData);
        console.log(countyData);
      } catch (err) {
        console.error("Error fetching counties:", err);
      }
    };
    fetchCountyData();
  }, []);

  return (
    <>
      <h1 className="text-4xl font-bold text-blue-600 my-4">Hello There</h1>
    </>
  );
}

export default App;
