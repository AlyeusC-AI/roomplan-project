"use client";

import { Fragment, useState } from 'react'
import { orgStore } from '@atoms/organization'
import { userInfoStore } from '@atoms/user-info'
import { TertiaryButton } from '@components/components/button'
import { PrimaryLink } from '@components/components/link'
import { LogoIconBlue } from '@components/components/logo'
import UserAvatar from '@components/DesignSystem/UserAvatar'
import NotificationPanel from '@components/NotificationPanel'
import { Menu, Transition } from '@headlessui/react'
import {
  BellDotIcon,
  BriefcaseIcon,
  CalendarIcon,
  ChartBarIcon,
  CogIcon,
  MapIcon,
} from 'lucide-react'
import { AccessLevel } from '@servicegeek/db'
import { trpc } from '@utils/trpc'
import clsx from 'clsx'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@lib/supabase/client'

const sidebarNavigation = [
  { name: 'Projects', href: '/projects', icon: BriefcaseIcon },
  { name: 'Map', href: '/map', icon: MapIcon },
  { name: 'Calendar', href: '/calender', icon: CalendarIcon },
  {
    name: 'Performance',
    href: '/performance',
    icon: ChartBarIcon,
    adminOnly: true,
  },
  { name: 'Settings', href: '/settings/account', icon: CogIcon },
]

const NotificationCount = () => {
  const getNotificationCount =
    trpc.notification.getUnreadNotificationCount.useQuery()
  return (
    <>
      {getNotificationCount &&
      getNotificationCount.data !== undefined &&
      getNotificationCount.data > 0 ? (
        <span className="absolute -top-2 right-0 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white shadow-lg">
          {getNotificationCount.data > 9 ? '9+' : getNotificationCount.data}
        </span>
      ) : null}
    </>
  )
}

