// @ts-nocheck
/* This example requires Tailwind CSS v2.0+ */
import { Fragment, useMemo, useState } from 'react'
import LogoIconBlue from '@components/DesignSystem/Logo/LogoIconBlue'
import LogoTextBlue from '@components/DesignSystem/Logo/LogoTextBlue'
import UserAvatar from '@components/DesignSystem/UserAvatar'
import { Dialog, Disclosure, Menu, Transition } from '@headlessui/react'
import {
  ArrowRightOnRectangleIcon,
  BellIcon,
  BookOpenIcon,
  BriefcaseIcon,
  CogIcon,
  HomeIcon,
  QuestionMarkCircleIcon,
  UserCircleIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline'
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react'
import clsx from 'clsx'
import Link from 'next/link'
import { useRouter } from 'next/router'

const navigation = [
  { name: 'Projects', href: '/projects', icon: BriefcaseIcon },
  {
    name: 'Settings',
    href: '/settings/account',
    icon: CogIcon,
  },
]

const secondaryNavigation = [
  { name: 'Help', href: '#', icon: QuestionMarkCircleIcon },
]

export default function AppHeader({ skeleton }: { skeleton?: boolean }) {
  const user = useUser()
  const router = useRouter()
  const [noImage, setNoImage] = useState(false)

  const [sidebarOpen, setSidebarOpen] = useState(false)
  let id = router.query.id || ''
  if (Array.isArray(id) || !id) {
    id = ''
  }
  const supabaseClient = useSupabaseClient()

  const projectNavigation = useMemo(
    () => [
      {
        name: 'Details',
        href: skeleton ? '#' : `/projects/${id}/overview`,
        icon: BookOpenIcon,
      },
      // {
      //   name: 'Estimate',
      //   href: skeleton ? '#' : `/projects/${id}/inspection`,

      //   icon: CalculatorIcon,
      // },
      // {
      //   name: 'Images',
      //   href: skeleton ? '#' : `/projects/${id}/images`,

      //   icon: PhotographIcon,
      // },
      // {
      //   name: 'Files',
      //   href: skeleton ? '#' : `/projects/${id}/inspection/files`,

      //   icon: FolderIcon,
      // },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [id]
  )

  return (
    <Disclosure as="nav" className="sticky top-0 z-20 bg-white shadow">
      {({ open }) => (
        <>
          <Transition.Root
            show={sidebarOpen} // @ts-ignore
            as={Fragment}
          >
            <Dialog
              as="div"
              className="relative z-40 lg:hidden"
              onClose={setSidebarOpen}
            >
              <Transition.Child
                // @ts-ignore
                as={Fragment}
                enter="transition-opacity ease-linear duration-300"
                enterFrom="opacity-0"
                enterTo="opacity-100"
                leave="transition-opacity ease-linear duration-300"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
              >
                <div className="fixed inset-0 bg-gray-600 bg-opacity-75" />
              </Transition.Child>

              <div className="fixed inset-0 z-40 flex">
                <Transition.Child
                  // @ts-ignore
                  as={Fragment}
                  enter="transition ease-in-out duration-300 transform"
                  enterFrom="-translate-x-full"
                  enterTo="translate-x-0"
                  leave="transition ease-in-out duration-300 transform"
                  leaveFrom="translate-x-0"
                  leaveTo="-translate-x-full"
                >
                  <Dialog.Panel className="relative flex w-full max-w-xs flex-1 flex-col bg-white pt-5 pb-4">
                    <Transition.Child
                      // @ts-ignore
                      as={Fragment}
                      enter="ease-in-out duration-300"
                      enterFrom="opacity-0"
                      enterTo="opacity-100"
                      leave="ease-in-out duration-300"
                      leaveFrom="opacity-100"
                      leaveTo="opacity-0"
                    >
                      <div className="absolute top-0 right-0 -mr-14 p-1">
                        <button
                          type="button"
                          className="flex h-12 w-12 items-center justify-center rounded-full focus:bg-gray-600 focus:outline-none"
                          onClick={() => setSidebarOpen(false)}
                        >
                          <XMarkIcon
                            className="h-6 w-6 text-white"
                            aria-hidden="true"
                          />
                          <span className="sr-only">Close sidebar</span>
                        </button>
                      </div>
                    </Transition.Child>
                    <div className="flex flex-shrink-0 items-center px-4">
                      <LogoTextBlue />
                    </div>
                    <div className="mt-5 h-0 flex-1 overflow-y-auto">
                      <nav className="flex h-full flex-col">
                        <div className="space-y-1">
                          {navigation.map((item) => (
                            <Fragment key={item.name}>
                              <Link
                                href={skeleton ? '#' : item.href}
                                className={clsx(
                                  router.pathname === item.href
                                    ? 'border-blue-600 bg-blue-50 text-primary'
                                    : 'border-transparent text-gray-600 hover:bg-gray-50 hover:text-gray-900',
                                  'group flex items-center border-l-4 py-2 px-3 text-base font-medium'
                                )}
                                aria-current={
                                  router.pathname === item.href
                                    ? 'page'
                                    : undefined
                                }
                              >
                                <item.icon
                                  className={clsx(
                                    router.pathname === item.href
                                      ? 'text-blue-500'
                                      : 'text-gray-400 group-hover:text-gray-500',
                                    'mr-4 h-6 w-6 flex-shrink-0'
                                  )}
                                  aria-hidden="true"
                                />
                                {item.name}
                              </Link>
                              {item.name === 'Projects' &&
                                router.pathname.indexOf('/projects/[id]') >=
                                  0 && (
                                  <div className="ml-6">
                                    {projectNavigation.map((project) => (
                                      <Link
                                        key={project.href}
                                        href={skeleton ? '#' : project.href}
                                        className={clsx(
                                          router.asPath === project.href
                                            ? 'border-blue-600 bg-blue-50 text-primary'
                                            : 'border-transparent text-gray-600 hover:bg-gray-50 hover:text-gray-900',
                                          'group flex items-center border-l-4 py-2 px-3 text-base font-medium'
                                        )}
                                        aria-current={
                                          router.asPath === project.href
                                            ? 'page'
                                            : undefined
                                        }
                                      >
                                        <project.icon
                                          className={clsx(
                                            router.asPath === project.href
                                              ? 'text-blue-500'
                                              : 'text-gray-400 group-hover:text-gray-500',
                                            'mr-4 h-6 w-6 flex-shrink-0'
                                          )}
                                          aria-hidden="true"
                                        />
                                        {project.name}
                                      </Link>
                                    ))}
                                  </div>
                                )}
                              {item.name === 'Settings' &&
                                router.pathname.indexOf('/settings/') >= 0 && (
                                  <div className="ml-6">
                                    <Link
                                      href={
                                        skeleton ? '#' : '/settings/account'
                                      }
                                      className={clsx(
                                        router.pathname === '/settings/account'
                                          ? 'border-blue-600 bg-blue-50 text-primary'
                                          : 'border-transparent text-gray-600 hover:bg-gray-50 hover:text-gray-900',
                                        'group flex items-center border-l-4 py-2 px-3 text-base font-medium'
                                      )}
                                      aria-current={
                                        router.pathname === '/settings/account'
                                          ? 'page'
                                          : undefined
                                      }
                                    >
                                      <UserCircleIcon
                                        className={clsx(
                                          router.pathname ===
                                            '/settings/account'
                                            ? 'text-blue-500'
                                            : 'text-gray-400 group-hover:text-gray-500',
                                          'mr-4 h-6 w-6 flex-shrink-0'
                                        )}
                                        aria-hidden="true"
                                      />
                                      Account
                                    </Link>
                                    <Link
                                      href={
                                        skeleton
                                          ? '#'
                                          : '/settings/organization'
                                      }
                                      className={clsx(
                                        router.pathname ===
                                          '/settings/organization'
                                          ? 'border-blue-600 bg-blue-50 text-primary'
                                          : 'border-transparent text-gray-600 hover:bg-gray-50 hover:text-gray-900',
                                        'group flex items-center border-l-4 py-2 px-3 text-base font-medium'
                                      )}
                                      aria-current={
                                        router.pathname ===
                                        '/settings/organization'
                                          ? 'page'
                                          : undefined
                                      }
                                    >
                                      <BriefcaseIcon
                                        className={clsx(
                                          router.pathname ===
                                            '/settings/organization'
                                            ? 'text-blue-500'
                                            : 'text-gray-400 group-hover:text-gray-500',
                                          'mr-4 h-6 w-6 flex-shrink-0'
                                        )}
                                        aria-hidden="true"
                                      />
                                      Organization
                                    </Link>
                                  </div>
                                )}
                            </Fragment>
                          ))}
                        </div>
                        <div className="mt-auto space-y-1 pt-10">
                          {secondaryNavigation.map((item) => (
                            <a
                              key={item.name}
                              href={skeleton ? '#' : item.href}
                              className="group flex items-center border-l-4 border-transparent py-2 px-3 text-base font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                            >
                              <item.icon
                                className="mr-4 h-6 w-6 text-gray-400 group-hover:text-gray-500"
                                aria-hidden="true"
                              />
                              {item.name}
                            </a>
                          ))}
                          <button
                            className="group flex items-center border-l-4 border-transparent py-2 px-3 text-base font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                            onClick={async () => {
                              await supabaseClient.auth.signOut()
                              router.push('/')
                            }}
                          >
                            <ArrowRightOnRectangleIcon
                              className="mr-4 h-6 w-6 text-gray-400 group-hover:text-gray-500"
                              aria-hidden="true"
                            />
                            Logout
                          </button>
                        </div>
                      </nav>
                    </div>
                  </Dialog.Panel>
                </Transition.Child>
                <div className="w-14 flex-shrink-0" aria-hidden="true">
                  {/* Dummy element to force sidebar to shrink to fit close icon */}
                </div>
              </div>
            </Dialog>
          </Transition.Root>
          <div className="mx-auto max-w-[100rem]">
            <div className="grid h-16 grid-cols-3">
              <div className="col-span-1 flex items-center justify-between">
                <button
                  type="button"
                  className="h-full border-r border-gray-200 pl-6 pr-4 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 md:pl-8 lg:hidden"
                  onClick={() => setSidebarOpen(true)}
                >
                  <span className="sr-only">Open sidebar</span>
                  <HomeIcon className="h-6 w-6" aria-hidden="true" />
                </button>
                <Link
                  href={skeleton ? '#' : '/projects'}
                  className="ml-4 hidden h-full w-8 lg:flex"
                >
                  <LogoIconBlue />
                </Link>
              </div>

              <div className="col-span-1 flex items-center justify-center"></div>
              <div className="col-span-1 mr-6 flex items-center justify-end md:mr-8">
                <button
                  type="button"
                  className="rounded-full bg-white p-1 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  <span className="sr-only">View notifications</span>
                  <BellIcon className="h-6 w-6" aria-hidden="true" />
                </button>

                {/* Profile dropdown */}
                <Menu as="div" className="relative ml-3">
                  <div>
                    <Menu.Button className="flex rounded-full bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                      <span className="sr-only">Open user menu</span>
                      <UserAvatar
                        email={user?.email}
                        firstName={user?.user_metadata.firstName || ''}
                        lastName={user?.user_metadata.lastName || ''}
                        userId={user?.id}
                      />
                    </Menu.Button>
                  </div>
                  <Transition
                    // @ts-ignore
                    as={Fragment}
                    enter="transition ease-out duration-200"
                    enterFrom="transform opacity-0 scale-95"
                    enterTo="transform opacity-100 scale-100"
                    leave="transition ease-in duration-75"
                    leaveFrom="transform opacity-100 scale-100"
                    leaveTo="transform opacity-0 scale-95"
                  >
                    <Menu.Items className="absolute right-0 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                      <Menu.Item>
                        {({ active }) => (
                          <Link
                            href={skeleton ? '#' : '/settings/account'}
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
          </div>
        </>
      )}
    </Disclosure>
  )
}
