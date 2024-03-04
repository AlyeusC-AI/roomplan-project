// @ts-nocheck
import { Fragment, useState } from 'react'
import DatePicker from 'react-datepicker'
import TrailEndedBanner from '@components/Banners/TrailEndedBanner'
import FullCalendar from '@components/Calender'
import CalenderProjectsModal from '@components/Calender/CalenderProjectsModal'
import AppContainer from '@components/layouts/AppContainer'
import MainContent from '@components/layouts/MainContent'
import { Dialog, Transition } from '@headlessui/react'
import { XMarkIcon } from '@heroicons/react/24/outline'
import getCalendarEvents from '@restorationx/db/queries/calendar-event/getCalendarEvents'
import getInvitation from '@restorationx/db/queries/invitations/getInvitation'
import getSubcriptionStatus from '@restorationx/db/queries/organization/getSubscriptionStatus'
import listProjects, {
  ProjectType,
} from '@restorationx/db/queries/project/listProjects'
import getOrgInfo, { OrgInfo } from '@lib/serverSidePropsUtils/getOrgInfo'
import getUserInfo, { UserInfo } from '@lib/serverSidePropsUtils/getUserInfo'
import getUserWithAuthStatus, {
  ORG_ACCESS_LEVEL,
} from '@lib/serverSidePropsUtils/getUserWithAuthStatus'
import {
  OrganizationInvitation,
  Project,
  SubscriptionStatus,
} from '@restorationx/db'
import type { GetServerSidePropsContext, NextPage } from 'next'
import Head from 'next/head'
import { RecoilRoot } from 'recoil'
import initRecoilAtoms from '@atoms/initRecoilAtoms'
import superjson from 'superjson'
import StakeholdersCalendarLegend from '@components/Calender/StakeholdersCalendarLegend'
import 'react-datepicker/dist/react-datepicker.css'

export interface InviteStatus {
  accepted: boolean
  organizationName: string
  inviteId: string
}

interface ProjectPageProps {
  error?: string
  orgId?: string | null
  projects?: ProjectType[] | null
  subscriptionStatus: SubscriptionStatus
  inviteStatus: InviteStatus | null
  userInfo: UserInfo
  allEvents: {
    isDeleted: boolean
    publicId: string
    projectId: number | null
    subject: string
    payload: string
    project: Project | null
    date: Date
    dynamicId: string
  }[]
  totalProjects: number
  orgInfo: OrgInfo
}

