import { useEffect, useRef, useState } from "react";
import { ZoomIn, ZoomOut } from "lucide-react";
import { formatPrice } from "../utils/format";
import * as d3 from "d3";

export default function CountyMap({ geoData, year, mode, industryMode }) {
  const svgRef = useRef();
  const [data, setData] = useState([]);

  //fetching all the SQL info data and putting it into data state
  useEffect(() => {
    if (!geoData) return;

    async function fetchData() {
      try {
        const result = await window.API.getViewDataWithFilter(
          "housing_view",
          "year",
          year
        );
        setData(result);
        console.log(result);
      } catch (err) {
        console.log("Data Pulling Error", err);
      }
    }
    fetchData();

    // Collect and merge the geo and county data

    const mergedData = mergeGeoData(geoData, data);
    console.log(mergedData);

    // Setting up map

    const width = 500;
    const height = 450;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    // Add a group to hold all counties (for zooming)
    const g = svg.append("g");

    const projection = d3.geoMercator().fitSize([width, height], geoData);
    const path = d3.geoPath().projection(projection);

    const tooltip = d3
      .select("body")
      .append("div")
      .style("position", "absolute")
      .style("background", "white")
      .style("padding", "4px 8px")
      .style("border", "1px solid #ccc")
      .style("border-radius", "4px")
      .style("pointer-events", "none")
      .style("opacity", 0);

    g.selectAll("path")
      .data(mergedData.features)
      .enter()
      .append("path")
      .attr("d", path)
      .attr("fill", (d) => {
        const value = d.properties.housing_cost;
        return value ? d3.interpolateBlues(value / 1000000) : "lightgray";
      })
      .attr("stroke", "#333")
      .attr("stroke-width", 0.5)
      .attr("opacity", 0.5)
      .style("cursor", "pointer")
      // set up attributes for each county
      .on("mouseover", function (event, d) {
        d3.select(this).transition().duration(100).attr("opacity", 1);

        tooltip.style("opacity", 1).html(
          `<strong>${d.properties.CountyName}</strong><br/>
         Housing Cost: ${formatPrice(d.properties.housing_cost) || "N/A"}<br/>
         Year : ${d.properties.year}`
        );
      })
      .on("mousemove", function (event) {
        tooltip
          .style("left", event.pageX + 10 + "px")
          .style("top", event.pageY + 10 + "px");
      })
      .on("mouseout", function () {
        d3.select(this).transition().duration(100).attr("opacity", 0.5);
        tooltip.style("opacity", 0);
      })
      .on("click", function (event, d) {
        const [[x0, y0], [x1, y1]] = path.bounds(d);
        const dx = x1 - x0;
        const dy = y1 - y0;
        const x = (x0 + x1) / 2;
        const y = (y0 + y1) / 2;
        const scale = 0.9 / Math.max(dx / width, dy / height);
        const translate = [width / 2 - scale * x, height / 2 - scale * y];

        // Smooth transition on the group
        g.transition()
          .duration(750)
          .attr(
            "transform",
            `translate(${translate[0]},${translate[1]}) scale(${scale})`
          );
      });
  }, [geoData, year]);

  return (
    <div className="relative w-[500px] h-[450px]">
      <svg ref={svgRef} width={500} height={450}></svg>
      <button
        onClick={() => {
          d3.select(svgRef.current)
            .select("g")
            .transition()
            .duration(750)
            .attr("transform", "translate(0,0) scale(1)");
        }}
        className="absolute top-2 right-2 z-10 btn bg-primary text-white px-2 py-1 text-xs"
      >
        <ZoomOut size={16} />
      </button>
    </div>
  );
}

function mergeGeoData(geoData, countyData) {
  return {
    ...geoData,
    features: geoData.features.map((feature) => {
      const countyName = feature.properties.CountyName;
      const match = countyData.find(
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
}
