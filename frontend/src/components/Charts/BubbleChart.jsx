import { useEffect, useRef, useState, useMemo } from "react";
import { ZoomOut } from "lucide-react";
import * as d3 from "d3";

import { formatPrice, interpolatedHousingColorScale } from "../../utils/format";
import Loading from "../LoadingScreen";

export default function BubbleChart({
  year,
  county,
  industryHousingData,
  width,
  height,
}) {
  const [data, setData] = useState([]);

  const svgRef = useRef();
  const tooltipRef = useRef();

  useEffect(() => {
    if (!industryHousingData || !county || !year) return;

    let filtered = industryHousingData
      .filter(
        (d) =>
          Number(d.year) === Number(year) &&
          d.county_name === county &&
          d.workers_per_million != null &&
          d.housing_cost != null
      )
      .map((d) => ({
        ...d,
        workers_per_million: +d.workers_per_million, // --- Changed: coerce to number
        housing_cost: +d.housing_cost, // --- Changed: coerce to number
      }));

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
      .domain([0, d3.max(filtered, (d) => d.workers_per_million) * 1.1])
      .range([0, innerWidth]);

    const yScale = d3
      .scaleLinear()
      .domain([0, d3.max(filtered, (d) => d.housing_cost) * 1.1])
      .range([innerHeight, 0]);

    const radius = 8;

    //Axes
    g.append("g")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale));

    g.append("g").call(d3.axisLeft(yScale));

    // ToolTip
    const tooltip = d3.select(tooltipRef.current);

    // Bubbles
    g.selectAll("circle")
      .data(filtered)
      .join("circle")
      .attr("cx", (d) => xScale(d.workers_per_million))
      .attr("cy", (d) => yScale(d.housing_cost))
      .attr("r", radius)
      .attr("fill", (d) => interpolatedHousingColorScale(d.housing_cost))
      .on("mouseover", (event, d) => {
        tooltip
          .style("opacity", 1)
          .html(
            `${d.industry}<br/>Workers/Million: ${
              d.workers_per_million
            }<br/>Housing: ${formatPrice(d.housing_cost)}`
          );
      })
      .on("mousemove", (event, d) => {
        tooltip
          .style("left", event.pageX + 10 + "px")
          .style("top", event.pageY + 10 + "px");
      })
      .on("mouseout", () => tooltip.style("opacity", 0));
  }, [year, county, industryHousingData]);
  return (
    <div style={{ position: "relative" }}>
      {/* --- Added explicit width/height to SVG */}
      <svg ref={svgRef} width={width} height={height}></svg>

      {/* --- Tooltip styling should be absolute, pointer-events-none */}
      <div
        ref={tooltipRef}
        className="tooltip"
        style={{
          position: "absolute",
          opacity: 0,
          pointerEvents: "none",
          backgroundColor: "white",
          border: "1px solid #ccc",
          padding: "5px",
          borderRadius: "4px",
          fontSize: "12px",
        }}
      ></div>
    </div>
  );
}
