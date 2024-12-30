"use client";

import { Fragment } from 'react'
import SearchBar from '@components/DesignSystem/SearchBar'
import { Menu, Transition } from '@headlessui/react'
import { Search } from 'lucide-react'
import clsx from 'clsx'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@lib/supabase/client'

export default function MobileNav() {
  const search = useSearchParams()
  const router = useRouter()
  const supabaseClient = createClient()
  // const { data } = await supabaseClient.auth.getUser()
  let id = search?.get("id") || ''
  if (Array.isArray(id) || !id) {
    id = ''
  }

  return (
    <div className="flex min-w-0 flex-1 items-center justify-between">
      <div className="relative min-w-0 flex-1">
        <div className=" max-w-2xl text-gray-400 focus-within:text-gray-500">
          <SearchBar className="" />
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center justify-center pl-4">
            <Search className="h-5 w-5" aria-hidden="true" />
          </div>
        </div>
      </div>
      <div className="w-22 justify-centerm mr-6 flex h-16 flex-shrink-0 items-center">
        <div className="flex items-center space-x-2">
          {/* <button
            type="button"
            className=" bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <span className="sr-only">View notifications</span>
            <BellIcon className="h-6 w-6" aria-hidden="true" />
          </button> */}
          <Menu as="div" className="relative inline-block text-left">
            <Menu.Button className="flex rounded-full bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2">
              <span className="sr-only">Open user menu</span>
              {/* <UserAvatar
                firstName={userInfo?.firstName || ''}
                lastName={userInfo?.lastName || ''}
                userId={data.user?.id}
                email={data.user?.email ?? ""}
              /> */}
            </Menu.Button>

            <Transition
              as={Fragment}
              enter="transition ease-out duration-100"
              enterFrom="transform opacity-0 scale-95"
              enterTo="transform opacity-100 scale-100"
              leave="transition ease-in duration-75"
              leaveFrom="transform opacity-100 scale-100"
              leaveTo="transform opacity-0 scale-95"
            >
              <Menu.Items className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                <div className="py-1">
                  <Menu.Item>
                    {({ active }) => (
                      <Link
                        href="/settings/account"
                        className={clsx(
                          active ? 'bg-gray-100' : '',
                          'block w-full px-4 py-2 text-sm text-gray-700'
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
                      <button
                        onClick={async () => {
                          await supabaseClient.auth.signOut()
                          router.push('/')
                        }}
                        className={clsx(
                          active ? 'bg-gray-100' : '',
                          'block w-full px-4 py-2 text-left text-sm text-gray-700'
                        )}
                      >
                        Sign Out
                      </button>
                    )}
                  </Menu.Item>
                </div>
              </Menu.Items>
            </Transition>
          </Menu>
        </div>
      </div>
    </div>
  )
}