const ProjectPage: NextPage<ProjectPageProps> = ({
  orgId,
  projects,
  subscriptionStatus,
  inviteStatus,
  userInfo,
  allEvents,
  totalProjects,
  orgInfo,
}) => {
  const allAssigness = projects
    ?.map((project) => project.projectAssignees)
    ?.flat()
    ?.filter((v, i, a) => a.findIndex((t) => t.userId === v.userId) === i)
    ?.map((assignee) => assignee)
  const [currentAssignees, setCurrentAssignees] = useState()
  const [showProjectsModal, setShowProjectsModal] = useState(false)
  const [isCreateCalenderEventModalOpen, setIsCreateCalenderEventModalOpen] =
    useState(false)

  const [existingCalenderEventSelected, setExistingCalenderEventSelected] =
    useState<{
      isDeleted: boolean
      publicId: string
      projectId: number | null
      subject: string
      payload: string
      project: Project | null
      date: Date
      dynamicId: string
    }>()

  const handleEventClick = (clickInfo: any, projs: ProjectType[]) => {
    const existingEvent = allEvents?.find(
      (event) => event?.publicId === clickInfo.event._def.publicId
    )

    setExistingCalenderEventSelected(existingEvent)
    setCurrentAssignees(
      projs?.find((p) => p.publicId === existingEvent?.project?.publicId)
        ?.projectAssignees || []
    )
    setIsCreateCalenderEventModalOpen(true)
  }

  return (
    <RecoilRoot
      initializeState={initRecoilAtoms({
        userInfo,
        projects: projects || [],
        orgInfo,
      })}
    >
      <AppContainer subscriptionStatus={subscriptionStatus}>
        <Head>
          <title>RestorationX - Calender</title>
          <meta
            name="description"
            content="Access the organization's calender"
          />
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <MainContent>
          <>
            {showProjectsModal && (
              <CalenderProjectsModal
                isOpen={showProjectsModal}
                setOpen={() => setShowProjectsModal(!showProjectsModal)}
              />
            )}
            <Transition.Root
              show={isCreateCalenderEventModalOpen}
              as={Fragment}
            >
              <Dialog
                as="div"
                className="relative z-10"
                onClose={setIsCreateCalenderEventModalOpen}
              >
                <Transition.Child
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
                        as={Fragment}
                        enter="transform transition ease-in-out duration-500 sm:duration-700"
                        enterFrom="translate-x-full"
                        enterTo="translate-x-0"
                        leave="transform transition ease-in-out duration-500 sm:duration-700"
                        leaveFrom="translate-x-0"
                        leaveTo="translate-x-full"
                      >
                        <Dialog.Panel className="pointer-events-auto relative w-96">
                          <form className="flex h-full flex-col divide-y divide-gray-200 bg-white shadow-xl">
                            <div className="h-0 flex-1 overflow-y-auto">
                              <div className="bg-blue-500 py-6 px-4 sm:px-6">
                                <div className="flex items-center justify-between">
                                  <Dialog.Title className="text-lg font-medium text-white">
                                    Event Details
                                  </Dialog.Title>
                                  <div className="ml-3 flex h-7 items-center">
                                    <button
                                      type="button"
                                      className="bg-blue-5000 rounded-md text-indigo-200 hover:text-white focus:outline-none focus:ring-2 focus:ring-white"
                                      onClick={() =>
                                        setIsCreateCalenderEventModalOpen(false)
                                      }
                                    >
                                      <span className="sr-only">
                                        Close panel
                                      </span>
                                      <XMarkIcon
                                        className="h-6 w-6"
                                        aria-hidden="true"
                                      />
                                    </button>
                                  </div>
                                </div>
                              </div>
                              <div className="flex flex-1 flex-col justify-between">
                                <div className="divide-y divide-gray-200 px-4 sm:px-6">
                                  <div className="space-y-6 pt-6 pb-5">
                                    <div>
                                      <label
                                        htmlFor="project-name"
                                        className="block text-sm font-medium text-gray-900"
                                      >
                                        Event name
                                      </label>
                                      <div className="mt-1">
                                        {existingCalenderEventSelected?.subject}
                                      </div>
                                    </div>
                                    <div>
                                      <label
                                        htmlFor="description"
                                        className="block text-sm font-medium text-gray-900"
                                      >
                                        Description
                                      </label>
                                      <div className="mt-1">
                                        {existingCalenderEventSelected?.payload}
                                      </div>
                                    </div>
                                    <div>
                                      <label
                                        htmlFor="description"
                                        className="block text-sm font-medium text-gray-900"
                                      >
                                        Time
                                      </label>
                                      <div className="mt-1">
                                        <DatePicker
                                          selected={
                                            new Date(
                                              existingCalenderEventSelected?.date
                                            )
                                          }
                                          showTimeSelect
                                          disabled={true}
                                          onChange={(date) => console.log(date)}
                                          dateFormat="MMMM d h:mm aa"
                                        />
                                      </div>
                                    </div>
                                  </div>

                                  {/* Team members */}
                                  <div className="pt-4 pb-6">
                                    <label
                                      htmlFor="description"
                                      className="block text-sm font-medium text-gray-900"
                                    >
                                      Project assignees
                                    </label>
                                    <div className="sm:col-span-2">
                                      <div className="flex mt-2">
                                        <StakeholdersCalendarLegend
                                          stakeholders={currentAssignees}
                                        />
                                      </div>
                                    </div>
                                  </div>

                                  <div className="pt-4 pb-6">
                                    <div>
                                      <label
                                        htmlFor="description"
                                        className="block text-sm font-medium text-gray-900"
                                      >
                                        Project data
                                      </label>
                                      <div className="mt-1"></div>
                                    </div>
                                    <div className="flex justify-between py-3 text-sm font-medium">
                                      <dt className="text-gray-500">
                                        Client name
                                      </dt>
                                      <dt className="text-gray-500">
                                        {existingCalenderEventSelected?.project
                                          ?.clientName || 'N/A'}
                                      </dt>
                                    </div>

                                    <div className="flex justify-between py-3 text-sm font-medium">
                                      <dt className="text-gray-500">
                                        Client location
                                      </dt>
                                      <dt className="text-gray-500">
                                        {existingCalenderEventSelected?.project
                                          ?.location || 'N/A'}
                                      </dt>
                                    </div>

                                    <div className="flex justify-between py-3 text-sm font-medium">
                                      <dt className="text-gray-500">
                                        Client email
                                      </dt>
                                      <dt className="text-gray-500">
                                        {existingCalenderEventSelected?.project
                                          ?.clientEmail || 'N/A'}
                                      </dt>
                                    </div>

                                    <div className="flex justify-between py-3 text-sm font-medium">
                                      <dt className="text-gray-500">
                                        Client phone number
                                      </dt>
                                      <dt className="text-gray-500">
                                        {existingCalenderEventSelected?.project
                                          ?.clientPhoneNumber || 'N/A'}
                                      </dt>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </form>
                        </Dialog.Panel>
                      </Transition.Child>
                    </div>
                  </div>
                </div>
              </Dialog>
            </Transition.Root>
            <>
              {subscriptionStatus === SubscriptionStatus.past_due && (
                <TrailEndedBanner />
              )}
              <div className="lg:flex lg:h-full lg:flex-col">
                <header className="flex items-center justify-between border-b border-gray-200 py-4 px-6 lg:flex-none">
                  <div className="max-w-[220px] sm:max-w-none sm:flex-auto">
                    <h1 className="text-xl font-semibold text-gray-900">
                      Organization calender
                    </h1>
                    <p className="mt-2 text-sm text-gray-700">
                      All calender reminders from all your projects
                    </p>
                  </div>

                  <div className="flex items-center">
                    <StakeholdersCalendarLegend stakeholders={allAssigness} />
                    <div className="hidden md:ml-4 md:flex md:items-center">
                      <div className="ml-6 h-6 w-px bg-gray-300" />
                      <button
                        type="button"
                        className="ml-6 rounded-md border border-transparent bg-blue-500 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                        onClick={() => setShowProjectsModal(true)}
                      >
                        Add event
                      </button>
                    </div>
                  </div>
                </header>
                <FullCalendar
                  eventStartEditable={false}
                  editable={false}
                  eventClick={(e) => handleEventClick(e, projects)}
                  events={allEvents.map((event) => ({
                    title: `Project: ${event.project?.name} \n Subject: ${event.subject}`,
                    start: event.date,
                    id: event.publicId,
                  }))}
                ></FullCalendar>
              </div>
            </>
          </>
        </MainContent>
      </AppContainer>
    </RecoilRoot>
  )
}

