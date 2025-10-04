import { useRef, useEffect } from "react";
import Loading from "../LoadingScreen";
import * as d3 from "d3";
import { formatPrice } from "../../utils/format.js";

export default function ScatterPlot({
  industryHousingData,
  industryMode,
  width,
  height,
}) {
  const svgRef = useRef();
  const tooltipRef = useRef();

  useEffect(() => {
    if (!industryHousingData) return;

    let filtered = industryHousingData;

    const data = filtered.filter(
      (d) =>
        d.industry_name === industryMode &&
        d.housing_cost !== null &&
        d.workers_per_mil !== null
    );

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
      .call(d3.axisBottom(x).ticks(5));

    g.append("g").call(d3.axisLeft(y));

    const tooltip = d3.select(tooltipRef.current);

    // Points
    g.selectAll("circle")
      .data(data)
      .join("circle")
      .attr("cx", (d) => x(d.housing_cost))
      .attr("cy", (d) => y(d.workers_per_mil))
      .attr("r", 5)
      .attr("fill", "steelblue")
      .attr("opacity", 0.7)
      .on("mouseover", function (event, d) {
        d3.select(this)
          .transition()
          .duration(100)
          .ease(d3.easeCubicOut)
          .attr("fill", "red")
          .attr("r", 7)
          .style("cursor", "pointer");

        tooltip.style("opacity", 1).html(
          `
          <strong>${d.industry_name}</strong><br/>
            Year: ${d.year}<br/>
            Housing Cost: ${formatPrice(d.housing_cost)}<br/>
            Workers: ${d.workers_per_mil} <br/>
            County: ${d.county_name} <br/>
          `
        );
      })
      .on("mousemove", function (event) {
        tooltip
          .style("left", event.pageX + 15 + "px")
          .style("top", event.pageY - 30 + "px");
      })
      .on("mouseleave", function () {
        tooltip.style("opacity", 0);
        d3.select(this)
          .transition()
          .duration(100)
          .ease(d3.easeCubicOut)
          .attr("fill", "steelblue")
          .attr("r", 5);
      });

    //Labels
  }, [industryHousingData, industryMode]);

  return !industryHousingData || !industryMode ? (
    <Loading width={width} height={height} />
  ) : (
    <>
      <svg ref={svgRef} width={width} height={height} />
      <div
        ref={tooltipRef}
        className="absolute opacity-0  bg-white border border-gray-300 rounded-lg px-2 py-1.5 pointer-events-none text-xs shadow-md"
      ></div>
    </>
  );
}
