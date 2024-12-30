// @ts-nocheck
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { trpc } from '@utils/trpc'
import { useRouter } from 'next/navigation'

import Column from './Column'
import { PrimaryButton } from '@components/components/button'
import { userInfoStore } from '@atoms/user-info'

const ProjectBoardView = ({
  redirectTo = 'overview',
}: {
  redirectTo?: string
}) => {
  const userInfo = userInfoStore((state) => state.user)
  const router = useRouter()
  const { data } = trpc.projects.getBoardProjects.useQuery({})
  const getAllProjectStatuses =
    trpc.projectStatus.getAllProjectStatuses.useQuery({
      publicProjectId: undefined,
    })

  const statusList = getAllProjectStatuses.data?.statuses || []

  return (
    <>
      {userInfo?.isAdmin && (
        <div className="mt-4 flex">
          <PrimaryButton
            onClick={() => {
              router.push('/settings/workflow')
            }}
          >
            Configure workflow
          </PrimaryButton>
        </div>
      )}
      <div className="mt-8 h-full overflow-hidden">
        <DndProvider backend={HTML5Backend}>
          <div className="relative flex h-full w-full flex-row space-x-4 overflow-x-auto">
            {statusList
              .sort((a, b) => ((a.order || -1) < (b.order || -1) ? -1 : 1))
              .map((status, index) => (
                <Column
                  key={status.label}
                  title={status.label || 'No Label'}
                  value={status.label}
                  color={status.color}
                  statusPublicId={status.publicId}
                  redirectTo={redirectTo}
                  projects={(data?.data || []).filter((p) => {
                    if (status.label === undefined) {
                      return !p.currentStatus
                    }
                    return p.currentStatus
                      ? p.currentStatus.label.toLowerCase() ===
                          status.label.toLowerCase()
                      : (p.status || '').toLowerCase() ===
                          status.label.toLowerCase()
                  })}
                />
              ))}
          </div>
        </DndProvider>
      </div>
    </>
  )
}

export default ProjectBoardView
