"use client";

import clsx from 'clsx'
import { useParams, usePathname } from 'next/navigation'

export default function TabNavigation() {

  const tabs = (id: string) => [
    { name: 'Overview', href: `/projects/${id}/overview` },
  ]
  const { id } = useParams()
  const pathname = usePathname()
  return (
    <div>
      <div className="hidden sm:block">
        <div className="border-b border-gray-200 px-8">
          <nav className="-mb-px flex space-x-8 " aria-label="Tabs">
            {tabs(id as string).map((tab) => (
              <a
                key={tab.name}
                href={tab.href}
                className={clsx(
                  tab.href === pathname
                    ? 'border-primary-action text-primary-action'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-primary-action-hover',
                  'whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium'
                )}
                aria-current={tab.href === pathname ? 'page' : undefined}
              >
                {tab.name}
              </a>
            ))}
          </nav>
        </div>
      </div>
    </div>
  )
}
