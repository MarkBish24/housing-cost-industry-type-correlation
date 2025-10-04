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

    let filtered = housingData.filter(
      (d) => Number(d.year) === Number(year) && d.housing_cost !== null
    );

    filtered.sort((a, b) =>
      d3.ascending(Number(a.housing_cost), Number(b.housing_cost))
    );

    console.log(filtered);

    // Calculations
    const values = filtered.map((d) => +d.housing_cost);
    const q1 = d3.quantile(values, 0.25);
    const median = d3.quantile(values, 0.5);
    const q3 = d3.quantile(values, 0.75);
    const iqr = q3 - q1;
    const upperWhisker = d3.min([d3.max(values), q3 + iqr * 1.5]);
    const lowerWhisker = d3.max([d3.min(values), q1 - iqr * 1.5]);
    const min = d3.min(values);
    const max = d3.max(values);
    const outliers = values.filter((v) => v < lowerWhisker || v > upperWhisker);

    // Setting Frame
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const margin = { top: 30, right: 60, bottom: 40, left: 60 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const g = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Scales
    const xScale = d3
      .scaleLinear()
      .domain([
        d3.min([lowerWhisker, min]) * 0.9,
        d3.max([upperWhisker, max]) * 1.05,
      ])
      .range([0, innerWidth]);

    const yScale = d3
      .scaleBand()
      .domain(["Housing Cost"])
      .range([0, innerHeight])
      .padding(0.3);

    g.append("rect")
      .attr("x", xScale(q1))
      .attr("y", yScale("Housing Cost"))
      .attr("width", xScale(q3) - xScale(q1))
      .attr("height", yScale.bandwidth())
      .attr("stroke", "black")
      .attr("fill", "#69b3a2");

    g.append("line")
      .attr("x1", xScale(median))
      .attr("x2", xScale(median))
      .attr("y1", yScale("Housing Cost"))
      .attr("y2", yScale("Housing Cost") + yScale.bandwidth())
      .attr("stroke", "black");

    g.append("line")
      .attr("x1", xScale(lowerWhisker))
      .attr("x2", xScale(upperWhisker))
      .attr("y1", yScale("Housing Cost") + yScale.bandwidth() / 2)
      .attr("y2", yScale("Housing Cost") + yScale.bandwidth() / 2)
      .attr("stroke", "black");

    g.append("g")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale));

    g.append("g").call(d3.axisLeft(yScale));

    g.selectAll("circle.outlier")
      .data(outliers)
      .enter()
      .append("circle")
      .attr("class", "outlier")
      .attr("cx", (d) => xScale(d))
      .attr("cy", yScale("Housing Cost") + yScale.bandwidth() / 2)
      .attr("r", 3)
      .attr("fill", "#69b3a2");
  }, [housingData, year, industryMode, width, height]);

  return <svg ref={svgRef} width={width} height={height}></svg>;
}
