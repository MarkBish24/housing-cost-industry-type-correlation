import { useRef, useState, useEffect } from "react";
import * as d3 from "d3";
import Loading from "../LoadingScreen";

export default function IndustryBarChart({
  industryHousingData,
  year,
  industryMode,
  width,
  height,
}) {
  const [data, setData] = useState([]);
  const svgRef = useRef();

  useEffect(() => {
    if (!industryHousingData) return;

    let filtered = industryHousingData;

    filtered = filtered.filter(
      (d) => Number(d.year) === Number(year) && d.industry_name === industryMode
    );

    filtered = filtered
      .sort((a, b) => b.workers_per_mil - a.workers_per_mil)
      .slice(0, 10);

    setData(filtered);
    console.log(data);

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const margin = { top: 30, right: 60, bottom: 40, left: 60 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const g = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);
  }, [industryHousingData, year, industryMode]);
}
