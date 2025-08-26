import { useEffect, useRef } from "react";
import * as d3 from "d3";

export default function CountyMap({ geoData }) {
  const svgRef = useRef();

  useEffect(() => {
    if (!geoData) return;

    const width = 500;
    const height = 450;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    // Add a group to hold all counties (for zooming)
    const g = svg.append("g");

    const projection = d3.geoMercator().fitSize([width, height], geoData);
    const path = d3.geoPath().projection(projection);

    g.selectAll("path")
      .data(geoData.features)
      .enter()
      .append("path")
      .attr("d", path)
      .attr("fill", "lightgray")
      .attr("stroke", "#333")
      .attr("stroke-width", 0.5)
      .attr("opacity", 0.5)
      .style("cursor", "pointer")
      .on("mouseover", function () {
        d3.select(this).transition().duration(100).attr("opacity", 1);
      })
      .on("mouseout", function () {
        d3.select(this).transition().duration(100).attr("opacity", 0.5);
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
  }, [geoData]);

  return <svg ref={svgRef} width={500} height={450}></svg>;
}
