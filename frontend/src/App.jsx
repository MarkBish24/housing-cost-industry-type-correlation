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
      <h1>Hello There</h1>
    </>
  );
}

export default App;
