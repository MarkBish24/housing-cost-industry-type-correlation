import { useRef, useEffect } from "react";
import * as d3 from "d3";
import Loading from "../LoadingScreen";
import {
  formatPrice,
  formatPopulation,
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
  const tooltipRef = useRef();

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
    // console.log(data);

    // setting up box
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const margin = { top: 30, right: 60, bottom: 40, left: 60 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const g = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const tooltip = d3.select(tooltipRef.current);

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
      .style("cursor", "pointer")
      .attr("fill", (d) => interpolatedHousingColorScale(d.housing_cost))
      .on("mouseover", function (event, d) {
        const hoverWidth = x.bandwidth() * 1.1;
        const shrinkWidth = x.bandwidth() * 0.9;

        g.selectAll("rect")
          .transition()
          .duration(100)
          .ease(d3.easeCubicOut)
          .attr("width", (b) => (b === d ? hoverWidth : shrinkWidth))
          .attr("x", (b) => {
            const originalX = x(b.county_name);
            if (b === d) return originalX - (hoverWidth - x.bandwidth()) / 2;
            return originalX + (x.bandwidth() - shrinkWidth) / 2;
          });

        tooltip.style("opacity", 1).html(
          `
            <strong>County: ${d.county_name} </strong><br/>
            Housing Cost: ${formatPrice(d.housing_cost)}<br/>
            Workers: ${formatPopulation(d.workers_per_mil)} <br/>
          `
        );
      })
      .on("mousemove", function () {
        tooltip
          .style("left", event.pageX + 15 + "px")
          .style("top", event.pageY - 30 + "px");
      })
      .on("mouseleave", function () {
        tooltip.style("opacity", 0);

        g.selectAll("rect")
          .transition()
          .duration(200)
          .ease(d3.easeCubicOut)
          .attr("width", x.bandwidth())
          .attr("x", (d) => x(d.county_name));
      });

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

    // Labels

    g.append("text")
      .attr("x", innerWidth / 2) // center of the axis
      .attr("y", innerHeight + 35) // below the chart
      .attr("text-anchor", "middle") // center align
      .attr("font-size", "12px")
      .attr("fill", "black")
      .text("Counties");

    g.append("text")
      .attr("x", -innerHeight / 2) // center vertically along Y-axis
      .attr("y", -50) // offset to the left of the axis
      .attr("transform", "rotate(-90)") // rotate the text
      .attr("text-anchor", "middle") // center alignment
      .attr("font-size", "12px")
      .attr("fill", "black")
      .text("Industry Workers per Million");
  }, [industryHousingData, year, industryMode]);

  return !industryHousingData ? (
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
