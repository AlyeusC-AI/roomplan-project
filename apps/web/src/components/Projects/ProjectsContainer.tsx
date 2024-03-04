import { ReactNode } from 'react'

const ProjectsContainer = ({ children }: { children: ReactNode }) => (
  <div className="flex flex-grow justify-center">
    <div className="flex-grow">{children}</div>
  </div>
)

export default ProjectsContainer
