import React from "react";
import { Line } from "react-chartjs-2";
import { MoonLoader } from "react-spinners";
import { trpc } from "@utils/trpc";
import {
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
} from "chart.js";
import { format } from "date-fns";
// import faker from 'faker';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export const options = {
  responsive: true,
  plugins: {
    legend: {
      position: "bottom" as const,
    },
    title: {
      display: false,
      text: "Weekly opened and closed projects",
    },
  },
};

const ProjectChart = () => {
  const usedEquipment: any = trpc.stats.getProjectStatusOverTime.useQuery();
  console.log(
    "labels",
    usedEquipment.data?.closed.map((c: any) => format(c.dateStart, "MMM, dd"))
  );
  console.log(
    "data",
    usedEquipment.data?.opened.map((c: any) => c.value)
  );
  const data = {
    labels: usedEquipment.data?.closed.map((c: any) =>
      format(c.dateStart, "MMM, dd")
    ),
    datasets: [
      {
        label: "Weekly Closed Projects",
        data: usedEquipment.data?.closed.map((c: any) => c.value),
        borderColor: "rgb(255, 99, 132)",
        backgroundColor: "rgba(255, 99, 132, 0.5)",
      },
      {
        label: "Weekly Opened Projects",
        data: usedEquipment.data?.opened.map((c: any) => c.value),
        borderColor: "rgb(53, 162, 235)",
        backgroundColor: "rgba(53, 162, 235, 0.5)",
      },
    ],
  };

  return (
    <div>
      <div className='w-fullborder relative h-[350px] w-[800px] rounded-md p-4 shadow-[0_10px_35px_0_rgba(0,0,0,0.3)]'>
        {!usedEquipment.data && (
          <div className='absolute z-40 flex size-full items-center justify-center bg-white bg-opacity-75'>
            <MoonLoader color='#2563eb' />
          </div>
        )}
        <Line
          options={options}
          data={data}
          className='border- border-gray-500'
        />
      </div>
    </div>
  );
};

export default ProjectChart;
