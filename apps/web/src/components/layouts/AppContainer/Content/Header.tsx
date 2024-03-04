import { Fragment } from 'react'
import UserAvatar from '@components/DesignSystem/UserAvatar'
import { Menu, Transition } from '@headlessui/react'
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react'
import clsx from 'clsx'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useRecoilState } from 'recoil'
import userInfoState from '@atoms/userInfoState'

export default function Header() {
  const user = useUser()
  const router = useRouter()
  const [userInfo] = useRecoilState(userInfoState)
  const supabase = useSupabaseClient()
  let id = router.query.id || ''
  if (Array.isArray(id) || !id) {
    id = ''
  }

  return (
    <Menu as="div" className="relative mb-2 inline-block">
      <Menu.Button className="flex w-full items-center justify-center rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2">
        <span className="sr-only">Open user menu</span>
        <UserAvatar />
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
        <Menu.Items className="absolute left-0  bottom-full z-10 mt-2 w-56 origin-top-right rounded-md bg-white shadow-xl ring-1 ring-black ring-opacity-5 focus:outline-none">
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
                    await supabase.auth.signOut()
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
  )
}
