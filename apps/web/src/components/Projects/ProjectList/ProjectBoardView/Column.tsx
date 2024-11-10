import { useDrop } from 'react-dnd'
import { ProjectType } from '@servicegeek/db/queries/project/listProjects'
import clsx from 'clsx'

import Card from './Card'
import { STATUS_COLORS } from '@components/Settings/Workflow/ColorPicker'

const Column = ({
  title,
  value,
  redirectTo,
  projects,
  color,
  statusPublicId,
}: {
  title: string
  value?: string
  color: string
  statusPublicId?: string
  redirectTo: string
  projects: ProjectType[]
}) => {
  const [{ canDrop, isOver }, drop] = useDrop(() => ({
    accept: 'CARD',
    drop: () => ({ status: value, statusPublicId }),
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  }))

  const isActive = canDrop && isOver
  let backgroundColor = 'rgb(249,250,251)'
  if (isActive) {
    backgroundColor = '#e2e8f0'
  }

  const selectedColor = STATUS_COLORS.find((s) => s.name === color)

  return (
    <div
      className="flex min-w-[250px] flex-col"
      ref={drop}
      style={{ backgroundColor }}
    >
      <div className="sticky top-0 left-0 z-10 mb-2 bg-gray-50 pt-2">
        <div className={clsx('flex w-full items-center justify-between')}>
          <h1 className="text-md w-full truncate font-medium uppercase text-gray-500">
            {title}
          </h1>
        </div>
        <div
          className={clsx(
            selectedColor?.bgColor ? selectedColor?.bgColor : 'bg-slate-400',
            'h-1 w-full'
          )}
        />
      </div>
      <div className="flex h-full flex-col space-y-4 overflow-auto ">
        {projects.map((project, i) => (
          <Card
            key={project.publicId}
            project={project}
            redirectTo={redirectTo}
          />
        ))}
      </div>
    </div>
  )
}

export default Column
