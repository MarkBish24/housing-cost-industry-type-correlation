import { useEffect, useRef, useState, useMemo } from "react";
import { ZoomOut } from "lucide-react";
import * as d3 from "d3";

import { formatPrice, interpolatedHousingColorScale } from "../../utils/format";
import Loading from "../LoadingScreen";

export default function CountyMap({
  geoData,
  year,
  housingData,
  mode,
  industryMode,
  industryWorkersData,
  highlightedCounty,
  setHighlightedCounty,
}) {
  const [zoomState, setZoomState] = useState({ scale: 1, translate: [0, 0] });
  const [isFixed, setIsFixed] = useState(false);
  const [toolTipData, setToolTipData] = useState(null);

  const svgRef = useRef();
  const toolTipRef = useRef(null);

  const width = 500;
  const height = 500;

  /** Filter housing data for the selected year */
  const filteredData = useMemo(() => {
    if (!housingData) return [];
    return housingData.filter((d) => Number(d.year) === Number(year));
  }, [housingData, year]);

  /** Merge housing data into geo features */
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
  }, [geoData, filteredData]);

  /** Convert mouse event to local coordinates */
  const toLocal = (event) => {
    const rect = svgRef.current.getBoundingClientRect();
    return {
      x: event.clientX - rect.left + 15,
      y: event.clientY - rect.top + 20,
    };
  };

  /** Draw map whenever data or state changes */
  useEffect(() => {
    if (!mergedData) return;

    const county = mergedData.features.find(
      (f) => f.properties.county_name === highlightedCounty
    );

    if (county) {
      setToolTipData({
        countyName: county.properties.CountyName,
        housingCost: county.properties.housing_cost,
        year: county.properties.year,
        fixed: true,
      });
    }

    const svg = d3.select(svgRef.current);

    let g = svg.select("g#counties");
    if (g.empty()) {
      g = svg.append("g").attr("id", "counties");
    }
    g.attr(
      "transform",
      `translate(${zoomState.translate[0]}, ${zoomState.translate[1]}) scale(${zoomState.scale})`
    );

    const projection = d3.geoMercator().fitSize([width, height], geoData);
    const path = d3.geoPath().projection(projection);

    g.selectAll("path")
      .data(mergedData.features, (d) => d.properties.county_name)
      .join(
        (enter) =>
          enter
            .append("path")
            .attr("stroke", "#FFFFFF")
            .attr("stroke-width", 0.3)
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
      .on("mouseover", (event, d) => {
        if (isFixed) return;

        setToolTipData({
          countyName: d.properties.CountyName,
          housingCost: d.properties.housing_cost,
          year: d.properties.year,
          fixed: false,
        });

        const { x, y } = toLocal(event);
        if (toolTipRef.current) {
          toolTipRef.current.style.left = `${x}px`;
          toolTipRef.current.style.top = `${y}px`;
        }
      })
      .on("mousemove", (event) => {
        if (isFixed || !toolTipRef.current) return;

        const { x, y } = toLocal(event);
        toolTipRef.current.style.left = `${x}px`;
        toolTipRef.current.style.top = `${y}px`;
      })
      .on("mouseout", () => {
        if (!isFixed) setToolTipData(null);
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
              housingCost: d.properties.housing_cost,
              year: d.properties.year,
              fixed: true,
            });
            if (toolTipRef.current) {
              toolTipRef.current.style.left = `20px`;
              toolTipRef.current.style.top = `20px`;
            }
          });
      });
  }, [mergedData, year, isFixed, zoomState, highlightedCounty, geoData]);

  if (!mergedData) {
    return <Loading width={width} height={height} />;
  }

  return (
    <div className="relative w-[500px] h-[500px]">
      <svg ref={svgRef} width={width} height={height}></svg>

      {/* Tooltip */}
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
          Year: {toolTipData.year ?? "N/A"}
        </div>
      )}

      {/* Legend */}
      <div
        id="legend"
        className="absolute bottom-2 left-2 w-[220px] bg-white border rounded-md shadow p-3"
      >
        <div
          className="h-6 w-full rounded"
          style={{
            background:
              "linear-gradient(to right, #006400 0%,#a6d96a 8%,#ffff66 21%,#fdae61 34%,#d7191c 47%,#4B0000 73%,#000000 100%)",
          }}
        ></div>

        <div className="relative w-full h-6 mt-2">
          <span className="absolute text-xs left-[0%] -translate-x-1/2">
            $100k
          </span>
          <span className="absolute text-xs left-[20%] -translate-x-1/2">
            $500k
          </span>
          <span className="absolute text-xs left-[47%] -translate-x-1/2">
            $1M
          </span>
          <span className="absolute text-xs left-[73%] -translate-x-1/2">
            $1.5M
          </span>
          <span className="absolute text-xs left-[100%] -translate-x-1/2">
            $2M
          </span>
        </div>
      </div>

      {/* Reset Zoom */}
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
        className="absolute top-2 right-2 z-10 bg-primary text-white px-2 py-1 text-xs rounded shadow"
      >
        <ZoomOut size={16} />
      </button>
    </div>
  );
}
