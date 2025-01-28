import Typeography from "@components/DesignSystem/Typeography";
import dynamic from "next/dynamic";

const ProjectChart = dynamic(() => import("./ProjectChart"), { ssr: false });

const ProjectChartContainer = () => {
  return (
    <div>
      <Typeography.H2>Weekly Opened and Completed Projects</Typeography.H2>
      {/* @ts-ignore */}
      <ProjectChart />
    </div>
  );
};

export default ProjectChartContainer;
