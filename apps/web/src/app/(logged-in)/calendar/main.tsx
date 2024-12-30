'use client'

import { Fragment, useEffect, useState } from 'react'
import DatePicker from 'react-datepicker'
import CalenderProjectsModal from './components/projects-modal'
import MainContent from '@components/layouts/MainContent'
import { Dialog, Transition } from '@headlessui/react'
import { XCircleIcon } from 'lucide-react'
import {
  Assignee,
  ProjectType,
} from '@servicegeek/db/queries/project/listProjects'
import { Project, SubscriptionStatus } from '@servicegeek/db'
import StakeholdersCalendarLegend from './components/StakeholdersCalendarLegend'
// import { userInfoStore } from '@atoms/user-info'
// import { projectsStore } from '@atoms/projects'
// import { orgStore } from '@atoms/organization'
import {
  CalendarBody,
  CalendarDate,
  CalendarDatePagination,
  CalendarDatePicker,
  CalendarHeader,
  CalendarItem,
  CalendarMonthPicker,
  CalendarProvider,
  CalendarYearPicker,
} from '@/components/roadmap-ui/calendar'

// import 'react-datepicker/dist/react-datepicker.css'
import { exampleFeatures } from '../settings/equipment/table'
import { Card } from '@components/ui/card'
import { Button } from '@components/ui/button'

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
  allEvents:
    | {
        isDeleted: boolean
        publicId: string
        projectId: number | null
        subject: string
        payload: string
        project: Project | null
        date: Date
        dynamicId: string
      }[]
    | undefined
  totalProjects: number
  orgInfo: OrgInfo
}

const Calendar = ({ projects }: LoggedInUserInfo) => {
  const allAssigness =
    projects
      ?.map((project) => project.projectAssignees)
      ?.flat()
      ?.filter((v, i, a) => a.findIndex((t) => t.userId === v.userId) === i)
      ?.map((assignee) => assignee) ?? []
      
  const [currentAssignees, setCurrentAssignees] = useState<Assignee[]>([])
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

  useEffect(() => {
    fetch('/api/v1/projects')
    .then((res) => res.json())
    .then((data) => {
      console.log(data)
    })
  })

  const earliestYear =
    exampleFeatures
      .map((feature) => feature.startAt.getFullYear())
      .sort()
      .at(0) ?? new Date().getFullYear()

  const latestYear =
    exampleFeatures
      .map((feature) => feature.endAt.getFullYear())
      .sort()
      .at(-1) ?? new Date().getFullYear()

  return (
    // <MainContent>
    <div className="flex h-screen flex-col">
      {showProjectsModal && (
        <CalenderProjectsModal
          isOpen={showProjectsModal}
          setOpen={() => setShowProjectsModal(!showProjectsModal)}
        />
      )}
      <Transition.Root show={isCreateCalenderEventModalOpen} as={Fragment}>
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
                                <span className="sr-only">Close panel</span>
                                <XCircleIcon
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
                                      existingCalenderEventSelected &&
                                      new Date(
                                        existingCalenderEventSelected.date
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

                            <div className="pt-4 pb-6">
                              <label
                                htmlFor="description"
                                className="block text-sm font-medium text-gray-900"
                              >
                                Project assignees
                              </label>
                              <div className="sm:col-span-2">
                                <div className="mt-2 flex">
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
                                <dt className="text-gray-500">Client name</dt>
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
                                <dt className="text-gray-500">Client email</dt>
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
        <div className=" lg:h-full">
          <header className="flex items-center justify-between border-b border-gray-200 pb-4 pl-3 lg:flex-none">
            <div className="space-y-0.5">
              <h2 className="text-2xl font-bold tracking-tight">Calendar</h2>
              <p className="text-muted-foreground">
                All calender reminders from all your projects.
              </p>
            </div>

            <div className="flex items-center">
              <StakeholdersCalendarLegend stakeholders={allAssigness} />
              <div className="hidden md:ml-4 md:flex md:items-center">
                <div className="ml-6 h-6 w-px bg-gray-300" />
                <Button onClick={() => setShowProjectsModal(true)}>
                  Add event
                </Button>
              </div>
            </div>
          </header>
          <Card className="mt-5">
            <CalendarProvider>
              <CalendarDate>
                <CalendarDatePicker>
                  <CalendarMonthPicker />
                  <CalendarYearPicker start={earliestYear} end={latestYear} />
                </CalendarDatePicker>
                <CalendarDatePagination />
              </CalendarDate>
              <CalendarHeader />
              <CalendarBody features={exampleFeatures}>
                {({ feature }) => (
                  <CalendarItem key={feature.id} feature={feature} />
                )}
              </CalendarBody>
            </CalendarProvider>
          </Card>
          {/* <FullCalendar
                eventStartEditable={false}
                editable={false}
                eventClick={(e) => handleEventClick(e, projects ?? [])}
                events={(allEvents ?? []).map((event) => ({
                  title: `Project: ${event.project?.name} \n Subject: ${event.subject}`,
                  start: event.date,
                  id: event.publicId,
                }))}
              ></FullCalendar> */}
        </div>
      </>
    </div>
    /* </MainContent> */
  )
}

export default Calendar
