import { useRef, useState, useEffect } from "react";
import * as d3 from "d3";
import Loading from "./LoadingScreen";

export default function MultiLineChart({
  industryMode,
  county,
  industryHousingData,
  width,
  height,
}) {
  const [data, setData] = useState([]);
  const svgRef = useRef();

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

    g.append("g")
      .call(
        d3
          .axisLeft(yLeft)
          .ticks(5)
          .tickFormat((d) => `$${d3.format(",")(d)}`)
      )
      .selectAll("text")
      .attr("fill", "steelblue");
    g.append("g")
      .append("g")
      .attr("transform", `translate(${innerWidth},0)`)
      .call(d3.axisRight(yRight))
      .selectAll("text")
      .attr("fill", "tomato");

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
    // Labels
    svg
      .append("text")
      .attr("x", margin.left)
      .attr("y", margin.top - 10)
      .text(`Housing Cost in ${county} (left, blue)`);

    svg
      .append("text")
      .attr("x", width - margin.right - 100)
      .attr("y", margin.top - 10)
      .text(`Industry Workers - ${industryMode} - per mil  (right, red)`);
  }, [industryHousingData, industryMode, county, industryMode]);

  return !industryHousingData || !industryMode || !county ? (
    <Loading width={width} height={height} />
  ) : (
    <svg ref={svgRef} width={width} height={height} />
  );
}
