import { useEffect, useRef, useState, useMemo } from "react";
import { ZoomIn, ZoomOut } from "lucide-react";
import * as d3 from "d3";

import { formatPrice, interpolatedHousingColorScale } from "../utils/format";
import Loading from "./LoadingScreen";

export default function CountyMap({
  geoData,
  year,
  mode,
  industryMode,
  housingData,
  industryWorkersData,
}) {
  // for maintaining the zoom state when the year changes
  const [zoomState, setZoomState] = useState({ scale: 1, translate: [0, 0] });
  const [isFixed, setIsFixed] = useState(false);
  const [highlightedCounty, setHighlightedCounty] = useState(null);

  const svgRef = useRef();

  const filteredData = useMemo(() => {
    if (!housingData) return [];
    return housingData.filter((d) => Number(d.year) === Number(year));
  }, [housingData, year]);

  // Pulling the housing and geo data from the app and combining them
  const mergedData = useMemo(() => {
    if (!geoData || !filteredData) return null;

    return {
      ...geoData,
      features: geoData.features.map((feature) => {
        const countyName = feature.properties.CountyName;
        const match = filteredData.find(
          (d) => d.county_name.toLowerCase() === countyName.toLowerCase()
        );

        return {
          ...feature,
          properties: {
            ...feature.properties,
            ...(match || {}),
          },
        };
      }),
    };
  });

  const width = 500;
  const height = 450;

  //fetching all the SQL info data and putting it into data state
  useEffect(() => {
    if (!mergedData) return;

    // Setting up map
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    // creating a legend
    d3.select("#legend");

    // Add a group to hold all counties (for zooming)
    const g = svg
      .append("g")
      .attr(
        "transform",
        `translate(${zoomState.translate[0]}, ${zoomState.translate[1]}) scale(${zoomState.scale})`
      );

    const projection = d3.geoMercator().fitSize([width, height], geoData);
    const path = d3.geoPath().projection(projection);

    const tooltip = d3
      .select("#tooltip")
      .style("position", "absolute")
      .style("background", "white")
      .style("padding", "4px 8px")
      .style("border", "1px solid #ccc")
      .style("border-radius", "4px")
      .style("pointer-events", "none")
      .style("opacity", 0);

    // sets a tool tip object at the start of the creation of the map

    if (isFixed && highlightedCounty !== null) {
      const countyData = mergedData.features.find(
        (feature) => feature.properties.county_name === highlightedCounty
      );

      if (countyData) {
        tooltip
          .style("opacity", 1)
          .style("left", "20px")
          .style("bottom", "20px")
          .style("top", "auto")
          .style("right", "auto").html(`
        <strong>${countyData.properties.CountyName}</strong><br/>
        Housing Cost: ${
          formatPrice(countyData.properties.housing_cost) || "N/A"
        }<br/>
        Year: ${countyData.properties.year}
      `);
      }
    }

    g.selectAll("path")
      .data(mergedData.features)
      .enter()
      .append("path")
      .attr("d", path)
      .attr("fill", (d) => {
        const value = d.properties.housing_cost;
        return value ? interpolatedHousingColorScale(value) : "lightgray";
      })
      .attr("stroke", "#333")
      .attr("stroke-width", 0.75)
      .attr("opacity", (d) =>
        d.properties.county_name === highlightedCounty ? 1 : 0.75
      )
      .style("cursor", "pointer")
      // set up attributes for each county
      .on("mouseover", function (event, d) {
        d3.select(this).transition().duration(100).attr("opacity", 1);

        if (!isFixed) {
          const rect = svgRef.current.getBoundingClientRect();
          tooltip
            .style("opacity", 1)
            .style("left", `${event.clientX - rect.left + 10}px`)
            .style("top", `${event.clientY - rect.top + 10}px`)
            .style("right", "auto")
            .style("bottom", "auto").html(`
        <strong>${d.properties.CountyName}</strong><br/>
        Housing Cost: ${formatPrice(d.properties.housing_cost) || "N/A"}<br/>
        Year: ${d.properties.year}
      `);
        }
      })
      .on("mousemove", function (event) {
        if (!isFixed) {
          const rect = svgRef.current.getBoundingClientRect();
          tooltip
            .style("left", `${event.clientX - rect.left + 10}px`)
            .style("top", `${event.clientY - rect.top + 10}px`);
        }
      })
      .on("mouseout", function () {
        d3.select(this).transition().duration(100).attr("opacity", 0.75);
        if (!isFixed) {
          tooltip.style("opacity", 0);
        }
      })
      .on("click", function (event, d) {
        console.log("here is something --->", d.properties.county_name);
        setHighlightedCounty(d.properties.county_name);

        const [[x0, y0], [x1, y1]] = path.bounds(d);
        const dx = x1 - x0;
        const dy = y1 - y0;
        const x = (x0 + x1) / 2;
        const y = (y0 + y1) / 2;
        const scale = 0.9 / Math.max(dx / width, dy / height);
        const translate = [width / 2 - scale * x, height / 2 - scale * y];

        // setting the box in the bottom left corner

        tooltip
          .style("opacity", 1)
          .style("left", "20px")
          .style("bottom", "20px")
          .style("top", "auto")
          .style("right", "auto").html(`
      <strong>${d.properties.CountyName}</strong><br/>
      Housing Cost: ${formatPrice(d.properties.housing_cost) || "N/A"}<br/>
      Year: ${d.properties.year}
      
    `);

        // Smooth transition on the group
        g.transition()
          .duration(750)
          .attr(
            "transform",
            `translate(${translate[0]},${translate[1]}) scale(${scale})`
          )
          .on("end", () => {
            setZoomState({ scale, translate });
            setIsFixed(true);
          });
      });
  }, [mergedData, isFixed]);
  if (!mergedData) return <Loading width={width} height={height} />;
  else
    return (
      <div className="relative w-[500px] h-[450px]">
        <svg ref={svgRef} width={500} height={450}></svg>
        {/* Tool tip object */}
        <div
          id="tooltip"
          className="absolute bg-white border rounded-md shadow px-2 py-1 text-sm"
          style={{ opacity: 0 }}
        />

        <div
          id="legend"
          className="absolute bottom-2 left-2 w-[220px] bg-white border rounded-md shadow p-3"
        >
          {/* Gradient */}
          <div
            className="h-6 w-full rounded relative"
            style={{
              background:
                "linear-gradient(to right, #006400 0%,#a6d96a 8%,#ffff66 21%,#fdae61 34%,#d7191c 47%,#4B0000 73%,#000000 100%)",
            }}
          ></div>

          {/* Labels */}
          <div className="relative w-full h-6 mt-2">
            <span className="absolute text-xs left-[0%] -translate-x-1/2">
              100k
            </span>
            <span className="absolute text-xs left-[17%] -translate-x-1/2">
              500k
            </span>
            <span className="absolute text-xs left-[47%] -translate-x-1/2">
              1M
            </span>
            <span className="absolute text-xs left-[73%] -translate-x-1/2">
              1.5M
            </span>
            <span className="absolute text-xs left-[100%] -translate-x-1/2">
              2M
            </span>
          </div>
        </div>

        <button
          onClick={() => {
            d3.select(svgRef.current)
              .select("g")
              .transition()
              .duration(750)
              .attr("transform", "translate(0,0) scale(1)")
              .on("end", () => {
                setZoomState({ scale: 1, translate: [0, 0] });
                setIsFixed(false);
              });

            d3.select("#tooltip").style("opacity", 0);
          }}
          className="absolute top-2 right-2 z-10 btn bg-primary text-white px-2 py-1 text-xs"
        >
          <ZoomOut size={16} />
        </button>
      </div>
    );
}