export default function Content({
  overflow,
  children,
  hideParentNav = false,
  renderSecondaryNavigation,
}: {
  overflow: boolean
  children: React.ReactNode
  hideParentNav?: boolean
  renderSecondaryNavigation?: () => React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const orgInfo = orgStore(state => state.organization)
  const userInfo = userInfoStore((state) => state.user)
  const [open, setOpen] = useState(false)

  const supabaseClient = createClient()

  return (
    <div className="flex h-screen flex-1 overflow-hidden">
      {/* Narrow sidebar*/}
      {!hideParentNav && (
        <nav
          aria-label="Sidebar"
          className="hidden h-screen md:block md:flex-shrink-0 md:bg-gray-800"
        >
          <div className="relative flex h-screen w-44 flex-col justify-between p-3">
            <div>
              <div className="mb-4">
                <div className="flex items-center justify-between">
                  <Link href="/projects" className="w-8">
                    <LogoIconBlue />
                  </Link>
                  <TertiaryButton
                    onClick={() => setOpen((o) => !o)}
                    className="relative ml-8 px-0"
                    noPadding
                  >
                    <BellDotIcon className="h-6 w-6 text-gray-400" />
                    {orgInfo?.name && <NotificationCount />}
                  </TertiaryButton>

                  <Menu as="div" className="relative py-0 px-0">
                    <div>
                      <Menu.Button className="flex rounded-full bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                        <span className="sr-only">Open user menu</span>
                        <UserAvatar
                          className="h-6 w-6"
                          firstName={userInfo?.firstName || ''}
                          lastName={userInfo?.lastName || ''}
                          userId={userInfo?.id}
                          textSize="text-xs"
                          email={userInfo?.email}
                        />
                      </Menu.Button>
                    </div>
                    <Transition
                      as={Fragment}
                      enter="transition ease-out duration-200"
                      enterFrom="transform opacity-0 scale-95"
                      enterTo="transform opacity-100 scale-100"
                      leave="transition ease-in duration-75"
                      leaveFrom="transform opacity-100 scale-100"
                      leaveTo="transform opacity-0 scale-95"
                    >
                      <Menu.Items className="absolute left-0 z-50 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                        <Menu.Item>
                          {({ active }) => (
                            <Link
                              href={'/settings/account'}
                              className={clsx(
                                active ? 'bg-slate-50' : '',
                                'block px-4 py-2 text-sm text-gray-700'
                              )}
                            >
                              Account
                            </Link>
                          )}
                        </Menu.Item>
                        <Menu.Item>
                          {({ active }) => (
                            <Link
                              href="/privacy"
                              className={clsx(
                                active ? 'bg-slate-50' : '',
                                'block px-4 py-2 text-sm text-gray-700'
                              )}
                            >
                              Privacy
                            </Link>
                          )}
                        </Menu.Item>
                        <Menu.Item>
                          {({ active }) => (
                            <Link
                              href="/terms"
                              className={clsx(
                                active ? 'bg-slate-50' : '',
                                'block px-4 py-2 text-sm text-gray-700'
                              )}
                            >
                              Terms
                            </Link>
                          )}
                        </Menu.Item>
                        <Menu.Item>
                          {({ active }) => (
                            <>
                              {/*eslint-disable-next-line @next/next/no-html-link-for-pages */}
                              <button
                                onClick={async () => {
                                  await supabaseClient.auth.signOut()
                                  router.push('/')
                                }}
                                className={clsx(
                                  active ? 'bg-slate-50' : '',
                                  'block px-4 py-2 text-sm text-gray-700'
                                )}
                              >
                                Sign out
                              </button>
                            </>
                          )}
                        </Menu.Item>
                      </Menu.Items>
                    </Transition>
                  </Menu>
                </div>
              </div>

              <h4 className="my-2 text-sm font-bold text-white">
                {orgInfo?.name}
              </h4>
              <div className="flex flex-col space-y-3">
                {sidebarNavigation.map((item) => {
                  const isAdmin =
                    userInfo?.isAdmin ||
                    userInfo?.accessLevel === AccessLevel.admin
                  if (item.adminOnly && !isAdmin) return null
                  return (
                    <Link
                      id={`side-bar-nav-button-${item.name}`}
                      key={item.name}
                      href={item.href}
                      className={clsx(
                        pathname!.indexOf(item.href) >= 0
                          ? 'bg-gray-700 text-accent-light'
                          : 'text-gray-400 hover:bg-gray-700',
                        'grid w-full grid-cols-4 rounded-lg py-2'
                      )}
                    >
                      <div className="flex items-center justify-center">
                        <item.icon className="h-5 w-5" aria-hidden="true" />
                      </div>
                      <div className="col-span-3 flex items-center pl-2">
                        <span className="text-sm">{item.name}</span>
                      </div>
                    </Link>
                  )
                })}
              </div>
              {/* <h4 className="mt-8 mb-2 text-sm font-bold text-white">
                Resources
              </h4>
              <div className="flex flex-col space-y-3">
                {resourcesNav.map((item) => (
                  <Link
                    id={`side-bar-nav-button-${item.name}`}
                    key={item.name}
                    href={item.href}
                    {...(item.target && { target: item.target })}
                    className={clsx(
                      router.asPath.indexOf(item.href) >= 0
                        ? 'bg-gray-900 text-white'
                        : 'text-gray-400 hover:bg-gray-700',
                      'grid h-14 w-full grid-cols-4 rounded-lg'
                    )}
                  >
                    <div className="flex items-center justify-center">
                      <item.icon className="h-5 w-5" aria-hidden="true" />
                    </div>
                    <div className="col-span-3 flex items-center pl-4">
                      <span className="text-sm">{item.name}</span>
                    </div>
                  </Link>
                ))}
              </div> */}
            </div>
            {process.env.PRICING_ENABLED === 'true' && (
              <div className="flex flex-col">
                {(userInfo?.isAdmin ||
                  userInfo?.accessLevel === AccessLevel.admin) && (
                  <PrimaryLink
                    variant="invert-swag"
                    className="w-full"
                    href="/settings/billing"
                  >
                    Upgrade
                  </PrimaryLink>
                )}
              </div>
            )}
          </div>
        </nav>
      )}
      {/* Main area */}
      <main className="min-w-0 flex-1 flex-row md:flex md:flex-col lg:flex-row">
        {/* Primary column */}
        <section
          aria-labelledby="primary-heading"
          className={clsx(
            'flex  min-w-0 flex-1 flex-col bg-gray-50 lg:order-last',
            overflow ? 'h-full overflow-scroll' : 'h-screen overflow-hidden'
          )}
        >
          <h1 id="primary-heading" className="sr-only">
            Home
          </h1>
          {children}
        </section>
        {/* Secondary column (hidden on smaller screens) */}

        {renderSecondaryNavigation && (
          <aside className="hidden md:order-first md:block md:flex-shrink-0">
            <div className="relative flex h-full w-full flex-row overflow-y-auto border-r border-gray-200 bg-gray-100 lg:w-44 lg:flex-col">
              {renderSecondaryNavigation()}
            </div>
          </aside>
        )}
      </main>
      {orgInfo?.name && <NotificationPanel open={open} setOpen={setOpen} />}
    </div>
  )
}
