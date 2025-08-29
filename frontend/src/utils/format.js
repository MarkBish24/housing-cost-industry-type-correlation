import * as d3 from "d3";

export function formatPrice(value) {
  const num = Number(value);
  if (isNaN(num)) return "N/A";
  return num.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
  });
}

export const interpolatedHousingColorScale = d3
  .scaleLinear()
  .domain([100000, 250000, 500000, 750000, 1000000, 1500000, 2000000]) // your thresholds
  .range([
    "#006400",
    "#a6d96a",
    "#ffff66",
    "#fdae61",
    "#d7191c",
    "#4B0000",
    "#000000",
  ]) // green → yellow → orange → red → dark red
  .clamp(true);
