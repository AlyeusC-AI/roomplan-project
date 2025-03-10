import ProjectChartContainer from "./ProjectChartContainer";
import StatsHeader from "./StatsHeader";

export default function PerformanceStats({
  projectStats,
}: {
  projectStats: ProjectStats;
}) {
  return (
    <>
      <StatsHeader projectStats={projectStats} />
      <ProjectChartContainer />
    </>
  );
}
