import { useEffect, useRef } from "react";
import * as d3 from "d3";

export default function CountyMap({ geoData }) {
  const svgRef = useRef();

  useEffect(() => {
    if (!geoData) return;

    const width = 500;
    const height = 450;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove(); // clear previous drawings

    // Projection: fits your GeoJSON to the SVG size
    const projection = d3.geoMercator().fitSize([width, height], geoData);
    const path = d3.geoPath().projection(projection);

    // Draw counties
    svg
      .selectAll("path")
      .data(geoData.features)
      .enter()
      .append("path")
      .attr("d", path)
      .attr("fill", "lightgray") // placeholder fill
      .attr("stroke", "#333") // borders
      .attr("stroke-width", 0.5);
  }, [geoData]);

  return <svg ref={svgRef} width={500} height={450}></svg>;
}
