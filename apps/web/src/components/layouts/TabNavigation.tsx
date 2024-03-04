import clsx from 'clsx'
import { useRouter } from 'next/router'

export default function TabNavigation({
  tabs,
}: {
  tabs: (id: string) => { name: string; href: string }[]
}) {
  const router = useRouter()
  return (
    <div>
      <div className="hidden sm:block">
        <div className="border-b border-gray-200 px-8">
          <nav className="-mb-px flex space-x-8 " aria-label="Tabs">
            {tabs(router.query.id as string).map((tab) => (
              <a
                key={tab.name}
                href={tab.href}
                className={clsx(
                  tab.href === router.asPath
                    ? 'border-primary-action text-primary-action'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-primary-action-hover',
                  'whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium'
                )}
                aria-current={tab.href === router.asPath ? 'page' : undefined}
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
