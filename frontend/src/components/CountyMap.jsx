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
  const [toolTipData, setToolTipData] = useState(null);
  const toolTipRef = useRef(null);

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

  const toLocal = (event) => {
    const rect = svgRef.current.getBoundingClientRect();
    return {
      x: event.clientX - rect.left + 15,
      y: event.clientY - rect.top + 20,
    };
  };

  //fetching all the SQL info data and putting it into data state
  useEffect(() => {
    if (!mergedData) return;

    // Setting up SVG and group
    const svg = d3.select(svgRef.current);
    let g = svg.select("g#counties");
    if (g.empty()) {
      g = svg
        .append("g")
        .attr("id", "counties") // give it an ID so we can select it later
        .attr(
          "transform",
          `translate(${zoomState.translate[0]}, ${zoomState.translate[1]}) scale(${zoomState.scale})`
        );
    } else {
      g.attr(
        "transform",
        `translate(${zoomState.translate[0]}, ${zoomState.translate[1]}) scale(${zoomState.scale})`
      );
    }

    // projection and path generator
    const projection = d3.geoMercator().fitSize([width, height], geoData);
    const path = d3.geoPath().projection(projection);

    // sets a tool tip object at the start of the creation of the map

    g.selectAll("path")
      .data(mergedData.features, (d) => d.properties.county_name)
      .join(
        (enter) =>
          enter
            .append("path")
            .attr("stroke", "#333")
            .attr("stroke-width", 0.75)
            .style("cursor", "pointer")
            .call((enter) =>
              enter
                .transition()
                .duration(350)
                .attr("d", path)
                .attr("fill", (d) =>
                  d.properties.housing_cost
                    ? interpolatedHousingColorScale(d.properties.housing_cost)
                    : "lightgray"
                )
                .attr("opacity", (d) =>
                  d.properties.county_name === highlightedCounty ? 1 : 0.75
                )
            ),
        (update) =>
          update.call((update) =>
            update
              .transition()
              .duration(350)
              .attr("d", path)
              .attr("fill", (d) =>
                d.properties.housing_cost
                  ? interpolatedHousingColorScale(d.properties.housing_cost)
                  : "lightgray"
              )
              .attr("opacity", (d) =>
                d.properties.county_name === highlightedCounty ? 1 : 0.75
              )
          ),
        (exit) => exit.remove()
      )
      // event handlers — now only update React state for tooltip
      .on("mouseover", (event, d) => {
        if (isFixed) return;

        setToolTipData({
          countyName: d.properties.CountyName,
          fixed: false,
        });
        const { x, y } = toLocal(event);
        if (toolTipRef.current) {
          toolTipRef.current.style.left = `${x}px`;
          toolTipRef.current.style.top = `${y}px`;
        }
      })
      .on("mousemove", (event) => {
        if (isFixed) return;
        if (!toolTipRef.current) return;

        const { x, y } = toLocal(event);
        toolTipRef.current.style.left = `${x}px`;
        toolTipRef.current.style.top = `${y}px`;
      })
      .on("mouseout", () => {
        if (isFixed) return;
        setToolTipData(null);
      })
      .on("click", function (event, d) {
        setHighlightedCounty(d.properties.county_name);

        const [[x0, y0], [x1, y1]] = path.bounds(d);
        const dx = x1 - x0;
        const dy = y1 - y0;
        const x = (x0 + x1) / 2;
        const y = (y0 + y1) / 2;
        const scale = 0.9 / Math.max(dx / width, dy / height);
        const translate = [width / 2 - scale * x, height / 2 - scale * y];

        g.transition()
          .duration(750)
          .attr(
            "transform",
            `translate(${translate[0]},${translate[1]}) scale(${scale})`
          )
          .on("end", () => {
            setZoomState({ scale, translate });
            setIsFixed(true);

            setToolTipData({
              countyName: d.properties.CountyName,
              fixed: true,
            });
            if (toolTipRef.current) {
              toolTipRef.current.style.left = `20px`;
              toolTipRef.current.style.top = `20px`;
            }
          });
      });
  }, [mergedData, year, isFixed, zoomState]);

  if (!mergedData) return <Loading width={width} height={height} />;
  else
    return (
      <div className="relative w-[500px] h-[450px]">
        <svg ref={svgRef} width={500} height={450}></svg>
        {/* Tool tip object */}
        {toolTipData && (
          <div
            ref={toolTipRef}
            className="absolute pointer-events-none bg-white border rounded-md shadow px-2 py-1 text-sm"
            style={{ left: 0, top: 0 }}
          >
            <strong>{toolTipData.countyName}</strong>
            <br />
            Housing Cost:{" "}
            {toolTipData.housingCost != null
              ? formatPrice(toolTipData.housingCost)
              : "N/A"}
            <br />
            Year: {toolTipData.year}
          </div>
        )}

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
              .select("g#counties")
              .transition()
              .duration(750)
              .attr("transform", "translate(0,0) scale(1)")
              .on("end", () => {
                setZoomState({ scale: 1, translate: [0, 0] });
                setIsFixed(false);
                setHighlightedCounty(null);
                setToolTipData(null);
              });
          }}
          className="absolute top-2 right-2 z-10 btn bg-primary text-white px-2 py-1 text-xs"
        >
          <ZoomOut size={16} />
        </button>
      </div>
    );
}
