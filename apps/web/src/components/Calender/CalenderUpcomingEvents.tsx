// @ts-nocheck
import { Fragment } from 'react'
import { Menu, Transition } from '@headlessui/react'
import {
  CalendarIcon,
  EllipsisHorizontalIcon,
} from '@heroicons/react/24/outline'
import classNames from '@utils/classNames'
import { calenderEvents, deleteCalenderBody } from '@utils/hooks/useScheduler'
import Link from 'next/link'

const CalenderUpcomingEvents = ({
  calenderEvents,
  deleteCalenderEvent,
  handleEditUpcomingEvent,
  projectId,
}: {
  calenderEvents: calenderEvents[]
  deleteCalenderEvent: (body: deleteCalenderBody) => void
  handleEditUpcomingEvent: (publicId: string) => void
  projectId: string
}) => {
  return (
    <div className="h-full md:w-2/4">
      <h1 className="sticky top-0 pl-3 text-lg font-semibold text-gray-900">
        Upcoming reminders
      </h1>
      {!calenderEvents?.length && (
        <div className="rounded-md bg-gray-50 p-3">
          <div className="flex">
            <div className="flex-shrink-0">
              <CalendarIcon
                aria-hidden="true"
                className="h-5 w-5 text-blue-400"
              ></CalendarIcon>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-700">
                No upcoming reminders
              </h3>
              <div className="text-grey-700 mt-2 text-sm">
                <ul role="list" className="list-disc space-y-1">
                  <li>
                    Visit the calender page to add reminders to your{' '}
                    <Link
                      className="text-primary"
                      key={projectId}
                      href={`/projects/${projectId}/calendar`}
                    >
                      calender
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
      <ol>
        {calenderEvents?.map((meeting) => (
          <li key={meeting.publicId} className="relative flex space-x-6 py-4">
            <div className="flex-auto">
              <h3 className="pr-10 text-gray-900 xl:pr-0">{meeting.subject}</h3>
              <h4 className="pr-10 text-gray-900 xl:pr-0">{meeting.payload}</h4>
              <div className="flex-auto">
                <dl className="mt-2 flex flex-row text-gray-500">
                  <div className="flex items-start space-x-3">
                    <dt className="mt-0.5">
                      <span className="sr-only">Date</span>
                      <CalendarIcon
                        className="h-5 w-5 text-gray-400"
                        aria-hidden="true"
                      />
                    </dt>
                    <dd>
                      <time className="word-break:break-word;">
                        {new Date(meeting?.date)?.toUTCString()}
                      </time>
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
            <Menu
              as="div"
              className="absolute top-6 right-0 xl:relative xl:top-auto xl:right-auto xl:self-center"
            >
              <div>
                <Menu.Button className="-m-2 flex items-center rounded-full p-2 text-gray-500 hover:text-gray-600">
                  <span className="sr-only">Open options</span>
                  <EllipsisHorizontalIcon
                    className="h-5 w-5"
                    aria-hidden="true"
                  />
                </Menu.Button>
              </div>

              <Transition
                // @ts-ignore
                as={Fragment}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
              >
                <Menu.Items className="absolute right-0 z-10 mt-2 w-36 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                  <div className="py-1">
                    <Menu.Item>
                      {({ active }) => (
                        <a
                          href="#"
                          className={classNames(
                            active
                              ? 'bg-gray-100 text-gray-900'
                              : 'text-gray-700',
                            'block px-4 py-2 text-sm'
                          )}
                          onClick={() => {
                            handleEditUpcomingEvent(meeting.publicId)
                          }}
                        >
                          Edit
                        </a>
                      )}
                    </Menu.Item>
                    <Menu.Item>
                      {({ active }) => (
                        <a
                          href="#"
                          className={classNames(
                            active
                              ? 'bg-gray-100 text-gray-900'
                              : 'text-gray-700',
                            'block px-4 py-2 text-sm'
                          )}
                          onClick={() => {
                            deleteCalenderEvent({
                              calendarEventPublicId: meeting.publicId,
                            })
                          }}
                        >
                          Delete
                        </a>
                      )}
                    </Menu.Item>
                  </div>
                </Menu.Items>
              </Transition>
            </Menu>
          </li>
        ))}
      </ol>
    </div>
  )
}

export default CalenderUpcomingEvents
