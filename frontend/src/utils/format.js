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

export function formatPopulation(value) {
  const num = Number(value);
  if (isNaN(num)) return "N/A";

  return num.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

export const getHousingColor = d3
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

export const getIndustryColor = d3
  .scaleSequential()
  .domain([0, 250000]) // adjust based on your data range
  .interpolator(d3.interpolateBlues);

export function interpolatedIndustryColorScale(value) {
  if (value === null || value === 0) return "#808080"; // gray
  return getIndustryColor(value);
}

export function interpolatedHousingColorScale(value) {
  if (value === null || value === 0) return "#808080"; // gray
  return getHousingColor(value);
}
