import { useRef, useState, useEffect } from "react";
import * as d3 from "d3";

export default function MultiLineChart({
  industryMode,
  county,
  industryHousingData,
}) {
  const [data, setData] = useState([]);
  const svgRef = useRef();

  const width = 600;
  const height = 400;

  useEffect(() => {
    if (!industryHousingData || !industryMode || !county) return;

    let filtered = industryHousingData;

    filtered = filtered.filter(
      (d) => d.county_name === county && d.industry_name === industryMode
    );

    setData(filtered);
    console.log(data);

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const margin = { top: 30, right: 60, bottom: 40, left: 60 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const g = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const parseYear = d3.timeParse("%Y");
    const dataProcessed = data.map((d) => ({
      ...d,
      year: parseYear(d.year),
      housing_cost: +d.housing_cost,
      workers: +d.workers_per_mil,
    }));

    // Scales

    const xScale = d3
      .scaleTime()
      .domain(d3.extent(dataProcessed, (d) => d.year))
      .range([0, innerWidth]);

    const yLeft = d3
      .scaleLinear()
      .domain([0, d3.max(dataProcessed, (d) => d.housing_cost)])
      .nice()
      .range([innerHeight, 0]);

    const yRight = d3
      .scaleLinear()
      .domain([0, d3.max(dataProcessed, (d) => d.workers)])
      .nice()
      .range([innerHeight, 0]);

    // Axes

    g.append("g")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale).ticks(5));

    g.append("g").call(d3.axisLeft(yLeft));
    g.append("g")
      .append("g")
      .attr("transform", `translate(${innerWidth},0)`)
      .call(d3.axisRight(yRight));

    // Lines
    const housingLine = d3
      .line()
      .x((d) => xScale(d.year))
      .y((d) => yLeft(d.housing_cost));

    const workersLine = d3
      .line()
      .x((d) => xScale(d.year))
      .y((d) => yRight(d.workers));

    g.append("path")
      .datum(dataProcessed)
      .attr("fill", "none")
      .attr("stroke", "steelblue")
      .attr("stroke-width", 2)
      .attr("d", housingLine);

    g.append("path")
      .datum(dataProcessed)
      .attr("fill", "none")
      .attr("stroke", "tomato")
      .attr("stroke-width", 2)
      .attr("d", workersLine);
  }, [industryHousingData, industryMode, county, industryMode]);

  return <svg ref={svgRef} width={width} height={height} />;
}
