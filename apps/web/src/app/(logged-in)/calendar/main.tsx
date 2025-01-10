'use client'

import { Fragment, useEffect, useState } from 'react'
import DatePicker from 'react-datepicker'
import { Dialog, Transition } from '@headlessui/react'
import { CalendarIcon, Check, ChevronsUpDown, XCircleIcon } from 'lucide-react'
import {
  Assignee,
  ProjectType,
} from '@servicegeek/db/queries/project/listProjects'
import { Project } from '@servicegeek/db'
import StakeholdersCalendarLegend from './components/StakeholdersCalendarLegend'
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
import { projectsStore } from '@atoms/projects'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@components/ui/sheet'
import { Input } from '@components/ui/input'
import { z } from 'zod'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@components/ui/form'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Popover, PopoverContent, PopoverTrigger } from '@components/ui/popover'
import { format } from 'date-fns'
import { cn } from '@lib/utils'
import { toast } from 'sonner'
import { Calendar } from '@components/ui/calendar'
import { Checkbox } from '@components/ui/checkbox'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@components/ui/command'

export interface InviteStatus {
  accepted: boolean
  organizationName: string
  inviteId: string
}

const calendarEventSchema = z.object({
  subject: z
    .string()
    .min(2, {
      message: 'Event subject must be at least 2 characters.',
    })
    .max(30, {
      message: 'Event subject must not be longer than 30 characters.',
    }),
  projectId: z.string().min(1, { message: 'Project is required' }),
  payload: z
    .string()
    .min(2, {
      message: 'Event message must be at least 2 characters.',
    })
    .max(200, {
      message: 'Event message must not be longer than 200 characters.',
    }),
  remindProjectOwners: z.boolean().optional(),
  remindClient: z.boolean().optional(),
  date: z.date({
    required_error: 'Date is required',
  }),
  reminderDate: z.date().optional(),
})

type CreateEventValues = z.infer<typeof calendarEventSchema>

// export type CalendarEvent = {
//   id: number
//   publicId: string
//   createdAt: Date
//   updatedAt: Date
//   subject: string
//   payload: string
//   projectId: number | null
//   date: Date
//   dynamicId: string
//   isDeleted: boolean
//   remindClient: boolean
//   remindProjectOwners: boolean
// }

const CalendarPage = () => {
  const { projects } = projectsStore((state) => state)

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

  const form = useForm<CreateEventValues>({
    resolver: zodResolver(calendarEventSchema),
    mode: 'onChange',
  })

  const [createPopover, setCreatePopover] = useState(false)

  function onSubmit(data: CreateEventValues) {
    toast('You submitted the following values:', {
      description: (
        <pre className="bg-slate-950 mt-2 w-[340px] rounded-md p-4">
          <code className="text-white">{JSON.stringify(data, null, 2)}</code>
        </pre>
      ),
    })
  }

  return (
    // <MainContent>
    <div className="flex h-screen flex-col">
      {showProjectsModal && (
        // <CalenderProjectsModal
        //   isOpen={showProjectsModal}
        //   setOpen={() => setShowProjectsModal(!showProjectsModal)}
        // />
        <Sheet open={showProjectsModal} onOpenChange={setShowProjectsModal}>
          <SheetContent className='overflow-y-scroll'>
            <SheetHeader>
              <SheetTitle>New Calendar Event</SheetTitle>
              <SheetDescription>Create a new calendar event.</SheetDescription>
            </SheetHeader>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-8 pt-3"
              >
                <FormField
                  control={form.control}
                  name="projectId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Project</FormLabel>
                      <FormControl>
                        <Popover
                          open={createPopover}
                          onOpenChange={setCreatePopover}
                        >
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              role="combobox"
                              aria-expanded={createPopover}
                              className="w-full justify-between"
                            >
                              {field.value
                                ? projects.find(
                                    (framework) => framework.publicId === field.value
                                  )?.name
                                : 'Select project...'}
                              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-full p-0">
                            <Command>
                              <CommandInput placeholder="Search projects..." />
                              <CommandList>
                                <CommandEmpty>No project found.</CommandEmpty>
                                <CommandGroup>
                                  {projects.map((project) => (
                                    <CommandItem
                                      key={project.publicId}
                                      value={project.name}
                                      onSelect={() => {
                                        field.onChange(
                                          project.publicId === field.value
                                            ? ''
                                            : project.publicId
                                        )
                                        setCreatePopover(false)
                                      }}
                                    >
                                      <Check
                                        className={cn(
                                          'mr-2 h-4 w-4',
                                          field.value === project.publicId
                                            ? 'opacity-100'
                                            : 'opacity-0'
                                        )}
                                      />
                                      {project.name}
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        </Popover>
                      </FormControl>
                      <FormDescription>
                        Select the project you want for your event.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="subject"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Event Subject</FormLabel>
                      <FormControl>
                        <Input placeholder="Event Name" {...field} />
                      </FormControl>
                      <FormDescription>The name of your event.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="payload"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Event Description</FormLabel>
                      <FormControl>
                        <Input placeholder="Event Description" {...field} />
                      </FormControl>
                      <FormDescription>
                        The description of your event.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Event Date</FormLabel>
                      <FormControl>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant={'outline'}
                              className={cn(
                                'w-full justify-start text-left font-normal',
                                !field.value && 'text-muted-foreground'
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {field.value ? (
                                format(field.value, 'PPP')
                              ) : (
                                <span>Pick a date</span>
                              )}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-full p-0">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </FormControl>
                      <FormDescription>
                        The date you want your event to take place.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="reminderDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Event Reminder Date</FormLabel>
                      <FormControl>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant={'outline'}
                              className={cn(
                                'w-full justify-start text-left font-normal',
                                !field.value && 'text-muted-foreground'
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {field.value ? (
                                format(field.value ?? Date.now(), 'PPP')
                              ) : (
                                <span>Pick a reminder date</span>
                              )}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-full p-0">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </FormControl>
                      <FormDescription>
                        The date you want to remind your client about the event.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormItem>
                  <FormLabel>Reminders</FormLabel>
                  <FormField
                    control={form.control}
                    name="remindProjectOwners"
                    render={({ field }) => (
                      <div className="mt-3 flex items-center space-x-2">
                        <Checkbox
                          id="terms1"
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                        <div className="grid gap-1.5 leading-none">
                          <label
                            htmlFor="terms1"
                            className="font-regular text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            Remind Project Owners
                          </label>
                        </div>
                      </div>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="remindClient"
                    render={({ field }) => (
                      <div className="mt-3 flex items-center space-x-2">
                        <Checkbox
                          id="terms1"
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                        <div className="grid gap-1.5 leading-none">
                          <label
                            htmlFor="terms1"
                            className="font-regular text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            Remind Client
                          </label>
                        </div>
                      </div>
                    )}
                  />

                  <FormDescription>
                    Select who you'd like to remind about the event.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
                <Button type="submit">Create Event</Button>
              </form>
            </Form>
          </SheetContent>
        </Sheet>
      )}
      {/* <Transition.Root show={isCreateCalenderEventModalOpen} as={Fragment}>
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
      </Transition.Root> */}
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

export default CalendarPage
