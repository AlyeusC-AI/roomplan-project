import Address from '@components/DesignSystem/Address'
import UserAvatar from '@components/DesignSystem/UserAvatar'
import { PhotoIcon } from '@heroicons/react/24/outline'
import { trpc } from '@utils/trpc'
import clsx from 'clsx'
import dateFormat from 'dateformat'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'

import StatusPill, { StatusValuePill } from '../OrgCreation/StatusPill'

import { usePageIndex } from './Pagination'
import { useSearchTerm } from '.'

const Pagination = dynamic(() => import('./Pagination'), {
  ssr: false,
})

import { MoonLoader } from 'react-spinners'

import ProjectListImage from './ProjectListImage'
import { RouterOutputs } from '@servicegeek/api'
const ProjectListView = ({
  redirectTo = 'overview',
  hidePagination,
  isFetching,
  getProjectsQueryResult,
}: {
  redirectTo?: string
  hidePagination: boolean
  isFetching: boolean
  getProjectsQueryResult: RouterOutputs['projects']['getProjects']
}) => {
  const searchTerm = useSearchTerm()
  const router = useRouter()

  const handleNavigation = (e: any, publicId: string) => {
    e.preventDefault()
    router.push(`/projects/${publicId}/${redirectTo}`)
  }

  const projects =
    isFetching && searchTerm
      ? { data: [], count: 0 }
      : getProjectsQueryResult
      ? getProjectsQueryResult
      : { data: [], count: 0 }

  return (
    <div className="mt-8 flex h-full flex-col overflow-scroll pb-20 ">
      <div className="divide-y divide-gray-200 rounded-lg shadow ring-1 ring-black ring-opacity-5">
        <div className="grid grid-cols-5 divide-y divide-gray-200 border-b border-gray-200 bg-gray-50">
          <div className="col-span-2 px-3 py-3.5 text-left text-sm font-semibold text-gray-900 ">
            Name
          </div>
          <div className="col-span-3 block px-3 py-3.5 text-left text-sm font-semibold text-gray-900 sm:hidden">
            Details
          </div>
          <div className="hidden px-3 py-3.5 text-left text-sm font-semibold text-gray-900 sm:block">
            Address
          </div>
          <div className="hidden px-3 py-3.5 text-left text-sm font-semibold text-gray-900 sm:block">
            Date
          </div>
          <div className="hidden px-3 py-3.5 text-left text-sm font-semibold text-gray-900 sm:block">
            Status
          </div>
        </div>
        {isFetching && searchTerm && (
          <div className="flex w-full items-center justify-center py-10">
            <MoonLoader className="" />
          </div>
        )}
        {!isFetching && searchTerm && projects.data.length === 0 && (
          <div className="flex w-full items-center justify-center py-10">
            There are no projects that match this search critera
          </div>
        )}
        {projects.data.map((project) => (
          <div
            className="grid grid-cols-5 bg-white hover:cursor-pointer hover:bg-primary hover:bg-opacity-5 "
            key={project.publicId}
            onClick={(e) => {
              handleNavigation(e, project.publicId)
            }}
          >
            <div className="col-span-2 flex py-4 pl-4 pr-3  text-sm sm:pl-6">
              <div className="flex items-center">
                <div className="relative flex h-28 w-28 items-center justify-center overflow-hidden rounded-lg shadow-md sm:h-24 sm:w-24">
                  {project.images.length === 0 ? (
                    <PhotoIcon className="w-full text-slate-400" />
                  ) : (
                    <div className="w-full text-slate-400">
                      <ProjectListImage path={project.images[0].key} />
                    </div>
                  )}
                </div>
              </div>
              <div>
                <div className="ml-4 hidden sm:block">
                  <div className="text-lg font-bold text-gray-900 ">
                    {project.clientName}
                  </div>
                  <div className="text-gray-500">
                    {project._count.images} Photos
                  </div>
                  <div
                    className={`relative flex h-full ${
                      project.projectAssignees.length > 0 &&
                      'h-4 min-h-[1rem] w-4 min-w-[1rem] sm:h-8 sm:min-h-[2rem] sm:w-8 sm:min-w-[2rem]'
                    }`}
                  >
                    {project.projectAssignees.map((a, i) => (
                      <div
                        key={a.userId}
                        className="absolute h-full "
                        style={{ left: `${i * 15}px` }}
                      >
                        <UserAvatar
                          className={clsx(
                            'h-4 min-h-[1rem] w-4 min-w-[1rem] sm:h-8 sm:min-h-[2rem] sm:w-8 sm:min-w-[2rem]'
                          )}
                          textSize="text-xs"
                          userId={a.userId}
                          firstName={a.user.firstName}
                          lastName={a.user.lastName}
                          email={a.user?.email}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div className="col-span-3 flex flex-col justify-between px-3 py-4 text-sm text-gray-500 sm:hidden">
              <div className="text-md font-bold text-gray-900">
                {project.name}
              </div>
              <div className="text-gray-900">
                <Address address={project.location} />
              </div>
              <div className="text-gray-500">
                {dateFormat(project.createdAt, 'dddd, mmmm dS yyyy')}
              </div>
              <div>
                <StatusPill status={project.status} />
              </div>
            </div>
            <div className="hidden items-center px-3 py-4 text-base text-gray-500 sm:flex">
              <div className="text-gray-900">
                <Address address={project.location} />
              </div>
            </div>
            <div className=" hidden items-center px-3 py-4 text-base text-gray-500 sm:flex">
              <div className="text-gray-500">
                {dateFormat(project.createdAt, 'dddd, mmmm dS yyyy')}
              </div>
            </div>
            <div className=" hidden items-center px-3 py-4 text-base text-gray-500 sm:flex">
              {project.currentStatus?.label ? (
                <StatusValuePill
                  label={project.currentStatus.label}
                  color={project.currentStatus.color}
                />
              ) : (
                <StatusPill status={project.status} />
              )}
            </div>
          </div>
        ))}
      </div>
      {!hidePagination && (
        <Pagination
          totalProjects={projects.count}
          projectsOnPage={projects.data.length}
        />
      )}
    </div>
  )
}

export default ProjectListView
