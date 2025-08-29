import { useRef, useState, useEffect } from "react";
import * as d3 from "d3";

export default function MultiLineChart({
  industryMode,
  county,
  industryHousingData,
}) {
  const [data, setData] = useState([]);
  const svgRef = useRef();

  const width = 600;
  const height = 400;

  useEffect(() => {
    if (!industryHousingData || !industryMode || !county) return;

    let filtered = industryHousingData;

    filtered = filtered.filter(
      (d) => d.county_name === county && d.industry_name === industryMode
    );

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

    const parseYear = d3.timeParse("%Y");
    const dataProcessed = data.map((d) => ({
      ...d,
      year: parseYear(d.year),
      housing_cost: +d.housing_cost,
      workers: +d.workers_per_mil,
    }));
  }, [industryHousingData, industryMode, county, industryMode]);

  return <div></div>;
}
