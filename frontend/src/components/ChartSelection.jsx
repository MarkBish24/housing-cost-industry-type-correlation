import { BarChart2, LineChart, ScatterChart } from "lucide-react";
import { FaChartBar, FaChartLine, FaChartPie } from "react-icons/fa";
import { BiScatterChart } from "react-icons/bi";
import { TbBox } from "react-icons/tb"; // box plot-ish

const IconList = [
  { name: "Bar Chart", icon: BarChart2 },
  { name: "Line Chart", icon: LineChart },
  { name: "Scatter Plot", icon: ScatterChart },
  { name: "Box Plot", icon: TbBox },
  { name: "Bubble Chart", icon: BiScatterChart },
];

export default function ChartSelection() {
  return (
    <div className="flex flex-wrap gap-4 p-4 justify-center">
      {IconList.map(({ name, icon: Icon }) => (
        <div
          key={name}
          className="flex flex-col items-center justify-center p-3 border rounded-xl shadow-sm hover:bg-gray-100 transition"
        >
          <Icon className="w-8 h-8 mb-2" />
          <span className="text-sm">{name}</span>
        </div>
      ))}
    </div>
  );
}
