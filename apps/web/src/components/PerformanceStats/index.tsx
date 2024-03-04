import { ProjectStats } from '@pages/performance'

import ProjectChartContainer from './ProjectChartContainer'
import StatsHeader from './StatsHeader'

export default function PerformanceStats({
  projectStats,
  totalProjects,
}: {
  totalProjects: number
  projectStats: ProjectStats
}) {
  return (
    <>
      <StatsHeader projectStats={projectStats} />
      <ProjectChartContainer />
    </>
  )
}
