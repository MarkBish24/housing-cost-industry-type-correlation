import { useEffect, useRef, useState, useMemo } from "react";
import { ZoomOut } from "lucide-react";
import * as d3 from "d3";

import { formatPrice, interpolatedHousingColorScale } from "../../utils/format";
import Loading from "../LoadingScreen";

export default function BubbleChart({
  year,
  county,
  industryMode,
  industryHousingData,
  width,
  height,
}) {
  const svgRef = useRef();
  const tooltipRef = useRef();

  useEffect(() => {
    if (!industryHousingData || !industryMode || !year) return;

    let filtered = industryHousingData
      .filter(
        (d) =>
          Number(d.year) === Number(year) &&
          d.industry_name === industryMode &&
          d.workers_per_mil !== null &&
          d.housing_cost !== null
      )
      .map((d) => ({
        ...d,
        county: d.county_name.trim(),
        workers_per_mil: +d.workers_per_mil, // --- Changed: coerce to number
        housing_cost: +d.housing_cost, // --- Changed: coerce to number
      }));

    let civilianData = industryHousingData
      .filter(
        (d) =>
          Number(d.year) === Number(year) &&
          d.industry_name === "Civilian Employment" &&
          d.workers_per_mil !== null
      )
      .map((d) => ({
        county: d.county_name.trim(),
        civilian_workers_per_mil: +d.workers_per_mil,
      }));

    let merged = filtered.map((d) => {
      const civilian = civilianData.find((c) => c.county === d.county);
      return {
        ...d,
        civilian_workers_per_mil: civilian
          ? civilian.civilian_workers_per_mil
          : null,
      };
    });

    console.log("merged", merged);

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const margin = { top: 30, right: 60, bottom: 40, left: 60 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const g = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    //Scales
    const xScale = d3
      .scaleLinear()
      .domain([0, d3.max(merged, (d) => d.civilian_workers_per_mil) * 1.1])
      .range([0, innerWidth]);

    const yScale = d3
      .scaleLinear()
      .domain([0, d3.max(merged, (d) => d.workers_per_mil) * 1.1])
      .range([innerHeight, 0]);

    const size = d3
      .scaleSqrt()
      .domain([0, d3.max(merged, (d) => d.housing_cost)])
      .range([2, 20]);

    //Axes
    g.append("g")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale));

    g.append("g").call(d3.axisLeft(yScale));

    g.append("text")
      .attr("x", innerWidth / 2) // center of the axis
      .attr("y", innerHeight + 35) // below the chart
      .attr("text-anchor", "middle") // center align
      .attr("font-size", "12px")
      .attr("fill", "black")
      .text("Counties");

    // ToolTip
    const tooltip = d3.select(tooltipRef.current);

    // Bubbles
    g.selectAll("circle")
      .data(merged)
      .join("circle")
      .attr("cx", (d) => xScale(d.civilian_workers_per_mil))
      .attr("cy", (d) => yScale(d.workers_per_mil))
      .attr("r", (d) => size(d.housing_cost))
      .attr("fill", (d) => interpolatedHousingColorScale(d.housing_cost))
      .attr("opacity", 0.7)
      .attr("cursor", "pointer")
      .on("mouseover", (event, d) => {
        tooltip.style("opacity", 1).html(
          `<strong>${d.county}</strong><br/>
            ${d.industry_name}<br/>Workers/Million: ${
            d.workers_per_mil
          }<br/>Housing: ${formatPrice(d.housing_cost)}`
        );
      })
      .on("mousemove", function (event) {
        tooltip
          .style("left", event.pageX + 15 + "px")
          .style("top", event.pageY - 30 + "px");
      })
      .on("mouseout", () => tooltip.style("opacity", 0));
  }, [year, industryHousingData, industryMode]);
  return (
    <div>
      {/* --- Added explicit width/height to SVG */}
      <svg ref={svgRef} width={width} height={height}></svg>

      {/* --- Tooltip styling should be absolute, pointer-events-none */}
      <div
        ref={tooltipRef}
        className="absolute opacity-0 bg-white border border-gray-300 rounded-lg px-2 py-1.5 pointer-events-none text-xs shadow-md"
      ></div>
    </div>
  );
}
