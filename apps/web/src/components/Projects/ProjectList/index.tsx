import { useState } from 'react'
import PrimaryButton from '@components/DesignSystem/Buttons/PrimaryButton'
import CreateFirstProject from '@components/Onboarding/CreateFirstProject'
import InviteInitialUsers from '@components/Onboarding/InviteInitialUsers'
import { DashboardViews } from '@restorationx/db'
import { useDynamicOnboardingStep } from '@utils/hooks/useOnboardingStep'
import { trpc } from '@utils/trpc'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'
import { useRecoilState } from 'recoil'
import projectsState from '@atoms/projectsState'

import CreateNewProject from '../CreateNewProject'

import { usePageIndex } from './Pagination'
import ProjectListView from './ProjectListView'
import { ProjectMapView } from './ProjectMapView'
import ProjectSearch from './ProjectSearch'
import ViewSwitcher from './ViewSwitcher'
import userInfoState from '@atoms/userInfoState'

const ProjectBoardView = dynamic(() => import('./ProjectBoardView'), {
  ssr: false,
})

export const useSearchTerm = () => {
  const router = useRouter()

  return router.query.search && !Array.isArray(router.query.search)
    ? router.query.search
    : undefined
}

export default function ProjectList({
  showHeader = true,
  redirectTo = 'overview',
  viewPreference = 'listView',
  totalProjects,
  hidePagination = false,
}: {
  showHeader?: boolean
  redirectTo?: string
  viewPreference?: DashboardViews
  totalProjects: number
  hidePagination?: boolean
}) {
  const [initialProjects] = useRecoilState(projectsState)
  const [userInfo, setUserInfo] = useRecoilState(userInfoState)
  const { startingIndex, parsedIndex } = usePageIndex()
  const searchTerm = useSearchTerm()
  const [isCreatingNewProject, setIsCreatingNewProject] = useState(false)
  const seenInviteInitialUsers = useDynamicOnboardingStep(
    'seenInviteInitialUsers'
  )

  const getProjectsQuery = trpc.projects.getProjects.useQuery(
    { searchTerm, page: parsedIndex },
    {
      initialData: {
        data: initialProjects,
        count: totalProjects,
      },
    }
  )

  const setView = (view: DashboardViews) => {
    setUserInfo((old) => {
      if (!old) return old
      return {
        ...old,
        savedDashboardView: view,
      }
    })
  }

  const projects = getProjectsQuery.data

  if (projects?.count === 0 && !searchTerm) {
    if (!seenInviteInitialUsers) {
      return (
        <>
          <div className="flex h-full w-full items-center justify-center">
            <InviteInitialUsers />
          </div>
        </>
      )
    }

    return (
      <>
        <div className="flex h-full w-full items-center justify-center">
          <CreateFirstProject />
        </div>
      </>
    )
  }

  return (
    <>
      {showHeader && (
        <div>
          <div className="flex justify-between space-x-6">
            <div className="max-w-[220px] sm:max-w-none sm:flex-auto">
              <h1 className="text-xl font-semibold text-gray-900">Projects</h1>
              <p className="mt-2 text-sm text-gray-700">
                Select a project to manage files and estimates.
              </p>
            </div>
            <div className="flex min-w-[100px] flex-col space-y-4">
              <PrimaryButton onClick={() => setIsCreatingNewProject((i) => !i)}>
                New Project
              </PrimaryButton>
            </div>
          </div>
          <div className="mt-2 flex justify-between">
            <ProjectSearch />
            <ViewSwitcher
              view={userInfo?.savedDashboardView || 'listView'}
              setView={setView}
            />
          </div>
        </div>
      )}
      {userInfo?.savedDashboardView === DashboardViews.listView && (
        <ProjectListView
          redirectTo={redirectTo}
          hidePagination={hidePagination}
          isFetching={getProjectsQuery.isFetching}
          getProjectsQueryResult={getProjectsQuery.data}
        />
      )}
      {userInfo?.savedDashboardView === DashboardViews.boardView && (
        <ProjectBoardView redirectTo={redirectTo} />
      )}
      {userInfo?.savedDashboardView === DashboardViews.mapView && (
        <ProjectMapView />
      )}
      {showHeader && (
        <CreateNewProject
          open={isCreatingNewProject}
          setOpen={setIsCreatingNewProject}
        />
      )}
    </>
  )
}
