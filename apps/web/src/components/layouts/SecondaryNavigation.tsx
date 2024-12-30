import { SVGProps } from 'react'
import { projectStore } from '@atoms/project'
import Pill from '@components/DesignSystem/Pills/Pill'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ArrowLeftIcon } from 'lucide-react'
import { TertiaryLink } from '@components/components/link'
import clsx from 'clsx'

export default function SecondaryNavigation({
  navigation,
  hideBackButton = false,
}: {
  hideBackButton?: boolean
  navigation: {
    name: string
    href: string
    icon: (
      props: SVGProps<SVGSVGElement> & {
        title?: string | undefined
        titleId?: string | undefined
      }
    ) => JSX.Element
    isComingSoon?: boolean
    id?: string
  }[]
}) {
  const pathname = usePathname()
  const projectInfo = projectStore(state => state.project)

  return (
    <>
      <div className="flex-grow">
        {!hideBackButton && (
          <div className="flex w-full items-center justify-start p-3 lg:justify-center">
            <TertiaryLink href="/projects">
              <ArrowLeftIcon className="mr-2 w-5" /> Back to Projects
            </TertiaryLink>
          </div>
        )}
        {projectInfo.clientName && (
          <div className="p-3 pb-0">
            <label className="mb-2 text-xs text-gray-600">Client Name</label>
            <h4 className="mb-2 text-sm font-bold text-gray-900">
              {projectInfo.clientName}
            </h4>
            <label className="mb-2 text-xs text-gray-600">Address</label>
            <h4 className="text-sm font-bold text-gray-900">
              {projectInfo.location}
            </h4>
          </div>
        )}
        <nav aria-label="Sidebar" className="divide-y divide-gray-300 p-3">
          <div className="flex items-center justify-center space-y-1 lg:flex-col lg:items-start lg:justify-start">
            {navigation.map((item) => {
              if (item.isComingSoon) {
                return (
                  <div
                    key={item.name}
                    className={clsx(
                      pathname!.indexOf(item.href) >= 0
                        ? 'bg-gray-200 text-gray-900'
                        : 'text-gray-600 hover:bg-gray-50',
                      'group flex w-full items-center rounded-md px-3 py-2 text-sm font-medium'
                    )}
                    aria-current={
                      pathname!.indexOf(item.href) >= 0 ? 'page' : undefined
                    }
                  >
                    <item.icon
                      className={clsx(
                        pathname!.indexOf(item.href) >= 0
                          ? 'text-gray-500'
                          : 'text-gray-400 group-hover:text-gray-500',
                        '-ml-1 mr-3 h-6 w-6 flex-shrink-0'
                      )}
                      aria-hidden="true"
                    />
                    <div className="flex flex-col">
                      <span className="truncate">{item.name}</span>
                      <Pill className="text-xs" color="blue">
                        Coming Soon
                      </Pill>
                    </div>
                  </div>
                )
              }
              return (
                <Link
                  id={`bar-nav-button-${item.name}`}
                  key={item.name}
                  href={item.href}
                  className={clsx(
                    pathname!.indexOf(item.href) >= 0
                      ? 'bg-gray-200 text-accent'
                      : 'text-gray-600 hover:bg-gray-50',
                    'group flex w-full items-center rounded-md px-3 py-2 text-sm font-medium'
                  )}
                  aria-current={
                    pathname!.indexOf(item.href) >= 0 ? 'page' : undefined
                  }
                >
                  <item.icon
                    className={clsx(
                      pathname!.indexOf(item.href) >= 0
                        ? 'text-accent'
                        : 'text-gray-400 group-hover:text-gray-500',
                      '-ml-1 mr-3 h-6 w-6 flex-shrink-0'
                    )}
                    aria-hidden="true"
                  />
                  <span className="truncate">{item.name}</span>
                </Link>
              )
            })}
          </div>
        </nav>
      </div>
    </>
  )
}
