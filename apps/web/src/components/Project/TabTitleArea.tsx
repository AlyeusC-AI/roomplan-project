import { ReactNode } from 'react'

const TabTitleArea = ({
  children,
  title,
  description,
  id,
}: {
  children?: ReactNode
  title: string
  description: string | ReactNode
  id?: string
}) => (
  <div className="mt-4 grid grid-cols-5">
    <div className="col-span-2 flex-col">
      <h3 id={id} className="text-2xl font-medium leading-6 text-gray-900">
        {title}
      </h3>
      <p className="mt-2 pr-8 text-base text-gray-500">{description}</p>
    </div>
    <div className="col-span-3 flex flex-wrap items-start justify-end gap-2">
      {children}
    </div>
  </div>
)

export default TabTitleArea
