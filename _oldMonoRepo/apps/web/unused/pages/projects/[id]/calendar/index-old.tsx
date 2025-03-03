import { Fragment, useEffect, useState } from 'react'
import { ScaleLoader } from 'react-spinners'
import { PrimaryButton } from '@components/components/button'
import AppContainer from '@components/layouts/AppContainer'
import MainContent from '@components/layouts/MainContent'
import TabNavigation from '@components/layouts/TabNavigation'
import ProjectNavigationContainer from '@components/Project/ProjectNavigationContainer'
import { Member } from '@components/Settings/Organization/types'
import { Dialog, Transition } from '@headlessui/react'
import getMembers from '@servicegeek/db/queries/organization/getMembers'
import getSubcriptionStatus from '@servicegeek/db/queries/organization/getSubscriptionStatus'
import { getInferenceList } from '@servicegeek/db/queries/project/getProjectDetections'
import getProjectForOrg from '@servicegeek/db/queries/project/getProjectForOrg'
import getUsersForProject, {
  Stakeholders,
} from '@servicegeek/db/queries/project/getUsersForProject'
import getOrgInfo, { OrgInfo } from '@lib/serverSidePropsUtils/getOrgInfo'
import getProjectInfo, {
  ProjectInfo,
} from '@lib/serverSidePropsUtils/getProjectInfo'
import getUserInfo, { UserInfo } from '@lib/serverSidePropsUtils/getUserInfo'
import getUserWithAuthStatus, {
  ORG_ACCESS_LEVEL,
} from '@lib/serverSidePropsUtils/getUserWithAuthStatus'
import { SubscriptionStatus } from '@servicegeek/db'
import useScheduler, { calenderEvents } from '@utils/hooks/useScheduler'
import type { GetServerSidePropsContext, NextPage } from 'next'
import dynamic from 'next/dynamic'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { RecoilRoot } from 'recoil'
import initRecoilAtoms from '@atoms/initRecoilAtoms'
import superjson from 'superjson'

import CalenderEventModal from '../../../calender/components/event-modal'
import { User } from '@supabase/supabase-js'

const FullCalendar = dynamic(() => import('@pages/calender/components'), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center">
      <ScaleLoader color="#2563eb" />
    </div>
  ),
})

interface EstimatePageProps {
  user: User
  accessToken: string
  error?: string
  projectInfo: ProjectInfo
  subscriptionStatus: SubscriptionStatus
  orgInfo: OrgInfo
  userInfo: UserInfo
  stakeholders: Stakeholders[]
  teamMembers: Member[]
}

const tabs = (id: string) => [
  { name: 'Calendar', href: `/projects/${id}/calendar` },
  {
    name: 'Upcoming reminders',
    href: `/projects/${id}/calendar/upcoming-reminders`,
  },
]

