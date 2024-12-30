'use client'

import { useEffect, useState } from 'react'
import CreateFirstProject from '@components/onboarding/CreateFirstProject'
import InviteInitialUsers from '@components/onboarding/InviteInitialUsers'
import { DashboardViews } from '@servicegeek/db'
import dynamic from 'next/dynamic'
import { useSearchParams } from 'next/navigation'
import { Tabs, TabsList, TabsTrigger } from '@components/ui/tabs'

import CreateNewProject from '../CreateNewProject'

import ProjectListView from './ProjectListView'
import { ProjectMapView } from './ProjectMapView'
import ProjectSearch from './ProjectSearch'
import { userInfoStore } from '@atoms/user-info'
import { projectsStore } from '@atoms/projects'
import { Button } from '@components/ui/button'
import { Table } from '@app/(logged-in)/settings/equipment/table'
import { Card } from '@components/ui/card'

const ProjectBoardView = dynamic(() => import('./ProjectBoardView'), {
  ssr: false,
})

export const useSearchTerm = () => {
  const router = useSearchParams()

  return router?.get('search')
}

export default function ProjectList({
  showHeader = true,
  redirectTo = 'overview',
  hidePagination = false,
}: {
  showHeader?: boolean
  redirectTo?: string
  hidePagination?: boolean
}) {

  const { projects, setProjects } = projectsStore((state) => state)
  const { user, setUser } = userInfoStore((state) => state)
  const searchTerm = useSearchTerm()
  const [isCreatingNewProject, setIsCreatingNewProject] = useState(false)

  useEffect(() => {
    fetch('/api/v1/projects')
      .then((res) => res.json())
      .then((data) => {
        setProjects(data.projects)
        console.log(data)
      })
  }, [])

  const setView = (preference: DashboardViews) => {
    if (!user) {
      return
    }

    fetch('/api/user/save-dashboard-preference', {
      method: 'PATCH',
      body: JSON.stringify({
        preference,
      }),
    })

    setUser({ ...user, savedDashboardView: preference })
  }

  if (projects?.length === 0 && !searchTerm) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <CreateFirstProject />
      </div>
    )
  }

  return (
    <>
      {showHeader && (
        <div>
          <div className="mt-3 flex justify-between space-x-6">
            <div className="max-w-[220px] sm:max-w-none sm:flex-auto">
              <h1 className="text-xl font-semibold text-gray-900">Projects</h1>
              <p className="mt-2 text-sm text-gray-700">
                Select a project to manage files and estimates.
              </p>
            </div>
            <div className="flex min-w-[100px] flex-col space-y-4">
              <Button onClick={() => setIsCreatingNewProject((i) => !i)}>
                New Project
              </Button>
            </div>
          </div>
          <div className="mt-2 flex justify-between">
            <ProjectSearch />
            <Tabs
              defaultValue={user?.savedDashboardView || DashboardViews.listView}
              onValueChange={(e) => setView(e as DashboardViews)}
            >
              <TabsList>
                <TabsTrigger value={DashboardViews.listView}>
                  List View
                </TabsTrigger>
                <TabsTrigger value={DashboardViews.boardView}>
                  Board View
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>
      )}

      <View />
      <CreateNewProject
        open={isCreatingNewProject}
        setOpen={setIsCreatingNewProject}
      />
    </>
  )

  function View() {
    switch (user?.savedDashboardView) {
      case DashboardViews.listView:
        return (
          <Card>
            <Table />
          </Card>
          // <ProjectListView
          //   redirectTo={redirectTo}
          //   hidePagination={hidePagination}
          //   isFetching={false}
          // />
        )
      case DashboardViews.boardView:
        return <ProjectBoardView redirectTo={redirectTo} />
      case DashboardViews.mapView:
        return <ProjectMapView />
      default:
        return (
          <ProjectListView
            redirectTo={redirectTo}
            hidePagination={hidePagination}
            isFetching={false}
          />
        )
    }
  }
}
