import { useState, useRef, useEffect } from "react";
import * as d3 from "d3";
import Loading from "../LoadingScreen";

export default function BoxPlot({
  width,
  height,
  industryMode,
  mode,
  year,
  housingData,
  industryWorkersData,
}) {
  const svgRef = useRef();
  const tooltipRef = useRef();

  useEffect(() => {
    if (!housingData || !year || !industryWorkersData || !industryMode) return;

    // Setting Frame
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const margin = { top: 30, right: 60, bottom: 40, left: 60 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const g = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    //Getting Data by Years

    const isIndustryMode = mode === "industry";

    const activeData = isIndustryMode ? industryWorkersData : housingData;
    const valueField = isIndustryMode ? "workers_per_mil" : "housing_cost";

    let filteredData = activeData.filter((d) => d[valueField] !== null);

    if (isIndustryMode) {
      filteredData = filteredData.filter(
        (d) => d.industry_name === industryMode
      );
    }

    const dataByYear = d3.groups(filteredData, (d) => d.year);

    const years = dataByYear.map((d) => d[0]).sort(d3.ascending);

    // Scales
    const xScale = d3
      .scaleBand()
      .domain(years)
      .range([0, innerWidth])
      .padding(0.3);

    const allValues = filteredData.map((d) => +d[valueField]);

    const yScale = d3
      .scaleLinear()
      .domain([d3.min(allValues) * 0.95, d3.max(allValues) * 1.05])
      .range([innerHeight, 0]);

    //Tooltip
    const tooltip = d3.select(tooltipRef.current);

    // Calculations
    dataByYear.forEach(([y, data]) => {
      const values = data.map((d) => +d[valueField]);
      const q1 = d3.quantile(values, 0.25);
      const median = d3.quantile(values, 0.5);
      const q3 = d3.quantile(values, 0.75);
      const iqr = q3 - q1;
      const upperWhisker = d3.min([d3.max(values), q3 + iqr * 1.5]);
      const lowerWhisker = d3.max([d3.min(values), q1 - iqr * 1.5]);
      const min = d3.min(values);
      const max = d3.max(values);
      const outliers = data.filter(
        (d) => d[valueField] < lowerWhisker || d[valueField] > upperWhisker
      );

      const centerX = xScale(y) + xScale.bandwidth() / 2;
      const boxWidth = xScale.bandwidth() / 1.5;

      g.append("rect")
        .attr("x", centerX - boxWidth / 2)
        .attr("y", yScale(q3))
        .attr("width", boxWidth)
        .attr("height", yScale(q1) - yScale(q3))
        .attr("stroke", "black")
        .attr("fill", y === year ? "#ff7f0e" : "#69b3a2")
        .attr("cursor", "pointer")
        .on("mouseover", (event, d) => {
          d3.select(event.currentTarget)
            .transition()
            .duration(200)
            .ease(d3.easeCubicInOut)
            .attr("x", centerX - (boxWidth * 2) / 2)
            .attr("width", boxWidth * 2);

          tooltip.style("opacity", 1).html(
            `<strong>${y}</strong><br/>
            Quarter 1: ${q1} <br/>
            Quarter 2: ${median} <br/>
            Quarter 3:  ${q3} <br/>
            Inner Quartile Range: ${iqr} <br/>
            Upper Whisker: ${upperWhisker} <br/>
            Lower Whisker: ${lowerWhisker} <br/>
                      `
          );
        })
        .on("mousemove", (event) => {
          tooltip
            .style("left", event.pageX + 15 + "px")
            .style("top", event.pageY - 30 + "px");
        })
        .on("mouseleave", (event, d) => {
          d3.select(event.currentTarget)
            .transition()
            .duration(200)
            .ease(d3.easeCubicInOut)
            .attr("x", centerX - boxWidth / 2)
            .attr("width", boxWidth);

          tooltip.style("opacity", 0);
        });

      g.append("line")
        .attr("x1", centerX - boxWidth / 2)
        .attr("x2", centerX + boxWidth / 2)
        .attr("y1", yScale(median))
        .attr("y2", yScale(median))
        .attr("stroke", "black")
        .style("pointer-events", "none");

      g.append("line")
        .attr("x1", centerX)
        .attr("x2", centerX)
        .attr("y1", yScale(lowerWhisker))
        .attr("y2", yScale(upperWhisker))
        .attr("stroke", "black")
        .style("pointer-events", "none");

      g.selectAll("circle.outlier");
      g.selectAll(`circle.outlier-${y}`)
        .data(outliers)
        .enter()
        .append("circle")
        .attr("cx", centerX)
        .attr("cy", (d) => yScale(+d[valueField]))
        .attr("r", 3)
        .attr("fill", "red")
        .attr("cursor", "pointer")
        .on("mouseover", (event, d) => {
          d3.select(event.currentTarget)
            .transition()
            .duration(200)
            .ease(d3.easeCubicInOut)
            .attr("r", 5);

          console.log(d);

          tooltip.style("opacity", 1).html(
            `<strong>County: ${d.county_name || "N/A"}</strong><br/>
            Year: ${y}<br/>
            ${isIndustryMode ? "Workers" : "Housing Cost"}: 
            ${(+d[valueField]).toLocaleString()}`
          );
        })
        .on("mousemove", (event, d) => {
          tooltip
            .style("left", event.pageX + 15 + "px")
            .style("top", event.pageY - 30 + "px");
        })
        .on("mouseleave", (event, d) => {
          d3.select(event.currentTarget)
            .transition()
            .duration(200)
            .ease(d3.easeCubicInOut)
            .attr("r", 3);

          tooltip.style("opacity", 0);
        });
    });

    const xAxis = g
      .append("g")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale));

    xAxis
      .selectAll("text")
      .attr("text-anchor", "end")
      .attr("transform", "rotate(-45)")
      .attr("dx", "-0.5em")
      .attr("dy", "0.25em");

    g.append("g").call(d3.axisLeft(yScale));
  }, [mode, industryMode, width, height]);

  return !housingData || !industryWorkersData || !industryMode ? (
    <Loading width={width} height={height} />
  ) : (
    <div>
      <svg ref={svgRef} width={width} height={height}></svg>
      <div
        ref={tooltipRef}
        className="absolute opacity-0 bg-white border border-gray-300 rounded-lg px-2 py-1.5 pointer-events-none text-xs shadow-md"
      ></div>
    </div>
  );
}