const CalenderPage: NextPage<EstimatePageProps> = ({
  projectInfo,
  userInfo,
  orgInfo,
  stakeholders,
  teamMembers,
  subscriptionStatus,
}) => {
  useEffect(() => {
    setTimeout(() => {
      // @ts-ignore
      window?.HubSpotConversations?.widget?.remove()
    }, 2000)
  }, [])
  const router = useRouter()
  const { id } = router.query
  const {
    calenderEvents,
    createCalenderEvent,
    updateCalenderEvent,
    deleteCalenderEvent,
  } = useScheduler({
    projectId: id as string,
  })
  const [timeStamp, setTimeStamp] = useState<Date>()
  const [isCreateCalenderEventModalOpen, setIsCreateCalenderEventModalOpen] =
    useState(false)
  const [existingCalenderEventSelected, setExistingCalenderEventSelected] =
    useState<calenderEvents>()

  const handleDateSelect = (selectInfo: any) => {
    setExistingCalenderEventSelected(undefined)
    const timeStamp: Date = new Date(selectInfo.start.getTime())
    setTimeStamp(timeStamp)
    setIsCreateCalenderEventModalOpen(true)
  }

  const handleEventClick = (clickInfo: any) => {
    setExistingCalenderEventSelected(
      calenderEvents.find(
        (event) => event.publicId === clickInfo.event._def.publicId
      )
    )
    setIsCreateCalenderEventModalOpen(true)
  }

  return (
    <RecoilRoot
      initializeState={initRecoilAtoms({
        userInfo,
        orgInfo,
        stakeholders,
        teamMembers,
        projectInfo,
      })}
    >
      <AppContainer
        hideParentNav
        subscriptionStatus={subscriptionStatus}
        renderSecondaryNavigation={() => <ProjectNavigationContainer />}
      >
        <Head>
          <title>ServiceGeek - Estimate</title>
          <meta name="description" content="Project Estimate and Details" />
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <TabNavigation tabs={tabs} />
        <MainContent>
          <div className="mb-4 flex justify-between space-x-6">
            <div className="max-w-[220px] sm:max-w-none sm:flex-auto">
              <div className="col-span-2 flex-col">
                <h3 className="text-2xl font-medium leading-6 text-gray-900">
                  Calendar
                </h3>
                <p className="mt-2 pr-8 text-base text-gray-500">
                  Create calendar events and text reminders for your project.
                </p>
              </div>
            </div>
            <div className="flex min-w-[100px] flex-col space-y-6">
              <PrimaryButton
                onClick={() => {
                  setExistingCalenderEventSelected(undefined)
                  setIsCreateCalenderEventModalOpen(true)
                }}
              >
                New Event
              </PrimaryButton>
            </div>
          </div>
          <div className="lg:flex lg:h-full lg:flex-col">
            <FullCalendar
              events={calenderEvents.map((event) => ({
                title: event.subject,
                start: event.date,
                id: event.publicId,
              }))}
              select={handleDateSelect}
              eventClick={handleEventClick}
            ></FullCalendar>

            <Transition.Root
              show={isCreateCalenderEventModalOpen}
              // @ts-ignore
              as={Fragment}
            >
              <Dialog
                as="div"
                className="relative z-10"
                onClose={setIsCreateCalenderEventModalOpen}
              >
                <Transition.Child
                  // @ts-ignore
                  as={Fragment}
                  enter="ease-in-out duration-2000"
                  enterFrom="opacity-0"
                  enterTo="opacity-50"
                  leave="ease-in-out duration-2000"
                  leaveFrom="opacity-50"
                  leaveTo="opacity-0"
                >
                  <div className="fixed inset-0 bg-gray-500 bg-opacity-30 transition-opacity" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-hidden">
                  <div className="absolute inset-0 overflow-hidden">
                    <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
                      <Transition.Child
                        // @ts-ignore
                        as={Fragment}
                        enter="transform transition ease-in-out duration-500 sm:duration-700"
                        enterFrom="translate-x-full"
                        enterTo="translate-x-0"
                        leave="transform transition ease-in-out duration-500 sm:duration-700"
                        leaveFrom="translate-x-0"
                        leaveTo="translate-x-full"
                      >
                        <Dialog.Panel className="pointer-events-auto relative w-96">
                          <CalenderEventModal
                            date={timeStamp}
                            teamMembers={teamMembers}
                            projectId={id as string}
                            projectInfo={projectInfo}
                            createEvent={createCalenderEvent}
                            editEvent={updateCalenderEvent}
                            setOpen={setIsCreateCalenderEventModalOpen}
                            deleteCalenderEvent={deleteCalenderEvent}
                            existingCalenderEventSelected={
                              existingCalenderEventSelected
                            }
                            stakeholders={stakeholders}
                          ></CalenderEventModal>
                        </Dialog.Panel>
                      </Transition.Child>
                    </div>
                  </div>
                </div>
              </Dialog>
            </Transition.Root>
          </div>
        </MainContent>
      </AppContainer>
    </RecoilRoot>
  )
}

export default CalenderPage

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
  try {
    const { user, orgAccessLevel } = await getUserWithAuthStatus(ctx)

    if (!user) {
      return {
        redirect: {
          destination: '/login',
          permanent: false,
        },
      }
    }

    if (orgAccessLevel === ORG_ACCESS_LEVEL.REMOVED) {
      return {
        redirect: {
          destination: '/access-revoked',
          permanent: false,
        },
      }
    }
    const orgId = user.org?.organization.id || null
    if (!orgId || !ctx.query.id || Array.isArray(ctx.query.id)) {
      return {
        redirect: {
          destination: '/projects',
          permanent: false,
        },
      }
    }
    let project = await getProjectForOrg(ctx.query.id, orgId)
    if (!project) {
      return {
        redirect: {
          destination: '/projects',
          permanent: false,
        },
      }
    }

    const inferenceList = await getInferenceList(ctx.query.id, orgId)
    const inferences = inferenceList?.rooms || []
    const subscriptionStatus = await getSubcriptionStatus(user.id)
    const stakeholders = await getUsersForProject(user.id, project.publicId)
    const members = await getMembers(orgId)
    const serializedMembers = superjson.serialize(members)

    return {
      props: {
        inferences,
        userInfo: getUserInfo(user),
        projectInfo: getProjectInfo(project),
        orgInfo: getOrgInfo(user),
        subscriptionStatus,
        stakeholders,
        teamMembers: serializedMembers.json,
      },
    }
  } catch (e) {
    console.error(e)
    return {
      props: {},
    }
  }
}
