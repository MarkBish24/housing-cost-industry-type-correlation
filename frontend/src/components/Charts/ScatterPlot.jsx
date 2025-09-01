import { useRef, useEffect } from "react";
import Loading from "../LoadingScreen";
import * as d3 from "d3";

export default function ScatterPlot({
  industryHousingData,
  industryMode,
  width,
  height,
}) {
  const svgRef = useRef();

  useEffect(() => {
    if (!industryHousingData) return;

    let filtered = industryHousingData;

    const data = filtered.filter((d) => d.industry_name === industryMode);

    // setting up box
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const margin = { top: 30, right: 60, bottom: 40, left: 60 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const g = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // X & Y scales
    const x = d3
      .scaleLinear()
      .domain([0, d3.max(data, (d) => +d.housing_cost)])
      .nice()
      .range([0, innerWidth]);

    const y = d3
      .scaleLinear()
      .domain([0, d3.max(data, (d) => +d.workers_per_mil)])
      .nice()
      .range([innerHeight, 0]);

    // Axes
    g.append("g")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(d3.axisBottom(x));

    g.append("g").call(d3.axisLeft(y));

    // Points
    g.selectAll("circle")
      .data(data)
      .join("circle")
      .attr("cx", (d) => x(d.housing_cost))
      .attr("cy", (d) => y(d.workers_per_mil))
      .attr("r", 5)
      .attr("fill", "steelblue")
      .attr("opacity", 0.7);

    //Labels
  }, [industryHousingData, industryMode]);

  return !industryHousingData || !industryMode ? (
    <Loading width={width} height={height} />
  ) : (
    <svg ref={svgRef} width={width} height={height} />
  );
}
