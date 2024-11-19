/* eslint-disable @next/next/no-img-element */
import { Fragment, useMemo, useState } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { BookOpenIcon, HomeModernIcon } from '@heroicons/react/20/solid'
import {
  ArrowLeftIcon,
  Bars3Icon,
  BriefcaseIcon,
  CalendarIcon,
  CogIcon,
  CurrencyDollarIcon,
  DocumentIcon,
  NewspaperIcon,
  PhotoIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline'
import clsx from 'clsx'
import Link from 'next/link'
import { useRouter } from 'next/router'

export default function MobileNav() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const router = useRouter()

  const navigation = useMemo(() => {
    if (router.pathname.indexOf('/projects/[id]') >= 0) {
      return [
        {
          name: 'Overview',
          href: `/projects/${router.query.id}/overview`,
          children: [],
          icon: NewspaperIcon,
        },
        {
          name: 'Files',
          href: `/projects/${router.query.id}/files`,
          children: [],
          icon: DocumentIcon,
        },
        {
          name: 'Photos',
          href: `/projects/${router.query.id}/photos`,
          children: [],
          icon: PhotoIcon,
        },
        {
          name: 'Mitigation',
          href: `/projects/${router.query.id}/mitigation`,
          children: [
            {
              name: 'Notes',
              href: `/projects/${router.query.id}/mitigation/notes`,
            },
            {
              name: 'Scope',
              href: `/projects/${router.query.id}/mitigation/scope`,
            },
            {
              name: 'Equipment',
              href: `/projects/${router.query.id}/mitigation/equipment`,
            },
          ],
          icon: BookOpenIcon,
        },
        {
          name: 'Expenses',
          href: `/projects/${router.query.id}/expenses`,
          children: [],
          icon: CurrencyDollarIcon,
        },
        // { name: 'Repairs', href: `#`, children: [], icon: CurrencyDollarIcon },
        {
          name: 'Calendar',
          href: `/projects/${router.query.id}/calendar`,
          children: [
            {
              name: 'Upcoming Reminders',
              href: `/projects/${router.query.id}/calendar/upcoming-reminders`,
            },
          ],
          icon: CalendarIcon,
        },
        // {
        //   name: 'Property',
        //   href: `/projects/${router.query.id}/property-info`,
        //   children: [],
        //   icon: EyeIcon,
        // },
        {
          name: 'Roofing',
          href: `/projects/${router.query.id}/roofing`,
          children: [
            {
              name: 'Wind Maps',
              href: `/projects/${router.query.id}/roofing-weather`,
            },
            {
              name: '3d',
              href: `/projects/${router.query.id}/roofing-3d`,
            },
            {
              name: 'Hail',
              href: `/projects/${router.query.id}/roofing-hail`,
            },
            {
              name: 'Wind',
              href: `/projects/${router.query.id}/roofing-wind`,
            },
            {
              name: 'Tornado',
              href: `/projects/${router.query.id}/roofing-tornado`,
            },
          ],
          icon: HomeModernIcon,
        },
        {
          name: 'Report',
          href: `/projects/${router.query.id}/report`,
          children: [],
          icon: BookOpenIcon,
        },
      ]
    }
    return []
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.pathname])

  const orgNavigation = useMemo(() => {
    if (router.pathname.indexOf('/projects/[id]') >= 0) {
      return [
        {
          name: 'Back to All Projects',
          href: '/projects',
          icon: ArrowLeftIcon,
        },
      ]
    }
    return [
      { name: 'Projects', href: '/projects', icon: BriefcaseIcon },
      { name: 'Settings', href: '/settings/account', icon: CogIcon },
    ]
  }, [router.pathname])

  return (
    <>
      <div>
        <button
          onClick={() => setMobileMenuOpen(true)}
          className="flex h-16 w-16 items-center justify-center focus:outline-none focus:ring-2 focus:ring-inset focus:ring-black md:hidden md:w-40 md:bg-primary"
        >
          <div className="h-8 w-auto">
            <span className="sr-only">Open main menu</span>
            <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
          </div>
        </button>
      </div>
      <Transition.Root
        show={mobileMenuOpen} // @ts-ignore
        as={Fragment}
      >
        <Dialog as="div" className="relative z-40" onClose={setMobileMenuOpen}>
          <div className="fixed z-40">
            <Transition.Child
              // @ts-ignore
              as={Fragment}
              enter="transition ease-out duration-150 md:ease-in-out md:duration-300"
              enterFrom="transform opacity-0 scale-110 md:translate-x-0 md:scale-300 md:opacity-100"
              enterTo="transform opacity-100 scale-100 md:translate-x-full md:scale-300 md:opacity-100"
              leave="transition ease-in duration-150 md:ease-in-out md:duration-300"
              leaveFrom="transform opacity-100 scale-100 md:translate-x-full md:scale-100 md:opacity-100"
              leaveTo="transform opacity-0 scale-110  md:translate-x-0 md:scale-100 md:opacity-100"
            >
              <Dialog.Panel
                className="fixed inset-0 z-40 h-full w-full overflow-scroll bg-white md:inset-y-0 md:left-auto md:right-0 md:w-full md:max-w-sm md:shadow-lg"
                aria-label="Global"
              >
                <div className="flex h-16 items-center justify-between px-4 md:px-6">
                  <img
                    className="block h-8 w-auto"
                    src="/images/brand/servicegeek.svg"
                    alt="ServiceGeek"
                  />
                  <button
                    type="button"
                    className="-mr-2 inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-600"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <span className="sr-only">Close main menu</span>
                    <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                  </button>
                </div>
                <div className="border border-gray-200  pb-3">
                  <div className="max-w-8xl mx-auto mt-3 space-y-1 px-2 md:px-4">
                    {orgNavigation.map((item) => (
                      <Link
                        key={item.name}
                        href={item.href}
                        className="flex rounded-md py-2 px-3 text-base font-medium text-gray-900 hover:bg-gray-50"
                      >
                        {item.icon && (
                          <item.icon
                            className={clsx(
                              item.href === router.asPath
                                ? 'text-gray-500'
                                : 'text-gray-400 group-hover:text-gray-500',
                              '-ml-1 mr-3 h-6 w-6 flex-shrink-0'
                            )}
                            aria-hidden="true"
                          />
                        )}
                        {item.name}
                      </Link>
                    ))}
                  </div>
                </div>
                <div className="max-w-8xl mx-auto py-3 px-2 md:px-4">
                  {navigation.map((item) => (
                    // @ts-ignore
                    <Fragment key={item.name}>
                      <Link
                        href={item.href}
                        className={clsx(
                          'flex rounded-md py-2 px-3 text-base font-medium text-gray-900 hover:bg-blue-500 hover:text-white',
                          router.asPath.indexOf(item.href) >= 0 &&
                            'text-blue-500 '
                        )}
                      >
                        {item.icon && (
                          <item.icon
                            className={clsx('-ml-1 mr-3 h-6 w-6 flex-shrink-0')}
                            aria-hidden="true"
                          />
                        )}
                        {item.name}
                      </Link>
                      {item.children.map((child) => (
                        <Link
                          key={child.name}
                          href={child.href}
                          className={clsx(
                            'ml-3  flex rounded-md py-2 px-3 text-base font-medium text-gray-500 hover:bg-blue-500 hover:text-white',
                            child.href === router.asPath && 'text-blue-500 '
                          )}
                        >
                          <div className="block w-6" />
                          {child.name}
                        </Link>
                      ))}
                    </Fragment>
                  ))}
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition.Root>
    </>
  )
}
