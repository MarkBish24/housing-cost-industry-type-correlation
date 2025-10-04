import { useState, useRef, useEffect } from "react";
import * as d3 from "d3";

export default function BoxPlot({
  width,
  height,
  industryMode,
  year,
  housingData,
}) {
  const svgRef = useRef();
  const tooltipRef = useRef();

  useEffect(() => {
    if (!housingData || !year) return;

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
    const dataByYear = d3.groups(
      housingData.filter((d) => d.housing_cost !== null),
      (d) => d.year
    );

    const years = dataByYear.map((d) => d[0]).sort(d3.ascending);

    // Scales
    const xScale = d3
      .scaleBand()
      .domain(years)
      .range([0, innerWidth])
      .padding(0.3);

    const allValues = housingData
      .filter((d) => d.housing_cost !== null)
      .map((d) => +d.housing_cost);

    const yScale = d3
      .scaleLinear()
      .domain([d3.min(allValues) * 0.95, d3.max(allValues) * 1.05])
      .range([innerHeight, 0]);

    // Calculations
    dataByYear.forEach(([year, data]) => {
      const values = data.map((d) => +d.housing_cost);
      const q1 = d3.quantile(values, 0.25);
      const median = d3.quantile(values, 0.5);
      const q3 = d3.quantile(values, 0.75);
      const iqr = q3 - q1;
      const upperWhisker = d3.min([d3.max(values), q3 + iqr * 1.5]);
      const lowerWhisker = d3.max([d3.min(values), q1 - iqr * 1.5]);
      const min = d3.min(values);
      const max = d3.max(values);
      const outliers = values.filter(
        (v) => v < lowerWhisker || v > upperWhisker
      );

      const centerX = xScale(year) + xScale.bandwidth() / 2;
      const boxWidth = xScale.bandwidth() / 2;

      g.append("rect")
        .attr("x", centerX - boxWidth / 2)
        .attr("y", yScale(q3))
        .attr("width", boxWidth)
        .attr("height", yScale(q1) - yScale(q3))
        .attr("stroke", "black")
        .attr("fill", "#69b3a2");

      g.append("line")
        .attr("x1", centerX - boxWidth / 2)
        .attr("x2", centerX + boxWidth / 2)
        .attr("y1", yScale(median))
        .attr("y2", yScale(median))
        .attr("stroke", "black");

      g.append("line")
        .attr("x1", centerX)
        .attr("x2", centerX)
        .attr("y1", yScale(lowerWhisker))
        .attr("y2", yScale(upperWhisker))
        .attr("stroke", "black");

      g.selectAll("circle.outlier");
      g.selectAll(`circle.outlier-${year}`)
        .data(outliers)
        .enter()
        .append("circle")
        .attr("cx", centerX)
        .attr("cy", (d) => yScale(d))
        .attr("r", 3)
        .attr("fill", "red");
    });

    g.append("g")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale));

    g.append("g").call(d3.axisLeft(yScale));
  }, [housingData, year, industryMode, width, height]);

  return (
    <div>
      <svg ref={svgRef} width={width} height={height}></svg>
    </div>
  );
}