export default ProjectPage

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
  try {
    const { user, orgAccessLevel, accessToken } = await getUserWithAuthStatus(
      ctx
    )

    if (!user) {
      return {
        redirect: {
          destination: '/login',
          permanent: false,
        },
      }
    }

    if (!user.org) {
      return {
        redirect: {
          destination: '/projects',
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

    const publicOrgId = user.org?.organization.publicId || null
    let projects = null
    let allEvents = []
    let totalProjects = 0
    if (user.org?.organization.id) {
      const orgWithProjects = await listProjects(user.org?.organization.id)
      projects = superjson.serialize(orgWithProjects?.projects)
        .json as unknown as ProjectType[]
      totalProjects = orgWithProjects?._count.projects || 0

      // get all calender events for each project
      const projectsPromises = projects.map((p: ProjectType) =>
        getCalendarEvents({
          userId: user.id,
          projectId: p.publicId,
        })
      )
      const projectsEvents = superjson.serialize(
        await Promise.all(projectsPromises)
      ).json as unknown as any
      allEvents = projectsEvents.reduce((acc: any, curr: any) => {
        return acc?.concat(curr)
      }, [])
      console.log(allEvents)
    }
    const subscriptionStatus = await getSubcriptionStatus(user.id)

    let inviteStatus: InviteStatus | null = null
    let invitation: OrganizationInvitation | null = null
    if (user.inviteId) {
      invitation = await getInvitation(user.inviteId)
      if (invitation) {
        inviteStatus = {
          accepted: invitation?.isAccepted,
          organizationName: user.org!.organization.name,
          inviteId: invitation.invitationId,
        }
      }
    }

    return {
      props: {
        orgId: publicOrgId,
        projects,
        subscriptionStatus,
        inviteStatus,
        userInfo: getUserInfo(user),
        allEvents,
        totalProjects,
        orgInfo: getOrgInfo(user),
      },
    }
  } catch (e) {
    console.error(e)
    return {
      props: {},
    }
  }
}
