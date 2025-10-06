import { useEffect, useRef } from "react";
import * as d3 from "d3";
import Loading from "../LoadingScreen";

export default function ViolinPlot({
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
    if (!housingData || !industryWorkersData || !industryMode) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const margin = { top: 30, right: 60, bottom: 40, left: 60 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const g = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

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

    const kde = (kernel, thresholds, data) =>
      thresholds.map((t) => [t, d3.mean(data, (d) => kernel(t - d))]);

    const epanechnikov = (bandwidth) => (x) =>
      Math.abs((x /= bandwidth)) <= 1 ? (0.75 * (1 - x * x)) / bandwidth : 0;

    //Tooltip
    const tooltip = d3.select(tooltipRef.current);

    g.append("g")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale));

    g.append("g").call(d3.axisLeft(yScale));

    dataByYear.forEach(([y, data]) => {
      const values = data.map((d) => +d[valueField]);
      const bandwidth = (d3.max(values) - d3.min(values)) / 20;
      const yTicks = yScale.ticks(40);
      const density = kde(epanechnikov(bandwidth), yTicks, values);
      const mean = d3.mean(values).toLocaleString();
      const median = d3.median(values).toLocaleString();

      const centerX = xScale(y) + xScale.bandwidth() / 2;
      const widthScale = d3
        .scaleLinear()
        .range([0, xScale.bandwidth() / 2])
        .domain([0, d3.max(density, (d) => d[1])]);

      const area = d3
        .area()
        .x0((d) => centerX - widthScale(d[1]))
        .x1((d) => centerX + widthScale(d[1]))
        .y((d) => yScale(d[0]))
        .curve(d3.curveCatmullRom);

      g.append("path")
        .datum(density)
        .attr("d", area)
        .attr("fill", y === year ? "#ff7f0e" : "#69b3a2")
        .attr("stroke", "black")
        .attr("opacity", 0.7)
        .attr("cursor", "pointer")
        .on("mouseover", (event, d) => {
          d3.select(event.currentTarget)
            .transition()
            .duration(200)
            .ease(d3.easeCubicInOut)
            .attr("opacity", 1);

          tooltip.style("opacity", 1).html(`
                <strong>Year:</strong> ${y}<br/>
                <strong>Mean:</strong> ${mean}<br/>
                <strong>Median:</strong> ${median}<br/>
                ${isIndustryMode ? "Workers per million" : "Housing cost"}
            `);
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
            .attr("opacity", 0.7);

          tooltip.style("opacity", 0);
        });
    });
  }, [housingData, industryWorkersData, industryMode, mode, width, height]);

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
