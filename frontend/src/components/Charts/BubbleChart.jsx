import { useEffect, useRef, useState, useMemo } from "react";
import { ZoomOut } from "lucide-react";
import * as d3 from "d3";

import { formatPrice, interpolatedHousingColorScale } from "../../utils/format";
import Loading from "../LoadingScreen";

export default function BubbleChart(
  year,
  county,
  industryHousingData,
  width,
  height
) {
  const [data, setData] = useState([]);

  const svgRef = useRef();
  const tooltipRef = useRef();

  useEffect(() => {
    if (!industryHousingData || !county || !year) return;

    let filtered = industryHousingData;

    filtered = filtered.gilter(
      (d) => Number(d.year) === Number(year) && d.county_name === county
    );
  });
  return <div></div>;
}
