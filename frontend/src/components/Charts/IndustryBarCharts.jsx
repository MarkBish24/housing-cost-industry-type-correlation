import { useRef, useState, useEffect } from "react";
import * as d3 from "d3";
import Loading from "../LoadingScreen";
import {
  formatPrice,
  interpolatedHousingColorScale,
} from "../../utils/format.js";

export default function IndustryBarChart({
  industryHousingData,
  year,
  industryMode,
  width,
  height,
}) {
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

    const data = filtered;
    console.log(data);

    // setting up box
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const margin = { top: 30, right: 60, bottom: 40, left: 60 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const g = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // rectangles - bars

    const x = d3
      .scaleBand()
      .domain(data.map((d) => d.county_name))
      .range([0, innerWidth])
      .padding(0.1);

    const y = d3
      .scaleLinear()
      .domain([0, d3.max(data, (d) => +d.workers_per_mil)])
      .nice()
      .range([innerHeight, 0]);

    g.selectAll("rect")
      .data(data)
      .join("rect")
      .attr("x", (d) => x(d.county_name))
      .attr("y", (d) => y(d.workers_per_mil))
      .attr("width", x.bandwidth())
      .attr("height", (d) => innerHeight - y(d.workers_per_mil))
      .attr("fill", (d) => interpolatedHousingColorScale(d.housing_cost));

    // axes

    g.append("g")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(
        d3.axisBottom(x).tickFormat((d) => {
          const parts = d.split(" ");
          let label = parts.slice(0, -1).join(" ");
          if (label.length > 9) label = label.slice(0, 6) + "…"; // truncate
          return label;
        })
      );

    g.append("g").call(d3.axisLeft(y));
  }, [industryHousingData, year, industryMode]);

  return !industryHousingData ? (
    <Loading width={width} height={height} />
  ) : (
    <svg ref={svgRef} width={width} height={height} />
  );
}
