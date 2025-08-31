import { useEffect, useRef, useState, useMemo } from "react";
// Charts
import MultiLineChart from "./Charts/MultiLineChart";
// symbols
import { BarChart2, LineChart, ScatterChart } from "lucide-react";
import { BiScatterChart } from "react-icons/bi";
import { TbBox } from "react-icons/tb";
import ViolinIcon from "../symbols/violin.svg?react";

// const ViolinIcon = (props) => (
//   <img src={violinSvg} alt="Violin Chart" {...props} />
// );

const IconList = [
  { name: "Bar Chart", icon: BarChart2 },
  { name: "Line Chart", icon: LineChart },
  { name: "Scatter Plot", icon: ScatterChart },
  { name: "Bubble Chart", icon: BiScatterChart },
  { name: "Box Plot", icon: TbBox },
  { name: "Violin Plot", icon: ViolinIcon },
];

export default function ChartSelection({
  slotIndex,
  selectedCharts,
  setSelectedCharts,
}) {
  return (
    <div className="flex flex-wrap gap-1 p-2 justify-center border rounded-xl shadow-sm">
      {IconList.map(({ name, icon: Icon }) => (
        <div
          key={name}
          className="flex flex-col items-center justify-center p-2 border rounded-xl shadow-sm hover:bg-gray-100 transition cursor-pointer"
          title={name}
          onClick={() => {
            setSelectedCharts((prev) => {
              const newCharts = [...prev];
              newCharts[slotIndex] = name;
              console.log(name, newCharts);
              return newCharts;
            });
          }}
        >
          <Icon className="w-4 h-4" />
        </div>
      ))}
    </div>
  );
}
