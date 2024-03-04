import { ReactNode, useState } from 'react'
import { ChevronDownIcon } from '@heroicons/react/24/outline'

const Accordion = ({
  title,
  children,
  error = false,
}: {
  title: string
  children: ReactNode
  error?: boolean
}) => {
  const [isCollapsed, setIsCollapsed] = useState(true)
  return (
    <div
      className={`mt-8 ${
        error ? 'bg-red-100' : 'bg-white'
      } rounded-sm px-4 py-2 shadow-sm`}
    >
      <button
        className={`flex w-full justify-between ${
          !isCollapsed && 'mb-4 border-b border-red-300 pb-4'
        }`}
        onClick={() => setIsCollapsed((prevCollapsed) => !prevCollapsed)}
      >
        {title}
        <ChevronDownIcon height={26} />
      </button>
      {!isCollapsed && <div>{children}</div>}
    </div>
  )
}

export default Accordion
