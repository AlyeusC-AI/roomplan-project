import { ReactNode } from 'react'

const Table = ({
  header,
  subtitle,
  children,
}: {
  header: string
  subtitle: string | React.ReactNode
  children: React.ReactNode
}) => {
  return (
    <>
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-xl font-semibold text-gray-900">{header}</h1>
          <span className="mt-2 text-sm text-gray-700">{subtitle}</span>
        </div>
      </div>
      <div className="mt-8 flex h-full flex-col">
        <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                {children}
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default Table
