import { Fragment } from 'react'
import { Menu, Transition } from '@headlessui/react'
import { EllipsisVerticalIcon } from '@heroicons/react/20/solid'
import { BellAlertIcon, BellIcon } from '@heroicons/react/24/outline'
import { RouterOutputs } from '@servicegeek/api'
import clsx from 'clsx'
import { format } from 'date-fns'

const tabs = [
  { name: 'Notifications', href: '#', current: true },
  { name: 'Team Activity', href: '#', current: false },
]

export type NotificationItemType = {
  title: string
  content: string
  createdAt: Date
  isSeen: boolean
  link?: string
  linkText: string
  type: 'notification' | 'activity'
  id: string
}

export default function NotificationItem({
  notification,
}: {
  notification: RouterOutputs['notification']['getNotifications'][0]
}) {
  return (
    <li>
      <div
        className={clsx(
          'group relative flex items-center py-6 px-5',
          !notification.isSeen && 'bg-blue-50'
        )}
      >
        <a href={notification.link || '#'} className="-m-1 block flex-1 p-1">
          <div
            className="absolute inset-0 group-hover:bg-gray-50"
            aria-hidden="true"
          />
          <div className="relative flex min-w-0 flex-1">
            <span className="relative inline-block flex-shrink-0">
              {!notification.isSeen ? (
                <BellAlertIcon
                  className={clsx(
                    'h-10 w-10 rounded-full',
                    !notification.isSeen ? 'text-gray-900' : 'text-gray-400'
                  )}
                />
              ) : (
                <BellIcon
                  className={clsx(
                    'h-10 w-10 rounded-full',
                    !notification.isSeen ? 'text-gray-900' : 'text-gray-400'
                  )}
                />
              )}
            </span>
            <div className="ml-4">
              <p
                className={clsx(
                  'text-sm font-medium ',
                  !notification.isSeen ? 'text-gray-900' : 'text-gray-600'
                )}
              >
                {notification.content}
              </p>
              <p className="text-sm text-gray-500">
                {format(notification.createdAt, "eee, MMM d 'at' K:mm b")}
              </p>
            </div>
          </div>
        </a>
        <Menu
          as="div"
          className="relative ml-2 inline-block flex-shrink-0 text-left"
        >
          <Menu.Button className="group relative inline-flex h-8 w-8 items-center justify-center rounded-full bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
            <span className="sr-only">Open options menu</span>
            <span className="flex h-full w-full items-center justify-center rounded-full">
              <EllipsisVerticalIcon
                className="h-5 w-5 text-gray-400 group-hover:text-gray-500"
                aria-hidden="true"
              />
            </span>
          </Menu.Button>
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
            <Menu.Items className="absolute top-0 right-9 z-10 w-48 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
              <div className="py-1">
                <Menu.Item>
                  {({ active }) => (
                    <a
                      href="#"
                      className={clsx(
                        active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                        'block px-4 py-2 text-sm'
                      )}
                    >
                      View profile
                    </a>
                  )}
                </Menu.Item>
                <Menu.Item>
                  {({ active }) => (
                    <a
                      href="#"
                      className={clsx(
                        active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                        'block px-4 py-2 text-sm'
                      )}
                    >
                      Send message
                    </a>
                  )}
                </Menu.Item>
              </div>
            </Menu.Items>
          </Transition>
        </Menu>
      </div>
    </li>
  )
}
